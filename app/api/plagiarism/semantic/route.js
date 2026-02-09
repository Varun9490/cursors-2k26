import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import prisma from '@/lib/prisma';
import { GoogleGenerativeAI } from '@google/generative-ai';
import axios from 'axios';
import * as cheerio from 'cheerio';
import { rateLimit } from '@/lib/rateLimiter';
import { chunkText, extractKeywords, cosineSimilarity, checkPlagiarism, normalizeText } from '@/lib/plagiarismUtils';

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
    if (!embeddingModel) return null;
    try {
        const result = await embeddingModel.embedContent(text);
        return result.embedding.values;
    } catch (err) {
        console.error('Embedding error:', err.message);
        return null;
    }
}

// Calculate text similarity using multiple methods (ENHANCED)
function calculateTextSimilarity(inputText, pageText) {
    const inputNorm = normalizeText(inputText).toLowerCase();
    const pageNorm = normalizeText(pageText).toLowerCase();

    // Method 1: Word overlap (Jaccard similarity)
    const inputWords = new Set(inputNorm.split(' ').filter(w => w.length > 3));
    const pageWords = new Set(pageNorm.split(' ').filter(w => w.length > 3));

    let overlap = 0;
    for (const word of inputWords) {
        if (pageWords.has(word)) overlap++;
    }

    const jaccardSimilarity = inputWords.size > 0 ? (overlap / inputWords.size) * 100 : 0;

    // Method 2: N-gram matching (3-grams)
    const inputTrigrams = new Set();
    const inputWordsArr = inputNorm.split(' ').filter(w => w.length > 2);
    for (let i = 0; i <= inputWordsArr.length - 3; i++) {
        inputTrigrams.add(inputWordsArr.slice(i, i + 3).join(' '));
    }

    let trigramMatches = 0;
    const pageWordsArr = pageNorm.split(' ').filter(w => w.length > 2);
    for (let i = 0; i <= pageWordsArr.length - 3; i++) {
        const trigram = pageWordsArr.slice(i, i + 3).join(' ');
        if (inputTrigrams.has(trigram)) trigramMatches++;
    }

    const trigramSimilarity = inputTrigrams.size > 0 ? (trigramMatches / inputTrigrams.size) * 100 : 0;

    // Method 3: Exact phrase matching
    let phraseMatchScore = 0;
    const phrases = inputText.match(/[^.!?]+[.!?]+/g) || [];
    for (const phrase of phrases.slice(0, 5)) {
        const cleanPhrase = phrase.trim().toLowerCase();
        if (cleanPhrase.length > 30 && pageNorm.includes(normalizeText(cleanPhrase))) {
            phraseMatchScore += 40;
        }
    }
    phraseMatchScore = Math.min(phraseMatchScore, 100);

    // Combine methods - use the highest score
    const maxSimilarity = Math.max(jaccardSimilarity, trigramSimilarity * 1.5, phraseMatchScore);

    return Math.round(maxSimilarity);
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
        let { text, threshold = 0.15, filename, documentId } = body;

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

        console.log(`\n========== SEMANTIC ANALYSIS START ==========`);
        console.log(`User: ${session.user.email}, Text: ${text.length} chars, Chunks: ${chunks.length}`);

        // ----------------------------------------------------
        // FALLBACK MODE IF NO API KEYS - Still use pattern analysis
        // ----------------------------------------------------
        if (!genAI || !process.env.SERPER_API_KEY) {
            await new Promise(r => setTimeout(r, 500));

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
                // A. Get Gemini Embedding for input chunk (for semantic comparison)
                const inputEmbedding = await getGeminiEmbedding(chunk);

                // B. Web Search using Serper with enhanced keywords
                const keywords = extractKeywords(chunk, 12).join(' ');
                let searchResults = [];

                console.log(`[SERPER] Searching: "${keywords.substring(0, 80)}..."`);

                if (process.env.SERPER_API_KEY) {
                    try {
                        const searchRes = await fetch('https://google.serper.dev/search', {
                            method: 'POST',
                            headers: {
                                'X-API-KEY': process.env.SERPER_API_KEY,
                                'Content-Type': 'application/json'
                            },
                            body: JSON.stringify({
                                q: keywords,
                                num: 10,  // Get more results
                                gl: 'us',
                                hl: 'en'
                            })
                        });

                        if (searchRes.ok) {
                            const searchData = await searchRes.json();
                            searchResults = searchData.organic || [];
                            console.log(`[SERPER] Found ${searchResults.length} results`);
                        } else {
                            console.warn(`[SERPER] API returned status ${searchRes.status}`);
                        }
                    } catch (searchError) {
                        console.error(`[SERPER] Search failed: ${searchError.message}`);
                    }
                }

                // C. Scrape & Compare each result
                for (const result of searchResults) {
                    try {
                        // First check snippet similarity (fast)
                        const snippetSim = result.snippet ? calculateTextSimilarity(chunk, result.snippet) : 0;

                        let pageSim = 0;
                        let embeddingSim = 0;
                        let pageText = result.snippet || '';

                        // Scrape full page if snippet looks promising OR is too short
                        if (snippetSim > 10 || (result.snippet?.length || 0) < 100) {
                            try {
                                const pageRes = await axios.get(result.link, {
                                    timeout: 4000,
                                    headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36' }
                                });
                                const $ = cheerio.load(pageRes.data);
                                $('script, style, nav, header, footer').remove();
                                pageText = $('p, article, main').text().replace(/\s+/g, ' ').substring(0, 3000);

                                if (pageText.length > 100) {
                                    // Text-based similarity
                                    pageSim = calculateTextSimilarity(chunk, pageText);

                                    // Embedding similarity (if available)
                                    if (inputEmbedding) {
                                        const pageEmbedding = await getGeminiEmbedding(pageText.substring(0, 1000));
                                        if (pageEmbedding) {
                                            embeddingSim = cosineSimilarity(inputEmbedding, pageEmbedding) * 100;
                                        }
                                    }
                                }
                            } catch (scrapeErr) {
                                // Use snippet only
                                pageSim = snippetSim;
                            }
                        }

                        // Use highest similarity score
                        const maxSimilarity = Math.max(snippetSim, pageSim, embeddingSim);

                        console.log(`  -> ${result.title?.substring(0, 40)}: ${maxSimilarity.toFixed(1)}% (snip:${snippetSim}, page:${pageSim}, emb:${embeddingSim.toFixed(1)})`);

                        if (maxSimilarity > threshold * 100) {
                            let matchType = 'SIMILAR';
                            if (maxSimilarity > 85) matchType = 'DIRECT';
                            else if (maxSimilarity > 60) matchType = 'PARAPHRASED';
                            else if (maxSimilarity > 35) matchType = 'SIMILAR';

                            matches.push({
                                originalText: chunk.substring(0, 300),
                                matchedText: pageText.substring(0, 200) + '...',
                                sourceUrl: result.link,
                                sourceTitle: result.title,
                                similarityScore: Math.round(maxSimilarity),
                                matchType,
                                position: { startIndex: text.indexOf(chunk), endIndex: text.indexOf(chunk) + chunk.length }
                            });
                        }

                    } catch (err) {
                        console.log(`[SCRAPE] Failed: ${result.link?.substring(0, 40)}: ${err.message}`);
                        continue;
                    }
                }
            } catch (chunkError) {
                console.error(`[CHUNK] Error: ${chunkError.message}`);
                continue;
            }
        }

        // ============================================================
        // ENHANCED SCORING: Combine web matches with pattern analysis
        // ============================================================

        // Calculate web-based similarity score
        let webSimilarity = 0;
        if (matches.length > 0) {
            // Use average of top 3 matches, not just max
            const sortedScores = matches.map(m => m.similarityScore).sort((a, b) => b - a);
            webSimilarity = sortedScores.slice(0, 3).reduce((a, b) => a + b, 0) / Math.min(3, sortedScores.length);
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
                    similarityScore: Math.round(patternPenalty / patternAnalysis.matches.length),
                    matchType: 'PATTERN',
                    position: null
                });
            }
        }

        // Combine scores
        let finalPenalty;
        if (webSimilarity > 30) {
            // Strong web matches - weight them heavily
            finalPenalty = Math.max(webSimilarity, patternPenalty * 0.5);
        } else if (matches.length > 0 && webSimilarity > 15) {
            // Some web matches
            finalPenalty = (webSimilarity + patternPenalty) / 2;
        } else {
            // No significant web matches - use pattern analysis
            finalPenalty = patternPenalty;
        }

        // Calculate overall score (higher penalty = lower originality)
        const overallScore = Math.max(0, Math.min(100, 100 - finalPenalty));

        // Determine verdict
        let verdict = 'ORIGINAL';
        if (overallScore < 40) verdict = 'LIKELY_PLAGIARIZED';
        else if (overallScore < 60) verdict = 'SUSPICIOUS';
        else if (overallScore < 80) verdict = 'MOSTLY_ORIGINAL';

        console.log(`========== SEMANTIC ANALYSIS COMPLETE ==========`);
        console.log(`Web similarity: ${webSimilarity.toFixed(1)}%, Pattern penalty: ${patternPenalty}%`);
        console.log(`Final: ${overallScore}% original, ${matches.length} matches, Verdict: ${verdict}`);
        console.log(`Processing time: ${Date.now() - startTime}ms\n`);

        // Save to DB
        const report = await prisma.plagiarismReport.create({
            data: {
                documentId: document.id,
                originalityScore: overallScore,
                matchedSources: JSON.stringify(matches),
            }
        });

        // Save individual matches
        for (const match of matches) {
            await prisma.plagiarismMatch.create({
                data: {
                    reportId: report.id,
                    originalText: match.originalText || '',
                    matchedText: match.matchedText || '',
                    sourceUrl: match.sourceUrl,
                    sourceTitle: match.sourceTitle || 'Unknown',
                    similarityScore: match.similarityScore,
                    matchType: match.matchType,
                    position: match.position ? JSON.stringify(match.position) : null
                }
            });
        }

        return NextResponse.json({
            reportId: report.id,
            overallScore,
            totalMatches: matches.length,
            matches,
            verdict,
            processingTime: Date.now() - startTime
        });

    } catch (error) {
        console.error('Semantic Analysis Error:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
