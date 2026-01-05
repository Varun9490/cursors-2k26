import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import prisma from '@/lib/prisma';
import { GoogleGenerativeAI } from '@google/generative-ai';
import axios from 'axios';
import * as cheerio from 'cheerio';
import { rateLimit } from '@/lib/rateLimiter';
import { chunkText, extractKeywords, cosineSimilarity } from '@/lib/plagiarismUtils';

// Initialize Gemini AI
let genAI;
let embeddingModel;
if (process.env.GEMINI_API_KEY) {
    genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    embeddingModel = genAI.getGenerativeModel({ model: "text-embedding-004" });
} else {
    console.warn("GEMINI_API_KEY is not set. Semantic analysis will run in mock mode.");
}

// Helper function to get embeddings from Gemini
async function getGeminiEmbedding(text) {
    const result = await embeddingModel.embedContent(text);
    return result.embedding.values;
}

export async function POST(req) {
    try {
        const session = await auth();
        if (!session) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        // Rate Limiting
        const limitCheck = rateLimit(session.user.id);
        if (!limitCheck.success) {
            return NextResponse.json({
                error: 'Rate limit exceeded. Please try again later.',
                retryAfter: Math.ceil((limitCheck.reset - Date.now()) / 1000)
            }, { status: 429 });
        }

        const body = await req.json();
        let { text, threshold = 0.5, filename, documentId } = body;

        // If documentId provided, fetch text from DB
        let document;
        if (documentId) {
            document = await prisma.document.findUnique({
                where: { id: documentId, userId: session.user.id }
            });
            if (!document) {
                return NextResponse.json({ error: 'Document not found or access denied.' }, { status: 404 });
            }
            text = document.content;
            filename = document.filename;
        } else {
            // Validation for raw text
            if (!text || text.length < 50) {
                return NextResponse.json({ error: 'Text too short (min 50 chars).' }, { status: 400 });
            }
            if (text.length > 10000) {
                return NextResponse.json({ error: 'Text too long (max 10000 chars).' }, { status: 400 });
            }

            // Save initial document to DB
            document = await prisma.document.create({
                data: {
                    userId: session.user.id,
                    content: text.substring(0, 8000),
                    filename: filename || 'Untitled',
                }
            });
        }

        const startTime = Date.now();
        const chunks = chunkText(text);
        const matches = [];

        // ----------------------------------------------------
        // MOCK MODE IF NO API KEY
        // ----------------------------------------------------
        if (!genAI || !process.env.SERPER_API_KEY) {
            await new Promise(r => setTimeout(r, 2000));

            const matchedSources = [{
                url: 'https://example.com/mock-result',
                title: 'Simulated Semantic Match',
                similarityScore: 85,
                matchType: 'PARAPHRASED',
                originalText: chunks[0] || text.substring(0, 200),
                matchedText: "This is a simulated match. Configure GEMINI_API_KEY and SERPER_API_KEY for real analysis."
            }];

            const report = await prisma.plagiarismReport.create({
                data: {
                    documentId: document.id,
                    originalityScore: 85.0,
                    matchedSources: JSON.stringify(matchedSources),
                }
            });

            return NextResponse.json({
                reportId: report.id,
                overallScore: 85.0,
                totalMatches: 1,
                matches: matchedSources,
                processingTime: Date.now() - startTime
            });
        }
        // ----------------------------------------------------

        // Process first 3 chunks to limit API usage
        const chunksToProcess = chunks.slice(0, 3);

        for (const chunk of chunksToProcess) {
            try {
                // A. Get Gemini Embedding for input chunk
                const inputEmbedding = await getGeminiEmbedding(chunk);

                // B. Web Search using Serper
                const keywords = extractKeywords(chunk).join(' ');
                let searchResults = [];

                if (process.env.SERPER_API_KEY) {
                    const searchRes = await fetch('https://google.serper.dev/search', {
                        method: 'POST',
                        headers: {
                            'X-API-KEY': process.env.SERPER_API_KEY,
                            'Content-Type': 'application/json'
                        },
                        body: JSON.stringify({ q: keywords, num: 5 })
                    });
                    const searchData = await searchRes.json();
                    searchResults = searchData.organic || [];
                }

                // C. Scrape & Compare each result
                for (const result of searchResults) {
                    try {
                        const pageRes = await axios.get(result.link, { timeout: 4000 });
                        const $ = cheerio.load(pageRes.data);
                        const pageText = $('p, article').text().substring(0, 2000);

                        if (pageText.length < 50) continue;

                        // D. Get Gemini Embedding for scraped page
                        const pageEmbedding = await getGeminiEmbedding(pageText.substring(0, 1000));

                        // E. Calculate Cosine Similarity
                        const similarity = cosineSimilarity(inputEmbedding, pageEmbedding);

                        if (similarity * 100 > threshold * 100) {
                            let matchType = 'SIMILAR';
                            if (similarity > 0.9) matchType = 'DIRECT';
                            else if (similarity > 0.75) matchType = 'PARAPHRASED';

                            matches.push({
                                originalText: chunk,
                                matchedText: pageText.substring(0, 200) + '...',
                                sourceUrl: result.link,
                                sourceTitle: result.title,
                                similarityScore: similarity * 100,
                                matchType,
                                position: { startIndex: text.indexOf(chunk), endIndex: text.indexOf(chunk) + chunk.length }
                            });
                        }

                    } catch (err) {
                        console.log(`Failed to process url ${result.link}: ${err.message}`);
                        continue;
                    }
                }
            } catch (chunkError) {
                console.error(`Error processing chunk: ${chunkError.message}`);
                continue;
            }
        }

        // Calculate Overall Score
        let maxSimilarity = 0;
        if (matches.length > 0) {
            maxSimilarity = Math.max(...matches.map(m => m.similarityScore));
        }
        const overallScore = Math.max(0, 100 - maxSimilarity);

        // Save to DB
        const report = await prisma.plagiarismReport.create({
            data: {
                documentId: document.id,
                originalityScore: overallScore,
                matchedSources: JSON.stringify(matches),
            }
        });

        return NextResponse.json({
            reportId: report.id,
            overallScore,
            totalMatches: matches.length,
            matches,
            processingTime: Date.now() - startTime
        });

    } catch (error) {
        console.error('Semantic Analysis Error:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
