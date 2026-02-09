// ================= API BASE URL =================
const API_BASE_URL = 'https://cursors-2k26.vercel.app';

let currentMode = 'text';

// ================= OFFLINE PATTERN ANALYSIS =================
const PLAGIARISM_PATTERNS = {
    genericPhrases: [
        'according to recent studies', 'it is widely known that', 'research has shown that',
        'studies have shown', 'experts believe', 'it is important to note', 'in conclusion',
        'as mentioned above', 'furthermore', 'in summary', 'to summarize', 'as previously stated',
        'it should be noted', 'it goes without saying', 'needless to say', 'as we can see'
    ],
    wikiPatterns: [/\(born \d{4}\)/gi, /also known as/gi, /is a [a-z]+ (that|which|who)/gi, /according to/gi],
    aiPatterns: [
        'in the realm of', 'when it comes to', 'it goes without saying', 'moving forward',
        'that being said', 'at the end of the day', 'dive deep into', 'game-changer', 'leverage', 'synergy'
    ]
};

function performOfflineAnalysis(text) {
    if (!text || text.length < 50) {
        return { score: 100, matches: [], verdict: 'TOO_SHORT', isOffline: true };
    }

    const normalizedText = text.toLowerCase().replace(/[^\w\s]/g, '').replace(/\s+/g, ' ').trim();
    let penalty = 0;
    let matches = [];

    // Check generic phrases
    let genericFound = PLAGIARISM_PATTERNS.genericPhrases.filter(p => normalizedText.includes(p)).length;
    if (genericFound >= 2) {
        penalty += Math.min(genericFound * 5, 20);
        matches.push({ type: 'generic', description: `${genericFound} academic template phrases` });
    }

    // Check wiki patterns
    let wikiFound = PLAGIARISM_PATTERNS.wikiPatterns.filter(p => p.test(text)).length;
    if (wikiFound >= 1) {
        penalty += wikiFound * 8;
        matches.push({ type: 'wiki', description: 'Encyclopedia-style writing' });
    }

    // Check AI patterns
    let aiFound = PLAGIARISM_PATTERNS.aiPatterns.filter(p => normalizedText.includes(p)).length;
    if (aiFound >= 2) {
        penalty += Math.min(aiFound * 6, 25);
        matches.push({ type: 'ai', description: `${aiFound} AI-style phrases` });
    }

    penalty = Math.min(penalty, 75);
    const score = Math.max(0, 100 - penalty);
    let verdict = score < 50 ? 'LIKELY_PLAGIARIZED' : score < 70 ? 'SUSPICIOUS' : score < 85 ? 'MOSTLY_ORIGINAL' : 'ORIGINAL';

    return { score, matches, matchCount: matches.length, verdict, isOffline: true };
}

// ================= TAB SWITCHING =================
document.querySelectorAll('.tab').forEach(tab => {
    tab.addEventListener('click', () => {
        // Update tab styles
        document.querySelectorAll('.tab').forEach(t => t.classList.remove('active'));
        tab.classList.add('active');
        currentMode = tab.dataset.mode;

        // Toggle Sections
        document.querySelectorAll('.section').forEach(s => s.classList.remove('active'));
        document.getElementById(currentMode + 'Section').classList.add('active');

        // Hide result
        document.getElementById('result').style.display = 'none';
        document.getElementById('loading').style.display = 'none';
    });
});

// ================= QUICK CHECK (Offline) =================
document.getElementById('quickCheck')?.addEventListener('click', async () => {
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    chrome.scripting.executeScript({
        target: { tabId: tab.id },
        function: () => window.getSelection().toString()
    }, async (results) => {
        const text = results[0]?.result;
        if (!text || text.length < 20) {
            showResult(0, 'error', '⚠️ Please Select Text', 'Select at least 20 characters on the page first.');
            return;
        }

        const result = performOfflineAnalysis(text);
        showResult(
            result.score,
            result.score >= 80 ? 'high' : result.score >= 50 ? 'medium' : 'low',
            result.score >= 80 ? '✅ Original Content' : result.score >= 50 ? '⚠️ Some Issues Found' : '🚨 High Plagiarism Risk',
            buildDetails(result),
            result.verdict
        );
    });
});

// ================= AI DETECTION =================
document.getElementById('aiCheck')?.addEventListener('click', async () => {
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    chrome.scripting.executeScript({
        target: { tabId: tab.id },
        function: () => window.getSelection().toString()
    }, async (results) => {
        const text = results[0]?.result;
        if (!text || text.length < 50) {
            showResult(0, 'error', '⚠️ Please Select Text', 'Select at least 50 characters for AI detection.');
            return;
        }

        showLoading();

        try {
            const res = await fetch(`${API_BASE_URL}/api/analyze/page`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ textContent: text, html: `<html><body>${text}</body></html>` })
            });
            const data = await res.json();

            const aiScore = data.contentAnalysis?.aiScore || 0;
            const humanScore = 100 - aiScore;

            showResult(
                humanScore,
                humanScore >= 70 ? 'high' : humanScore >= 40 ? 'medium' : 'low',
                humanScore >= 70 ? '👤 Likely Human Written' : humanScore >= 40 ? '🤔 Mixed Content' : '🤖 Likely AI Generated',
                `🤖 AI Probability: ${aiScore}%\n👤 Human Probability: ${humanScore}%`,
                humanScore >= 70 ? 'HUMAN' : humanScore >= 40 ? 'MIXED' : 'AI_GENERATED'
            );
        } catch (e) {
            // Fallback to offline
            const result = performOfflineAnalysis(text);
            showResult(result.score, result.score >= 80 ? 'high' : 'medium', '⚡ Offline Analysis', buildDetails(result), result.verdict);
        }
    });
});

// ================= CODE PLAGIARISM CHECK =================
document.getElementById('verifyCodeBtn').addEventListener('click', async () => {
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    const language = document.getElementById('compilerSelect').value;

    chrome.scripting.executeScript({
        target: { tabId: tab.id },
        function: () => window.getSelection().toString()
    }, async (results) => {
        if (!results || !results[0] || !results[0].result || results[0].result.length < 10) {
            showResult(0, 'error', '⚠️ No Code Selected', 'Please select a code snippet on the page first.');
            return;
        }

        const code = results[0].result;
        showLoading();

        try {
            const res = await fetch(`${API_BASE_URL}/api/plagiarism/code`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ code, language })
            });
            const data = await res.json();

            const originalityScore = data.originalityScore || 0;
            const aiScore = data.aiAnalysis?.aiScore || 0;

            let details = [];
            if (aiScore > 30) details.push(`🤖 AI Pattern: ${aiScore}%`);
            if (data.commonAlgorithms?.length > 0) {
                const algos = data.commonAlgorithms.map(a => `${a.algorithm} (${a.similarity}%)`).join(', ');
                details.push(`📚 Matches: ${algos}`);
            }
            if (data.issues?.length > 0) {
                details.push(...data.issues.slice(0, 2));
            }
            details.push(`📊 Verdict: ${(data.verdict || 'UNKNOWN').replace(/_/g, ' ')}`);

            showResult(
                originalityScore,
                originalityScore >= 80 ? 'high' : originalityScore >= 50 ? 'medium' : 'low',
                originalityScore >= 80 ? '✅ Original Code' : originalityScore >= 50 ? '⚠️ Some Similarity' : '❌ Likely Copied',
                details.join('\n'),
                data.verdict || 'UNKNOWN'
            );
        } catch (err) {
            console.error(err);
            showResult(0, 'error', '❌ Connection Failed', 'Unable to reach server. Please try again.');
        }
    });
});

// ================= IMAGE DETECTION =================
const dropZone = document.getElementById('dropZone');
const fileInput = document.getElementById('fileInput');

dropZone?.addEventListener('click', () => fileInput.click());

dropZone?.addEventListener('dragover', (e) => {
    e.preventDefault();
    dropZone.classList.add('dragover');
});

dropZone?.addEventListener('dragleave', () => dropZone.classList.remove('dragover'));

dropZone?.addEventListener('drop', (e) => {
    e.preventDefault();
    dropZone.classList.remove('dragover');
    if (e.dataTransfer.files.length) {
        handleImageUpload(e.dataTransfer.files[0]);
    }
});

fileInput?.addEventListener('change', (e) => {
    if (e.target.files.length) {
        handleImageUpload(e.target.files[0]);
    }
});

async function handleImageUpload(file) {
    // Show preview
    const reader = new FileReader();
    reader.onload = (e) => {
        const img = document.getElementById('previewImage');
        img.src = e.target.result;
        img.style.display = 'block';
        dropZone.style.display = 'none';
    };
    reader.readAsDataURL(file);

    showLoading();

    try {
        const formData = new FormData();
        formData.append('image', file);

        const res = await fetch(`${API_BASE_URL}/api/analyze/image`, {
            method: 'POST',
            body: formData
        });

        const data = await res.json();
        const score = data.isLikelyAI ? (100 - Math.round(data.aiProbability)) : 100;

        showResult(
            score,
            data.isLikelyAI ? 'low' : 'high',
            data.isLikelyAI ? '🤖 AI Generated Image' : '📷 Real Image',
            data.reasoning || (data.artifacts ? data.artifacts.join(', ') : 'Analysis complete'),
            data.isLikelyAI ? 'AI_GENERATED' : 'AUTHENTIC'
        );

    } catch (err) {
        showResult(0, 'error', '❌ Analysis Failed', 'Unable to reach server. Please try again.');
    }
}

// ================= TEXT CHECK =================
document.getElementById('checkSelection').addEventListener('click', async () => {
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    chrome.scripting.executeScript({
        target: { tabId: tab.id },
        function: () => window.getSelection().toString()
    }, async (results) => {
        const text = results[0]?.result;
        if (!text || text.length < 20) {
            showResult(0, 'error', '⚠️ Please Select Text', 'Select at least 20 characters on the page first.');
            return;
        }

        showLoading();
        try {
            const res = await fetch(`${API_BASE_URL}/api/analyze/page`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    textContent: text,
                    html: `<html><body>${text}</body></html>`
                })
            });
            const data = await res.json();

            if (data.error) {
                showResult(0, 'error', '❌ Analysis Failed', data.error);
                return;
            }

            const score = data.overallScore || 0;
            const plagScore = data.plagiarismAnalysis?.originalityScore || score;
            const aiScore = data.contentAnalysis?.aiScore || 0;

            let details = [];
            details.push(`📋 Originality: ${Math.round(plagScore)}%`);
            details.push(`🤖 AI Score: ${aiScore}%`);
            if (data.plagiarismAnalysis?.matchCount > 0) {
                details.push(`🔍 Matches: ${data.plagiarismAnalysis.matchCount}`);
            }

            showResult(
                Math.round(plagScore),
                plagScore >= 70 ? 'high' : plagScore >= 40 ? 'medium' : 'low',
                plagScore >= 70 ? '✅ Original Content' : plagScore >= 40 ? '⚠️ Some Similarity' : '❌ Potential Plagiarism',
                details.join('\n'),
                data.overallVerdict || 'UNKNOWN'
            );
        } catch (e) {
            // Fallback to offline
            const result = performOfflineAnalysis(text);
            showResult(
                result.score,
                result.score >= 80 ? 'high' : result.score >= 50 ? 'medium' : 'low',
                '⚡ Offline Analysis (Server Unavailable)',
                buildDetails(result),
                result.verdict
            );
        }
    });
});

// ================= FULL PAGE ANALYSIS =================
document.getElementById('checkPage').addEventListener('click', async () => {
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });

    showLoading();

    chrome.scripting.executeScript({
        target: { tabId: tab.id },
        function: () => ({
            html: document.documentElement.outerHTML,
            textContent: document.body.innerText,
            title: document.title,
            url: window.location.href
        })
    }, async (results) => {
        if (!results || !results[0] || !results[0].result) {
            showResult(0, 'error', '❌ Access Denied', 'Cannot access this page. Try a different website.');
            return;
        }

        const pageData = results[0].result;

        try {
            const res = await fetch(`${API_BASE_URL}/api/analyze/page`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    html: pageData.html,
                    textContent: pageData.textContent,
                    url: pageData.url
                })
            });

            const data = await res.json();

            if (data.error) {
                showResult(0, 'error', '❌ Analysis Failed', data.error);
                return;
            }

            const overallScore = data.overallScore || 50;

            let details = [];
            if (data.plagiarismAnalysis) {
                const plagScore = data.plagiarismAnalysis.originalityScore || 100;
                details.push(`📋 Originality: ${plagScore}%`);
                if (data.plagiarismAnalysis.matchCount > 0) {
                    details.push(`   └─ ${data.plagiarismAnalysis.matchCount} sources found`);
                }
            }
            if (data.contentAnalysis) {
                details.push(`🤖 AI Probability: ${data.contentAnalysis.aiScore || 0}%`);
            }
            if (data.seoAnalysis) {
                details.push(`📊 SEO Score: ${data.seoAnalysis.score}%`);
            }
            if (data.recommendations?.length > 0) {
                details.push('\n' + data.recommendations.slice(0, 2).join('\n'));
            }

            let statusText;
            switch (data.overallVerdict) {
                case 'ORIGINAL': statusText = '✅ Original Content'; break;
                case 'AI_GENERATED': statusText = '🤖 AI-Generated Content'; break;
                case 'PLAGIARIZED': statusText = '❌ Plagiarism Detected'; break;
                default: statusText = '⚠️ Mixed Content';
            }

            showResult(
                overallScore,
                overallScore >= 70 ? 'high' : overallScore >= 40 ? 'medium' : 'low',
                statusText,
                details.join('\n'),
                data.overallVerdict || 'MIXED'
            );

        } catch (err) {
            console.error(err);
            showResult(0, 'error', '❌ Connection Failed', 'Unable to reach server. Please try again.');
        }
    });
});

// ================= HELPER FUNCTIONS =================
function showLoading() {
    document.getElementById('loading').style.display = 'block';
    document.getElementById('result').style.display = 'none';
}

function buildDetails(result) {
    let details = [];
    if (result.isOffline) {
        details.push('⚡ Pattern Analysis (Offline)');
    }
    if (result.matches && result.matches.length > 0) {
        result.matches.forEach(m => {
            details.push(`• ${m.description || m.type}`);
        });
    } else {
        details.push('✓ No suspicious patterns detected');
    }
    return details.join('\n');
}

function showResult(score, scoreType, status, details, verdict = 'UNKNOWN') {
    document.getElementById('loading').style.display = 'none';
    const resultDiv = document.getElementById('result');
    resultDiv.style.display = 'block';

    // Score ring with CSS variable
    const scoreRing = document.getElementById('scoreRing');
    scoreRing.style.setProperty('--score', score);
    scoreRing.className = 'score-ring';
    if (scoreType === 'high') scoreRing.classList.add('score-high');
    else if (scoreType === 'medium') scoreRing.classList.add('score-medium');
    else scoreRing.classList.add('score-low');

    // Score value
    const scoreValue = document.getElementById('scoreValue');
    if (scoreType === 'error') {
        scoreValue.innerHTML = '!';
    } else {
        scoreValue.innerHTML = `${Math.round(score)}<small>%</small>`;
    }

    // Status text
    document.getElementById('statusText').textContent = status;

    // Verdict badge
    const verdictBadge = document.getElementById('verdictBadge');
    verdictBadge.textContent = verdict.replace(/_/g, ' ');
    verdictBadge.className = 'verdict-badge';
    if (verdict.includes('ORIGINAL') || verdict === 'HUMAN' || verdict === 'AUTHENTIC') {
        verdictBadge.classList.add('verdict-original');
    } else if (verdict.includes('SUSPICIOUS') || verdict === 'MIXED' || verdict.includes('MOSTLY')) {
        verdictBadge.classList.add('verdict-suspicious');
    } else {
        verdictBadge.classList.add('verdict-plagiarized');
    }

    // Details
    document.getElementById('detailsText').innerHTML = details.replace(/\n/g, '<br>');
}

console.log('PlagDetect popup.js loaded (v1.1)');
