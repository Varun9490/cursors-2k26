import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { calculateCodeSimilarity, detectCommonAlgorithm, detectAICodePatterns } from '@/lib/codePlagiarism';

export async function POST(req) {
    try {
        const session = await auth();
        if (!session) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { code, language = 'auto', compareWith } = await req.json();

        if (!code || code.length < 20) {
            return NextResponse.json({ error: 'Code too short (min 20 chars)' }, { status: 400 });
        }

        const startTime = Date.now();

        // Detect language if not specified
        const detectedLanguage = detectLanguage(code);

        let results = {
            codeLength: code.length,
            language: language === 'auto' ? detectedLanguage : language,
            lineCount: code.split('\n').length,
            commonAlgorithms: [],
            aiAnalysis: null,
            issues: []
        };

        // 1. Check against common algorithms (works for ALL languages)
        results.commonAlgorithms = detectCommonAlgorithm(code);

        // 2. Check for AI-generated code patterns (language-agnostic)
        results.aiAnalysis = detectAICodePatterns(code);

        // 3. If user provided code to compare against
        if (compareWith) {
            const comparison = calculateCodeSimilarity(code, compareWith);
            results.directComparison = comparison;
        }

        // 4. Calculate overall originality
        let maxSimilarity = 0;
        let verdict = 'ORIGINAL';

        // Factor in common algorithm matches (these are NOT plagiarism, but are standard)
        if (results.commonAlgorithms.length > 0) {
            const topMatch = results.commonAlgorithms[0];
            maxSimilarity = Math.max(maxSimilarity, topMatch.similarity * 0.7); // 70% weight
            results.issues.push(`Matches "${topMatch.algorithm}" pattern (${topMatch.similarity}%)`);
        }

        // Factor in direct comparison
        if (results.directComparison) {
            maxSimilarity = Math.max(maxSimilarity, results.directComparison.similarity);
        }

        // Factor in AI detection (AI-generated code reduces originality)
        if (results.aiAnalysis.isLikelyAI) {
            const aiPenalty = results.aiAnalysis.aiScore * 0.8;
            maxSimilarity = Math.max(maxSimilarity, aiPenalty);
            verdict = 'AI_GENERATED';
            results.issues.push(`AI-generated code detected (${results.aiAnalysis.aiScore}%)`);
        }

        // Add AI issues to main issues
        results.issues = [...results.issues, ...results.aiAnalysis.issues];

        // Calculate final score
        results.originalityScore = Math.max(0, Math.round(100 - maxSimilarity));
        results.processingTime = Date.now() - startTime;

        // Determine final verdict
        if (results.aiAnalysis.isLikelyAI) {
            verdict = 'AI_GENERATED';
        } else if (results.commonAlgorithms.length > 0 && results.commonAlgorithms[0].similarity > 80) {
            verdict = 'COMMON_ALGORITHM';
        } else if (maxSimilarity > 70) {
            verdict = 'HIGH_SIMILARITY';
        } else if (maxSimilarity > 40) {
            verdict = 'MODERATE_SIMILARITY';
        } else {
            verdict = 'ORIGINAL';
        }

        results.verdict = verdict;

        return NextResponse.json(results);

    } catch (error) {
        console.error('Code Plagiarism Error:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}

/**
 * Simple language detection based on syntax
 */
function detectLanguage(code) {
    if (/^def\s+\w+\s*\(|^\s*import\s+\w+|^from\s+\w+\s+import/m.test(code)) {
        return 'python';
    }
    if (/function\s+\w+\s*\(|const\s+\w+\s*=|let\s+\w+\s*=|=>\s*{/m.test(code)) {
        return 'javascript';
    }
    if (/public\s+(static\s+)?void\s+main|class\s+\w+\s*{|System\.out\.print/m.test(code)) {
        return 'java';
    }
    if (/#include\s*<|int\s+main\s*\(|std::/m.test(code)) {
        return 'cpp';
    }
    if (/func\s+\w+\s*\(.*\)\s*(->|\{)|let\s+\w+:\s*\w+/m.test(code)) {
        return 'swift';
    }
    return 'unknown';
}
