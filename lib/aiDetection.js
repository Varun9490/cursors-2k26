/**
 * AI Content Detection & SEO Analysis
 * Enhanced with comprehensive AI pattern detection
 * Includes: em dash detection, ChatGPT patterns, URL checking, Gemini AI analysis
 */

// ============================================
// AI SOURCE URLS - pages that generate AI content
// ============================================
const AI_SOURCE_URLS = [
    'chat.openai.com', 'chatgpt.com', 'claude.ai', 'anthropic.com',
    'bard.google.com', 'gemini.google.com', 'copilot.microsoft.com',
    'perplexity.ai', 'you.com', 'poe.com', 'character.ai',
    'writesonic.com', 'jasper.ai', 'copy.ai', 'rytr.me',
    'quillbot.com', 'wordtune.com', 'grammarly.com/ai',
    'huggingface.co', 'replicate.com', 'deepai.org'
];

// ============================================
// AI WRITING PATTERNS - comprehensive detection
// ============================================
const AI_MARKERS = {
    // ChatGPT's favorite phrases
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
        'it\'s crucial to', 'it\'s essential to', 'it is crucial to', 'it is essential to',
        'navigating the complexities', 'navigating the world',
        'landscape of', 'ever-evolving', 'ever-changing',
        'not only...but also', 'while also', 'in this comprehensive',
        'this comprehensive guide', 'in this article',
        'unlock the full potential', 'unleash the power',
        'designed to help', 'aimed at helping',
        'a testament to', 'a deep dive', 'deep dive into',
        'stands out as', 'stands as a', 'emerge as',
        'at the core of', 'at its core', 'at the heart of',
        'the bottom line', 'the key takeaway',
        'understanding the nuances', 'nuances of',
        'a myriad of', 'a plethora of', 'a multitude of',
        'serves as a', 'acts as a catalyst',
        'paves the way', 'sets the stage',
        'in the realm of', 'in the world of', 'in the landscape of',
        'first and foremost', 'last but not least'
    ],

    // Overused corporate/AI buzzwords  
    phrases: [
        'leverage', 'utilize', 'furthermore', 'moreover',
        'in conclusion', 'comprehensive', 'robust', 'seamless', 'streamline',
        'cutting-edge', 'state-of-the-art', 'innovative', 'revolutionary',
        'paradigm', 'synergy', 'optimize', 'enhance', 'facilitate', 'empower',
        'holistic', 'scalable', 'dynamic', 'ecosystem', 'landscape',
        'navigate', 'unpack', 'dive deep', 'at the end of the day',
        'as we can see', 'elevate', 'foster', 'harness', 'pivotal',
        'paramount', 'transformative', 'groundbreaking', 'actionable',
        'best practices', 'key takeaways', 'moving forward',
        'game-changer', 'game changer', 'tapestry', 'underscores',
        'multifaceted', 'intricate', 'intricacies', 'aligns with',
        'resonate', 'amplify', 'bolster', 'spearhead', 'cornerstone'
    ],

    // Formal transition words overused by AI
    transitions: [
        'additionally', 'consequently', 'nevertheless', 'nonetheless',
        'subsequently', 'accordingly', 'hence', 'thus', 'therefore',
        'in addition', 'as a result', 'on the other hand', 'in contrast',
        'similarly', 'likewise', 'in particular', 'specifically',
        'notably', 'significantly', 'importantly', 'essentially',
        'fundamentally', 'ultimately', 'inherently', 'arguably'
    ],

    // Formulaic sentence starters
    starters: [
        'In the realm of', 'When it comes to', 'It goes without saying',
        'As mentioned earlier', 'Moving forward', 'That being said',
        'With that in mind', 'Having said that', 'It\'s no secret that',
        'There\'s no denying', 'One of the most', 'In order to',
        'As we navigate', 'As technology continues', 'As the world',
        'In an era', 'In a world where', 'In an increasingly',
        'With the advent of', 'With the rise of'
    ],

    // Hedging phrases AI loves
    hedging: [
        'it could be argued', 'one might argue', 'it\'s safe to say',
        'for the most part', 'in many cases', 'in some instances',
        'to a certain extent', 'to some degree', 'broadly speaking',
        'generally speaking', 'relatively speaking'
    ],

    // List introduction patterns
    listPatterns: [
        'here are some', 'here are a few', 'consider the following',
        'the following are', 'some of these include', 'these include',
        'let\'s look at', 'we\'ll explore', 'we will explore',
        'key factors include', 'key aspects include',
        'several factors', 'several key', 'various factors'
    ]
};

// AI Code Patterns
const AI_CODE_PATTERNS = {
    comments: [
        /\/\/ TODO:/gi,
        /\/\/ FIXME:/gi,
        /\/\/ Example usage/gi,
        /\/\/ This function/gi,
        /\/\*\*\s*\n\s*\*\s*@/gi,
    ],
    variableNames: [
        /^(data|result|value|item|element|temp|obj|arr|str|num|bool)$/,
        /^(input|output|response|request|payload|params)$/,
    ],
    genericPatterns: [
        /console\.log\(['"](?:test|debug|here|hello)/gi,
        /\/\/ Add your .* here/gi,
        /throw new Error\(['"]Not implemented/gi,
        /return null; \/\/ placeholder/gi,
    ],
    missingErrorHandling: /try\s*{\s*[^}]+}\s*catch\s*\([^)]*\)\s*{\s*}/g,
    emptyFunctions: /function\s+\w+\s*\([^)]*\)\s*{\s*}/g,
};

// SEO Issues
const SEO_ISSUES = {
    genericMeta: [
        'welcome to', 'best website', 'top quality', 'official site',
        'home page', 'about us page'
    ],
    keywordStuffing: 5,
    thinContent: 300,
    duplicateHeadings: true,
    noAltText: true,
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
            return {
                isAISource: true,
                source: domain,
                penalty: 85, // Very high penalty - this IS an AI source
                message: `Content from ${domain} is AI-generated`
            };
        }
    }
    return { isAISource: false, source: null, penalty: 0 };
}

// ============================================
// ENHANCED AI CONTENT DETECTION
// ============================================
export function detectAIContent(text, url = null) {
    const result = {
        isLikelyAI: false,
        confidence: 0,
        aiScore: 0,
        markers: [],
        issues: [],
        detailedFactors: []
    };

    const lowerText = text.toLowerCase();
    const words = text.split(/\s+/).filter(w => w.length > 0);
    const wordCount = words.length;

    if (wordCount < 30) {
        return { ...result, issues: ['Text too short for reliable analysis'] };
    }

    let aiScore = 0;
    let maxPossibleScore = 0;

    // ========================================
    // FACTOR 1: Em Dash Detection (—)
    // AI (especially ChatGPT) LOVES em dashes
    // ========================================
    maxPossibleScore += 20;
    const emDashCount = (text.match(/—/g) || []).length;
    const enDashCount = (text.match(/–/g) || []).length;
    const totalSpecialDashes = emDashCount + enDashCount;

    if (totalSpecialDashes > 0) {
        const dashDensity = (totalSpecialDashes / wordCount) * 100;
        if (totalSpecialDashes >= 3 || dashDensity > 0.5) {
            aiScore += 18;
            result.markers.push({ type: 'em_dash', text: `${totalSpecialDashes} em/en dashes found (strong AI indicator)`, count: totalSpecialDashes });
            result.detailedFactors.push(`🔴 Em dashes (—): ${totalSpecialDashes} found — this is a very strong AI indicator. ChatGPT uses em dashes 10x more than humans.`);
        } else if (totalSpecialDashes >= 1) {
            aiScore += 10;
            result.markers.push({ type: 'em_dash', text: `${totalSpecialDashes} em/en dashes found`, count: totalSpecialDashes });
            result.detailedFactors.push(`🟡 Em dashes (—): ${totalSpecialDashes} found — moderate AI indicator.`);
        }
    }

    // ========================================
    // FACTOR 2: ChatGPT-Specific Phrases
    // ========================================
    maxPossibleScore += 25;
    let chatgptPhraseCount = 0;
    const foundChatGPTPhrases = [];
    AI_MARKERS.chatgptPhrases.forEach(phrase => {
        const regex = new RegExp(phrase.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'gi');
        const matches = lowerText.match(regex);
        if (matches) {
            chatgptPhraseCount += matches.length;
            foundChatGPTPhrases.push(phrase);
        }
    });

    if (chatgptPhraseCount >= 5) {
        aiScore += 25;
        result.detailedFactors.push(`🔴 ChatGPT phrases: ${chatgptPhraseCount} found (${foundChatGPTPhrases.slice(0, 5).join(', ')}). Heavy AI usage.`);
    } else if (chatgptPhraseCount >= 3) {
        aiScore += 18;
        result.detailedFactors.push(`🟠 ChatGPT phrases: ${chatgptPhraseCount} found (${foundChatGPTPhrases.join(', ')}). Likely AI.`);
    } else if (chatgptPhraseCount >= 1) {
        aiScore += 8;
        result.detailedFactors.push(`🟡 ChatGPT phrases: ${chatgptPhraseCount} found (${foundChatGPTPhrases.join(', ')}). Possible AI.`);
    }
    if (chatgptPhraseCount > 0) {
        result.markers.push({ type: 'chatgpt_phrases', text: `${chatgptPhraseCount} ChatGPT-typical phrases`, count: chatgptPhraseCount, examples: foundChatGPTPhrases.slice(0, 5) });
    }

    // ========================================
    // FACTOR 3: Generic AI Buzzwords
    // ========================================
    maxPossibleScore += 15;
    let buzzwordCount = 0;
    const foundBuzzwords = [];
    AI_MARKERS.phrases.forEach(phrase => {
        const regex = new RegExp(`\\b${phrase.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\b`, 'gi');
        const matches = lowerText.match(regex);
        if (matches) {
            buzzwordCount += matches.length;
            foundBuzzwords.push(phrase);
        }
    });

    if (buzzwordCount >= 6) {
        aiScore += 15;
        result.detailedFactors.push(`🔴 AI buzzwords: ${buzzwordCount} found. Very high AI indicator.`);
    } else if (buzzwordCount >= 3) {
        aiScore += 10;
        result.detailedFactors.push(`🟠 AI buzzwords: ${buzzwordCount} found.`);
    } else if (buzzwordCount >= 1) {
        aiScore += 4;
    }
    if (buzzwordCount > 0) {
        result.markers.push({ type: 'buzzwords', count: buzzwordCount, examples: foundBuzzwords.slice(0, 5) });
    }

    // ========================================
    // FACTOR 4: Transition Word Overuse
    // ========================================
    maxPossibleScore += 12;
    let transitionCount = 0;
    AI_MARKERS.transitions.forEach(t => {
        const regex = new RegExp(`\\b${t}\\b`, 'gi');
        transitionCount += (lowerText.match(regex) || []).length;
    });
    const transitionDensity = (transitionCount / wordCount) * 100;

    if (transitionDensity > 3) {
        aiScore += 12;
        result.markers.push({ type: 'transitions', density: transitionDensity.toFixed(2) + '%' });
        result.detailedFactors.push(`🔴 Transition density: ${transitionDensity.toFixed(1)}% — AI over-uses formal transitions.`);
    } else if (transitionDensity > 1.5) {
        aiScore += 7;
        result.markers.push({ type: 'transitions', density: transitionDensity.toFixed(2) + '%' });
        result.detailedFactors.push(`🟡 Transition density: ${transitionDensity.toFixed(1)}% — slightly elevated.`);
    }

    // ========================================
    // FACTOR 5: Sentence Uniformity  
    // (AI generates uniformly-lengthed sentences)
    // ========================================
    maxPossibleScore += 12;
    const sentences = text.split(/[.!?]+/).filter(s => s.trim().length > 5);
    if (sentences.length > 4) {
        const lengths = sentences.map(s => s.trim().split(/\s+/).length);
        const avgLength = lengths.reduce((a, b) => a + b, 0) / lengths.length;
        const variance = lengths.reduce((sum, len) => sum + Math.pow(len - avgLength, 2), 0) / lengths.length;
        const stdDev = Math.sqrt(variance);
        const coeffOfVariation = stdDev / avgLength;

        if (coeffOfVariation < 0.3 && avgLength > 10) {
            aiScore += 12;
            result.markers.push({ type: 'uniformity', stdDev: stdDev.toFixed(2), avgLength: avgLength.toFixed(1), cv: coeffOfVariation.toFixed(3) });
            result.detailedFactors.push(`🔴 Sentence uniformity: CV=${coeffOfVariation.toFixed(2)} (avg ${avgLength.toFixed(0)} words). AI writes very evenly-lengthed sentences.`);
        } else if (coeffOfVariation < 0.45 && avgLength > 10) {
            aiScore += 6;
            result.markers.push({ type: 'uniformity', stdDev: stdDev.toFixed(2), avgLength: avgLength.toFixed(1), cv: coeffOfVariation.toFixed(3) });
            result.detailedFactors.push(`🟡 Sentence uniformity: CV=${coeffOfVariation.toFixed(2)} — moderate uniformity.`);
        }
    }

    // ========================================
    // FACTOR 6: Formulaic Starters
    // ========================================
    maxPossibleScore += 10;
    let starterCount = 0;
    const foundStarters = [];
    AI_MARKERS.starters.forEach(starter => {
        if (lowerText.includes(starter.toLowerCase())) {
            starterCount++;
            foundStarters.push(starter);
        }
    });

    if (starterCount >= 3) {
        aiScore += 10;
        result.detailedFactors.push(`🔴 Formulaic starters: ${starterCount} found (${foundStarters.join(', ')})`);
    } else if (starterCount >= 1) {
        aiScore += 5;
        result.detailedFactors.push(`🟡 Formulaic starters: ${starterCount} found (${foundStarters.join(', ')})`);
    }
    if (starterCount > 0) {
        result.markers.push({ type: 'starters', count: starterCount, examples: foundStarters });
    }

    // ========================================
    // FACTOR 7: Lack of Personal Voice
    // ========================================
    maxPossibleScore += 8;
    const personalPronouns = (text.match(/\b(I|my|me|myself|we|our|us)\b/gi) || []).length;
    const pronounDensity = (personalPronouns / wordCount) * 100;

    if (pronounDensity < 0.3 && wordCount > 80) {
        aiScore += 8;
        result.markers.push({ type: 'impersonal', pronounDensity: pronounDensity.toFixed(2) + '%' });
        result.detailedFactors.push(`🔴 Impersonal writing: Only ${pronounDensity.toFixed(1)}% personal pronouns. AI avoids "I", "my", "we".`);
    } else if (pronounDensity < 1 && wordCount > 80) {
        aiScore += 4;
        result.detailedFactors.push(`🟡 Low personal voice: ${pronounDensity.toFixed(1)}% personal pronouns.`);
    }

    // ========================================
    // FACTOR 8: Hedging Language
    // ========================================
    maxPossibleScore += 8;
    let hedgingCount = 0;
    AI_MARKERS.hedging.forEach(phrase => {
        if (lowerText.includes(phrase)) hedgingCount++;
    });

    if (hedgingCount >= 3) {
        aiScore += 8;
        result.detailedFactors.push(`🔴 Hedging language: ${hedgingCount} hedging phrases. AI hedges to appear balanced.`);
    } else if (hedgingCount >= 1) {
        aiScore += 3;
    }

    // ========================================
    // FACTOR 9: List Introduction Patterns
    // ========================================
    maxPossibleScore += 6;
    let listPatternCount = 0;
    AI_MARKERS.listPatterns.forEach(phrase => {
        if (lowerText.includes(phrase)) listPatternCount++;
    });

    if (listPatternCount >= 2) {
        aiScore += 6;
        result.detailedFactors.push(`🟠 List patterns: ${listPatternCount} list-introduction phrases (AI organizes into lists).`);
    }

    // ========================================
    // FACTOR 10: Colon Usage Density
    // (AI uses colons for explanations very frequently)
    // ========================================
    maxPossibleScore += 6;
    const colonCount = (text.match(/:/g) || []).length;
    const colonDensity = (colonCount / Math.max(1, sentences.length)) * 100;

    if (colonCount >= 5 && colonDensity > 30) {
        aiScore += 6;
        result.detailedFactors.push(`🟠 High colon usage: ${colonCount} colons in ${sentences.length} sentences. AI uses colons heavily.`);
    }

    // ========================================
    // FACTOR 11: Bullet Points / Numbered Lists
    // ========================================
    maxPossibleScore += 5;
    const bulletPoints = (text.match(/^[\s]*[-•*]\s/gm) || []).length;
    const numberedItems = (text.match(/^[\s]*\d+[.)]\s/gm) || []).length;
    const totalListItems = bulletPoints + numberedItems;

    if (totalListItems >= 5) {
        aiScore += 5;
        result.detailedFactors.push(`🟡 Heavy list usage: ${totalListItems} list items. AI loves structured lists.`);
    }

    // ========================================
    // FACTOR 12: Repetitive Sentence Structure
    // ========================================
    maxPossibleScore += 8;
    if (sentences.length > 5) {
        const sentenceStarts = sentences.map(s => {
            const trimmed = s.trim().split(' ').slice(0, 3).join(' ').toLowerCase();
            return trimmed.replace(/[^a-z\s]/g, '').trim();
        }).filter(s => s.length > 3);

        const startFreq = {};
        sentenceStarts.forEach(s => { startFreq[s] = (startFreq[s] || 0) + 1; });
        const maxRepeat = Math.max(...Object.values(startFreq));
        const repeatRatio = 1 - (new Set(sentenceStarts).size / sentenceStarts.length);

        if (repeatRatio > 0.4 || maxRepeat >= 4) {
            aiScore += 8;
            result.detailedFactors.push(`🔴 Repetitive structure: ${(repeatRatio * 100).toFixed(0)}% sentence start repetition.`);
        } else if (repeatRatio > 0.25) {
            aiScore += 4;
        }
    }

    // ========================================
    // FACTOR 13: Perfect Grammar / No Contractions  
    // (AI tends to use "it is" instead of "it's", "do not" instead of "don't")
    // ========================================
    maxPossibleScore += 6;
    const formalForms = (text.match(/\b(it is|do not|does not|cannot|will not|would not|should not|could not|is not|are not|was not|were not|has not|have not|had not)\b/gi) || []).length;
    const contractionForms = (text.match(/\b(it's|don't|doesn't|can't|won't|wouldn't|shouldn't|couldn't|isn't|aren't|wasn't|weren't|hasn't|haven't|hadn't)\b/gi) || []).length;

    if (formalForms > 3 && contractionForms === 0 && wordCount > 100) {
        aiScore += 6;
        result.detailedFactors.push(`🟠 No contractions: ${formalForms} formal forms, 0 contractions. AI often avoids contractions.`);
    }

    // ========================================
    // FACTOR 14: Paragraph Structure (AI generates similar-length paragraphs)
    // ========================================
    maxPossibleScore += 5;
    const paragraphs = text.split(/\n\s*\n/).filter(p => p.trim().length > 20);
    if (paragraphs.length >= 3) {
        const paraLengths = paragraphs.map(p => p.split(/\s+/).length);
        const avgParaLen = paraLengths.reduce((a, b) => a + b, 0) / paraLengths.length;
        const paraVariance = paraLengths.reduce((sum, len) => sum + Math.pow(len - avgParaLen, 2), 0) / paraLengths.length;
        const paraCV = Math.sqrt(paraVariance) / avgParaLen;

        if (paraCV < 0.25) {
            aiScore += 5;
            result.detailedFactors.push(`🟡 Uniform paragraphs: CV=${paraCV.toFixed(2)}. AI generates same-size paragraphs.`);
        }
    }

    // ========================================
    // FACTOR 15: URL-based AI Source Detection
    // ========================================
    if (url) {
        const urlCheck = checkAISourceURL(url);
        if (urlCheck.isAISource) {
            maxPossibleScore += 30;
            aiScore += 30;
            result.markers.push({ type: 'ai_source_url', source: urlCheck.source, penalty: urlCheck.penalty });
            result.detailedFactors.push(`🔴🔴 SOURCE URL: Content is from ${urlCheck.source} — an AI generation platform. This is DEFINITELY AI-generated.`);
        }
    }

    // ========================================
    // CALCULATE FINAL SCORE
    // ========================================
    // Normalize to 0-100 scale
    const rawScore = Math.min(100, Math.round((aiScore / Math.max(1, maxPossibleScore)) * 100));

    // Apply aggressive scaling for clear AI signals
    let finalScore = rawScore;

    // If multiple strong signals, boost the score
    const strongSignals = result.detailedFactors.filter(f => f.startsWith('🔴')).length;
    if (strongSignals >= 3) {
        finalScore = Math.max(finalScore, 75);
    }
    if (strongSignals >= 5) {
        finalScore = Math.max(finalScore, 85);
    }

    // URL from AI source is almost certainly AI
    if (url && checkAISourceURL(url).isAISource) {
        finalScore = Math.max(finalScore, 90);
    }

    // Em dashes + ChatGPT phrases together = very strong signal
    if (emDashCount >= 2 && chatgptPhraseCount >= 2) {
        finalScore = Math.max(finalScore, 70);
    }

    result.aiScore = Math.min(100, finalScore);
    result.confidence = Math.min(98, 40 + (wordCount / 10) + (strongSignals * 5));
    result.isLikelyAI = result.aiScore > 35; // Lower threshold to catch more AI

    // Add summary of key factors
    result.detailedFactors.push(`\n📊 Overall: ${result.detailedFactors.filter(f => f.startsWith('🔴')).length} strong indicators, ${result.detailedFactors.filter(f => f.startsWith('🟠')).length} moderate, ${result.detailedFactors.filter(f => f.startsWith('🟡')).length} mild`);

    return result;
}

/**
 * Analyze text for AI using Gemini AI (server-side only)
 */
export async function detectAIWithGemini(text, genAI) {
    if (!genAI) return null;

    try {
        const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash' });

        const prompt = `You are an expert AI content detector. Analyze the following text and determine if it was written by an AI (like ChatGPT, Claude, Gemini, etc.) or by a human.

Consider these factors:
1. Em dashes (—) usage — AI uses them excessively
2. Formulaic phrases like "delve into", "it's important to note", "in today's world"
3. Sentence uniformity (similar length sentences)
4. Lack of personal voice (no "I", "my")
5. Excessive use of transitions (moreover, furthermore, additionally)
6. Perfect grammar with no contractions
7. Hedging language ("it could be argued", "one might say")
8. Buzzwords (leverage, seamless, robust, comprehensive)
9. List-heavy formatting
10. Repetitive sentence structure

TEXT TO ANALYZE:
"""
${text.substring(0, 3000)}
"""

Respond in this exact JSON format only, no other text:
{
  "aiProbability": <number 0-100>,
  "humanProbability": <number 0-100>,
  "confidence": <number 0-100>,
  "verdict": "<HUMAN|LIKELY_HUMAN|MIXED|LIKELY_AI|AI>",
  "reasoning": "<brief explanation>",
  "keyFactors": ["<factor1>", "<factor2>", "<factor3>"]
}`;

        const result = await model.generateContent(prompt);
        const responseText = result.response.text().trim();

        // Extract JSON from response
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
                source: 'gemini'
            };
        }
    } catch (err) {
        console.error('[GEMINI AI DETECTION] Error:', err.message);
    }
    return null;
}

/**
 * Analyze code for AI-generated patterns
 */
export function detectAIGeneratedCode(code) {
    const result = {
        isLikelyAI: false,
        confidence: 0,
        aiScore: 0,
        issues: [],
        codeQuality: 100
    };

    const lines = code.split('\n');
    let issueCount = 0;

    AI_CODE_PATTERNS.comments.forEach(pattern => {
        const matches = code.match(pattern);
        if (matches) {
            issueCount += matches.length;
            result.issues.push(`Generic comment pattern found: ${matches.length} occurrences`);
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
        result.issues.push(`Empty/stub functions: ${emptyFuncs.length}`);
        result.codeQuality -= emptyFuncs.length * 15;
    }

    const verboseVars = code.match(/\b(isValid|hasError|shouldUpdate|canExecute|willChange)(?:ly|ed|ing|s)?\b/gi);
    if (verboseVars && verboseVars.length > 3) {
        issueCount += 1;
        result.issues.push('Overly verbose boolean naming patterns');
    }

    const consoleLogs = code.match(/console\.(log|debug|info)/g);
    if (consoleLogs && consoleLogs.length > 2) {
        issueCount += 1;
        result.issues.push(`Debug statements left in code: ${consoleLogs.length}`);
        result.codeQuality -= 5;
    }

    const commentLines = lines.filter(l => l.trim().startsWith('//') || l.trim().startsWith('/*')).length;
    const codeLines = lines.filter(l => l.trim().length > 0 && !l.trim().startsWith('//')).length;
    const commentRatio = commentLines / Math.max(1, codeLines);
    if (commentRatio > 0.5) {
        issueCount += 2;
        result.issues.push(`High comment-to-code ratio: ${(commentRatio * 100).toFixed(0)}%`);
    }

    const hasTryCatch = code.includes('try') && code.includes('catch');
    const hasThrow = code.includes('throw');
    if (!hasTryCatch && !hasThrow && codeLines > 20) {
        issueCount += 1;
        result.issues.push('No error handling in substantial code');
        result.codeQuality -= 10;
    }

    result.aiScore = Math.min(100, issueCount * 10);
    result.isLikelyAI = result.aiScore > 40;
    result.confidence = Math.min(90, 40 + (lines.length / 5));
    result.codeQuality = Math.max(0, result.codeQuality);

    return result;
}

/**
 * Analyze HTML for SEO issues
 */
export function analyzeSEO(html, textContent) {
    const result = {
        score: 100,
        issues: [],
        warnings: [],
        aiContentPenalty: 0
    };

    const titleMatch = html.match(/<title[^>]*>([^<]+)<\/title>/i);
    if (!titleMatch) {
        result.score -= 15;
        result.issues.push('Missing page title');
    } else if (titleMatch[1].length < 30 || titleMatch[1].length > 60) {
        result.score -= 5;
        result.warnings.push(`Title length: ${titleMatch[1].length} (optimal: 30-60 chars)`);
    }

    const metaDesc = html.match(/<meta[^>]*name=["']description["'][^>]*content=["']([^"']+)["']/i);
    if (!metaDesc) {
        result.score -= 15;
        result.issues.push('Missing meta description');
    } else if (metaDesc[1].length < 120 || metaDesc[1].length > 160) {
        result.score -= 5;
        result.warnings.push(`Meta description length: ${metaDesc[1].length} (optimal: 120-160)`);
    }

    const h1Count = (html.match(/<h1[^>]*>/gi) || []).length;
    if (h1Count === 0) {
        result.score -= 10;
        result.issues.push('Missing H1 heading');
    } else if (h1Count > 1) {
        result.score -= 5;
        result.warnings.push(`Multiple H1 tags: ${h1Count} (should be 1)`);
    }

    const h2Count = (html.match(/<h2[^>]*>/gi) || []).length;
    const h3Count = (html.match(/<h3[^>]*>/gi) || []).length;
    if (h3Count > 0 && h2Count === 0) {
        result.score -= 5;
        result.warnings.push('H3 used without H2 - broken hierarchy');
    }

    const images = html.match(/<img[^>]*>/gi) || [];
    const imagesWithoutAlt = images.filter(img => !img.includes('alt=') || img.includes('alt=""'));
    if (imagesWithoutAlt.length > 0) {
        result.score -= imagesWithoutAlt.length * 2;
        result.issues.push(`${imagesWithoutAlt.length} images missing alt text`);
    }

    const wordCount = textContent.split(/\s+/).filter(w => w.length > 2).length;
    if (wordCount < 300) {
        result.score -= 10;
        result.warnings.push(`Thin content: only ${wordCount} words (recommended: 300+)`);
    }

    // AI Content Penalty
    const aiResult = detectAIContent(textContent);
    if (aiResult.isLikelyAI) {
        result.aiContentPenalty = Math.round(aiResult.aiScore * 0.3);
        result.score -= result.aiContentPenalty;
        result.issues.push(`AI-generated content detected (${aiResult.aiScore}% confidence) - SEO penalty applied`);
    }

    SEO_ISSUES.genericAnchors.forEach(anchor => {
        const regex = new RegExp(`<a[^>]*>${anchor}</a>`, 'gi');
        if (html.match(regex)) {
            result.score -= 2;
            result.warnings.push(`Generic anchor text: "${anchor}"`);
        }
    });

    result.score = Math.max(0, result.score);
    return result;
}
