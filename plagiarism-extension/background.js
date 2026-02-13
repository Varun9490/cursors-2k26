// Background service worker for context menu and badge updates
// Enhanced with comprehensive AI detection, URL checking, and Gemini integration

// API Base URLs - Try local first, then production
const API_BASE_URL = 'http://localhost:3000';
const PRODUCTION_URL = 'https://cursors-2k26.vercel.app';

// =====================================================
// AI SOURCE URLS
// =====================================================
const AI_SOURCE_URLS = [
    'chat.openai.com', 'chatgpt.com', 'claude.ai', 'anthropic.com',
    'bard.google.com', 'gemini.google.com', 'copilot.microsoft.com',
    'perplexity.ai', 'you.com', 'poe.com', 'character.ai',
    'writesonic.com', 'jasper.ai', 'copy.ai', 'rytr.me',
    'quillbot.com', 'wordtune.com', 'huggingface.co', 'deepai.org'
];

function isAISourceURL(url) {
    if (!url) return { isAI: false };
    const lowerUrl = url.toLowerCase();
    for (const domain of AI_SOURCE_URLS) {
        if (lowerUrl.includes(domain)) {
            return { isAI: true, source: domain };
        }
    }
    return { isAI: false };
}

// =====================================================
// ENHANCED OFFLINE PATTERN ANALYSIS
// =====================================================
const AI_PATTERNS = {
    chatgptPhrases: [
        'delve into', 'delve deeper', 'it\'s important to note', 'it\'s worth noting',
        'it is important to note', 'it is worth noting', 'in today\'s rapidly',
        'in today\'s digital', 'in today\'s world', 'in today\'s fast-paced',
        'let\'s explore', 'let\'s dive', 'let\'s break down', 'let\'s take a closer look',
        'here are some key', 'here are the key', 'here\'s a comprehensive',
        'plays a crucial role', 'plays a vital role', 'plays an important role',
        'is a powerful tool', 'is a game-changer', 'is a game changer',
        'offers a wide range', 'provides a comprehensive', 'ensures that',
        'it\'s crucial to', 'it\'s essential to', 'it is crucial to',
        'navigating the complexities', 'navigating the world',
        'landscape of', 'ever-evolving', 'ever-changing',
        'this comprehensive guide', 'in this article',
        'unlock the full potential', 'unleash the power',
        'a testament to', 'a deep dive', 'deep dive into',
        'stands out as', 'stands as a', 'emerge as',
        'at the core of', 'at its core', 'at the heart of',
        'understanding the nuances', 'nuances of',
        'a myriad of', 'a plethora of', 'a multitude of',
        'serves as a', 'acts as a catalyst',
        'paves the way', 'sets the stage',
        'in the realm of', 'in the world of',
        'first and foremost', 'last but not least'
    ],
    buzzwords: [
        'leverage', 'utilize', 'furthermore', 'moreover',
        'comprehensive', 'robust', 'seamless', 'streamline',
        'cutting-edge', 'state-of-the-art', 'innovative', 'revolutionary',
        'paradigm', 'synergy', 'optimize', 'enhance', 'facilitate', 'empower',
        'holistic', 'scalable', 'dynamic', 'ecosystem', 'landscape',
        'navigate', 'unpack', 'dive deep', 'at the end of the day',
        'elevate', 'foster', 'harness', 'pivotal', 'paramount',
        'transformative', 'groundbreaking', 'actionable',
        'best practices', 'key takeaways', 'moving forward',
        'game-changer', 'tapestry', 'underscores', 'cornerstone'
    ],
    transitions: [
        'additionally', 'consequently', 'nevertheless', 'nonetheless',
        'subsequently', 'accordingly', 'hence', 'thus', 'therefore',
        'in addition', 'as a result', 'on the other hand', 'in contrast',
        'notably', 'significantly', 'importantly', 'essentially',
        'fundamentally', 'ultimately', 'inherently', 'arguably'
    ],
    starters: [
        'In the realm of', 'When it comes to', 'It goes without saying',
        'Moving forward', 'That being said', 'With that in mind',
        'It\'s no secret that', 'There\'s no denying',
        'One of the most', 'In order to', 'As we navigate',
        'In an era', 'In a world where', 'With the advent of'
    ],
    genericPhrases: [
        'according to recent studies', 'it is widely known that', 'research has shown that',
        'studies have shown', 'experts believe', 'in conclusion',
        'as mentioned above', 'in summary', 'to summarize',
        'as previously stated', 'it should be noted',
        'needless to say', 'as we can see'
    ],
    wikiPatterns: [
        /\(born \d{4}\)/gi,
        /also known as/gi,
        /is a [a-z]+ (that|which|who)/gi,
        /was a [a-z]+ (that|which|who)/gi,
        /according to/gi
    ],
    copyPastePatterns: [
        /\s{3,}/g,
        /[\u200B-\u200D\uFEFF]/g,
        /\t/g,
        /[\u00A0]/g
    ]
};

function performOfflineAnalysis(text, pageUrl = null) {
    if (!text || text.length < 30) {
        return { score: 100, matches: [], verdict: 'TOO_SHORT', isOffline: true, aiScore: 0 };
    }

    const lowerText = text.toLowerCase();
    const words = text.split(/\s+/).filter(w => w.length > 0);
    const wordCount = words.length;
    const sentences = text.split(/[.!?]+/).filter(s => s.trim().length > 5);
    const normalizedText = lowerText.replace(/[^\w\s]/g, '').replace(/\s+/g, ' ').trim();

    let penalty = 0;
    let aiPenalty = 0;
    let matches = [];

    // 1. Em Dashes (—) - STRONG AI indicator
    const emDashCount = (text.match(/—/g) || []).length;
    const enDashCount = (text.match(/–/g) || []).length;
    const totalDashes = emDashCount + enDashCount;
    if (totalDashes >= 3) {
        aiPenalty += 25;
        penalty += 15;
        matches.push({ type: 'ai', description: `${totalDashes} em dashes — strong AI indicator` });
    } else if (totalDashes >= 1) {
        aiPenalty += 12;
        penalty += 6;
        matches.push({ type: 'ai', description: `${totalDashes} em/en dashes found` });
    }

    // 2. ChatGPT phrases
    let chatgptCount = 0;
    for (const phrase of AI_PATTERNS.chatgptPhrases) {
        if (lowerText.includes(phrase.toLowerCase())) chatgptCount++;
    }
    if (chatgptCount >= 5) {
        aiPenalty += 30; penalty += 15;
        matches.push({ type: 'ai', description: `${chatgptCount} ChatGPT-typical phrases` });
    } else if (chatgptCount >= 3) {
        aiPenalty += 20; penalty += 10;
        matches.push({ type: 'ai', description: `${chatgptCount} ChatGPT phrases` });
    } else if (chatgptCount >= 1) {
        aiPenalty += 8; penalty += 4;
    }

    // 3. AI buzzwords
    let buzzCount = 0;
    for (const word of AI_PATTERNS.buzzwords) {
        if (lowerText.includes(word)) buzzCount++;
    }
    if (buzzCount >= 5) {
        aiPenalty += 15; penalty += 8;
        matches.push({ type: 'ai', description: `${buzzCount} AI buzzwords` });
    } else if (buzzCount >= 3) {
        aiPenalty += 8; penalty += 4;
    }

    // 4. Transition overuse
    let transCount = 0;
    for (const t of AI_PATTERNS.transitions) {
        const regex = new RegExp(`\\b${t}\\b`, 'gi');
        transCount += (lowerText.match(regex) || []).length;
    }
    const transDensity = (transCount / wordCount) * 100;
    if (transDensity > 2.5) {
        aiPenalty += 12; penalty += 6;
        matches.push({ type: 'ai', description: `High transition density: ${transDensity.toFixed(1)}%` });
    }

    // 5. Sentence uniformity
    if (sentences.length > 4) {
        const lengths = sentences.map(s => s.trim().split(/\s+/).length);
        const avgLen = lengths.reduce((a, b) => a + b, 0) / lengths.length;
        const variance = lengths.reduce((sum, l) => sum + Math.pow(l - avgLen, 2), 0) / lengths.length;
        const cv = Math.sqrt(variance) / avgLen;
        if (cv < 0.3 && avgLen > 10) {
            aiPenalty += 12; penalty += 6;
            matches.push({ type: 'ai', description: 'Very uniform sentence lengths (AI pattern)' });
        }
    }

    // 6. Formulaic starters
    let starterCount = 0;
    for (const starter of AI_PATTERNS.starters) {
        if (lowerText.includes(starter.toLowerCase())) starterCount++;
    }
    if (starterCount >= 2) {
        aiPenalty += 10; penalty += 5;
        matches.push({ type: 'ai', description: `${starterCount} formulaic starters` });
    }

    // 7. No personal pronouns
    const personalPronouns = (text.match(/\b(I|my|me|myself|we|our|us)\b/gi) || []).length;
    const pronounDensity = (personalPronouns / wordCount) * 100;
    if (pronounDensity < 0.3 && wordCount > 80) {
        aiPenalty += 8; penalty += 4;
        matches.push({ type: 'ai', description: 'Impersonal writing (no I/my/we)' });
    }

    // 8. No contractions
    const formalForms = (text.match(/\b(it is|do not|does not|cannot|will not|would not|should not)\b/gi) || []).length;
    const contractions = (text.match(/\b(it's|don't|doesn't|can't|won't|wouldn't|shouldn't)\b/gi) || []).length;
    if (formalForms > 2 && contractions === 0 && wordCount > 80) {
        aiPenalty += 6; penalty += 3;
        matches.push({ type: 'ai', description: 'No contractions (formal AI style)' });
    }

    // 9. URL check
    if (pageUrl) {
        const urlCheck = isAISourceURL(pageUrl);
        if (urlCheck.isAI) {
            aiPenalty += 50; penalty += 40;
            matches.push({ type: 'ai_source', description: `Content from ${urlCheck.source} (AI platform)` });
        }
    }

    // 10. Generic phrases
    let genericFound = AI_PATTERNS.genericPhrases.filter(p => normalizedText.includes(p.toLowerCase())).length;
    if (genericFound >= 2) {
        penalty += Math.min(genericFound * 4, 15);
        matches.push({ type: 'generic', description: `${genericFound} academic template phrases` });
    }

    // 11. Wiki patterns
    let wikiFound = AI_PATTERNS.wikiPatterns.filter(p => p.test(text)).length;
    if (wikiFound >= 1) {
        penalty += wikiFound * 5;
        matches.push({ type: 'wiki', description: 'Encyclopedia-style writing' });
    }

    // 12. Copy-paste artifacts
    let copyPasteFound = AI_PATTERNS.copyPastePatterns.some(p => p.test(text));
    if (copyPasteFound) {
        penalty += 8;
        matches.push({ type: 'formatting', description: 'Copy-paste artifacts detected' });
    }

    // 13. Repetitive sentence structures
    if (sentences.length > 5) {
        const sentenceStarts = sentences.map(s => s.trim().split(' ').slice(0, 3).join(' ').toLowerCase());
        const uniqueStarts = new Set(sentenceStarts);
        if (uniqueStarts.size < sentenceStarts.length * 0.5) {
            penalty += 10;
            matches.push({ type: 'structure', description: 'Repetitive sentence structures' });
        }
    }

    // 14. N-gram repetition
    if (words.length > 20) {
        const fourGrams = [];
        const normWords = normalizedText.split(' ').filter(w => w.length > 0);
        for (let i = 0; i <= normWords.length - 4; i++) {
            fourGrams.push(normWords.slice(i, i + 4).join(' '));
        }
        const uniqueFourGrams = new Set(fourGrams);
        const repetitionRatio = 1 - (uniqueFourGrams.size / fourGrams.length);
        if (repetitionRatio > 0.3) {
            penalty += 12;
            matches.push({ type: 'repetition', description: 'High text repetition' });
        }
    }

    // Calculate scores
    penalty = Math.min(penalty, 85);
    aiPenalty = Math.min(aiPenalty, 100);

    const score = Math.max(0, 100 - penalty);
    const aiScore = Math.min(100, aiPenalty);

    let verdict;
    if (aiScore >= 60) verdict = 'AI_GENERATED';
    else if (score < 40) verdict = 'LIKELY_PLAGIARIZED';
    else if (score < 60 || aiScore >= 40) verdict = 'SUSPICIOUS';
    else if (score < 80) verdict = 'MOSTLY_ORIGINAL';
    else verdict = 'ORIGINAL';

    return {
        score, aiScore, matches,
        matchCount: matches.length,
        verdict, isOffline: true,
        analysisType: 'pattern'
    };
}

// =====================================================
// API HELPER WITH FALLBACK
// =====================================================
async function fetchWithFallback(endpoint, options) {
    try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 10000);
        const localResponse = await fetch(`${API_BASE_URL}${endpoint}`, {
            ...options, signal: controller.signal
        });
        clearTimeout(timeoutId);
        if (localResponse.ok) {
            console.log('Using local server');
            return await localResponse.json();
        }
    } catch (localError) {
        console.log('Local server unavailable, trying production...');
    }

    try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 15000);
        const prodResponse = await fetch(`${PRODUCTION_URL}${endpoint}`, {
            ...options, signal: controller.signal
        });
        clearTimeout(timeoutId);
        if (prodResponse.ok) {
            console.log('Using production server');
            return await prodResponse.json();
        }
        throw new Error('Production API error');
    } catch (prodError) {
        console.error('Both servers failed:', prodError);
        throw prodError;
    }
}

// =====================================================
// CREATE CONTEXT MENUS
// =====================================================
chrome.runtime.onInstalled.addListener(() => {
    console.log('PlagDetect Extension Installed/Updated (v2.0)');

    chrome.contextMenus.removeAll(() => {
        chrome.contextMenus.create({
            id: "quickCheck",
            title: "⚡ Quick Check (Offline)",
            contexts: ["selection"]
        });

        chrome.contextMenus.create({
            id: "checkTextPlagiarism",
            title: "🔍 Full Plagiarism Check",
            contexts: ["selection"]
        });

        chrome.contextMenus.create({
            id: "checkCodePlagiarism",
            title: "💻 Check Code Similarity",
            contexts: ["selection"]
        });

        chrome.contextMenus.create({
            id: "separator1",
            type: "separator",
            contexts: ["selection"]
        });

        chrome.contextMenus.create({
            id: "checkAI",
            title: "🤖 Check for AI Content",
            contexts: ["selection"]
        });
    });
});

// =====================================================
// HANDLE CONTEXT MENU CLICKS
// =====================================================
chrome.contextMenus.onClicked.addListener(async (info, tab) => {
    if (!info.selectionText) return;

    const text = info.selectionText;

    if (text.length < 20) {
        showNotification('Text Too Short', 'Please select at least 20 characters');
        chrome.action.setBadgeText({ text: '!' });
        chrome.action.setBadgeBackgroundColor({ color: '#EF4444' });
        return;
    }

    // Get the current URL
    const pageUrl = tab?.url || '';

    // ===== QUICK OFFLINE CHECK =====
    if (info.menuItemId === 'quickCheck') {
        const result = performOfflineAnalysis(text, pageUrl);

        chrome.action.setBadgeText({ text: Math.round(result.score) + '%' });
        chrome.action.setBadgeBackgroundColor({
            color: result.score >= 80 && result.aiScore < 30 ? '#10B981' :
                result.score >= 50 ? '#F59E0B' : '#EF4444'
        });

        chrome.storage.local.set({
            lastResult: {
                score: result.score,
                aiScore: result.aiScore,
                matchCount: result.matchCount,
                matches: result.matches,
                verdict: result.verdict,
                isOffline: true,
                timestamp: Date.now()
            }
        });

        showNotification(
            result.aiScore >= 50 ? `AI Detected: ${result.aiScore}%` : `Originality: ${Math.round(result.score)}%`,
            result.verdict.replace(/_/g, ' ') + (result.matchCount > 0 ? ` (${result.matchCount} issues)` : '')
        );
        return;
    }

    // ===== FULL API CHECKS =====
    chrome.action.setBadgeText({ text: '...' });
    chrome.action.setBadgeBackgroundColor({ color: '#667eea' });

    try {
        let endpoint, body;

        switch (info.menuItemId) {
            case 'checkTextPlagiarism':
                endpoint = '/api/analyze/page';
                body = { textContent: text, html: `<html><body>${text}</body></html>`, url: pageUrl };
                break;

            case 'checkCodePlagiarism':
                endpoint = '/api/plagiarism/code';
                body = { code: text, language: 'auto' };
                break;

            case 'checkAI':
                endpoint = '/api/analyze/page';
                body = { textContent: text, html: `<html><body>${text}</body></html>`, url: pageUrl };
                break;

            default:
                return;
        }

        const data = await fetchWithFallback(endpoint, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(body)
        });

        let score, matchCount, verdict, aiScore;

        if (info.menuItemId === 'checkAI') {
            aiScore = data.contentAnalysis?.aiScore || 0;
            const urlCheck = isAISourceURL(pageUrl);
            if (urlCheck.isAI) aiScore = Math.max(aiScore, 90);

            score = 100 - aiScore;
            matchCount = aiScore > 35 ? 1 : 0;
            verdict = aiScore > 60 ? 'AI_GENERATED' : aiScore > 35 ? 'MIXED' : 'HUMAN_WRITTEN';
        } else {
            score = data.overallScore || data.originalityScore || 0;
            matchCount = data.totalMatches || data.plagiarismAnalysis?.matchCount || 0;
            verdict = data.overallVerdict || data.verdict || 'UNKNOWN';
            aiScore = data.contentAnalysis?.aiScore || 0;
        }

        chrome.action.setBadgeText({ text: Math.round(score) + '%' });
        chrome.action.setBadgeBackgroundColor({
            color: score >= 80 ? '#10B981' : score >= 50 ? '#F59E0B' : '#EF4444'
        });

        chrome.storage.local.set({
            lastResult: {
                score, reportId: data.reportId,
                matchCount, verdict,
                aiScore,
                webMatchCount: data.plagiarismAnalysis?.webMatchCount,
                isOffline: false,
                timestamp: Date.now()
            }
        });

        showNotification(
            info.menuItemId === 'checkAI' ?
                `AI: ${aiScore}% | Human: ${100 - aiScore}%` :
                `Originality: ${Math.round(score)}%`,
            verdict.replace(/_/g, ' ') + (matchCount > 0 ? ` (${matchCount} matches)` : '')
        );

    } catch (err) {
        console.error('Analysis failed:', err);

        const fallbackResult = performOfflineAnalysis(text, pageUrl);

        chrome.action.setBadgeText({ text: Math.round(fallbackResult.score) + '%' });
        chrome.action.setBadgeBackgroundColor({
            color: fallbackResult.score >= 80 ? '#10B981' : fallbackResult.score >= 50 ? '#F59E0B' : '#EF4444'
        });

        chrome.storage.local.set({
            lastResult: {
                score: fallbackResult.score,
                aiScore: fallbackResult.aiScore,
                matchCount: fallbackResult.matchCount,
                verdict: fallbackResult.verdict,
                isOffline: true,
                isFallback: true,
                timestamp: Date.now()
            }
        });

        showNotification(
            `Offline Result: ${Math.round(fallbackResult.score)}%`,
            'Server unavailable - using pattern analysis'
        );
    }
});

// =====================================================
// HELPER FUNCTIONS
// =====================================================
function showNotification(title, message) {
    if (chrome.notifications) {
        chrome.notifications.create({
            type: 'basic',
            iconUrl: 'icons/icon128.png',
            title: 'PlagDetect: ' + title,
            message: message
        });
    }
}

// Keyboard shortcut handler
chrome.commands?.onCommand?.addListener((command) => {
    if (command === 'quick-check') {
        chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
            if (!tabs || tabs.length === 0) return;
            const pageUrl = tabs[0].url || '';

            chrome.scripting.executeScript({
                target: { tabId: tabs[0].id },
                function: () => window.getSelection().toString()
            }, (results) => {
                if (results && results[0] && results[0].result) {
                    const text = results[0].result;
                    if (text.length >= 20) {
                        const result = performOfflineAnalysis(text, pageUrl);

                        chrome.action.setBadgeText({ text: Math.round(result.score) + '%' });
                        chrome.action.setBadgeBackgroundColor({
                            color: result.score >= 80 ? '#10B981' : result.score >= 50 ? '#F59E0B' : '#EF4444'
                        });

                        chrome.storage.local.set({
                            lastResult: { ...result, timestamp: Date.now() }
                        });

                        showNotification(
                            `Quick Check: ${Math.round(result.score)}%`,
                            result.verdict.replace(/_/g, ' ')
                        );
                    }
                }
            });
        });
    }
});

console.log('PlagDetect background service worker loaded (v2.0 - Enhanced AI Detection)');
