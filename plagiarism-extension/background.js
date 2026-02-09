// Background service worker for context menu and badge updates
// Enhanced with offline pattern analysis fallback

// API Base URL - Production
const API_BASE_URL = 'https://cursors-2k26.vercel.app';

// =====================================================
// OFFLINE PATTERN ANALYSIS (works without server)
// =====================================================
const PLAGIARISM_PATTERNS = {
    // Academic template phrases (high indicator)
    genericPhrases: [
        'according to recent studies',
        'it is widely known that',
        'research has shown that',
        'studies have shown',
        'experts believe',
        'it is important to note',
        'in conclusion',
        'as mentioned above',
        'furthermore',
        'in summary',
        'to summarize',
        'as previously stated',
        'it should be noted',
        'it goes without saying',
        'needless to say',
        'as we can see'
    ],
    // Wikipedia-style patterns
    wikiPatterns: [
        /\(born \d{4}\)/gi,
        /also known as/gi,
        /is a [a-z]+ (that|which|who)/gi,
        /was a [a-z]+ (that|which|who)/gi,
        /according to/gi
    ],
    // AI-generated text patterns
    aiPatterns: [
        'in the realm of',
        'when it comes to',
        'it goes without saying',
        'moving forward',
        'that being said',
        'at the end of the day',
        'dive deep into',
        'game-changer',
        'leverage',
        'synergy',
        'utilize'
    ],
    // Copy-paste artifacts
    copyPastePatterns: [
        /\s{3,}/g,                    // Multiple spaces
        /[\u200B-\u200D\uFEFF]/g,     // Hidden characters
        /\t/g,                        // Tabs
        /[\u00A0]/g                   // Non-breaking spaces
    ]
};

function performOfflineAnalysis(text) {
    if (!text || text.length < 50) {
        return { score: 100, matches: [], verdict: 'TOO_SHORT', isOffline: true };
    }

    const normalizedText = text.toLowerCase().replace(/[^\w\s]/g, '').replace(/\s+/g, ' ').trim();
    const words = normalizedText.split(' ').filter(w => w.length > 0);
    const sentences = text.split(/[.!?]+/).filter(s => s.trim().length > 10);

    let penalty = 0;
    let matches = [];

    // 1. Check generic academic phrases
    let genericFound = 0;
    for (const phrase of PLAGIARISM_PATTERNS.genericPhrases) {
        if (normalizedText.includes(phrase)) {
            genericFound++;
        }
    }
    if (genericFound >= 2) {
        penalty += Math.min(genericFound * 5, 20);
        matches.push({ type: 'generic', count: genericFound, description: `${genericFound} academic template phrases detected` });
    }

    // 2. Check Wikipedia patterns
    let wikiFound = 0;
    for (const pattern of PLAGIARISM_PATTERNS.wikiPatterns) {
        if (pattern.test(text)) {
            wikiFound++;
        }
    }
    if (wikiFound >= 1) {
        penalty += wikiFound * 8;
        matches.push({ type: 'wiki', count: wikiFound, description: 'Encyclopedia-style writing detected' });
    }

    // 3. Check AI patterns
    let aiFound = 0;
    for (const phrase of PLAGIARISM_PATTERNS.aiPatterns) {
        if (normalizedText.includes(phrase)) {
            aiFound++;
        }
    }
    if (aiFound >= 2) {
        penalty += Math.min(aiFound * 6, 25);
        matches.push({ type: 'ai', count: aiFound, description: `${aiFound} AI-style phrases detected` });
    }

    // 4. Check copy-paste artifacts
    let copyPasteFound = false;
    for (const pattern of PLAGIARISM_PATTERNS.copyPastePatterns) {
        if (pattern.test(text)) {
            copyPasteFound = true;
            break;
        }
    }
    if (copyPasteFound) {
        penalty += 10;
        matches.push({ type: 'formatting', description: 'Copy-paste artifacts detected' });
    }

    // 5. Check for repetitive sentence structures
    if (sentences.length > 5) {
        const sentenceStarts = sentences.map(s => s.trim().split(' ').slice(0, 3).join(' ').toLowerCase());
        const uniqueStarts = new Set(sentenceStarts);
        if (uniqueStarts.size < sentenceStarts.length * 0.5) {
            penalty += 12;
            matches.push({ type: 'structure', description: 'Repetitive sentence structures' });
        }
    }

    // 6. Check for impersonal writing in long texts
    const personalPronouns = ['i ', 'we ', 'my ', 'our ', 'me '];
    const hasPersonalVoice = personalPronouns.some(p => normalizedText.includes(p));
    if (!hasPersonalVoice && words.length > 100) {
        penalty += 5;
        matches.push({ type: 'voice', description: 'Impersonal writing style' });
    }

    // 7. N-gram repetition check
    if (words.length > 20) {
        const fourGrams = [];
        for (let i = 0; i <= words.length - 4; i++) {
            fourGrams.push(words.slice(i, i + 4).join(' '));
        }
        const uniqueFourGrams = new Set(fourGrams);
        const repetitionRatio = 1 - (uniqueFourGrams.size / fourGrams.length);
        if (repetitionRatio > 0.3) {
            penalty += 15;
            matches.push({ type: 'repetition', description: 'High text repetition detected' });
        }
    }

    // Cap penalty at 75%
    penalty = Math.min(penalty, 75);
    const score = Math.max(0, 100 - penalty);

    // Determine verdict
    let verdict = 'ORIGINAL';
    if (score < 50) verdict = 'LIKELY_PLAGIARIZED';
    else if (score < 70) verdict = 'SUSPICIOUS';
    else if (score < 85) verdict = 'MOSTLY_ORIGINAL';

    return {
        score,
        matches,
        matchCount: matches.length,
        verdict,
        isOffline: true,
        analysisType: 'pattern'
    };
}

// =====================================================
// CREATE CONTEXT MENUS
// =====================================================
chrome.runtime.onInstalled.addListener(() => {
    console.log('PlagDetect Extension Installed/Updated');

    // Remove existing menus first
    chrome.contextMenus.removeAll(() => {
        // Quick check (offline pattern analysis)
        chrome.contextMenus.create({
            id: "quickCheck",
            title: "⚡ Quick Check (Offline)",
            contexts: ["selection"]
        });

        // Full plagiarism check (uses API)
        chrome.contextMenus.create({
            id: "checkTextPlagiarism",
            title: "🔍 Full Plagiarism Check",
            contexts: ["selection"]
        });

        // Code similarity check
        chrome.contextMenus.create({
            id: "checkCodePlagiarism",
            title: "💻 Check Code Similarity",
            contexts: ["selection"]
        });

        // Separator
        chrome.contextMenus.create({
            id: "separator1",
            type: "separator",
            contexts: ["selection"]
        });

        // AI detection
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

    // ===== QUICK OFFLINE CHECK =====
    if (info.menuItemId === 'quickCheck') {
        const result = performOfflineAnalysis(text);

        // Update badge
        chrome.action.setBadgeText({ text: Math.round(result.score) + '%' });
        chrome.action.setBadgeBackgroundColor({
            color: result.score >= 80 ? '#10B981' : result.score >= 50 ? '#F59E0B' : '#EF4444'
        });

        // Store result for popup and content script
        chrome.storage.local.set({
            lastResult: {
                score: result.score,
                matchCount: result.matchCount,
                matches: result.matches,
                verdict: result.verdict,
                isOffline: true,
                timestamp: Date.now()
            }
        });

        // Show notification
        showNotification(
            `Originality: ${Math.round(result.score)}%`,
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
                endpoint = `${API_BASE_URL}/api/analyze/page`;
                body = { textContent: text, html: `<html><body>${text}</body></html>` };
                break;

            case 'checkCodePlagiarism':
                endpoint = `${API_BASE_URL}/api/plagiarism/code`;
                body = { code: text, language: 'auto' };
                break;

            case 'checkAI':
                endpoint = `${API_BASE_URL}/api/analyze/page`;
                body = { textContent: text, html: `<html><body>${text}</body></html>` };
                break;

            default:
                return;
        }

        const res = await fetch(endpoint, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(body)
        });

        if (!res.ok) throw new Error('API Error');

        const data = await res.json();

        let score, matchCount, verdict;

        if (info.menuItemId === 'checkAI') {
            // For AI detection, show AI probability
            score = 100 - (data.contentAnalysis?.aiScore || 0);
            matchCount = data.contentAnalysis?.aiScore > 50 ? 1 : 0;
            verdict = data.contentAnalysis?.aiScore > 50 ? 'AI_DETECTED' : 'HUMAN_WRITTEN';
        } else {
            score = data.overallScore || data.originalityScore || 0;
            matchCount = data.totalMatches || data.plagiarismAnalysis?.matchCount || 0;
            verdict = data.overallVerdict || data.verdict || 'UNKNOWN';
        }

        // Update badge
        chrome.action.setBadgeText({ text: Math.round(score) + '%' });
        chrome.action.setBadgeBackgroundColor({
            color: score >= 80 ? '#10B981' : score >= 50 ? '#F59E0B' : '#EF4444'
        });

        // Store result
        chrome.storage.local.set({
            lastResult: {
                score,
                reportId: data.reportId,
                matchCount,
                verdict,
                aiScore: data.contentAnalysis?.aiScore,
                isOffline: false,
                timestamp: Date.now()
            }
        });

        // Show notification
        showNotification(
            `Originality: ${Math.round(score)}%`,
            verdict.replace(/_/g, ' ') + (matchCount > 0 ? ` (${matchCount} matches)` : '')
        );

    } catch (err) {
        console.error('Analysis failed:', err);

        // Fallback to offline analysis
        const fallbackResult = performOfflineAnalysis(text);

        chrome.action.setBadgeText({ text: Math.round(fallbackResult.score) + '%' });
        chrome.action.setBadgeBackgroundColor({
            color: fallbackResult.score >= 80 ? '#10B981' : fallbackResult.score >= 50 ? '#F59E0B' : '#EF4444'
        });

        chrome.storage.local.set({
            lastResult: {
                score: fallbackResult.score,
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
    // Try to use notifications API if available
    if (chrome.notifications) {
        chrome.notifications.create({
            type: 'basic',
            iconUrl: 'icons/icon128.png',
            title: 'PlagDetect: ' + title,
            message: message
        });
    }
}

// Clear badge after 60 seconds
setInterval(() => {
    chrome.action.getBadgeText({}, (text) => {
        if (text && text !== '...' && text !== '!') {
            // Keep badge for 60 seconds instead of 30
        }
    });
}, 60000);

// Keyboard shortcut handler
chrome.commands?.onCommand?.addListener((command) => {
    if (command === 'quick-check') {
        chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
            chrome.scripting.executeScript({
                target: { tabId: tabs[0].id },
                function: () => window.getSelection().toString()
            }, (results) => {
                if (results && results[0] && results[0].result) {
                    const text = results[0].result;
                    if (text.length >= 20) {
                        const result = performOfflineAnalysis(text);
                        chrome.storage.local.set({ lastResult: { ...result, timestamp: Date.now() } });
                    }
                }
            });
        });
    }
});

console.log('PlagDetect background service worker loaded');
