// Background service worker for context menu and badge updates

// Create context menu on install
chrome.runtime.onInstalled.addListener(() => {
    console.log('PlagDetect Extension Installed');

    // Context menu for selected text
    chrome.contextMenus.create({
        id: "checkTextPlagiarism",
        title: "🔍 Check Plagiarism",
        contexts: ["selection"]
    });

    // Context menu for code (same selection but labeled differently)
    chrome.contextMenus.create({
        id: "checkCodePlagiarism",
        title: "💻 Check Code Similarity",
        contexts: ["selection"]
    });
});

// Handle context menu clicks
chrome.contextMenus.onClicked.addListener(async (info, tab) => {
    if (!info.selectionText) return;

    const text = info.selectionText;

    if (text.length < 20) {
        // Show notification for short text
        chrome.action.setBadgeText({ text: '!' });
        chrome.action.setBadgeBackgroundColor({ color: '#EF4444' });
        return;
    }

    // Set loading badge
    chrome.action.setBadgeText({ text: '...' });
    chrome.action.setBadgeBackgroundColor({ color: '#667eea' });

    try {
        let endpoint = 'http://localhost:3000/api/plagiarism/semantic';
        let body = { text, threshold: 0.5, filename: 'Context Menu Selection' };

        if (info.menuItemId === 'checkCodePlagiarism') {
            endpoint = 'http://localhost:3000/api/plagiarism/code';
            body = { code: text, language: 'javascript' };
        }

        const res = await fetch(endpoint, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(body)
        });

        if (!res.ok) throw new Error('API Error');

        const data = await res.json();
        const score = data.overallScore || data.originalityScore || 0;

        // Update badge with score
        chrome.action.setBadgeText({ text: Math.round(score) + '%' });
        chrome.action.setBadgeBackgroundColor({
            color: score >= 80 ? '#10B981' : score >= 50 ? '#F59E0B' : '#EF4444'
        });

        // Store result for popup to display
        chrome.storage.local.set({
            lastResult: {
                score,
                reportId: data.reportId,
                matchCount: data.totalMatches || 0,
                timestamp: Date.now()
            }
        });

    } catch (err) {
        console.error('Analysis failed:', err);
        chrome.action.setBadgeText({ text: 'ERR' });
        chrome.action.setBadgeBackgroundColor({ color: '#EF4444' });
    }
});

// Clear badge after 30 seconds
setInterval(() => {
    chrome.action.setBadgeText({ text: '' });
}, 30000);
