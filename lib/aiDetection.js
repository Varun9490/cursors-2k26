/**
 * AI Content Detection & SEO Analysis
 * Detects patterns typical of AI-generated content
 */

// AI Writing Patterns - words/phrases overused by AI
const AI_MARKERS = {
    phrases: [
        'delve into', 'leverage', 'utilize', 'furthermore', 'moreover',
        'in conclusion', 'it is worth noting', 'it is important to note',
        'comprehensive', 'robust', 'seamless', 'streamline', 'cutting-edge',
        'state-of-the-art', 'innovative', 'revolutionary', 'paradigm',
        'synergy', 'optimize', 'enhance', 'facilitate', 'empower',
        'holistic', 'scalable', 'dynamic', 'ecosystem', 'landscape',
        'navigate', 'unpack', 'dive deep', 'at the end of the day',
        'in today\'s world', 'in this article', 'as we can see'
    ],
    transitions: [
        'additionally', 'consequently', 'nevertheless', 'nonetheless',
        'subsequently', 'accordingly', 'hence', 'thus', 'therefore'
    ],
    starters: [
        'In the realm of', 'When it comes to', 'It goes without saying',
        'As mentioned earlier', 'Moving forward', 'That being said'
    ]
};

// AI Code Patterns - common in AI-generated code
const AI_CODE_PATTERNS = {
    comments: [
        /\/\/ TODO:/gi,
        /\/\/ FIXME:/gi,
        /\/\/ Example usage/gi,
        /\/\/ This function/gi,
        /\/\*\*\s*\n\s*\*\s*@/gi, // JSDoc without real content
    ],
    variableNames: [
        /^(data|result|value|item|element|temp|obj|arr|str|num|bool)$/,
        /^(input|output|response|request|payload|params)$/,
    ],
    genericPatterns: [
        /console\.log\(['"](test|debug|here|hello)/gi,
        /\/\/ Add your .* here/gi,
        /throw new Error\(['"]Not implemented/gi,
        /return null; \/\/ placeholder/gi,
    ],
    missingErrorHandling: /try\s*{\s*[^}]+}\s*catch\s*\([^)]*\)\s*{\s*}/g,
    emptyFunctions: /function\s+\w+\s*\([^)]*\)\s*{\s*}/g,
};

// SEO Issues common in AI content
const SEO_ISSUES = {
    genericMeta: [
        'welcome to', 'best website', 'top quality', 'official site',
        'home page', 'about us page'
    ],
    keywordStuffing: 5, // Same word appearing more than 5% is suspicious
    thinContent: 300, // Less than 300 words is thin
    duplicateHeadings: true,
    noAltText: true,
    genericAnchors: ['click here', 'read more', 'learn more', 'this link']
};

/**
 * Analyze text for AI-generated content patterns
 */
export function detectAIContent(text) {
    const result = {
        isLikelyAI: false,
        confidence: 0,
        aiScore: 0, // 0-100, higher = more likely AI
        markers: [],
        issues: []
    };

    const lowerText = text.toLowerCase();
    const words = text.split(/\s+/).filter(w => w.length > 0);
    const wordCount = words.length;

    if (wordCount < 50) {
        return { ...result, issues: ['Text too short for reliable analysis'] };
    }

    let aiIndicators = 0;
    let totalChecks = 0;

    // 1. Check for AI phrases
    AI_MARKERS.phrases.forEach(phrase => {
        const count = (lowerText.match(new RegExp(phrase.toLowerCase(), 'g')) || []).length;
        if (count > 0) {
            aiIndicators += count;
            result.markers.push({ type: 'phrase', text: phrase, count });
        }
        totalChecks++;
    });

    // 2. Check transition word density (AI overuses these)
    let transitionCount = 0;
    AI_MARKERS.transitions.forEach(t => {
        transitionCount += (lowerText.match(new RegExp(`\\b${t}\\b`, 'g')) || []).length;
    });
    const transitionDensity = (transitionCount / wordCount) * 100;
    if (transitionDensity > 2) { // More than 2% is suspicious
        aiIndicators += Math.floor(transitionDensity);
        result.markers.push({ type: 'transitions', density: transitionDensity.toFixed(2) + '%' });
    }
    totalChecks += 5;

    // 3. Check sentence uniformity (AI tends to have similar length sentences)
    const sentences = text.split(/[.!?]+/).filter(s => s.trim().length > 0);
    if (sentences.length > 5) {
        const lengths = sentences.map(s => s.trim().split(/\s+/).length);
        const avgLength = lengths.reduce((a, b) => a + b, 0) / lengths.length;
        const variance = lengths.reduce((sum, len) => sum + Math.pow(len - avgLength, 2), 0) / lengths.length;
        const stdDev = Math.sqrt(variance);

        // Low variance = AI-like uniformity
        if (stdDev < 5 && avgLength > 10) {
            aiIndicators += 3;
            result.markers.push({ type: 'uniformity', stdDev: stdDev.toFixed(2), avgLength: avgLength.toFixed(1) });
        }
        totalChecks += 3;
    }

    // 4. Check for formulaic starters
    AI_MARKERS.starters.forEach(starter => {
        if (lowerText.includes(starter.toLowerCase())) {
            aiIndicators += 2;
            result.markers.push({ type: 'starter', text: starter });
        }
        totalChecks++;
    });

    // 5. Lack of personal pronouns (AI often avoids "I", "my", etc.)
    const personalPronouns = (text.match(/\b(I|my|me|myself|we|our|us)\b/gi) || []).length;
    const pronounDensity = (personalPronouns / wordCount) * 100;
    if (pronounDensity < 0.5 && wordCount > 100) {
        aiIndicators += 2;
        result.markers.push({ type: 'impersonal', pronounDensity: pronounDensity.toFixed(2) + '%' });
    }
    totalChecks += 2;

    // Calculate final score
    result.aiScore = Math.min(100, Math.round((aiIndicators / Math.max(1, totalChecks * 0.3)) * 100));
    result.confidence = Math.min(95, 50 + (wordCount / 20)); // More text = higher confidence
    result.isLikelyAI = result.aiScore > 60;

    return result;
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

    // 1. Check for generic/placeholder comments
    AI_CODE_PATTERNS.comments.forEach(pattern => {
        const matches = code.match(pattern);
        if (matches) {
            issueCount += matches.length;
            result.issues.push(`Generic comment pattern found: ${matches.length} occurrences`);
        }
    });

    // 2. Check for missing error handling
    const emptyTryCatch = code.match(AI_CODE_PATTERNS.missingErrorHandling);
    if (emptyTryCatch) {
        issueCount += emptyTryCatch.length * 2;
        result.issues.push(`Empty catch blocks: ${emptyTryCatch.length}`);
        result.codeQuality -= emptyTryCatch.length * 10;
    }

    // 3. Check for empty functions
    const emptyFuncs = code.match(AI_CODE_PATTERNS.emptyFunctions);
    if (emptyFuncs) {
        issueCount += emptyFuncs.length * 2;
        result.issues.push(`Empty/stub functions: ${emptyFuncs.length}`);
        result.codeQuality -= emptyFuncs.length * 15;
    }

    // 4. Check for overly verbose variable names (AI style)
    const verboseVars = code.match(/\b(isValid|hasError|shouldUpdate|canExecute|willChange)(?:ly|ed|ing|s)?\b/gi);
    if (verboseVars && verboseVars.length > 3) {
        issueCount += 1;
        result.issues.push('Overly verbose boolean naming patterns');
    }

    // 5. Check for console.log debugging left in
    const consoleLogs = code.match(/console\.(log|debug|info)/g);
    if (consoleLogs && consoleLogs.length > 2) {
        issueCount += 1;
        result.issues.push(`Debug statements left in code: ${consoleLogs.length}`);
        result.codeQuality -= 5;
    }

    // 6. Check code-to-comment ratio (AI tends to over-comment)
    const commentLines = lines.filter(l => l.trim().startsWith('//') || l.trim().startsWith('/*')).length;
    const codeLines = lines.filter(l => l.trim().length > 0 && !l.trim().startsWith('//')).length;
    const commentRatio = commentLines / Math.max(1, codeLines);
    if (commentRatio > 0.5) {
        issueCount += 2;
        result.issues.push(`High comment-to-code ratio: ${(commentRatio * 100).toFixed(0)}%`);
    }

    // 7. Check for lack of error handling overall
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
 * Analyze HTML for SEO issues (especially AI-generated content)
 */
export function analyzeSEO(html, textContent) {
    const result = {
        score: 100,
        issues: [],
        warnings: [],
        aiContentPenalty: 0
    };

    // 1. Check title
    const titleMatch = html.match(/<title[^>]*>([^<]+)<\/title>/i);
    if (!titleMatch) {
        result.score -= 15;
        result.issues.push('Missing page title');
    } else if (titleMatch[1].length < 30 || titleMatch[1].length > 60) {
        result.score -= 5;
        result.warnings.push(`Title length: ${titleMatch[1].length} (optimal: 30-60 chars)`);
    }

    // 2. Check meta description
    const metaDesc = html.match(/<meta[^>]*name=["']description["'][^>]*content=["']([^"']+)["']/i);
    if (!metaDesc) {
        result.score -= 15;
        result.issues.push('Missing meta description');
    } else if (metaDesc[1].length < 120 || metaDesc[1].length > 160) {
        result.score -= 5;
        result.warnings.push(`Meta description length: ${metaDesc[1].length} (optimal: 120-160)`);
    }

    // 3. Check H1
    const h1Count = (html.match(/<h1[^>]*>/gi) || []).length;
    if (h1Count === 0) {
        result.score -= 10;
        result.issues.push('Missing H1 heading');
    } else if (h1Count > 1) {
        result.score -= 5;
        result.warnings.push(`Multiple H1 tags: ${h1Count} (should be 1)`);
    }

    // 4. Check heading hierarchy
    const h2Count = (html.match(/<h2[^>]*>/gi) || []).length;
    const h3Count = (html.match(/<h3[^>]*>/gi) || []).length;
    if (h3Count > 0 && h2Count === 0) {
        result.score -= 5;
        result.warnings.push('H3 used without H2 - broken hierarchy');
    }

    // 5. Check images for alt text
    const images = html.match(/<img[^>]*>/gi) || [];
    const imagesWithoutAlt = images.filter(img => !img.includes('alt=') || img.includes('alt=""'));
    if (imagesWithoutAlt.length > 0) {
        result.score -= imagesWithoutAlt.length * 2;
        result.issues.push(`${imagesWithoutAlt.length} images missing alt text`);
    }

    // 6. Check for thin content
    const wordCount = textContent.split(/\s+/).filter(w => w.length > 2).length;
    if (wordCount < 300) {
        result.score -= 10;
        result.warnings.push(`Thin content: only ${wordCount} words (recommended: 300+)`);
    }

    // 7. AI Content Penalty
    const aiResult = detectAIContent(textContent);
    if (aiResult.isLikelyAI) {
        result.aiContentPenalty = Math.round(aiResult.aiScore * 0.3);
        result.score -= result.aiContentPenalty;
        result.issues.push(`AI-generated content detected (${aiResult.aiScore}% confidence) - SEO penalty applied`);
    }

    // 8. Check for generic anchor text
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
