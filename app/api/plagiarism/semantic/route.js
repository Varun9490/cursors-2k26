import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import prisma from '@/lib/prisma';
import { GoogleGenerativeAI } from '@google/generative-ai';
import axios from 'axios';
import * as cheerio from 'cheerio';
import { rateLimit } from '@/lib/rateLimiter';
import { chunkText, extractKeywords, cosineSimilarity, checkPlagiarism } from '@/lib/plagiarismUtils';

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
        // Lowered default threshold from 0.5 to 0.25 for better match detection
        let { text, threshold = 0.25, filename, documentId } = body;

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
        // FALLBACK MODE IF NO API KEYS - Still use pattern analysis
        // ----------------------------------------------------
        if (!genAI || !process.env.SERPER_API_KEY) {
            await new Promise(r => setTimeout(r, 1500));

            // Run pattern analysis even in mock mode
            const patternAnalysis = await checkPlagiarism(text);
            const patternMatches = (patternAnalysis.matches || []).map(m => ({
                url: null,
                title: `Pattern Analysis: ${m.type}`,
                similarityScore: (100 - patternAnalysis.originalityScore) / Math.max(patternAnalysis.matches.length, 1),
                matchType: 'PATTERN',
                originalText: m.reason,
                matchedText: `Detected: ${m.type} - ${m.reason}`
            }));

            // Add a notice about API keys
            if (patternMatches.length === 0) {
                patternMatches.push({
                    url: null,
                    title: 'API Keys Not Configured',
                    similarityScore: 0,
                    matchType: 'INFO',
                    originalText: 'Configure GEMINI_API_KEY and SERPER_API_KEY for web-based plagiarism detection.',
                    matchedText: 'Pattern analysis found no issues with this text.'
                });
            }

            const report = await prisma.plagiarismReport.create({
                data: {
                    documentId: document.id,
                    originalityScore: patternAnalysis.originalityScore,
                    matchedSources: JSON.stringify(patternMatches),
                }
            });

            return NextResponse.json({
                reportId: report.id,
                overallScore: patternAnalysis.originalityScore,
                totalMatches: patternMatches.length,
                matches: patternMatches,
                verdict: patternAnalysis.verdict,
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

        // ============================================================
        // ENHANCED SCORING: Combine web matches with pattern analysis
        // ============================================================

        // Calculate web-based similarity score
        let webSimilarity = 0;
        if (matches.length > 0) {
            webSimilarity = Math.max(...matches.map(m => m.similarityScore));
        }

        // Always run pattern analysis for additional detection
        const patternAnalysis = await checkPlagiarism(text);
        const patternPenalty = 100 - patternAnalysis.originalityScore;

        // Add pattern-based matches to the matches array
        if (patternAnalysis.matches && patternAnalysis.matches.length > 0) {
            for (const patternMatch of patternAnalysis.matches) {
                matches.push({
                    originalText: patternMatch.reason,
                    matchedText: `Pattern detected: ${patternMatch.type}`,
                    sourceUrl: null,
                    sourceTitle: `Pattern Analysis: ${patternMatch.type}`,
                    similarityScore: patternPenalty / patternAnalysis.matches.length,
                    matchType: 'PATTERN',
                    position: null
                });
            }
        }

        // Combine scores: 
        // - If web matches found: Use the higher penalty between web and pattern
        // - If no web matches: Use pattern analysis directly
        let finalPenalty;
        if (webSimilarity > 0) {
            // Web matches found - use higher of the two penalties
            finalPenalty = Math.max(webSimilarity, patternPenalty);
        } else {
            // No web matches - rely on pattern analysis
            finalPenalty = patternPenalty;
        }

        // Calculate overall score (higher penalty = lower originality)
        const overallScore = Math.max(0, Math.min(100, 100 - finalPenalty));

        console.log(`Plagiarism Analysis Complete:
            - Web similarity: ${webSimilarity}%
            - Pattern penalty: ${patternPenalty}%
            - Final penalty: ${finalPenalty}%
            - Originality score: ${overallScore}%
            - Total matches: ${matches.length}
            - Verdict: ${patternAnalysis.verdict}`);

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
            verdict: patternAnalysis.verdict,
            processingTime: Date.now() - startTime
        });

    } catch (error) {
        console.error('Semantic Analysis Error:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
