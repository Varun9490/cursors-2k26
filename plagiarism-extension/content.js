// Content script - runs on all pages
// Enhanced with better visual feedback and offline result display

// =====================================================
// MESSAGE HANDLERS
// =====================================================
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.action === 'getSelection') {
        sendResponse({ text: window.getSelection().toString() });
    }
    if (request.action === 'getPageText') {
        sendResponse({ text: document.body.innerText });
    }
    if (request.action === 'showResult') {
        showResultToast(request.score, request.verdict, request.matches);
    }
    if (request.action === 'showAnalyzing') {
        showAnalyzingIndicator();
    }
    return true;
});

// =====================================================
// VISUAL INDICATORS
// =====================================================
function injectStyles() {
    if (document.getElementById('plagdetect-styles')) return;

    const styles = document.createElement('style');
    styles.id = 'plagdetect-styles';
    styles.textContent = `
        @keyframes plagdetect-slideIn {
            from { transform: translateX(100px); opacity: 0; }
            to { transform: translateX(0); opacity: 1; }
        }
        @keyframes plagdetect-slideOut {
            from { transform: translateX(0); opacity: 1; }
            to { transform: translateX(100px); opacity: 0; }
        }
        @keyframes plagdetect-spin {
            to { transform: rotate(360deg); }
        }
        @keyframes plagdetect-pulse {
            0%, 100% { opacity: 1; }
            50% { opacity: 0.5; }
        }
        .plagdetect-toast {
            position: fixed;
            bottom: 20px;
            right: 20px;
            z-index: 2147483647;
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, sans-serif;
            animation: plagdetect-slideIn 0.3s ease;
        }
        .plagdetect-toast.hiding {
            animation: plagdetect-slideOut 0.3s ease forwards;
        }
    `;
    document.head.appendChild(styles);
}

function showAnalyzingIndicator() {
    injectStyles();
    removeExistingToast();

    const indicator = document.createElement('div');
    indicator.id = 'plagdetect-toast';
    indicator.className = 'plagdetect-toast';
    indicator.innerHTML = `
        <div style="
            background: linear-gradient(135deg, #667eea, #764ba2);
            color: white;
            padding: 14px 20px;
            border-radius: 12px;
            font-size: 14px;
            font-weight: 500;
            box-shadow: 0 4px 24px rgba(102, 126, 234, 0.4);
            display: flex;
            align-items: center;
            gap: 12px;
        ">
            <div style="
                width: 18px;
                height: 18px;
                border: 2px solid white;
                border-top-color: transparent;
                border-radius: 50%;
                animation: plagdetect-spin 1s linear infinite;
            "></div>
            <div>
                <div style="font-weight: 600;">PlagDetect</div>
                <div style="font-size: 12px; opacity: 0.9;">Analyzing content...</div>
            </div>
        </div>
    `;
    document.body.appendChild(indicator);

    // Auto-remove after 10 seconds (in case of hang)
    setTimeout(() => removeExistingToast(), 10000);
}

function showResultToast(score, verdict = '', matches = []) {
    injectStyles();
    removeExistingToast();

    const color = score >= 80 ? '#10B981' : score >= 50 ? '#F59E0B' : '#EF4444';
    const bgColor = score >= 80 ? '#ECFDF5' : score >= 50 ? '#FFFBEB' : '#FEF2F2';
    const status = score >= 80 ? '✅ Original' : score >= 50 ? '⚠️ Some Issues' : '🚨 High Risk';

    // Build match details
    let matchDetails = '';
    if (matches && matches.length > 0) {
        const matchItems = matches.slice(0, 3).map(m =>
            `<div style="font-size: 11px; color: #6B7280; padding: 2px 0;">• ${m.description || m.type}</div>`
        ).join('');
        matchDetails = `<div style="margin-top: 8px; padding-top: 8px; border-top: 1px solid ${color}20;">${matchItems}</div>`;
    }

    const toast = document.createElement('div');
    toast.id = 'plagdetect-toast';
    toast.className = 'plagdetect-toast';
    toast.innerHTML = `
        <div style="
            background: ${bgColor};
            border: 1px solid ${color}40;
            border-left: 4px solid ${color};
            padding: 16px 20px;
            border-radius: 12px;
            box-shadow: 0 4px 24px rgba(0,0,0,0.12);
            min-width: 240px;
            max-width: 320px;
        ">
            <div style="display: flex; justify-content: space-between; align-items: flex-start;">
                <div>
                    <div style="font-weight: 600; color: #1f2937; font-size: 13px; margin-bottom: 8px;">
                        🔍 PlagDetect Result
                    </div>
                    <div style="display: flex; align-items: baseline; gap: 8px;">
                        <span style="font-size: 32px; font-weight: 700; color: ${color};">${Math.round(score)}%</span>
                        <span style="color: #6b7280; font-size: 13px;">${status}</span>
                    </div>
                </div>
                <button onclick="this.closest('.plagdetect-toast').remove()" style="
                    background: none;
                    border: none;
                    cursor: pointer;
                    font-size: 18px;
                    color: #9CA3AF;
                    padding: 0;
                    line-height: 1;
                ">×</button>
            </div>
            ${verdict ? `<div style="margin-top: 6px; font-size: 12px; color: #6B7280;">Verdict: ${verdict.replace(/_/g, ' ')}</div>` : ''}
            ${matchDetails}
        </div>
    `;
    document.body.appendChild(toast);

    // Auto-remove after 12 seconds
    setTimeout(() => {
        const el = document.getElementById('plagdetect-toast');
        if (el) {
            el.classList.add('hiding');
            setTimeout(() => el.remove(), 300);
        }
    }, 12000);
}

function removeExistingToast() {
    const existing = document.getElementById('plagdetect-toast');
    if (existing) existing.remove();
}

// =====================================================
// STORAGE CHANGE LISTENER
// =====================================================
chrome.storage.onChanged.addListener((changes, namespace) => {
    if (changes.lastResult && namespace === 'local') {
        const result = changes.lastResult.newValue;
        if (result && Date.now() - result.timestamp < 5000) {
            showResultToast(
                Math.round(result.score),
                result.verdict,
                result.matches || []
            );
        }
    }
});

// =====================================================
// SELECTION HELPER (for writing platforms)
// =====================================================
let lastSelectionCheck = 0;

function checkSelectionPeriodically() {
    // Check if user has selected text
    const selection = window.getSelection().toString();
    if (selection && selection.length > 50 && Date.now() - lastSelectionCheck > 3000) {
        lastSelectionCheck = Date.now();
        // Could add a floating button here in the future
    }
}

// Optional: Add floating button on text selection (can be enabled later)
// document.addEventListener('mouseup', checkSelectionPeriodically);

// =====================================================
// PLATFORM DETECTION (for future integration)
// =====================================================
const writingPlatforms = {
    'docs.google.com': 'google-docs',
    'word.office.com': 'office-online',
    'notion.so': 'notion',
    'medium.com': 'medium',
    'wordpress.com': 'wordpress'
};

const currentPlatform = writingPlatforms[window.location.hostname];
if (currentPlatform) {
    console.log(`PlagDetect: Detected writing platform - ${currentPlatform}`);
    // Future: Enable real-time checking for detected platforms
}

console.log('PlagDetect content script loaded (v1.1)');
