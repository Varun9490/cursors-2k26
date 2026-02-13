/**
 * AI Content Detection & SEO Analysis
 * ====================================
 * Multi-engine AI detection system combining:
 * 1. ai-text-detector (npm) — perplexity, burstiness, stylometric analysis
 * 2. Local pattern matching — 100+ patterns, em dashes, ChatGPT fingerprints
 * 3. Gemini AI — independent LLM-based detection (no hints given)
 * 4. Statistical analysis — sentence uniformity, vocabulary metrics
 * 5. URL-based source detection — AI platform fingerprinting
 */

import { detectAIText, getPerplexityScore, getBurstinessScore, AITextDetector } from 'ai-text-detector';

// ============================================
// AI SOURCE URLS - known AI content generators
// ============================================
const AI_SOURCE_URLS = [
    'chat.openai.com', 'chatgpt.com', 'claude.ai', 'anthropic.com',
    'bard.google.com', 'gemini.google.com', 'copilot.microsoft.com',
    'perplexity.ai', 'you.com', 'poe.com', 'character.ai',
    'writesonic.com', 'jasper.ai', 'copy.ai', 'rytr.me',
    'quillbot.com', 'wordtune.com', 'grammarly.com/ai',
    'huggingface.co', 'replicate.com', 'deepai.org',
    'chat.deepseek.com', 'deepseek.com', 'mistral.ai',
    'cohere.com', 'together.ai', 'fireworks.ai',
    'llama.meta.com', 'meta.ai', 'bing.com/chat',
    'pi.ai', 'inflection.ai', 'phind.com',
    'tabs.ai', 'textcortex.com', 'smodin.io',
    'hyperwriteai.com', 'sudowrite.com', 'anyword.com',
    'notion.so/ai', 'notion.ai', 'lex.page',
    'jenni.ai', 'scholarcy.com', 'elicit.com'
];

// ============================================
// COMPREHENSIVE AI WRITING PATTERNS (100+)
// ============================================
const AI_MARKERS = {
    // === ChatGPT Signature Phrases (40+) ===
    chatgptPhrases: [
        'delve into', 'delve deeper', 'delves into', 'delving into',
        'it\'s important to note', 'it\'s worth noting', 'it\'s worth mentioning',
        'it is important to note', 'it is worth noting', 'it is worth mentioning',
        'in today\'s rapidly', 'in today\'s digital', 'in today\'s world',
        'in today\'s fast-paced', 'in today\'s ever-changing', 'in today\'s landscape',
        'let\'s explore', 'let\'s dive', 'let\'s break down', 'let\'s take a closer look',
        'let\'s unpack', 'let me explain', 'allow me to',
        'here are some key', 'here are the key', 'here\'s a comprehensive',
        'here are some tips', 'here are some ways', 'here\'s how',
        'whether you\'re a', 'whether it\'s', 'regardless of whether',
        'by understanding', 'by leveraging', 'by utilizing', 'by harnessing',
        'plays a crucial role', 'plays a vital role', 'plays an important role',
        'plays a key role', 'plays a significant role', 'plays a pivotal role',
        'is a powerful tool', 'is a game-changer', 'is a game changer',
        'offers a wide range', 'provides a comprehensive', 'ensures that',
        'it\'s crucial to', 'it\'s essential to', 'it is crucial to', 'it is essential to',
        'navigating the complexities', 'navigating the world', 'navigating the landscape',
        'landscape of', 'ever-evolving', 'ever-changing', 'rapidly evolving',
        'this comprehensive guide', 'in this article', 'in this guide',
        'unlock the full potential', 'unleash the power', 'tap into the power',
        'designed to help', 'aimed at helping', 'intended to help',
        'a testament to', 'a deep dive', 'deep dive into',
        'stands out as', 'stands as a', 'emerge as', 'emerged as',
        'at the core of', 'at its core', 'at the heart of', 'lies at the heart',
        'the bottom line', 'the key takeaway', 'the takeaway here',
        'understanding the nuances', 'nuances of', 'subtle nuances',
        'a myriad of', 'a plethora of', 'a multitude of', 'an array of',
        'serves as a', 'acts as a catalyst', 'serves as a catalyst',
        'paves the way', 'sets the stage', 'lays the groundwork',
        'in the realm of', 'in the world of', 'in the landscape of', 'in the sphere of',
        'first and foremost', 'last but not least', 'above all else',
        'that said', 'with that said', 'having said that', 'that being said',
        'on the flip side', 'on the other hand', 'conversely',
        'not only...but also', 'while also', 'in this comprehensive',
        'in an era of', 'in a world where', 'in an increasingly',
        'with the advent of', 'with the rise of', 'with the emergence of',
        'it cannot be overstated', 'it bears mentioning', 'one cannot overstate',
        'needless to say', 'goes without saying', 'suffice it to say',
        'when it comes to', 'in terms of',
        'the importance of', 'the significance of', 'the impact of',
        'tailor your approach', 'tailor-made', 'tailored to your needs',
        'dive deep into', 'a closer look at', 'sheds light on',
        'bridges the gap', 'fills the gap', 'closing the gap',
        'dovetails with', 'aligns seamlessly', 'integrates seamlessly',
        'harnesses the power', 'taps into', 'capitalizes on',
        'is poised to', 'are well-positioned', 'is well-suited',
        'strike a balance', 'striking a balance', 'find the right balance',
        'food for thought', 'thought-provoking', 'raises important questions'
    ],

    // === AI Buzzwords (50+) ===
    buzzwords: [
        'leverage', 'utilize', 'furthermore', 'moreover',
        'comprehensive', 'robust', 'seamless', 'streamline', 'streamlined',
        'cutting-edge', 'state-of-the-art', 'innovative', 'revolutionary',
        'paradigm', 'synergy', 'optimize', 'enhance', 'facilitate', 'empower',
        'holistic', 'scalable', 'dynamic', 'ecosystem', 'landscape',
        'navigate', 'unpack', 'dive deep', 'at the end of the day',
        'elevate', 'foster', 'harness', 'pivotal', 'paramount',
        'transformative', 'groundbreaking', 'actionable',
        'best practices', 'key takeaways', 'moving forward',
        'game-changer', 'tapestry', 'underscores', 'underscore',
        'multifaceted', 'intricate', 'intricacies', 'cornerstone',
        'spearhead', 'bolster', 'amplify', 'resonate', 'resonates',
        'aligns with', 'instrumental', 'indispensable', 'imperative',
        'meticulous', 'meticulously', 'nuanced', 'nuance',
        'overarching', 'underpinning', 'underpin', 'underpins',
        'endeavor', 'endeavors', 'endeavour',
        'pertinent', 'salient', 'cogent',
        'burgeoning', 'nascent', 'ubiquitous',
        'inherent', 'inherently', 'intrinsic', 'intrinsically',
        'plethora', 'myriad', 'multitude',
        'proliferation', 'proliferate',
        'juxtapose', 'juxtaposition',
        'epitome', 'epitomize', 'epitomizes',
        'catalyst', 'catalyze',
        'paradigm shift', 'game-changing',
        'synergistic', 'synergize',
        'holistic approach', 'proactive', 'proactively',
        'stakeholders', 'stakeholder',
        'bandwidth', 'deep-dive',
        'touchpoint', 'touchpoints',
        'ecosystem', 'verticals',
        'curated', 'bespoke', 'tailor-made'
    ],

    // === Formal Transitions AI Overuses (25+) ===
    transitions: [
        'additionally', 'consequently', 'nevertheless', 'nonetheless',
        'subsequently', 'accordingly', 'hence', 'thus', 'therefore',
        'in addition', 'as a result', 'on the other hand', 'in contrast',
        'similarly', 'likewise', 'in particular', 'specifically',
        'notably', 'significantly', 'importantly', 'essentially',
        'fundamentally', 'ultimately', 'inherently', 'arguably',
        'notwithstanding', 'henceforth', 'therein', 'thereby',
        'wherein', 'whereby', 'inasmuch as', 'insofar as'
    ],

    // === Formulaic Sentence Starters (20+) ===
    starters: [
        'In the realm of', 'When it comes to', 'It goes without saying',
        'As mentioned earlier', 'Moving forward', 'That being said',
        'With that in mind', 'Having said that', 'It\'s no secret that',
        'There\'s no denying', 'One of the most', 'In order to',
        'As we navigate', 'As technology continues', 'As the world',
        'In an era', 'In a world where', 'In an increasingly',
        'With the advent of', 'With the rise of',
        'It is no surprise that', 'It should come as no surprise',
        'It is undeniable that', 'There is no doubt that',
        'It is widely recognized', 'It is generally accepted',
        'As we look to the future', 'Looking ahead',
        'In light of', 'Given the fact that', 'Considering the',
        'From the perspective of', 'In the context of'
    ],

    // === Hedging Language ===
    hedging: [
        'it could be argued', 'one might argue', 'it\'s safe to say',
        'for the most part', 'in many cases', 'in some instances',
        'to a certain extent', 'to some degree', 'broadly speaking',
        'generally speaking', 'relatively speaking',
        'it is often the case', 'more often than not',
        'it stands to reason', 'it follows that',
        'it can be said', 'it may be said',
        'arguably', 'presumably', 'conceivably',
        'it is plausible', 'it is reasonable to assume'
    ],

    // === List Introduction Patterns ===
    listPatterns: [
        'here are some', 'here are a few', 'consider the following',
        'the following are', 'some of these include', 'these include',
        'let\'s look at', 'we\'ll explore', 'we will explore',
        'key factors include', 'key aspects include',
        'several factors', 'several key', 'various factors',
        'some key benefits', 'some key features', 'the main benefits',
        'the key advantages', 'the primary benefits',
        'the following tips', 'the following strategies',
        'the following steps', 'the following points'
    ],

    // === Conclusion Patterns ===
    conclusionPatterns: [
        'in conclusion', 'to sum up', 'to summarize', 'in summary',
        'all in all', 'to wrap up', 'in closing',
        'the bottom line is', 'ultimately',
        'as we have seen', 'as discussed above', 'as mentioned earlier',
        'taking everything into account', 'considering all factors',
        'all things considered', 'when all is said and done',
        'the evidence suggests', 'the data indicates'
    ],

    // === Emotional Padding (AI adds fluff) ===
    emotionalPadding: [
        'it\'s truly remarkable', 'it\'s fascinating', 'it\'s incredibly',
        'absolutely essential', 'truly transformative', 'remarkably',
        'undeniably important', 'incredibly powerful',
        'nothing short of', 'can\'t be overstated',
        'exciting opportunity', 'exciting development',
        'golden opportunity', 'unique opportunity',
        'stands to gain', 'stands to benefit'
    ]
};

// AI Code Patterns
const AI_CODE_PATTERNS = {
    comments: [
        /\/\/ TODO:/gi, /\/\/ FIXME:/gi,
        /\/\/ Example usage/gi, /\/\/ This function/gi,
        /\/\*\*\s*\n\s*\*\s*@/gi,
    ],
    missingErrorHandling: /try\s*{\s*[^}]+}\s*catch\s*\([^)]*\)\s*{\s*}/g,
    emptyFunctions: /function\s+\w+\s*\([^)]*\)\s*{\s*}/g,
};

// SEO Issues
const SEO_ISSUES = {
    genericAnchors: ['click here', 'read more', 'learn more', 'this link']
};

// ============================================
// CHECK IF URL IS AN AI SOURCE
// ============================================
export function checkAISourceURL(url) {
    if (!url) return { isAISource: false, source: null, penalty: 0 };

    const lowerUrl = url.toLowerCase();
    for (const domain of AI_SOURCE_URLS) {
        if (lowerUrl.includes(domain)) {
            // Random penalty between 50 and 80
            const randomPenalty = Math.floor(Math.random() * 31) + 50; // 50-80
            return {
                isAISource: true,
                source: domain,
                penalty: randomPenalty,
                message: `Content from ${domain} is AI-generated`
            };
        }
    }
    return { isAISource: false, source: null, penalty: 0 };
}

// ============================================
// ENGINE 1: ai-text-detector (npm package)
// Perplexity, burstiness, stylometric analysis
// ============================================
function runNpmDetector(text) {
    try {
        const result = detectAIText(text);
        const perplexity = getPerplexityScore(text);
        const burstiness = getBurstinessScore(text);

        return {
            isAIGenerated: result.isAIGenerated || false,
            confidence: result.confidence || 0,
            score: result.score || 0,
            reasons: result.reasons || [],
            perplexityScore: result.perplexityScore || perplexity || 0,
            burstinessScore: result.burstinessScore || burstiness || 0,
            source: 'ai-text-detector'
        };
    } catch (err) {
        console.error('[NPM DETECTOR] Error:', err.message);
        return {
            isAIGenerated: false, confidence: 0, score: 0,
            reasons: ['Detection failed: ' + err.message],
            perplexityScore: 0, burstinessScore: 0,
            source: 'ai-text-detector', error: true
        };
    }
}

// ============================================
// ENGINE 2: Advanced Local Pattern Detector
// 100+ patterns, em dashes, statistical analysis
// ============================================
function runLocalDetector(text, url = null) {
    const result = {
        isLikelyAI: false,
        aiScore: 0,
        markers: [],
        detailedFactors: []
    };

    const lowerText = text.toLowerCase();
    const words = text.split(/\s+/).filter(w => w.length > 0);
    const wordCount = words.length;

    if (wordCount < 30) {
        return { ...result, detailedFactors: ['Text too short'] };
    }

    let aiScore = 0;
    let maxPossible = 0;

    // --- FACTOR 1: Em Dashes (—) — STRONGEST single indicator ---
    maxPossible += 22;
    const emDashCount = (text.match(/—/g) || []).length;
    const enDashCount = (text.match(/–/g) || []).length;
    const totalDashes = emDashCount + enDashCount;

    if (totalDashes >= 4) {
        aiScore += 22;
        result.markers.push({ type: 'em_dash', count: totalDashes });
        result.detailedFactors.push(`🔴 EM DASHES: ${totalDashes} found — strongest AI indicator. ChatGPT uses em dashes 10-15x more than humans.`);
    } else if (totalDashes >= 2) {
        aiScore += 15;
        result.markers.push({ type: 'em_dash', count: totalDashes });
        result.detailedFactors.push(`🔴 Em dashes: ${totalDashes} found — strong AI indicator.`);
    } else if (totalDashes >= 1) {
        aiScore += 8;
        result.markers.push({ type: 'em_dash', count: totalDashes });
        result.detailedFactors.push(`🟡 Em dash: ${totalDashes} found — possible AI indicator.`);
    }

    // --- FACTOR 2: ChatGPT Signature Phrases ---
    maxPossible += 25;
    let chatgptCount = 0;
    const foundChatGPT = [];
    for (const phrase of AI_MARKERS.chatgptPhrases) {
        const escaped = phrase.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
        const regex = new RegExp(escaped, 'gi');
        const matches = lowerText.match(regex);
        if (matches) {
            chatgptCount += matches.length;
            if (foundChatGPT.length < 8) foundChatGPT.push(phrase);
        }
    }

    if (chatgptCount >= 8) {
        aiScore += 25;
        result.detailedFactors.push(`🔴 ChatGPT phrases: ${chatgptCount} found — extremely high AI probability. Examples: "${foundChatGPT.slice(0, 4).join('", "')}"`);
    } else if (chatgptCount >= 5) {
        aiScore += 20;
        result.detailedFactors.push(`🔴 ChatGPT phrases: ${chatgptCount} found. Examples: "${foundChatGPT.slice(0, 3).join('", "')}"`);
    } else if (chatgptCount >= 3) {
        aiScore += 14;
        result.detailedFactors.push(`🟠 ChatGPT phrases: ${chatgptCount} found — likely AI. Examples: "${foundChatGPT.join('", "')}"`);
    } else if (chatgptCount >= 1) {
        aiScore += 6;
        result.detailedFactors.push(`🟡 ChatGPT phrases: ${chatgptCount} found — "${foundChatGPT.join('", "')}"`);
    }
    if (chatgptCount > 0) {
        result.markers.push({ type: 'chatgpt_phrases', count: chatgptCount, examples: foundChatGPT });
    }

    // --- FACTOR 3: AI Buzzwords ---
    maxPossible += 15;
    let buzzCount = 0;
    const foundBuzz = [];
    for (const word of AI_MARKERS.buzzwords) {
        const escaped = word.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
        const regex = new RegExp(`\\b${escaped}\\b`, 'gi');
        const matches = lowerText.match(regex);
        if (matches) {
            buzzCount += matches.length;
            if (foundBuzz.length < 6) foundBuzz.push(word);
        }
    }

    if (buzzCount >= 8) {
        aiScore += 15;
        result.detailedFactors.push(`🔴 AI buzzwords: ${buzzCount} found — overwhelming AI vocabulary.`);
    } else if (buzzCount >= 5) {
        aiScore += 11;
        result.detailedFactors.push(`🟠 AI buzzwords: ${buzzCount} found.`);
    } else if (buzzCount >= 3) {
        aiScore += 7;
        result.detailedFactors.push(`🟡 AI buzzwords: ${buzzCount} found.`);
    }

    // --- FACTOR 4: Transition Word Density ---
    maxPossible += 12;
    let transCount = 0;
    for (const t of AI_MARKERS.transitions) {
        const regex = new RegExp(`\\b${t}\\b`, 'gi');
        transCount += (lowerText.match(regex) || []).length;
    }
    const transDensity = (transCount / wordCount) * 100;

    if (transDensity > 3.5) {
        aiScore += 12;
        result.detailedFactors.push(`🔴 Transition density: ${transDensity.toFixed(1)}% — AI overuses formal transitions.`);
    } else if (transDensity > 2) {
        aiScore += 8;
        result.detailedFactors.push(`🟠 Transition density: ${transDensity.toFixed(1)}% — elevated.`);
    } else if (transDensity > 1.2) {
        aiScore += 4;
        result.detailedFactors.push(`🟡 Transition density: ${transDensity.toFixed(1)}%.`);
    }

    // --- FACTOR 5: Sentence Uniformity ---
    maxPossible += 14;
    const sentences = text.split(/[.!?]+/).filter(s => s.trim().length > 5);
    if (sentences.length > 4) {
        const lengths = sentences.map(s => s.trim().split(/\s+/).length);
        const avgLen = lengths.reduce((a, b) => a + b, 0) / lengths.length;
        const variance = lengths.reduce((sum, l) => sum + Math.pow(l - avgLen, 2), 0) / lengths.length;
        const stdDev = Math.sqrt(variance);
        const cv = stdDev / avgLen;

        if (cv < 0.25 && avgLen > 10) {
            aiScore += 14;
            result.detailedFactors.push(`🔴 Sentence uniformity: CV=${cv.toFixed(2)} — very robotic uniform length. Human writing has much more variation.`);
        } else if (cv < 0.35 && avgLen > 10) {
            aiScore += 8;
            result.detailedFactors.push(`🟠 Sentence uniformity: CV=${cv.toFixed(2)} — suspiciously uniform.`);
        } else if (cv < 0.45 && avgLen > 10) {
            aiScore += 4;
            result.detailedFactors.push(`🟡 Sentence uniformity: CV=${cv.toFixed(2)}.`);
        }
    }

    // --- FACTOR 6: Formulaic Starters ---
    maxPossible += 10;
    let starterCount = 0;
    const foundStarters = [];
    for (const starter of AI_MARKERS.starters) {
        if (lowerText.includes(starter.toLowerCase())) {
            starterCount++;
            foundStarters.push(starter);
        }
    }
    if (starterCount >= 4) {
        aiScore += 10;
        result.detailedFactors.push(`🔴 Formulaic starters: ${starterCount} found — "${foundStarters.slice(0, 3).join('", "')}"`);
    } else if (starterCount >= 2) {
        aiScore += 6;
        result.detailedFactors.push(`🟡 Formulaic starters: ${starterCount} found.`);
    } else if (starterCount >= 1) {
        aiScore += 3;
    }

    // --- FACTOR 7: Lack of Personal Voice ---
    maxPossible += 10;
    const personalPronouns = (text.match(/\b(I|my|me|myself|we|our|us)\b/gi) || []).length;
    const pronounDensity = (personalPronouns / wordCount) * 100;
    if (pronounDensity < 0.2 && wordCount > 80) {
        aiScore += 10;
        result.detailedFactors.push(`🔴 Impersonal: ${pronounDensity.toFixed(1)}% personal pronouns — AI avoids "I", "my", "we".`);
    } else if (pronounDensity < 0.8 && wordCount > 80) {
        aiScore += 5;
        result.detailedFactors.push(`🟡 Low personal voice: ${pronounDensity.toFixed(1)}% pronouns.`);
    }

    // --- FACTOR 8: No Contractions ---
    maxPossible += 8;
    const formalForms = (text.match(/\b(it is|do not|does not|cannot|will not|would not|should not|could not|is not|are not|was not|were not|has not|have not|had not|did not)\b/gi) || []).length;
    const contractions = (text.match(/\b(it's|don't|doesn't|can't|won't|wouldn't|shouldn't|couldn't|isn't|aren't|wasn't|weren't|hasn't|haven't|hadn't|didn't)\b/gi) || []).length;
    if (formalForms > 3 && contractions === 0 && wordCount > 80) {
        aiScore += 8;
        result.detailedFactors.push(`🟠 Zero contractions: ${formalForms} formal forms found. AI avoids contractions.`);
    } else if (formalForms > 1 && contractions === 0 && wordCount > 50) {
        aiScore += 4;
    }

    // --- FACTOR 9: Hedging Language ---
    maxPossible += 8;
    let hedgeCount = 0;
    for (const phrase of AI_MARKERS.hedging) {
        if (lowerText.includes(phrase)) hedgeCount++;
    }
    if (hedgeCount >= 4) {
        aiScore += 8;
        result.detailedFactors.push(`🟠 Heavy hedging: ${hedgeCount} hedging phrases — AI hedges to sound balanced.`);
    } else if (hedgeCount >= 2) {
        aiScore += 4;
    }

    // --- FACTOR 10: List Patterns ---
    maxPossible += 6;
    let listCount = 0;
    for (const pattern of AI_MARKERS.listPatterns) {
        if (lowerText.includes(pattern)) listCount++;
    }
    if (listCount >= 3) {
        aiScore += 6;
        result.detailedFactors.push(`🟠 List patterns: ${listCount} list introductions — AI structures content with lists.`);
    } else if (listCount >= 1) {
        aiScore += 2;
    }

    // --- FACTOR 11: Conclusion Patterns ---
    maxPossible += 6;
    let conclusionCount = 0;
    for (const pattern of AI_MARKERS.conclusionPatterns) {
        if (lowerText.includes(pattern)) conclusionCount++;
    }
    if (conclusionCount >= 2) {
        aiScore += 6;
        result.detailedFactors.push(`🟡 Formulaic conclusions: ${conclusionCount} conclusion patterns.`);
    }

    // --- FACTOR 12: Emotional Padding ---
    maxPossible += 6;
    let emotionalCount = 0;
    for (const pattern of AI_MARKERS.emotionalPadding) {
        if (lowerText.includes(pattern)) emotionalCount++;
    }
    if (emotionalCount >= 3) {
        aiScore += 6;
        result.detailedFactors.push(`🟡 Emotional padding: ${emotionalCount} fluff phrases — AI adds superlatives.`);
    }

    // --- FACTOR 13: Colon Density ---
    maxPossible += 5;
    const colonCount = (text.match(/:/g) || []).length;
    if (colonCount >= 6 && sentences.length > 0) {
        const colonPerSentence = colonCount / sentences.length;
        if (colonPerSentence > 0.3) {
            aiScore += 5;
            result.detailedFactors.push(`🟡 Heavy colon usage: ${colonCount} colons. AI uses colons for explanations.`);
        }
    }

    // --- FACTOR 14: Bullet/Numbered Lists ---
    maxPossible += 5;
    const bulletPoints = (text.match(/^[\s]*[-•*]\s/gm) || []).length;
    const numberedItems = (text.match(/^[\s]*\d+[.)]\s/gm) || []).length;
    if (bulletPoints + numberedItems >= 6) {
        aiScore += 5;
        result.detailedFactors.push(`🟡 Heavy list usage: ${bulletPoints + numberedItems} items.`);
    }

    // --- FACTOR 15: Repetitive Sentence Starts ---
    maxPossible += 8;
    if (sentences.length > 5) {
        const starts = sentences.map(s => s.trim().split(' ').slice(0, 3).join(' ').toLowerCase().replace(/[^a-z\s]/g, '').trim()).filter(s => s.length > 3);
        const startFreq = {};
        starts.forEach(s => { startFreq[s] = (startFreq[s] || 0) + 1; });
        const maxRepeat = Math.max(...Object.values(startFreq));
        const repeatRatio = 1 - (new Set(starts).size / starts.length);
        if (repeatRatio > 0.45 || maxRepeat >= 5) {
            aiScore += 8;
            result.detailedFactors.push(`🔴 Repetitive starts: ${(repeatRatio * 100).toFixed(0)}% repetition.`);
        } else if (repeatRatio > 0.3) {
            aiScore += 4;
        }
    }

    // --- FACTOR 16: Paragraph Uniformity ---
    maxPossible += 5;
    const paragraphs = text.split(/\n\s*\n/).filter(p => p.trim().length > 20);
    if (paragraphs.length >= 3) {
        const paraLens = paragraphs.map(p => p.split(/\s+/).length);
        const avgPLen = paraLens.reduce((a, b) => a + b, 0) / paraLens.length;
        const paraVar = paraLens.reduce((sum, l) => sum + Math.pow(l - avgPLen, 2), 0) / paraLens.length;
        const paraCV = Math.sqrt(paraVar) / avgPLen;
        if (paraCV < 0.2) {
            aiScore += 5;
            result.detailedFactors.push(`🟡 Uniform paragraphs: CV=${paraCV.toFixed(2)} — AI generates same-size paragraphs.`);
        }
    }

    // --- FACTOR 17: Lexical Diversity (Type-Token Ratio) ---
    maxPossible += 8;
    const normalizedWords = words.map(w => w.toLowerCase().replace(/[^a-z]/g, '')).filter(w => w.length > 2);
    const uniqueWords = new Set(normalizedWords);
    const ttr = uniqueWords.size / normalizedWords.length;
    if (ttr < 0.45 && wordCount > 100) {
        aiScore += 8;
        result.detailedFactors.push(`🟠 Low lexical diversity: TTR=${ttr.toFixed(2)} — AI reuses vocabulary.`);
    } else if (ttr < 0.55 && wordCount > 100) {
        aiScore += 4;
    }

    // --- FACTOR 18: Question marks (AI rarely asks questions) ---
    maxPossible += 4;
    const questionCount = (text.match(/\?/g) || []).length;
    if (questionCount === 0 && wordCount > 150) {
        aiScore += 4;
        result.detailedFactors.push(`🟡 No questions: AI rarely asks questions in generated text.`);
    }

    // --- FACTOR 19: Exclamation marks (AI rarely uses them) ---
    maxPossible += 3;
    const exclamCount = (text.match(/!/g) || []).length;
    if (exclamCount === 0 && wordCount > 200) {
        aiScore += 3;
    }

    // --- FACTOR 20: Average word length ---
    maxPossible += 5;
    const avgWordLen = normalizedWords.reduce((sum, w) => sum + w.length, 0) / normalizedWords.length;
    if (avgWordLen > 5.5 && wordCount > 80) {
        aiScore += 5;
        result.detailedFactors.push(`🟡 High avg word length: ${avgWordLen.toFixed(1)} chars — AI uses longer words.`);
    }

    // --- URL Check ---
    if (url) {
        const urlCheck = checkAISourceURL(url);
        if (urlCheck.isAISource) {
            maxPossible += 30;
            aiScore += 30;
            result.markers.push({ type: 'ai_source_url', source: urlCheck.source });
            result.detailedFactors.push(`🔴🔴 SOURCE URL: ${urlCheck.source} — AI generation platform. Content is AI-generated.`);
        }
    }

    // --- CALCULATE ---
    const rawScore = Math.min(100, Math.round((aiScore / Math.max(1, maxPossible)) * 100));
    let finalScore = rawScore;

    const strongSignals = result.detailedFactors.filter(f => f.startsWith('🔴')).length;
    if (strongSignals >= 4) finalScore = Math.max(finalScore, 80);
    else if (strongSignals >= 3) finalScore = Math.max(finalScore, 70);
    else if (strongSignals >= 2) finalScore = Math.max(finalScore, 55);

    if (emDashCount >= 2 && chatgptCount >= 2) finalScore = Math.max(finalScore, 65);
    if (emDashCount >= 3 && chatgptCount >= 3) finalScore = Math.max(finalScore, 80);

    if (url && checkAISourceURL(url).isAISource) {
        const urlPenalty = checkAISourceURL(url).penalty; // random 50-80
        finalScore = Math.max(finalScore, urlPenalty);
    }

    result.aiScore = Math.min(100, finalScore);
    result.isLikelyAI = result.aiScore > 35;

    return result;
}

// ============================================
// COMBINED ENGINE: detectAIContent
// Merges npm detector + local detector
// ============================================
export function detectAIContent(text, url = null) {
    const combined = {
        isLikelyAI: false,
        confidence: 0,
        aiScore: 0,
        markers: [],
        issues: [],
        detailedFactors: [],
        engines: {}
    };

    const words = text.split(/\s+/).filter(w => w.length > 0);
    const wordCount = words.length;

    if (wordCount < 30) {
        return { ...combined, issues: ['Text too short for reliable analysis'] };
    }

    // === Engine 1: npm ai-text-detector ===
    const npmResult = runNpmDetector(text);
    combined.engines.npmDetector = npmResult;

    // === Engine 2: Local pattern detector ===
    const localResult = runLocalDetector(text, url);
    combined.engines.localDetector = { aiScore: localResult.aiScore, markers: localResult.markers };

    // === Merge results ===
    combined.markers = [...localResult.markers];
    combined.detailedFactors = [...localResult.detailedFactors];

    // Add npm detector results to factors
    if (npmResult.isAIGenerated) {
        combined.detailedFactors.push(`🔴 NPM Detector: AI detected (confidence: ${(npmResult.confidence * 100).toFixed(0)}%, perplexity: ${npmResult.perplexityScore.toFixed(2)}, burstiness: ${npmResult.burstinessScore.toFixed(2)})`);
    } else if (npmResult.score > 0.4) {
        combined.detailedFactors.push(`🟠 NPM Detector: Suspicious (score: ${(npmResult.score * 100).toFixed(0)}%)`);
    }
    if (npmResult.reasons?.length > 0) {
        npmResult.reasons.slice(0, 3).forEach(r => {
            combined.detailedFactors.push(`📊 ${r}`);
        });
    }

    // === Calculate combined score ===
    const npmScore = npmResult.isAIGenerated ? Math.max(60, npmResult.confidence * 100) :
        npmResult.score > 0 ? npmResult.score * 100 : 0;
    const localScore = localResult.aiScore;

    // Weighted average: local gets more weight since it has 100+ patterns
    let combinedScore = Math.round(
        Math.max(
            (localScore * 0.55 + npmScore * 0.45),
            localScore,
            npmScore * 0.85
        )
    );

    // Strong signal boost
    if (npmResult.isAIGenerated && localScore > 40) {
        combinedScore = Math.max(combinedScore, 75);
    }

    // URL boost
    if (url) {
        const urlCheck = checkAISourceURL(url);
        if (urlCheck.isAISource) {
            combinedScore = Math.max(combinedScore, urlCheck.penalty); // random 50-80
        }
    }

    combined.aiScore = Math.min(100, combinedScore);
    combined.confidence = Math.min(98, 35 + (wordCount / 8) + (combined.detailedFactors.filter(f => f.startsWith('🔴')).length * 6));
    combined.isLikelyAI = combined.aiScore > 35;

    return combined;
}

// ============================================
// GEMINI AI DETECTION (no hints — independent judgment)
// ============================================
export async function detectAIWithGemini(text, genAI) {
    if (!genAI) return null;

    try {
        const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash' });

        const prompt = `You are an expert linguist and AI content forensics specialist. Your job is to determine whether the following text was written by a human or generated by an AI language model (such as ChatGPT, Claude, Gemini, etc.).

Analyze the text completely on your own. Use your own expertise and judgment. Look at writing style, vocabulary choices, sentence structure, tone, and any patterns you notice.

TEXT TO ANALYZE:
"""
${text.substring(0, 4000)}
"""

Respond ONLY with this exact JSON format, nothing else:
{
  "aiProbability": <number 0-100>,
  "humanProbability": <number 0-100>,
  "confidence": <number 0-100>,
  "verdict": "<HUMAN|LIKELY_HUMAN|MIXED|LIKELY_AI|AI>",
  "reasoning": "<your detailed analysis in 2-3 sentences>",
  "keyFactors": ["<factor1>", "<factor2>", "<factor3>", "<factor4>", "<factor5>"]
}`;

        const result = await model.generateContent(prompt);
        const responseText = result.response.text().trim();

        const jsonMatch = responseText.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
            const parsed = JSON.parse(jsonMatch[0]);
            return {
                aiProbability: parsed.aiProbability || 0,
                humanProbability: parsed.humanProbability || 100,
                confidence: parsed.confidence || 50,
                verdict: parsed.verdict || 'UNKNOWN',
                reasoning: parsed.reasoning || '',
                keyFactors: parsed.keyFactors || [],
                source: 'gemini-2.0-flash'
            };
        }
    } catch (err) {
        console.error('[GEMINI AI DETECTION] Error:', err.message);
    }
    return null;
}

// ============================================
// CODE DETECTION
// ============================================
export function detectAIGeneratedCode(code) {
    const result = {
        isLikelyAI: false, confidence: 0,
        aiScore: 0, issues: [], codeQuality: 100
    };

    const lines = code.split('\n');
    let issueCount = 0;

    AI_CODE_PATTERNS.comments.forEach(pattern => {
        const matches = code.match(pattern);
        if (matches) {
            issueCount += matches.length;
            result.issues.push(`Generic comment pattern: ${matches.length} occurrences`);
        }
    });

    const emptyTryCatch = code.match(AI_CODE_PATTERNS.missingErrorHandling);
    if (emptyTryCatch) {
        issueCount += emptyTryCatch.length * 2;
        result.issues.push(`Empty catch blocks: ${emptyTryCatch.length}`);
        result.codeQuality -= emptyTryCatch.length * 10;
    }

    const emptyFuncs = code.match(AI_CODE_PATTERNS.emptyFunctions);
    if (emptyFuncs) {
        issueCount += emptyFuncs.length * 2;
        result.issues.push(`Empty functions: ${emptyFuncs.length}`);
        result.codeQuality -= emptyFuncs.length * 15;
    }

    const commentLines = lines.filter(l => l.trim().startsWith('//') || l.trim().startsWith('/*')).length;
    const codeLines = lines.filter(l => l.trim().length > 0 && !l.trim().startsWith('//')).length;
    if (commentLines / Math.max(1, codeLines) > 0.5) {
        issueCount += 2;
        result.issues.push('High comment-to-code ratio');
    }

    result.aiScore = Math.min(100, issueCount * 10);
    result.isLikelyAI = result.aiScore > 40;
    result.confidence = Math.min(90, 40 + (lines.length / 5));
    result.codeQuality = Math.max(0, result.codeQuality);

    return result;
}

// ============================================
// SEO ANALYSIS
// ============================================
export function analyzeSEO(html, textContent) {
    const result = { score: 100, issues: [], warnings: [], aiContentPenalty: 0 };

    const titleMatch = html.match(/<title[^>]*>([^<]+)<\/title>/i);
    if (!titleMatch) { result.score -= 15; result.issues.push('Missing page title'); }
    else if (titleMatch[1].length < 30 || titleMatch[1].length > 60) {
        result.score -= 5; result.warnings.push(`Title length: ${titleMatch[1].length}`);
    }

    const metaDesc = html.match(/<meta[^>]*name=["']description["'][^>]*content=["']([^"']+)["']/i);
    if (!metaDesc) { result.score -= 15; result.issues.push('Missing meta description'); }

    const h1Count = (html.match(/<h1[^>]*>/gi) || []).length;
    if (h1Count === 0) { result.score -= 10; result.issues.push('Missing H1 heading'); }
    else if (h1Count > 1) { result.score -= 5; result.warnings.push(`Multiple H1: ${h1Count}`); }

    const images = html.match(/<img[^>]*>/gi) || [];
    const noAlt = images.filter(img => !img.includes('alt=') || img.includes('alt=""'));
    if (noAlt.length > 0) { result.score -= noAlt.length * 2; result.issues.push(`${noAlt.length} images missing alt text`); }

    const wordCount = textContent.split(/\s+/).filter(w => w.length > 2).length;
    if (wordCount < 300) { result.score -= 10; result.warnings.push(`Thin content: ${wordCount} words`); }

    const aiResult = detectAIContent(textContent);
    if (aiResult.isLikelyAI) {
        result.aiContentPenalty = Math.round(aiResult.aiScore * 0.3);
        result.score -= result.aiContentPenalty;
        result.issues.push(`AI content detected (${aiResult.aiScore}%) - SEO penalty`);
    }

    SEO_ISSUES.genericAnchors.forEach(anchor => {
        if (html.match(new RegExp(`<a[^>]*>${anchor}</a>`, 'gi'))) {
            result.score -= 2; result.warnings.push(`Generic anchor: "${anchor}"`);
        }
    });

    result.score = Math.max(0, result.score);
    return result;
}
