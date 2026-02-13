import { NextResponse } from 'next/server';
import { detectAIContent, detectAIWithGemini, detectAIGeneratedCode, analyzeSEO, checkAISourceURL } from '@/lib/aiDetection';
import { checkPlagiarism, extractKeywords, cosineSimilarity, normalizeText } from '@/lib/plagiarismUtils';
import { GoogleGenerativeAI } from '@google/generative-ai';
import axios from 'axios';
import * as cheerio from 'cheerio';

// Initialize Gemini AI
let genAI;
let embeddingModel;
if (process.env.GEMINI_API_KEY) {
    genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    embeddingModel = genAI.getGenerativeModel({ model: "text-embedding-004" });
}

// Get embeddings
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

// Search web
async function searchWeb(query, numResults = 5) {
    if (!process.env.SERPER_API_KEY) return [];
    try {
        const response = await fetch('https://google.serper.dev/search', {
            method: 'POST',
            headers: { 'X-API-KEY': process.env.SERPER_API_KEY, 'Content-Type': 'application/json' },
            body: JSON.stringify({ q: query, num: numResults, gl: 'us', hl: 'en' })
        });
        if (!response.ok) return [];
        const data = await response.json();
        return data.organic || [];
    } catch { return []; }
}

// Scrape content
async function scrapePageContent(url) {
    try {
        const response = await axios.get(url, {
            timeout: 5000,
            headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36' }
        });
        const $ = cheerio.load(response.data);
        $('script, style, nav, header, footer, aside').remove();
        return $('p, article, main, .content, .post').text().replace(/\s+/g, ' ').trim().substring(0, 3000);
    } catch { return null; }
}

// Text similarity
function calculateTextSimilarity(inputText, pageText) {
    const inputNorm = normalizeText(inputText).toLowerCase();
    const pageNorm = normalizeText(pageText).toLowerCase();

    const inputWords = new Set(inputNorm.split(' ').filter(w => w.length > 3));
    const pageWords = new Set(pageNorm.split(' ').filter(w => w.length > 3));
    let overlap = 0;
    for (const word of inputWords) { if (pageWords.has(word)) overlap++; }
    const jaccardSimilarity = inputWords.size > 0 ? (overlap / inputWords.size) * 100 : 0;

    const inputTrigrams = new Set();
    const inputWArr = inputNorm.split(' ').filter(w => w.length > 2);
    for (let i = 0; i <= inputWArr.length - 3; i++) inputTrigrams.add(inputWArr.slice(i, i + 3).join(' '));
    let trigramMatches = 0;
    const pageWArr = pageNorm.split(' ').filter(w => w.length > 2);
    for (let i = 0; i <= pageWArr.length - 3; i++) {
        if (inputTrigrams.has(pageWArr.slice(i, i + 3).join(' '))) trigramMatches++;
    }
    const trigramSimilarity = inputTrigrams.size > 0 ? (trigramMatches / inputTrigrams.size) * 100 : 0;

    let phraseMatchScore = 0;
    const phrases = inputText.match(/[^.!?]+[.!?]+/g) || [];
    for (const phrase of phrases.slice(0, 5)) {
        const cleanPhrase = phrase.trim().toLowerCase();
        if (cleanPhrase.length > 30 && pageNorm.includes(normalizeText(cleanPhrase))) phraseMatchScore += 40;
    }
    phraseMatchScore = Math.min(phraseMatchScore, 100);

    return {
        jaccardSimilarity: Math.round(jaccardSimilarity),
        trigramSimilarity: Math.round(trigramSimilarity),
        phraseMatchScore: Math.round(phraseMatchScore),
        combined: Math.round(Math.max(jaccardSimilarity, trigramSimilarity * 1.5, phraseMatchScore))
    };
}

// Web plagiarism check
async function checkWebPlagiarism(text) {
    if (!text || text.length < 100) return { matches: [], maxSimilarity: 0 };
    const webMatches = [];
    const keywords = extractKeywords(text, 12);
    const searchQuery = keywords.join(' ');
    if (!searchQuery || searchQuery.length < 10) return { matches: [], maxSimilarity: 0 };

    let searchResults = await searchWeb(searchQuery, 8);
    if (searchResults.length === 0) {
        const firstSentence = text.split(/[.!?]/)[0];
        if (firstSentence?.length > 20) {
            searchResults = await searchWeb(firstSentence.substring(0, 100), 5);
        }
    }
    if (searchResults.length === 0) return { matches: [], maxSimilarity: 0 };

    let inputEmbedding = embeddingModel ? await getGeminiEmbedding(text.substring(0, 1000)) : null;

    for (const result of searchResults) {
        try {
            const snippetSim = calculateTextSimilarity(text, result.snippet || '');
            let pageSim = { combined: 0 };

            if (snippetSim.combined > 10 || (result.snippet?.length || 0) < 100) {
                const pageContent = await scrapePageContent(result.link);
                if (pageContent?.length > 100) {
                    pageSim = calculateTextSimilarity(text, pageContent);
                    if (inputEmbedding) {
                        const pageEmb = await getGeminiEmbedding(pageContent.substring(0, 1000));
                        if (pageEmb) {
                            const embSim = cosineSimilarity(inputEmbedding, pageEmb) * 100;
                            pageSim.embeddingSimilarity = Math.round(embSim);
                            pageSim.combined = Math.max(pageSim.combined, embSim);
                        }
                    }
                }
            }

            const maxSim = Math.max(snippetSim.combined, pageSim.combined);
            if (maxSim > 15) {
                webMatches.push({
                    url: result.link, title: result.title, snippet: result.snippet || '',
                    similarity: Math.round(maxSim),
                    matchType: maxSim > 80 ? 'DIRECT_COPY' : maxSim > 50 ? 'PARAPHRASED' : 'SIMILAR',
                    details: { snippetSim: snippetSim.combined, pageSim: pageSim.combined }
                });
            }
        } catch { continue; }
    }

    webMatches.sort((a, b) => b.similarity - a.similarity);
    return { matches: webMatches.slice(0, 5), maxSimilarity: webMatches[0]?.similarity || 0 };
}

export async function POST(req) {
    try {
        const startTime = Date.now();
        const { html, textContent, sourceCode, url } = await req.json();

        if (!textContent && !html && !sourceCode) {
            return NextResponse.json({ error: 'No content provided' }, { status: 400 });
        }

        console.log(`\n========== PAGE ANALYSIS START ==========`);
        console.log(`Text length: ${textContent?.length || 0} chars | URL: ${url || 'N/A'}`);

        const results = {
            timestamp: new Date().toISOString(),
            url: url || 'Unknown',
            contentAnalysis: null,
            plagiarismAnalysis: null,
            codeAnalysis: null,
            seoAnalysis: null,
            geminiAnalysis: null,
            urlAnalysis: null,
            overallVerdict: 'ORIGINAL',
            overallScore: 100,
            recommendations: [],
            processingTime: 0,
            detailedAIFactors: []
        };

        // ===== 0. URL CHECK =====
        if (url) {
            const urlCheck = checkAISourceURL(url);
            results.urlAnalysis = urlCheck;
            if (urlCheck.isAISource) {
                console.log(`[URL] AI source: ${urlCheck.source} — penalty: ${urlCheck.penalty}%`);
                results.overallScore -= urlCheck.penalty; // random 50-80
                results.recommendations.push(`🔴 Content from ${urlCheck.source} — AI generation platform detected!`);
                results.detailedAIFactors.push(`URL is AI platform: ${urlCheck.source} (penalty: ${urlCheck.penalty}%)`);
            }
        }

        // ===== 1. AI CONTENT DETECTION (npm + local + Gemini) =====
        if (textContent && textContent.length > 30) {
            // A. Combined npm detector + local patterns
            results.contentAnalysis = detectAIContent(textContent, url);
            console.log(`[AI COMBINED] Score: ${results.contentAnalysis.aiScore}%, isAI: ${results.contentAnalysis.isLikelyAI}`);
            console.log(`[AI ENGINES] npm: ${JSON.stringify(results.contentAnalysis.engines?.npmDetector ? { ai: results.contentAnalysis.engines.npmDetector.isAIGenerated, score: results.contentAnalysis.engines.npmDetector.score } : 'N/A')}`);
            console.log(`[AI ENGINES] local: ${JSON.stringify(results.contentAnalysis.engines?.localDetector ? { aiScore: results.contentAnalysis.engines.localDetector.aiScore } : 'N/A')}`);

            // B. Gemini AI detection — independent, no hints
            if (genAI && textContent.length > 50) {
                try {
                    console.log(`[GEMINI] Starting independent AI analysis...`);
                    const geminiResult = await detectAIWithGemini(textContent, genAI);

                    if (geminiResult) {
                        results.geminiAnalysis = geminiResult;
                        console.log(`[GEMINI] Verdict: ${geminiResult.verdict}, AI: ${geminiResult.aiProbability}%`);

                        // Combine: local+npm (40%) + Gemini (60%)
                        const engineScore = results.contentAnalysis.aiScore;
                        const geminiScore = geminiResult.aiProbability;

                        const combinedAIScore = Math.round(
                            Math.max(
                                (engineScore * 0.4 + geminiScore * 0.6),
                                engineScore,
                                geminiScore * 0.85
                            )
                        );

                        results.contentAnalysis.aiScore = Math.min(100, combinedAIScore);
                        results.contentAnalysis.geminiAIScore = geminiScore;
                        results.contentAnalysis.engineAIScore = engineScore;
                        results.contentAnalysis.isLikelyAI = combinedAIScore > 35;

                        // Add Gemini's own factors (it figured these out on its own)
                        if (geminiResult.keyFactors?.length > 0) {
                            geminiResult.keyFactors.forEach(f => {
                                results.detailedAIFactors.push(`🧠 Gemini: ${f}`);
                            });
                        }
                        if (geminiResult.reasoning) {
                            results.detailedAIFactors.push(`🧠 Analysis: ${geminiResult.reasoning}`);
                        }
                    }
                } catch (geminiErr) {
                    console.error('[GEMINI] Detection failed:', geminiErr.message);
                }
            }

            // Apply AI penalty
            if (results.contentAnalysis.isLikelyAI) {
                const aiPenalty = results.contentAnalysis.aiScore * 0.6;
                results.overallScore -= aiPenalty;
                results.recommendations.push(
                    `🤖 AI content detected — ${results.contentAnalysis.aiScore}% AI probability. ` +
                    `Engines: npm-detector=${results.contentAnalysis.engines?.npmDetector?.isAIGenerated ? 'AI' : 'Human'}, ` +
                    `local=${results.contentAnalysis.engines?.localDetector?.aiScore || 0}%` +
                    (results.geminiAnalysis ? `, Gemini=${results.geminiAnalysis.verdict}` : '')
                );
            }

            // Pass through detailed factors
            if (results.contentAnalysis.detailedFactors) {
                results.detailedAIFactors.push(...results.contentAnalysis.detailedFactors);
            }
        }

        // ===== 2. PLAGIARISM CHECK =====
        if (textContent && textContent.length > 100) {
            try {
                const patternResult = await checkPlagiarism(textContent.substring(0, 3000));
                const webResult = await checkWebPlagiarism(textContent.substring(0, 2000));

                const patternPenalty = patternResult ? (100 - patternResult.originalityScore) : 0;
                const webPenalty = webResult.maxSimilarity;
                const combinedPenalty = webResult.matches.length > 0 ?
                    Math.max(webPenalty, patternPenalty * 0.5) : patternPenalty;
                const combinedScore = Math.max(0, 100 - combinedPenalty);

                const allMatches = [];
                webResult.matches.forEach(m => allMatches.push({
                    type: 'WEB', source: m.title, url: m.url, similarity: m.similarity,
                    matchType: m.matchType, snippet: m.snippet.substring(0, 200)
                }));
                patternResult?.matches?.forEach(m => allMatches.push({
                    type: 'PATTERN', source: `Pattern: ${m.type}`, url: null,
                    similarity: Math.round(patternPenalty / (patternResult.matches.length || 1)),
                    matchType: 'PATTERN', snippet: m.reason
                }));

                results.plagiarismAnalysis = {
                    originalityScore: combinedScore, matchCount: allMatches.length,
                    matches: allMatches, webMatchCount: webResult.matches.length,
                    patternMatchCount: patternResult?.matches?.length || 0,
                    maxWebSimilarity: webResult.maxSimilarity,
                    verdict: combinedScore >= 80 ? 'ORIGINAL' : combinedScore >= 50 ? 'SUSPICIOUS' : 'LIKELY_PLAGIARIZED'
                };

                if (combinedScore < 70) {
                    results.overallScore -= (100 - combinedScore) * 0.5;
                    results.recommendations.push(`📋 Plagiarism: ${allMatches.length} matches found. Originality: ${combinedScore}%`);
                }
            } catch (plagError) {
                console.error('[PLAG] Error:', plagError);
                results.plagiarismAnalysis = { originalityScore: 100, matchCount: 0, matches: [], verdict: 'UNCHECKED', error: plagError.message };
            }
        }

        // ===== 3. CODE ANALYSIS =====
        if (sourceCode && sourceCode.length > 50) {
            results.codeAnalysis = detectAIGeneratedCode(sourceCode);
            if (results.codeAnalysis.isLikelyAI) {
                results.overallScore -= results.codeAnalysis.aiScore * 0.2;
                results.recommendations.push('💻 Code appears AI-generated.');
            }
        }

        // ===== 4. SEO ANALYSIS =====
        if (html && textContent) {
            results.seoAnalysis = analyzeSEO(html, textContent);
            if (results.seoAnalysis.score < 70) results.overallScore -= (100 - results.seoAnalysis.score) * 0.1;
            if (results.seoAnalysis.aiContentPenalty > 0) results.recommendations.push('📉 AI content may hurt SEO rankings.');
            results.seoAnalysis.issues.slice(0, 3).forEach(i => results.recommendations.push(`📊 SEO: ${i}`));
        }

        // ===== 5. FINAL VERDICT =====
        results.overallScore = Math.max(0, Math.round(results.overallScore));
        const aiScore = results.contentAnalysis?.aiScore || 0;
        const urlIsAI = url ? checkAISourceURL(url).isAISource : false;

        if (urlIsAI) {
            results.overallVerdict = 'AI_GENERATED';
            results.overallScore = Math.min(results.overallScore, 15);
        } else if (aiScore >= 70) {
            results.overallVerdict = 'AI_GENERATED';
            results.overallScore = Math.min(results.overallScore, 30);
        } else if (aiScore >= 45) {
            results.overallVerdict = 'MIXED_CONTENT';
            results.overallScore = Math.min(results.overallScore, 55);
        } else if (results.overallScore >= 80) {
            results.overallVerdict = 'ORIGINAL';
        } else if (results.overallScore >= 50) {
            results.overallVerdict = 'MIXED_CONTENT';
        } else if (results.contentAnalysis?.isLikelyAI) {
            results.overallVerdict = 'AI_GENERATED';
        } else {
            results.overallVerdict = 'PLAGIARIZED';
        }

        results.processingTime = Date.now() - startTime;
        console.log(`========== DONE: ${results.overallScore}%, ${results.overallVerdict}, AI=${aiScore}%, ${results.processingTime}ms ==========\n`);

        return NextResponse.json(results);
    } catch (error) {
        console.error('[PAGE] Error:', error);
        return NextResponse.json({ error: 'Analysis failed: ' + error.message }, { status: 500 });
    }
}
