/**
 * Calculate cosine similarity between two vectors
 */
export function cosineSimilarity(vecA, vecB) {
    if (!vecA || !vecB || vecA.length !== vecB.length) return 0;

    let dotProduct = 0;
    let normA = 0;
    let normB = 0;

    for (let i = 0; i < vecA.length; i++) {
        dotProduct += vecA[i] * vecB[i];
        normA += vecA[i] * vecA[i];
        normB += vecB[i] * vecB[i];
    }

    if (normA === 0 || normB === 0) return 0;

    return dotProduct / (Math.sqrt(normA) * Math.sqrt(normB));
}

/**
 * Split text into semantic chunks
 */
export function chunkText(text, maxTokens = 500) {
    // This is a naive splitting strategy. In production, use token counting.
    // Assuming roughly 4 chars per token -> 2000 chars
    const sentences = text.match(/[^.!?]+[.!?]+/g) || [text];
    const chunks = [];
    let currentChunk = '';

    for (const sentence of sentences) {
        if ((currentChunk + sentence).length > maxTokens * 4) {
            chunks.push(currentChunk.trim());
            currentChunk = sentence;
        } else {
            currentChunk += ' ' + sentence;
        }
    }

    if (currentChunk.trim().length > 0) {
        chunks.push(currentChunk.trim());
    }

    return chunks;
}

/**
 * Normalize text for comparison
 */
export function normalizeText(text) {
    return text
        .toLowerCase()
        .replace(/[^\w\s]/g, '')
        .replace(/\s+/g, ' ')
        .trim();
}

/**
 * Extract keywords using TF-IDF-like scoring (removing stop words)
 * Enhanced with more stop words and better keyword selection
 */
export function extractKeywords(text, maxKeywords = 12) {
    // Expanded stop words list
    const stopWords = new Set([
        'the', 'and', 'is', 'in', 'it', 'to', 'of', 'for', 'with', 'on', 'at', 'by', 'from',
        'a', 'an', 'as', 'be', 'been', 'being', 'was', 'were', 'are', 'am', 'have', 'has', 'had',
        'do', 'does', 'did', 'will', 'would', 'could', 'should', 'may', 'might', 'must', 'shall',
        'this', 'that', 'these', 'those', 'what', 'which', 'who', 'whom', 'whose',
        'if', 'then', 'else', 'when', 'where', 'why', 'how', 'all', 'each', 'every',
        'both', 'few', 'more', 'most', 'other', 'some', 'such', 'no', 'nor', 'not', 'only',
        'own', 'same', 'so', 'than', 'too', 'very', 'just', 'also', 'now', 'here', 'there',
        'can', 'about', 'into', 'through', 'during', 'before', 'after', 'above', 'below',
        'between', 'under', 'again', 'further', 'once', 'any', 'but', 'or', 'because',
        'until', 'while', 'although', 'however', 'therefore', 'thus', 'hence', 'yet',
        'their', 'they', 'them', 'its', 'his', 'her', 'your', 'our', 'my', 'we', 'you', 'he', 'she'
    ]);

    const words = normalizeText(text)
        .split(' ')
        .filter(word => word.length > 3 && !stopWords.has(word));

    // Count word frequency
    const wordFreq = {};
    for (const word of words) {
        wordFreq[word] = (wordFreq[word] || 0) + 1;
    }

    // Score by frequency and word length (longer words tend to be more meaningful)
    const scoredWords = Object.entries(wordFreq)
        .map(([word, freq]) => ({
            word,
            score: freq * Math.min(word.length / 5, 2) // Boost longer words
        }))
        .sort((a, b) => b.score - a.score);

    // Return top keywords
    return scoredWords.slice(0, maxKeywords).map(w => w.word);
}

/**
 * Extract key phrases (2-3 word combinations) for better search
 */
export function extractKeyPhrases(text, maxPhrases = 5) {
    const sentences = text.split(/[.!?]+/).filter(s => s.trim().length > 20);
    const phrases = [];

    for (const sentence of sentences.slice(0, 5)) {
        const words = sentence.trim().split(/\s+/).filter(w => w.length > 2);
        // Extract 3-word phrases
        for (let i = 0; i <= words.length - 3; i++) {
            const phrase = words.slice(i, i + 3).join(' ').toLowerCase();
            // Only include phrases that seem meaningful (contain at least one word > 5 chars)
            if (words.slice(i, i + 3).some(w => w.length > 5)) {
                phrases.push(phrase);
            }
        }
    }

    // Return unique phrases
    return [...new Set(phrases)].slice(0, maxPhrases);
}


/**
 * Check text for plagiarism using pattern analysis
 * @param {string} text - Text to check
 * @returns {Object} - Plagiarism analysis results
 */
export async function checkPlagiarism(text) {
    if (!text || text.length < 50) {
        return {
            originalityScore: 100,
            matches: [],
            verdict: 'TOO_SHORT'
        };
    }

    // Analyze text patterns for plagiarism indicators
    const normalizedText = normalizeText(text);
    const words = normalizedText.split(' ').filter(w => w.length > 0);
    const sentences = text.split(/[.!?]+/).filter(s => s.trim().length > 10);

    let plagiarismIndicators = 0;
    let matches = [];

    // Check for common plagiarism patterns:

    // 1. Check for unusual formatting (copy-paste artifacts)
    const hasUnusualSpacing = /\s{3,}/.test(text);
    const hasHiddenChars = /[\u200B-\u200D\uFEFF]/.test(text);
    const hasTabsOrSpecialChars = /\t/.test(text) || /[\u00A0]/.test(text);
    if (hasUnusualSpacing || hasHiddenChars || hasTabsOrSpecialChars) {
        plagiarismIndicators += 12;
        matches.push({ type: 'formatting', reason: 'Unusual spacing, hidden characters, or copy-paste artifacts detected' });
    }

    // 2. Check for citation markers without citations
    const hasCitationMarkers = /\[\d+\]|\(\d{4}\)|et al\.|ibid\./i.test(text);
    const hasActualCitations = /References|Bibliography|Works Cited|Sources/i.test(text);
    if (hasCitationMarkers && !hasActualCitations) {
        plagiarismIndicators += 10;
        matches.push({ type: 'citation', reason: 'Citation markers without reference section' });
    }

    // 3. Check for inconsistent writing style (vocabulary shifts)
    const avgWordLength = words.reduce((sum, w) => sum + w.length, 0) / words.length;
    const complexWords = words.filter(w => w.length > 10).length;
    const complexityRatio = complexWords / words.length;

    if (complexityRatio > 0.15 && avgWordLength < 5) {
        plagiarismIndicators += 8;
        matches.push({ type: 'style', reason: 'Inconsistent vocabulary complexity' });
    }

    // 4. Check for identical sentence structures (copy indicators)
    const sentenceStarts = sentences.map(s => s.trim().split(' ').slice(0, 3).join(' ').toLowerCase());
    const uniqueStarts = new Set(sentenceStarts);
    if (sentenceStarts.length > 5 && uniqueStarts.size < sentenceStarts.length * 0.5) {
        plagiarismIndicators += 12;
        matches.push({ type: 'structure', reason: 'Repetitive sentence structures detected' });
    }

    // 5. Check for known generic phrases often found in copied content
    const genericPhrases = [
        'according to recent studies',
        'it is widely known that',
        'research has shown that',
        'in conclusion',
        'as mentioned above',
        'it is important to note',
        'studies have shown',
        'experts believe',
        'furthermore',
        'in summary',
        'to summarize',
        'as previously stated',
        'it should be noted',
        'it goes without saying',
        'needless to say',
        'as we can see'
    ];

    const foundGenericPhrases = genericPhrases.filter(phrase =>
        normalizedText.includes(phrase.toLowerCase())
    );

    if (foundGenericPhrases.length >= 2) {
        plagiarismIndicators += 8;
        matches.push({ type: 'generic', reason: `Academic template phrases detected (${foundGenericPhrases.length} found)` });
    }

    // 6. N-gram analysis - check for repeated 4-word sequences (common in copy-paste)
    const fourGrams = [];
    for (let i = 0; i <= words.length - 4; i++) {
        fourGrams.push(words.slice(i, i + 4).join(' '));
    }
    const uniqueFourGrams = new Set(fourGrams);
    const repetitionRatio = fourGrams.length > 10 ? 1 - (uniqueFourGrams.size / fourGrams.length) : 0;

    if (repetitionRatio > 0.3) {
        plagiarismIndicators += 15;
        matches.push({ type: 'repetition', reason: 'High text repetition detected (possible copy-paste)' });
    }

    // 7. Check for unusually long sentences (common in academic copy-paste)
    const longSentences = sentences.filter(s => s.split(' ').length > 40);
    if (longSentences.length > sentences.length * 0.3 && sentences.length > 3) {
        plagiarismIndicators += 8;
        matches.push({ type: 'length', reason: 'Unusually long sentences detected' });
    }

    // 8. Check for lack of personal voice (I, we, my, our)
    const personalPronouns = ['i ', 'we ', 'my ', 'our ', 'me '];
    const hasPersonalVoice = personalPronouns.some(p => normalizedText.includes(p));
    const wordCount = words.length;

    // For texts > 100 words without personal voice - could indicate copied content
    if (!hasPersonalVoice && wordCount > 100) {
        plagiarismIndicators += 5;
        matches.push({ type: 'voice', reason: 'Impersonal writing style (potential copy from formal source)' });
    }

    // 9. Check for Wikipedia-style writing patterns
    const wikiPatterns = /\(born \d{4}\)|also known as|is a [a-z]+ (that|which|who)|according to/i;
    if (wikiPatterns.test(text)) {
        plagiarismIndicators += 10;
        matches.push({ type: 'wiki', reason: 'Encyclopedia-style writing patterns detected' });
    }

    // Calculate originality score (cap penalty contribution)
    const cappedIndicators = Math.min(plagiarismIndicators, 75); // Max 75% penalty from patterns
    const originalityScore = Math.max(0, Math.min(100, 100 - cappedIndicators));

    // Determine verdict
    let verdict = 'ORIGINAL';
    if (originalityScore < 50) {
        verdict = 'LIKELY_PLAGIARIZED';
    } else if (originalityScore < 70) {
        verdict = 'SUSPICIOUS';
    } else if (originalityScore < 85) {
        verdict = 'MOSTLY_ORIGINAL';
    }

    return {
        originalityScore,
        matches,
        matchCount: matches.length,
        verdict
    };
}

