let currentMode = 'text';

// Tab Switching Logic
document.querySelectorAll('.tab').forEach(tab => {
    tab.addEventListener('click', () => {
        document.querySelectorAll('.tab').forEach(t => t.classList.remove('active'));
        tab.classList.add('active');
        currentMode = tab.dataset.mode;

        // Toggle Sections
        document.getElementById('textSection').style.display = currentMode === 'text' ? 'block' : 'none';
        document.getElementById('codeSection').style.display = currentMode === 'code' ? 'block' : 'none';
        document.getElementById('imageSection').style.display = currentMode === 'image' ? 'block' : 'none';

        document.getElementById('result').style.display = 'none';
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
            alert('Please select the code snippet to check first.');
            return;
        }

        const code = results[0].result;
        showLoading();

        try {
            // Call plagiarism detection API for code
            const res = await fetch('http://localhost:3000/api/plagiarism/code', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ code, language })
            });
            const data = await res.json();

            // Get originality score (100 = original, 0 = copied)
            const originalityScore = data.originalityScore || 0;
            const aiScore = data.aiAnalysis?.aiScore || 0;

            let scoreType, status, details;

            // Determine color based on originality
            if (originalityScore >= 80) {
                scoreType = 'high';
                status = '✅ Original Code';
            } else if (originalityScore >= 50) {
                scoreType = 'medium';
                status = '⚠️ Some Similarity Found';
            } else {
                scoreType = 'low';
                status = '❌ Likely Copied/AI-Generated';
            }

            // Build details
            let detailParts = [];

            if (aiScore > 30) {
                detailParts.push(`🤖 AI Pattern: ${aiScore}%`);
            }

            if (data.commonAlgorithms && data.commonAlgorithms.length > 0) {
                const algos = data.commonAlgorithms.map(a => `${a.algorithm} (${a.similarity}%)`).join(', ');
                detailParts.push(`📚 Matches: ${algos}`);
            }

            if (data.issues && data.issues.length > 0) {
                detailParts.push(data.issues.slice(0, 2).join('\n'));
            }

            detailParts.push(`\n📊 Verdict: ${(data.verdict || 'UNKNOWN').replace(/_/g, ' ')}`);

            details = detailParts.join('\n');

            showResult(`${originalityScore}%`, scoreType, status, details);
        } catch (err) {
            console.error(err);
            showResult('Error', 'low', 'Connection Failed', 'Is localhost:3000 running?');
        }
    });
});

// ================= IMAGE DETECTION =================
const dropZone = document.getElementById('dropZone');
const fileInput = document.getElementById('fileInput');

dropZone.addEventListener('click', () => fileInput.click());

dropZone.addEventListener('dragover', (e) => {
    e.preventDefault();
    dropZone.classList.add('dragover');
});

dropZone.addEventListener('dragleave', () => dropZone.classList.remove('dragover'));

dropZone.addEventListener('drop', (e) => {
    e.preventDefault();
    dropZone.classList.remove('dragover');
    if (e.dataTransfer.files.length) {
        handleImageUpload(e.dataTransfer.files[0]);
    }
});

fileInput.addEventListener('change', (e) => {
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
    };
    reader.readAsDataURL(file);

    showLoading();

    try {
        const formData = new FormData();
        formData.append('image', file);

        const res = await fetch('http://localhost:3000/api/analyze/image', {
            method: 'POST',
            body: formData
        });

        const data = await res.json();

        showResult(
            data.isLikelyAI ? 'AI Generated' : 'Real Image',
            data.isLikelyAI ? 'low' : 'high', // low score color (red) for AI, high (green) for Real
            data.isLikelyAI ? `${Math.round(data.aiProbability)}% AI Probability` : 'Likely Authentic',
            data.reasoning || data.artifacts.join(', ')
        );

    } catch (err) {
        showResult('Error', 'low', 'Analysis Failed', 'Is localhost:3000 running?');
    }
}

// ================= TEXT & PAGE CHECK (Existing) =================
document.getElementById('checkSelection').addEventListener('click', async () => {
    // Reuse existing text checking logic logic here or trigger logic similar to verified code
    // For brevity, just calling the API same as before but simplified for this update
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    chrome.scripting.executeScript({
        target: { tabId: tab.id },
        function: () => window.getSelection().toString()
    }, async (results) => {
        const text = results[0]?.result;
        if (!text) return alert('Select text first');

        showLoading();
        try {
            const res = await fetch('http://localhost:3000/api/plagiarism/semantic', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ text, threshold: 0.5 })
            });
            const data = await res.json();
            showResult(
                Math.round(data.overallScore) + '%',
                data.overallScore > 80 ? 'high' : 'low',
                data.overallScore > 80 ? 'Original Content' : 'Potential Plagiarism',
                `${data.totalMatches} matches found`
            );
        } catch (e) { console.error(e); }
    });
});

// ================= FULL PAGE ANALYSIS =================
document.getElementById('checkPage').addEventListener('click', async () => {
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });

    showLoading();

    // Get page content
    chrome.scripting.executeScript({
        target: { tabId: tab.id },
        function: () => {
            return {
                html: document.documentElement.outerHTML,
                textContent: document.body.innerText,
                title: document.title,
                url: window.location.href
            };
        }
    }, async (results) => {
        if (!results || !results[0] || !results[0].result) {
            showResult('Error', 'low', 'Access Denied', 'Cannot access this page. Try a different website.');
            return;
        }

        const pageData = results[0].result;

        try {
            const res = await fetch('http://localhost:3000/api/analyze/page', {
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
                showResult('Error', 'low', 'Analysis Failed', data.error);
                return;
            }

            // Build result display
            const overallScore = data.overallScore || 50;
            let scoreType = overallScore >= 70 ? 'high' : (overallScore >= 40 ? 'medium' : 'low');

            // Determine status based on verdict
            let status;
            switch (data.overallVerdict) {
                case 'ORIGINAL':
                    status = '✅ Original Content';
                    break;
                case 'AI_GENERATED':
                    status = '❌ AI-Generated Content';
                    break;
                case 'PLAGIARIZED':
                    status = '❌ Plagiarism Detected';
                    break;
                default:
                    status = '⚠️ Mixed Content';
            }

            // Build details
            let details = [];

            // Plagiarism info (show first if detected)
            if (data.plagiarismAnalysis) {
                const plagScore = data.plagiarismAnalysis.originalityScore || 100;
                details.push(`📋 Originality: ${plagScore}%`);
                if (data.plagiarismAnalysis.matchCount > 0) {
                    details.push(`   ${data.plagiarismAnalysis.matchCount} matching sources found`);
                }
            }

            // AI detection info
            if (data.contentAnalysis) {
                details.push(`🤖 AI Probability: ${data.contentAnalysis.aiScore || 0}%`);
            }

            // SEO info
            if (data.seoAnalysis) {
                details.push(`📊 SEO Score: ${data.seoAnalysis.score}%`);
            }

            // Recommendations
            if (data.recommendations?.length > 0) {
                details.push('\n' + data.recommendations.slice(0, 2).join('\n'));
            }

            showResult(`${overallScore}%`, scoreType, status, details.join('\n'));

        } catch (err) {
            console.error(err);
            showResult('Error', 'low', 'Connection Failed', 'Is localhost:3000 running?');
        }
    });
});


// Helper UI Functions
function showLoading() {
    document.getElementById('loading').style.display = 'block';
    document.getElementById('result').style.display = 'none';
}

function showResult(mainText, scoreType, status, details) {
    document.getElementById('loading').style.display = 'none';
    const resultDiv = document.getElementById('result');
    resultDiv.style.display = 'block';

    const circle = document.getElementById('scoreValue');
    circle.textContent = mainText;
    // Map scoreType to CSS class
    const classMap = { 'high': 'score-high', 'medium': 'score-medium', 'low': 'score-low' };
    circle.className = `score-circle ${classMap[scoreType] || 'score-low'}`;

    // Adjust font size for long text
    if (mainText.length > 4) circle.style.fontSize = '14px';
    else circle.style.fontSize = '24px';

    document.getElementById('statusText').textContent = status;
    document.getElementById('detailsText').innerHTML = details.replace(/\n/g, '<br>');
}
