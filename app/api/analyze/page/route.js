import { NextResponse } from 'next/server';
import { detectAIContent, detectAIGeneratedCode, analyzeSEO } from '@/lib/aiDetection';
import { checkPlagiarism, extractKeywords, cosineSimilarity, normalizeText } from '@/lib/plagiarismUtils';
import { GoogleGenerativeAI } from '@google/generative-ai';
import axios from 'axios';
import * as cheerio from 'cheerio';

// Initialize Gemini AI for embeddings
let genAI;
let embeddingModel;
if (process.env.GEMINI_API_KEY) {
    genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    embeddingModel = genAI.getGenerativeModel({ model: "text-embedding-004" });
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

// Search web using Serper API
async function searchWeb(query, numResults = 5) {
    if (!process.env.SERPER_API_KEY) {
        console.log('SERPER_API_KEY not configured, skipping web search');
        return [];
    }

    try {
        console.log(`[SERPER] Searching: "${query.substring(0, 80)}..."`);

        const response = await fetch('https://google.serper.dev/search', {
            method: 'POST',
            headers: {
                'X-API-KEY': process.env.SERPER_API_KEY,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                q: query,
                num: numResults,
                gl: 'us',
                hl: 'en'
            })
        });

        if (!response.ok) {
            const errorText = await response.text();
            console.error(`[SERPER] API error: ${response.status} - ${errorText}`);
            return [];
        }

        const data = await response.json();
        console.log(`[SERPER] Found ${data.organic?.length || 0} results`);
        return data.organic || [];
    } catch (err) {
        console.error('[SERPER] Search failed:', err.message);
        return [];
    }
}

// Scrape page content
async function scrapePageContent(url) {
    try {
        const response = await axios.get(url, {
            timeout: 5000,
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
            }
        });
        const $ = cheerio.load(response.data);

        // Remove scripts, styles, and nav elements
        $('script, style, nav, header, footer, aside').remove();

        // Get main content
        const pageText = $('p, article, main, .content, .post').text()
            .replace(/\s+/g, ' ')
            .trim()
            .substring(0, 3000);

        return pageText;
    } catch (err) {
        console.log(`[SCRAPE] Failed for ${url.substring(0, 50)}: ${err.message}`);
        return null;
    }
}

// Calculate text similarity using multiple methods
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
            phraseMatchScore += 40; // High score for exact matches
        }
    }
    phraseMatchScore = Math.min(phraseMatchScore, 100);

    // Combine methods - use the highest score
    const maxSimilarity = Math.max(jaccardSimilarity, trigramSimilarity * 1.5, phraseMatchScore);

    return {
        jaccardSimilarity: Math.round(jaccardSimilarity),
        trigramSimilarity: Math.round(trigramSimilarity),
        phraseMatchScore: Math.round(phraseMatchScore),
        combined: Math.round(maxSimilarity)
    };
}

// Check text similarity against web sources
async function checkWebPlagiarism(text) {
    const webMatches = [];

    if (!text || text.length < 100) {
        console.log('[WEB] Text too short for web check');
        return { matches: [], maxSimilarity: 0 };
    }

    // Extract keywords for search
    const keywords = extractKeywords(text, 12);
    const searchQuery = keywords.join(' ');

    console.log(`[WEB] Keywords: ${keywords.slice(0, 5).join(', ')}...`);

    if (!searchQuery || searchQuery.length < 10) {
        console.log('[WEB] Search query too short, skipping');
        return { matches: [], maxSimilarity: 0 };
    }

    // Search the web
    const searchResults = await searchWeb(searchQuery, 8);

    if (searchResults.length === 0) {
        console.log('[WEB] No search results, trying alternative query...');
        // Try with first sentence
        const firstSentence = text.split(/[.!?]/)[0];
        if (firstSentence && firstSentence.length > 20) {
            const altResults = await searchWeb(firstSentence.substring(0, 100), 5);
            if (altResults.length > 0) {
                searchResults.push(...altResults);
            }
        }
    }

    if (searchResults.length === 0) {
        console.log('[WEB] No search results found from any query');
        return { matches: [], maxSimilarity: 0 };
    }

    // Check each search result
    let inputEmbedding = null;
    if (embeddingModel) {
        inputEmbedding = await getGeminiEmbedding(text.substring(0, 1000));
    }

    for (const result of searchResults) {
        try {
            console.log(`[WEB] Checking: ${result.title?.substring(0, 50)}...`);

            // First, check snippet similarity (faster)
            const snippetSim = calculateTextSimilarity(text, result.snippet || '');

            // If snippet looks promising, scrape the full page
            let pageSim = { combined: 0 };
            if (snippetSim.combined > 10 || result.snippet?.length < 100) {
                const pageContent = await scrapePageContent(result.link);
                if (pageContent && pageContent.length > 100) {
                    pageSim = calculateTextSimilarity(text, pageContent);

                    // Also try embedding similarity if available
                    if (inputEmbedding) {
                        const pageEmbedding = await getGeminiEmbedding(pageContent.substring(0, 1000));
                        if (pageEmbedding) {
                            const embeddingSim = cosineSimilarity(inputEmbedding, pageEmbedding) * 100;
                            pageSim.embeddingSimilarity = Math.round(embeddingSim);
                            pageSim.combined = Math.max(pageSim.combined, embeddingSim);
                        }
                    }
                }
            }

            const maxSim = Math.max(snippetSim.combined, pageSim.combined);
            console.log(`  -> Similarity: ${maxSim}% (snippet: ${snippetSim.combined}%, page: ${pageSim.combined}%)`);

            if (maxSim > 15) { // Lower threshold to catch more matches
                let matchType = 'SIMILAR';
                if (maxSim > 80) matchType = 'DIRECT_COPY';
                else if (maxSim > 50) matchType = 'PARAPHRASED';
                else if (maxSim > 30) matchType = 'SIMILAR';

                webMatches.push({
                    url: result.link,
                    title: result.title,
                    snippet: result.snippet || '',
                    similarity: Math.round(maxSim),
                    matchType,
                    details: {
                        snippetSim: snippetSim.combined,
                        pageSim: pageSim.combined
                    }
                });
            }
        } catch (err) {
            console.log(`[WEB] Error checking ${result.link?.substring(0, 30)}: ${err.message}`);
            continue;
        }
    }

    // Sort by similarity
    webMatches.sort((a, b) => b.similarity - a.similarity);

    const maxSimilarity = webMatches.length > 0 ? webMatches[0].similarity : 0;

    console.log(`[WEB] Complete: ${webMatches.length} matches, max similarity: ${maxSimilarity}%`);

    return { matches: webMatches.slice(0, 5), maxSimilarity };
}

export async function POST(req) {
    try {
        const startTime = Date.now();
        const { html, textContent, sourceCode, url } = await req.json();

        if (!textContent && !html && !sourceCode) {
            return NextResponse.json({ error: 'No content provided' }, { status: 400 });
        }

        console.log(`\n========== PAGE ANALYSIS START ==========`);
        console.log(`Text length: ${textContent?.length || 0} chars`);

        const results = {
            timestamp: new Date().toISOString(),
            url: url || 'Unknown',
            contentAnalysis: null,
            plagiarismAnalysis: null,
            codeAnalysis: null,
            seoAnalysis: null,
            overallVerdict: 'ORIGINAL',
            overallScore: 100,
            recommendations: [],
            processingTime: 0
        };

        // 1. Analyze text content for AI patterns
        if (textContent && textContent.length > 50) {
            results.contentAnalysis = detectAIContent(textContent);

            if (results.contentAnalysis.isLikelyAI) {
                results.overallScore -= results.contentAnalysis.aiScore * 0.4;
                results.recommendations.push('🤖 Content shows AI-generated patterns. Consider rewriting for authenticity.');
            }
        }

        // 2. Check for plagiarism - ENHANCED with web search
        if (textContent && textContent.length > 100) {
            try {
                console.log(`[PLAG] Starting plagiarism analysis...`);

                // A. Pattern-based analysis (local)
                const patternResult = await checkPlagiarism(textContent.substring(0, 3000));
                console.log(`[PLAG] Pattern analysis: ${patternResult?.originalityScore}% original, ${patternResult?.matches?.length || 0} patterns`);

                // B. Web-based plagiarism check (uses Serper API)
                const webResult = await checkWebPlagiarism(textContent.substring(0, 2000));
                console.log(`[PLAG] Web analysis: ${webResult.matches.length} sources, max ${webResult.maxSimilarity}% similar`);

                // Combine results
                const patternPenalty = patternResult ? (100 - patternResult.originalityScore) : 0;
                const webPenalty = webResult.maxSimilarity;

                // Use weighted combination
                let combinedPenalty;
                if (webResult.matches.length > 0) {
                    // If web matches found, weight them heavily
                    combinedPenalty = Math.max(webPenalty, patternPenalty * 0.5);
                } else {
                    // Only pattern analysis
                    combinedPenalty = patternPenalty;
                }

                const combinedScore = Math.max(0, 100 - combinedPenalty);

                // Merge matches from both sources
                const allMatches = [];

                // Add web matches
                if (webResult.matches.length > 0) {
                    webResult.matches.forEach(m => {
                        allMatches.push({
                            type: 'WEB',
                            source: m.title,
                            url: m.url,
                            similarity: m.similarity,
                            matchType: m.matchType,
                            snippet: m.snippet.substring(0, 200)
                        });
                    });
                }

                // Add pattern matches
                if (patternResult?.matches?.length > 0) {
                    patternResult.matches.forEach(m => {
                        allMatches.push({
                            type: 'PATTERN',
                            source: `Pattern: ${m.type}`,
                            url: null,
                            similarity: Math.round(patternPenalty / patternResult.matches.length),
                            matchType: 'PATTERN',
                            snippet: m.reason
                        });
                    });
                }

                results.plagiarismAnalysis = {
                    originalityScore: combinedScore,
                    matchCount: allMatches.length,
                    matches: allMatches,
                    webMatchCount: webResult.matches.length,
                    patternMatchCount: patternResult?.matches?.length || 0,
                    maxWebSimilarity: webResult.maxSimilarity,
                    verdict: combinedScore >= 80 ? 'ORIGINAL' :
                        combinedScore >= 50 ? 'SUSPICIOUS' : 'LIKELY_PLAGIARIZED'
                };

                // Reduce overall score based on plagiarism
                if (combinedScore < 70) {
                    results.overallScore -= (100 - combinedScore) * 0.5;
                    results.recommendations.push(
                        `📋 Plagiarism concerns: ${allMatches.length} matches found (${webResult.matches.length} web sources, ${patternResult?.matches?.length || 0} patterns). Originality: ${combinedScore}%`
                    );
                }

                console.log(`[PLAG] Final: Score=${combinedScore}%, Total=${allMatches.length} matches`);

            } catch (plagError) {
                console.error('[PLAG] Error:', plagError);
                results.plagiarismAnalysis = {
                    originalityScore: 100,
                    matchCount: 0,
                    matches: [],
                    verdict: 'UNCHECKED',
                    error: 'Plagiarism check failed: ' + plagError.message
                };
            }
        }

        // 3. Analyze source code if provided
        if (sourceCode && sourceCode.length > 50) {
            results.codeAnalysis = detectAIGeneratedCode(sourceCode);

            if (results.codeAnalysis.isLikelyAI) {
                results.overallScore -= results.codeAnalysis.aiScore * 0.2;
                results.recommendations.push('💻 Code appears AI-generated. Review for logical errors and missing edge cases.');
            }

            if (results.codeAnalysis.codeQuality < 70) {
                results.recommendations.push('⚠️ Code quality issues detected. Add proper error handling and remove debug statements.');
            }
        }

        // 4. Analyze SEO (requires HTML)
        if (html && textContent) {
            results.seoAnalysis = analyzeSEO(html, textContent);

            if (results.seoAnalysis.score < 70) {
                results.overallScore -= (100 - results.seoAnalysis.score) * 0.1;
            }

            if (results.seoAnalysis.aiContentPenalty > 0) {
                results.recommendations.push('📉 AI content detected - this may negatively impact search rankings.');
            }

            // Add top SEO issues
            results.seoAnalysis.issues.slice(0, 3).forEach(issue => {
                results.recommendations.push(`📊 SEO: ${issue}`);
            });
        }

        // Determine overall verdict
        results.overallScore = Math.max(0, Math.round(results.overallScore));

        if (results.overallScore >= 80) {
            results.overallVerdict = 'ORIGINAL';
        } else if (results.overallScore >= 50) {
            results.overallVerdict = 'MIXED_CONTENT';
        } else if (results.contentAnalysis?.isLikelyAI) {
            results.overallVerdict = 'AI_GENERATED';
        } else {
            results.overallVerdict = 'PLAGIARIZED';
        }

        results.processingTime = Date.now() - startTime;

        console.log(`========== PAGE ANALYSIS COMPLETE ==========`);
        console.log(`Overall: ${results.overallScore}%, Verdict: ${results.overallVerdict}, Time: ${results.processingTime}ms\n`);

        return NextResponse.json(results);

    } catch (error) {
        console.error('[PAGE] Analysis Error:', error);
        return NextResponse.json({ error: 'Analysis failed: ' + error.message }, { status: 500 });
    }
}
