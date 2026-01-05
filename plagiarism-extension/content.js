// Content script - runs on all pages

// Listen for messages from popup or background
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.action === 'getSelection') {
        sendResponse({ text: window.getSelection().toString() });
    }
    if (request.action === 'getPageText') {
        sendResponse({ text: document.body.innerText });
    }
    return true; // Keep channel open for async response
});

// Add visual indicator when text is being analyzed
function showAnalyzingIndicator() {
    const existing = document.getElementById('plagdetect-indicator');
    if (existing) existing.remove();

    const indicator = document.createElement('div');
    indicator.id = 'plagdetect-indicator';
    indicator.innerHTML = `
        <div style="
            position: fixed;
            bottom: 20px;
            right: 20px;
            background: linear-gradient(135deg, #667eea, #764ba2);
            color: white;
            padding: 12px 20px;
            border-radius: 12px;
            font-family: system-ui, sans-serif;
            font-size: 14px;
            font-weight: 500;
            box-shadow: 0 4px 20px rgba(102, 126, 234, 0.4);
            z-index: 999999;
            display: flex;
            align-items: center;
            gap: 10px;
            animation: slideIn 0.3s ease;
        ">
            <div style="
                width: 16px;
                height: 16px;
                border: 2px solid white;
                border-top-color: transparent;
                border-radius: 50%;
                animation: spin 1s linear infinite;
            "></div>
            PlagDetect: Analyzing...
        </div>
        <style>
            @keyframes slideIn {
                from { transform: translateX(100px); opacity: 0; }
                to { transform: translateX(0); opacity: 1; }
            }
            @keyframes spin {
                to { transform: rotate(360deg); }
            }
        </style>
    `;
    document.body.appendChild(indicator);

    // Remove after 5 seconds
    setTimeout(() => {
        indicator.remove();
    }, 5000);
}

// Show result toast
function showResultToast(score, isOriginal) {
    const existing = document.getElementById('plagdetect-indicator');
    if (existing) existing.remove();

    const color = score >= 80 ? '#10B981' : score >= 50 ? '#F59E0B' : '#EF4444';
    const status = score >= 80 ? '✅ Original' : score >= 50 ? '⚠️ Moderate' : '🚨 High Risk';

    const toast = document.createElement('div');
    toast.id = 'plagdetect-indicator';
    toast.innerHTML = `
        <div style="
            position: fixed;
            bottom: 20px;
            right: 20px;
            background: white;
            border-left: 4px solid ${color};
            padding: 16px 20px;
            border-radius: 8px;
            font-family: system-ui, sans-serif;
            box-shadow: 0 4px 20px rgba(0,0,0,0.15);
            z-index: 999999;
            animation: slideIn 0.3s ease;
        ">
            <div style="font-weight: 600; color: #1f2937; margin-bottom: 4px;">
                PlagDetect Result
            </div>
            <div style="display: flex; align-items: center; gap: 8px;">
                <span style="font-size: 24px; font-weight: bold; color: ${color};">${score}%</span>
                <span style="color: #6b7280; font-size: 13px;">${status}</span>
            </div>
        </div>
    `;
    document.body.appendChild(toast);

    // Remove after 8 seconds
    setTimeout(() => {
        toast.remove();
    }, 8000);
}

// Listen for result updates from background
chrome.storage.onChanged.addListener((changes, namespace) => {
    if (changes.lastResult) {
        const result = changes.lastResult.newValue;
        showResultToast(Math.round(result.score), result.score >= 80);
    }
});

console.log('PlagDetect content script loaded');
