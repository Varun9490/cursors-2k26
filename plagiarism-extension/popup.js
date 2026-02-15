// ================= API BASE URL =================
const API_BASE_URL = 'http://localhost:3000';
const PRODUCTION_URL = 'https://cursors-2k26.vercel.app';

let currentMode = 'text';

// ================= AI SOURCE URLS =================
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

// ================= ENHANCED OFFLINE PATTERN ANALYSIS =================
const AI_PATTERNS = {
    // ChatGPT's signature phrases
    chatgptPhrases: [
        'delve into', 'delve deeper', 'it\'s important to note', 'it\'s worth noting',
        'it is important to note', 'it is worth noting', 'in today\'s rapidly',
        'in today\'s digital', 'in today\'s world', 'in today\'s fast-paced',
        'let\'s explore', 'let\'s dive', 'let\'s break down', 'let\'s take a closer look',
        'here are some key', 'here are the key', 'here\'s a comprehensive',
        'whether you\'re a', 'whether it\'s', 'by understanding', 'by leveraging',
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
        'the bottom line', 'the key takeaway',
        'understanding the nuances', 'nuances of',
        'a myriad of', 'a plethora of', 'a multitude of',
        'serves as a', 'acts as a catalyst',
        'paves the way', 'sets the stage',
        'in the realm of', 'in the world of',
        'first and foremost', 'last but not least'
    ],

    // AI buzzwords
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
        'game-changer', 'tapestry', 'underscores',
        'multifaceted', 'intricate', 'intricacies', 'cornerstone'
    ],

    // Formal transitions AI overuses
    transitions: [
        'additionally', 'consequently', 'nevertheless', 'nonetheless',
        'subsequently', 'accordingly', 'hence', 'thus', 'therefore',
        'in addition', 'as a result', 'on the other hand', 'in contrast',
        'notably', 'significantly', 'importantly', 'essentially',
        'fundamentally', 'ultimately', 'inherently', 'arguably'
    ],

    // Formulaic starters
    starters: [
        'In the realm of', 'When it comes to', 'It goes without saying',
        'Moving forward', 'That being said', 'With that in mind',
        'It\'s no secret that', 'There\'s no denying',
        'One of the most', 'In order to', 'As we navigate',
        'In an era', 'In a world where', 'With the advent of',
        'With the rise of'
    ],

    // Generic academic
    genericPhrases: [
        'according to recent studies', 'it is widely known that', 'research has shown that',
        'studies have shown', 'experts believe', 'in conclusion',
        'as mentioned above', 'in summary', 'to summarize',
        'as previously stated', 'it should be noted',
        'needless to say', 'as we can see'
    ],

    wikiPatterns: [/\(born \d{4}\)/gi, /also known as/gi, /is a [a-z]+ (that|which|who)/gi, /according to/gi]
};

function performOfflineAnalysis(text, pageUrl = null) {
    if (!text || text.length < 30) {
        return { score: 100, matches: [], verdict: 'TOO_SHORT', isOffline: true, aiScore: 0 };
    }

    const lowerText = text.toLowerCase();
    const words = text.split(/\s+/).filter(w => w.length > 0);
    const wordCount = words.length;
    const sentences = text.split(/[.!?]+/).filter(s => s.trim().length > 5);

    let penalty = 0;
    let aiPenalty = 0;
    let matches = [];
    let aiFactors = [];

    // ===== CHECK 1: Em Dashes (—) - STRONG AI INDICATOR =====
    const emDashCount = (text.match(/—/g) || []).length;
    const enDashCount = (text.match(/–/g) || []).length;
    const totalDashes = emDashCount + enDashCount;

    if (totalDashes >= 3) {
        aiPenalty += 25;
        penalty += 15;
        matches.push({ type: 'ai', description: `🔴 ${totalDashes} em/en dashes — strong AI indicator (ChatGPT uses these excessively)` });
        aiFactors.push(`Em dashes: ${totalDashes} found`);
    } else if (totalDashes >= 1) {
        aiPenalty += 12;
        penalty += 6;
        matches.push({ type: 'ai', description: `🟡 ${totalDashes} em/en dashes found — possible AI indicator` });
        aiFactors.push(`Em dashes: ${totalDashes} found`);
    }

    // ===== CHECK 2: ChatGPT-Specific Phrases =====
    let chatgptCount = 0;
    const foundChatGPT = [];
    for (const phrase of AI_PATTERNS.chatgptPhrases) {
        if (lowerText.includes(phrase.toLowerCase())) {
            chatgptCount++;
            foundChatGPT.push(phrase);
        }
    }

    if (chatgptCount >= 5) {
        aiPenalty += 30;
        penalty += 15;
        matches.push({ type: 'ai', description: `🔴 ${chatgptCount} ChatGPT-typical phrases found: "${foundChatGPT.slice(0, 3).join('", "')}"` });
    } else if (chatgptCount >= 3) {
        aiPenalty += 20;
        penalty += 10;
        matches.push({ type: 'ai', description: `🟠 ${chatgptCount} ChatGPT phrases: "${foundChatGPT.slice(0, 3).join('", "')}"` });
    } else if (chatgptCount >= 1) {
        aiPenalty += 8;
        penalty += 4;
        matches.push({ type: 'ai', description: `🟡 ${chatgptCount} possible AI phrases: "${foundChatGPT.join('", "')}"` });
    }

    // ===== CHECK 3: AI Buzzwords =====
    let buzzCount = 0;
    for (const word of AI_PATTERNS.buzzwords) {
        if (lowerText.includes(word)) buzzCount++;
    }
    if (buzzCount >= 5) {
        aiPenalty += 15;
        penalty += 8;
        matches.push({ type: 'ai', description: `🟠 ${buzzCount} AI buzzwords detected` });
    } else if (buzzCount >= 3) {
        aiPenalty += 8;
        penalty += 4;
        matches.push({ type: 'ai', description: `🟡 ${buzzCount} AI buzzwords detected` });
    }

    // ===== CHECK 4: Transition Overuse =====
    let transCount = 0;
    for (const t of AI_PATTERNS.transitions) {
        const regex = new RegExp(`\\b${t}\\b`, 'gi');
        transCount += (lowerText.match(regex) || []).length;
    }
    const transDensity = (transCount / wordCount) * 100;
    if (transDensity > 2.5) {
        aiPenalty += 12;
        penalty += 6;
        matches.push({ type: 'ai', description: `🟠 High transition density: ${transDensity.toFixed(1)}% (AI overuses formal transitions)` });
    }

    // ===== CHECK 5: Sentence Uniformity =====
    if (sentences.length > 4) {
        const lengths = sentences.map(s => s.trim().split(/\s+/).length);
        const avgLen = lengths.reduce((a, b) => a + b, 0) / lengths.length;
        const variance = lengths.reduce((sum, l) => sum + Math.pow(l - avgLen, 2), 0) / lengths.length;
        const cv = Math.sqrt(variance) / avgLen;

        if (cv < 0.3 && avgLen > 10) {
            aiPenalty += 12;
            penalty += 6;
            matches.push({ type: 'ai', description: '🔴 Very uniform sentence lengths — AI generates evenly-sized sentences' });
        } else if (cv < 0.45 && avgLen > 10) {
            aiPenalty += 5;
            penalty += 3;
        }
    }

    // ===== CHECK 6: Formulaic Starters =====
    let starterCount = 0;
    for (const starter of AI_PATTERNS.starters) {
        if (lowerText.includes(starter.toLowerCase())) starterCount++;
    }
    if (starterCount >= 2) {
        aiPenalty += 10;
        penalty += 5;
        matches.push({ type: 'ai', description: `🟡 ${starterCount} formulaic sentence starters` });
    }

    // ===== CHECK 7: Lack of Personal Voice =====
    const personalPronouns = (text.match(/\b(I|my|me|myself|we|our|us)\b/gi) || []).length;
    const pronounDensity = (personalPronouns / wordCount) * 100;
    if (pronounDensity < 0.3 && wordCount > 80) {
        aiPenalty += 8;
        penalty += 4;
        matches.push({ type: 'ai', description: '🟡 Impersonal writing — AI avoids "I", "my", "we"' });
    }

    // ===== CHECK 8: No Contractions =====
    const formalForms = (text.match(/\b(it is|do not|does not|cannot|will not|would not|should not)\b/gi) || []).length;
    const contractions = (text.match(/\b(it's|don't|doesn't|can't|won't|wouldn't|shouldn't)\b/gi) || []).length;
    if (formalForms > 2 && contractions === 0 && wordCount > 80) {
        aiPenalty += 6;
        penalty += 3;
        matches.push({ type: 'ai', description: '🟡 No contractions used — AI tends to use formal forms' });
    }

    // ===== CHECK 9: URL Check =====
    if (pageUrl) {
        const urlCheck = isAISourceURL(pageUrl);
        if (urlCheck.isAI) {
            aiPenalty += 50;
            penalty += 40;
            matches.push({ type: 'ai_source', description: `🔴🔴 Content from ${urlCheck.source} — AI generation platform!` });
        }
    }

    // ===== CHECK 10: Wiki patterns =====
    let wikiFound = AI_PATTERNS.wikiPatterns.filter(p => p.test(text)).length;
    if (wikiFound >= 1) {
        penalty += wikiFound * 5;
        matches.push({ type: 'wiki', description: 'Encyclopedia-style writing' });
    }

    // ===== CHECK 11: Generic phrases =====
    let genericFound = AI_PATTERNS.genericPhrases.filter(p => lowerText.includes(p)).length;
    if (genericFound >= 2) {
        penalty += Math.min(genericFound * 4, 15);
        matches.push({ type: 'generic', description: `${genericFound} academic template phrases` });
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
        score,
        aiScore,
        matches,
        matchCount: matches.length,
        verdict,
        isOffline: true,
        aiFactors
    };
}

// ================= API HELPER WITH FALLBACK =================
async function fetchWithFallback(endpoint, options) {
    try {
        const localResponse = await fetch(`${API_BASE_URL}${endpoint}`, {
            ...options,
            signal: AbortSignal.timeout(10000)
        });
        if (localResponse.ok) {
            return await localResponse.json();
        }
    } catch (localError) {
        console.log('Local server unavailable, trying production...');
    }

    try {
        const prodResponse = await fetch(`${PRODUCTION_URL}${endpoint}`, {
            ...options,
            signal: AbortSignal.timeout(15000)
        });
        if (prodResponse.ok) {
            return await prodResponse.json();
        }
        throw new Error('Production API error');
    } catch (prodError) {
        console.error('Both servers failed:', prodError);
        throw prodError;
    }
}

// ================= TAB SWITCHING =================
document.querySelectorAll('.tab').forEach(tab => {
    tab.addEventListener('click', () => {
        document.querySelectorAll('.tab').forEach(t => t.classList.remove('active'));
        tab.classList.add('active');
        currentMode = tab.dataset.mode;

        document.querySelectorAll('.section').forEach(s => s.classList.remove('active'));
        document.getElementById(currentMode + 'Section').classList.add('active');

        document.getElementById('result').style.display = 'none';
        document.getElementById('loading').style.display = 'none';
    });
});

// ================= QUICK CHECK (Offline) =================
document.getElementById('quickCheck')?.addEventListener('click', async () => {
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    chrome.scripting.executeScript({
        target: { tabId: tab.id },
        function: () => ({
            text: window.getSelection().toString(),
            url: window.location.href
        })
    }, async (results) => {
        const text = results[0]?.result?.text;
        const pageUrl = results[0]?.result?.url;

        if (!text || text.length < 20) {
            showResult(0, 'error', '⚠️ Please Select Text', 'Select at least 20 characters on the page first.');
            return;
        }

        const result = performOfflineAnalysis(text, pageUrl);

        // Check URL
        const urlCheck = isAISourceURL(pageUrl);

        let details = buildDetails(result);
        if (urlCheck.isAI) {
            details = `🔴 Source: ${urlCheck.source} (AI Platform)\n` + details;
        }

        showResult(
            result.score,
            result.score >= 80 && result.aiScore < 30 ? 'high' : result.score >= 50 ? 'medium' : 'low',
            result.aiScore >= 50 ? '🤖 Likely AI Generated' :
                result.score >= 80 ? '✅ Original Content' :
                    result.score >= 50 ? '⚠️ Some Issues Found' : '🚨 High Risk',
            details,
            result.verdict
        );
    });
});

// ================= AI DETECTION =================
document.getElementById('aiCheck')?.addEventListener('click', async () => {
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    chrome.scripting.executeScript({
        target: { tabId: tab.id },
        function: () => ({
            text: window.getSelection().toString(),
            url: window.location.href
        })
    }, async (results) => {
        const text = results[0]?.result?.text;
        const pageUrl = results[0]?.result?.url;

        if (!text || text.length < 50) {
            showResult(0, 'error', '⚠️ Please Select Text', 'Select at least 50 characters for AI detection.');
            return;
        }

        showLoading();

        // First do a quick URL check
        const urlCheck = isAISourceURL(pageUrl);

        try {
            const data = await fetchWithFallback('/api/analyze/page', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    textContent: text,
                    html: `<html><body>${text}</body></html>`,
                    url: pageUrl
                })
            });

            let aiScore = data.contentAnalysis?.aiScore || 0;

            // If URL is AI source, boost the score
            if (urlCheck.isAI) {
                aiScore = Math.max(aiScore, 90);
            }

            const humanScore = 100 - aiScore;

            let details = `🤖 AI Probability: ${aiScore}%\n👤 Human Probability: ${humanScore}%`;

            // Add URL warning
            if (urlCheck.isAI) {
                details = `🔴 Source: ${urlCheck.source} (AI Platform)\n` + details;
            }

            // Add Gemini analysis if available
            if (data.geminiAnalysis) {
                details += `\n\n🧠 Gemini Analysis: ${data.geminiAnalysis.verdict}`;
                if (data.geminiAnalysis.reasoning) {
                    details += `\n${data.geminiAnalysis.reasoning}`;
                }
            }

            // Add detailed factors
            if (data.detailedAIFactors && data.detailedAIFactors.length > 0) {
                const factorsList = data.detailedAIFactors
                    .filter(f => f && !f.startsWith('\n'))
                    .slice(0, 5)
                    .join('\n');
                if (factorsList) {
                    details += `\n\n📋 Key Factors:\n${factorsList}`;
                }
            }

            showResult(
                humanScore,
                humanScore >= 70 ? 'high' : humanScore >= 40 ? 'medium' : 'low',
                humanScore >= 70 ? '👤 Likely Human Written' : humanScore >= 40 ? '🤔 Mixed Content' : '🤖 Likely AI Generated',
                details,
                humanScore >= 70 ? 'HUMAN' : humanScore >= 40 ? 'MIXED' : 'AI_GENERATED'
            );
        } catch (e) {
            // Fallback to offline analysis
            const result = performOfflineAnalysis(text, pageUrl);
            const aiScore = result.aiScore || 0;
            const humanScore = 100 - aiScore;

            let details = `🤖 AI Probability: ${aiScore}% (Offline)\n👤 Human Probability: ${humanScore}%`;
            if (urlCheck.isAI) {
                details = `🔴 Source: ${urlCheck.source} (AI Platform)\n` + details;
            }

            let aiDetails = result.matches
                .filter(m => m.type === 'ai' || m.type === 'ai_source')
                .map(m => m.description)
                .join('\n');
            if (aiDetails) details += `\n\n${aiDetails}`;

            showResult(
                humanScore,
                humanScore >= 70 ? 'high' : humanScore >= 40 ? 'medium' : 'low',
                aiScore >= 50 ? '🤖 Likely AI Generated' : humanScore >= 70 ? '👤 Likely Human' : '🤔 Mixed Content',
                details,
                aiScore >= 50 ? 'AI_GENERATED' : humanScore >= 70 ? 'HUMAN' : 'MIXED'
            );
        }
    });
});

// ================= CODE PLAGIARISM CHECK =================
document.getElementById('verifyCodeBtn')?.addEventListener('click', async () => {
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    const language = document.getElementById('compilerSelect')?.value || 'auto';

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
            const data = await fetchWithFallback('/api/plagiarism/code', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ code, language })
            });

            const originalityScore = data.originalityScore || 0;
            const aiPct = data.aiGeneratedPercentage || 0;
            const humanPct = data.humanWrittenPercentage || (100 - aiPct);

            let details = [];

            // Show detected language
            if (data.language && data.language !== 'unknown') {
                details.push(`🔤 Language: ${data.language.charAt(0).toUpperCase() + data.language.slice(1)}${data.languageDetection?.confidence ? ` (${data.languageDetection.confidence}% confidence)` : ''}`);
            }

            // Show AI generation percentage (KEY metric)
            details.push(`🤖 AI Generated: ${aiPct}% | Human Written: ${humanPct}%`);
            details.push(`📊 Originality: ${originalityScore}%`);

            // Show AST analysis
            if (data.astAnalysis) {
                const ast = data.astAnalysis;
                if (ast.genericVariableRatio > 0) {
                    details.push(`🔬 AST: ${ast.genericVariableRatio}% generic variables, ${ast.uniqueIdentifiers} unique identifiers`);
                }
                if (ast.variableRenamingScore > 50) {
                    details.push(`⚠️ AST: Variable renaming detected (${ast.variableRenamingScore}% uniform naming)`);
                }
            }

            // Show Gemini analysis
            if (data.geminiAnalysis) {
                const gemini = data.geminiAnalysis;
                if (gemini.isAIGenerated) {
                    details.push(`🧠 Gemini: AI-generated (${gemini.aiConfidence}% confidence)`);
                }
                if (gemini.reasoning) {
                    details.push(`💡 ${gemini.reasoning.substring(0, 200)}`);
                }
            }

            // Show common algorithm matches
            if (data.commonAlgorithms?.length > 0) {
                const algos = data.commonAlgorithms.map(a => `${a.algorithm} (${a.similarity}%)`).join(', ');
                details.push(`📚 Matches: ${algos}`);
            }

            // Show key issues
            if (data.issues?.length > 0) {
                const keyIssues = data.issues.filter(i =>
                    i.startsWith('🔴') || i.startsWith('🤖') || i.startsWith('🧠') || i.startsWith('🔬') || i.startsWith('⚠')
                ).slice(0, 4);
                if (keyIssues.length > 0) details.push(...keyIssues);
            }

            // Show explanation
            if (data.explanation) {
                details.push(`\n📝 ${data.explanation.substring(0, 300)}`);
            }

            details.push(`📊 Verdict: ${(data.verdict || 'UNKNOWN').replace(/_/g, ' ')}`);

            // Better status titles based on verdict
            const isAIVerdict = data.verdict?.includes('AI_GENERATED');
            let statusTitle, statusLevel;
            if (isAIVerdict) {
                statusTitle = `🤖 AI Generated Code (${aiPct}%)`;
                statusLevel = aiPct >= 70 ? 'low' : 'medium';
            } else if (originalityScore >= 75) {
                statusTitle = '✅ Original Code';
                statusLevel = 'high';
            } else if (originalityScore >= 45) {
                statusTitle = '⚠️ Some Similarity';
                statusLevel = 'medium';
            } else {
                statusTitle = '❌ Likely Copied';
                statusLevel = 'low';
            }

            showResult(
                originalityScore,
                statusLevel,
                statusTitle,
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

dropZone?.addEventListener('click', () => fileInput?.click());

dropZone?.addEventListener('dragover', (e) => {
    e.preventDefault();
    dropZone.classList.add('dragover');
});

dropZone?.addEventListener('dragleave', () => dropZone?.classList.remove('dragover'));

dropZone?.addEventListener('drop', (e) => {
    e.preventDefault();
    dropZone?.classList.remove('dragover');
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
    const reader = new FileReader();
    reader.onload = (e) => {
        const img = document.getElementById('previewImage');
        if (img) {
            img.src = e.target.result;
            img.style.display = 'block';
        }
        if (dropZone) dropZone.style.display = 'none';
    };
    reader.readAsDataURL(file);

    showLoading();

    try {
        const formData = new FormData();
        formData.append('image', file);

        let data;
        try {
            const res = await fetch(`${API_BASE_URL}/api/analyze/image`, {
                method: 'POST',
                body: formData
            });
            if (res.ok) {
                data = await res.json();
            } else {
                throw new Error('Local failed');
            }
        } catch {
            const res = await fetch(`${PRODUCTION_URL}/api/analyze/image`, {
                method: 'POST',
                body: formData
            });
            data = await res.json();
        }

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
document.getElementById('checkSelection')?.addEventListener('click', async () => {
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    chrome.scripting.executeScript({
        target: { tabId: tab.id },
        function: () => ({
            text: window.getSelection().toString(),
            url: window.location.href
        })
    }, async (results) => {
        const text = results[0]?.result?.text;
        const pageUrl = results[0]?.result?.url;

        if (!text || text.length < 20) {
            showResult(0, 'error', '⚠️ Please Select Text', 'Select at least 20 characters on the page first.');
            return;
        }

        showLoading();
        try {
            const data = await fetchWithFallback('/api/analyze/page', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    textContent: text,
                    html: `<html><body>${text}</body></html>`,
                    url: pageUrl
                })
            });

            if (data.error) {
                showResult(0, 'error', '❌ Analysis Failed', data.error);
                return;
            }

            const score = data.overallScore || 0;
            const plagScore = data.plagiarismAnalysis?.originalityScore || score;
            const aiScore = data.contentAnalysis?.aiScore || 0;

            // Check URL
            const urlCheck = isAISourceURL(pageUrl);

            let details = [];
            if (urlCheck.isAI) {
                details.push(`🔴 Source: ${urlCheck.source} (AI Platform)`);
            }
            details.push(`📋 Originality: ${Math.round(plagScore)}%`);
            details.push(`🤖 AI Score: ${aiScore}%`);
            if (data.plagiarismAnalysis?.matchCount > 0) {
                details.push(`🔍 Matches: ${data.plagiarismAnalysis.matchCount}`);
                if (data.plagiarismAnalysis?.webMatchCount > 0) {
                    details.push(`🌐 Web Sources: ${data.plagiarismAnalysis.webMatchCount}`);
                }
            }

            // Adjust displayed score based on AI detection
            let displayScore = Math.round(plagScore);
            let displayType = 'high';
            let displayStatus = '✅ Original Content';
            let displayVerdict = data.overallVerdict || 'UNKNOWN';

            if (urlCheck.isAI || aiScore >= 60) {
                displayScore = Math.min(displayScore, 25);
                displayType = 'low';
                displayStatus = '🤖 AI-Generated Content';
                displayVerdict = 'AI_GENERATED';
            } else if (aiScore >= 35) {
                displayScore = Math.min(displayScore, 55);
                displayType = 'medium';
                displayStatus = '⚠️ Mixed Content (AI Detected)';
                displayVerdict = 'MIXED_CONTENT';
            } else if (plagScore < 40) {
                displayType = 'low';
                displayStatus = '❌ Potential Plagiarism';
            } else if (plagScore < 70) {
                displayType = 'medium';
                displayStatus = '⚠️ Some Similarity';
            }

            showResult(displayScore, displayType, displayStatus, details.join('\n'), displayVerdict);
        } catch (e) {
            const result = performOfflineAnalysis(text, pageUrl);
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
document.getElementById('checkPage')?.addEventListener('click', async () => {
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

        // Check URL FIRST
        const urlCheck = isAISourceURL(pageData.url);

        try {
            const data = await fetchWithFallback('/api/analyze/page', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    html: pageData.html,
                    textContent: pageData.textContent,
                    url: pageData.url
                })
            });

            if (data.error) {
                showResult(0, 'error', '❌ Analysis Failed', data.error);
                return;
            }

            let overallScore = data.overallScore || 50;
            const aiScore = data.contentAnalysis?.aiScore || 0;

            let details = [];

            // URL check warning first
            if (urlCheck.isAI) {
                details.push(`🔴 SOURCE: ${urlCheck.source} (AI Platform)`);
                details.push(`🔴 Content from this URL is AI-generated`);
                overallScore = Math.min(overallScore, 10);
            }

            if (data.plagiarismAnalysis) {
                const plagScore = data.plagiarismAnalysis.originalityScore || 100;
                details.push(`📋 Originality: ${plagScore}%`);
                if (data.plagiarismAnalysis.matchCount > 0) {
                    details.push(`   └─ ${data.plagiarismAnalysis.matchCount} sources found`);
                }
                if (data.plagiarismAnalysis.webMatchCount > 0) {
                    details.push(`   └─ ${data.plagiarismAnalysis.webMatchCount} web matches`);
                }
            }
            if (data.contentAnalysis) {
                details.push(`🤖 AI Probability: ${aiScore}%`);
            }
            if (data.geminiAnalysis) {
                details.push(`🧠 Gemini: ${data.geminiAnalysis.verdict} (${data.geminiAnalysis.aiProbability}% AI)`);
            }
            if (data.seoAnalysis) {
                details.push(`📊 SEO Score: ${data.seoAnalysis.score}%`);
            }
            if (data.recommendations?.length > 0) {
                details.push('\n' + data.recommendations.slice(0, 3).join('\n'));
            }

            // Determine verdict based on AI + URL
            let statusText;
            let verdict = data.overallVerdict;

            if (urlCheck.isAI || aiScore >= 70) {
                statusText = '🤖 AI-Generated Content';
                verdict = 'AI_GENERATED';
                overallScore = Math.min(overallScore, 15);
            } else if (aiScore >= 45) {
                statusText = '⚠️ Mixed Content (AI Suspected)';
                verdict = 'MIXED_CONTENT';
                overallScore = Math.min(overallScore, 50);
            } else {
                switch (verdict) {
                    case 'ORIGINAL': statusText = '✅ Original Content'; break;
                    case 'AI_GENERATED': statusText = '🤖 AI-Generated Content'; break;
                    case 'PLAGIARIZED': statusText = '❌ Plagiarism Detected'; break;
                    default: statusText = '⚠️ Mixed Content';
                }
            }

            showResult(
                overallScore,
                overallScore >= 70 ? 'high' : overallScore >= 40 ? 'medium' : 'low',
                statusText,
                details.join('\n'),
                verdict
            );

        } catch (err) {
            console.error(err);
            // Offline fallback for full page
            if (urlCheck.isAI) {
                showResult(5, 'low', '🤖 AI Source Detected',
                    `🔴 SOURCE: ${urlCheck.source}\nContent from this URL is AI-generated.\n(Server unavailable for full analysis)`,
                    'AI_GENERATED'
                );
            } else {
                showResult(0, 'error', '❌ Connection Failed', 'Unable to reach server. Please try again.');
            }
        }
    });
});

// ================= HELPER FUNCTIONS =================
function showLoading() {
    const loading = document.getElementById('loading');
    const result = document.getElementById('result');
    if (loading) loading.style.display = 'block';
    if (result) result.style.display = 'none';
}

function buildDetails(result) {
    let details = [];
    if (result.isOffline) {
        details.push('⚡ Pattern Analysis (Offline)');
    }
    if (result.aiScore > 0) {
        details.push(`🤖 AI Score: ${result.aiScore}%`);
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
    const loading = document.getElementById('loading');
    const resultDiv = document.getElementById('result');

    if (loading) loading.style.display = 'none';
    if (resultDiv) resultDiv.style.display = 'block';

    const scoreRing = document.getElementById('scoreRing');
    if (scoreRing) {
        scoreRing.style.setProperty('--score', score);
        scoreRing.className = 'score-ring';
        if (scoreType === 'high') scoreRing.classList.add('score-high');
        else if (scoreType === 'medium') scoreRing.classList.add('score-medium');
        else scoreRing.classList.add('score-low');
    }

    const scoreValue = document.getElementById('scoreValue');
    if (scoreValue) {
        if (scoreType === 'error') {
            scoreValue.innerHTML = '!';
        } else {
            scoreValue.innerHTML = `${Math.round(score)}<small>%</small>`;
        }
    }

    const statusText = document.getElementById('statusText');
    if (statusText) statusText.textContent = status;

    const verdictBadge = document.getElementById('verdictBadge');
    if (verdictBadge) {
        verdictBadge.textContent = verdict.replace(/_/g, ' ');
        verdictBadge.className = 'verdict-badge';
        if (verdict.includes('ORIGINAL') || verdict === 'HUMAN' || verdict === 'AUTHENTIC') {
            verdictBadge.classList.add('verdict-original');
        } else if (verdict.includes('SUSPICIOUS') || verdict === 'MIXED' || verdict.includes('MOSTLY') || verdict.includes('MIXED_CONTENT')) {
            verdictBadge.classList.add('verdict-suspicious');
        } else {
            verdictBadge.classList.add('verdict-plagiarized');
        }
    }

    const detailsText = document.getElementById('detailsText');
    if (detailsText) detailsText.innerHTML = details.replace(/\n/g, '<br>');
}

console.log('PlagDetect popup.js loaded (v2.0 - Enhanced AI Detection with Gemini + URL check)');
