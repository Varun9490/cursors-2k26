/**
 * Code Plagiarism Detection - Multi-Language Support
 * Uses structure analysis and pattern matching for any language
 */

import * as parser from '@babel/parser';
import traverse from '@babel/traverse';

// Common algorithm patterns for multiple languages
export const COMMON_ALGORITHMS = {
    // Prime number check (the exact algorithm used in the user's code)
    isPrime: {
        patterns: [
            /if\s*\(?n\s*[<<=]+\s*1\)?.*return\s*(false|False|0)/i,
            /if\s*\(?n\s*%\s*2\s*==\s*0/i,
            /while\s*\(?i\s*\*\s*i\s*[<<=]+\s*n\)?/i,
            /n\s*%\s*i\s*==\s*0/i,
            /i\s*\+=?\s*6/,
        ],
        name: 'Prime Number Check',
        minMatches: 3
    },
    generatePrimes: {
        patterns: [
            /for\s*.*range\s*\(.*limit/i,
            /is_?prime\s*\(/i,
            /primes?\s*\.?\s*(append|push)/i,
        ],
        name: 'Prime Generator (Sieve/Iteration)',
        minMatches: 2
    },
    quickSort: {
        patterns: [
            /pivot/i,
            /filter|partition/i,
            /(left|right)\s*=.*filter/i,
            /\.\.\..*sort.*left/i,
            /quicksort|quick_sort/i,
        ],
        name: 'QuickSort',
        minMatches: 2
    },
    bubbleSort: {
        patterns: [
            /for.*i.*length/i,
            /for.*j.*length.*-.*i/i,
            /\[.*j.*\].*>.*\[.*j.*\+.*1\]/,
            /swap|temp/i,
        ],
        name: 'BubbleSort',
        minMatches: 2
    },
    binarySearch: {
        patterns: [
            /left\s*=\s*0/i,
            /right\s*=.*length/i,
            /mid\s*=.*(left\s*\+\s*right)\s*\/\s*2/i,
            /while.*left\s*[<<=]+\s*right/i,
            /binary.?search/i,
        ],
        name: 'Binary Search',
        minMatches: 2
    },
    fibonacci: {
        patterns: [
            /fib(onacci)?/i,
            /if.*n\s*[<<=]+\s*1.*return\s*n/i,
            /return.*fib.*n\s*-\s*1.*\+.*fib.*n\s*-\s*2/i,
        ],
        name: 'Fibonacci',
        minMatches: 2
    },
    factorial: {
        patterns: [
            /factorial/i,
            /if.*n\s*[<<=]+\s*(0|1).*return\s*1/i,
            /return.*n\s*\*.*factorial/i,
        ],
        name: 'Factorial',
        minMatches: 2
    },
    reverseString: {
        patterns: [
            /reverse/i,
            /\[::\s*-1\s*\]/,   // Python slice
            /split.*reverse.*join/i,
        ],
        name: 'String Reverse',
        minMatches: 1
    },
    palindrome: {
        patterns: [
            /palindrome/i,
            /==.*\[::\s*-1\s*\]/,
            /reverse.*==|==.*reverse/i,
        ],
        name: 'Palindrome Check',
        minMatches: 1
    }
};

// AI-generated code patterns (language-agnostic)
const AI_CODE_PATTERNS = [
    { pattern: /# Example/i, weight: 2, description: 'AI placeholder comment' },
    { pattern: /\/\/ Example/i, weight: 2, description: 'AI placeholder comment' },
    { pattern: /# TODO/i, weight: 1, description: 'TODO comment' },
    { pattern: /# This (function|code|script)/i, weight: 2, description: 'Generic comment' },
    { pattern: /\/\/ This (function|code|script)/i, weight: 2, description: 'Generic comment' },
    { pattern: /print\s*\(\s*["'].*["']\s*\)/g, weight: 1, description: 'Debug print' },
    { pattern: /console\.log/g, weight: 1, description: 'Debug log' },
    { pattern: /def\s+\w+\s*\([^)]*\)\s*:\s*\n\s*['"]{3}/i, weight: 2, description: 'AI docstring pattern' },
    { pattern: /"""[^"]+"""/g, weight: 1, description: 'Docstring' },
    { pattern: /^#\s*(Generate|Create|Check|Calculate|Get|Set)/im, weight: 2, description: 'AI comment style' },
];

// Structural patterns common in AI code
const AI_STRUCTURAL_PATTERNS = [
    { pattern: /if.*:\s*\n\s*return (True|False|true|false)\s*\n\s*if/g, weight: 2, description: 'Simple boolean returns' },
    { pattern: /result\s*=\s*\[\]\s*\n.*for.*:\s*\n.*\.append/g, weight: 3, description: 'List accumulator pattern' },
    { pattern: /for\s+\w+\s+in\s+range\s*\(/g, weight: 1, description: 'Simple iteration' },
];

/**
 * Detect common algorithms using pattern matching (works for any language)
 */
export function detectCommonAlgorithm(code) {
    const results = [];
    const normalizedCode = code.toLowerCase();

    for (const [key, algo] of Object.entries(COMMON_ALGORITHMS)) {
        let matchCount = 0;
        const matchedPatterns = [];

        for (const pattern of algo.patterns) {
            if (pattern.test(code) || pattern.test(normalizedCode)) {
                matchCount++;
                matchedPatterns.push(pattern.toString());
            }
        }

        if (matchCount >= algo.minMatches) {
            const similarity = Math.min(95, 50 + (matchCount / algo.patterns.length) * 50);
            results.push({
                algorithm: algo.name,
                key,
                similarity: Math.round(similarity),
                matchCount,
                totalPatterns: algo.patterns.length,
                verdict: similarity > 80 ? 'COMMON_ALGORITHM' : 'SIMILAR_PATTERN'
            });
        }
    }

    return results.sort((a, b) => b.similarity - a.similarity);
}

/**
 * Detect AI-generated code patterns (language-agnostic)
 */
export function detectAICodePatterns(code) {
    let aiScore = 0;
    const issues = [];
    const lines = code.split('\n');

    // Check AI patterns
    for (const { pattern, weight, description } of AI_CODE_PATTERNS) {
        const matches = code.match(pattern);
        if (matches) {
            aiScore += weight * matches.length;
            issues.push(`${description}: ${matches.length} occurrence(s)`);
        }
    }

    // Check structural patterns
    for (const { pattern, weight, description } of AI_STRUCTURAL_PATTERNS) {
        if (pattern.test(code)) {
            aiScore += weight;
            issues.push(description);
        }
    }

    // Check for overly commented code (AI tends to over-explain)
    const commentLines = lines.filter(l =>
        l.trim().startsWith('#') ||
        l.trim().startsWith('//') ||
        l.trim().startsWith('/*')
    ).length;
    const codeLines = lines.filter(l => l.trim().length > 0).length;
    const commentRatio = commentLines / Math.max(1, codeLines);

    if (commentRatio > 0.3) {
        aiScore += Math.floor(commentRatio * 10);
        issues.push(`High comment ratio: ${(commentRatio * 100).toFixed(0)}%`);
    }

    // Check for lack of error handling
    const hasErrorHandling = /try|except|catch|raise|throw/i.test(code);
    if (!hasErrorHandling && lines.length > 15) {
        aiScore += 3;
        issues.push('No error handling in substantial code');
    }

    // Check for generic variable names
    const genericVars = code.match(/\b(result|data|value|item|temp|num|arr|lst)\b/gi) || [];
    if (genericVars.length > 3) {
        aiScore += 2;
        issues.push(`Generic variable names: ${genericVars.length}`);
    }

    // Normalize score to 0-100
    aiScore = Math.min(100, aiScore * 5);

    return {
        aiScore,
        isLikelyAI: aiScore > 40,
        issues,
        confidence: Math.min(90, 50 + lines.length / 2)
    };
}

/**
 * JavaScript-specific AST analysis (fallback for JS code)
 */
function analyzeJavaScriptAST(code) {
    try {
        const ast = parser.parse(code, {
            sourceType: 'module',
            plugins: ['jsx', 'typescript']
        });

        const structure = [];
        traverse.default(ast, {
            enter(path) {
                structure.push(path.node.type);
            }
        });

        return { success: true, structure, nodeCount: structure.length };
    } catch (error) {
        return { success: false, error: error.message };
    }
}

/**
 * Calculate similarity between two code snippets using structure comparison
 */
export function calculateCodeSimilarity(code1, code2) {
    // Try JS AST first
    const ast1 = analyzeJavaScriptAST(code1);
    const ast2 = analyzeJavaScriptAST(code2);

    if (ast1.success && ast2.success) {
        // Use LCS for AST comparison
        const lcs = longestCommonSubsequence(ast1.structure, ast2.structure);
        const similarity = (2 * lcs) / (ast1.nodeCount + ast2.nodeCount);
        return {
            similarity: Math.round(similarity * 100),
            method: 'AST'
        };
    }

    // Fallback: Token-based comparison for non-JS code
    const tokens1 = tokenize(code1);
    const tokens2 = tokenize(code2);

    const lcs = longestCommonSubsequence(tokens1, tokens2);
    const similarity = (2 * lcs) / (tokens1.length + tokens2.length);

    return {
        similarity: Math.round(similarity * 100),
        method: 'tokenized'
    };
}

/**
 * Simple tokenizer for any language
 */
function tokenize(code) {
    // Remove comments
    const noComments = code
        .replace(/#.*$/gm, '')
        .replace(/\/\/.*$/gm, '')
        .replace(/\/\*[\s\S]*?\*\//g, '');

    // Extract tokens
    return noComments
        .split(/[\s\n\r\t]+/)
        .filter(t => t.length > 0)
        .map(t => t.replace(/[^\w]/g, '').toLowerCase())
        .filter(t => t.length > 0);
}

/**
 * LCS algorithm for comparing structures
 */
function longestCommonSubsequence(arr1, arr2) {
    const m = arr1.length;
    const n = arr2.length;

    if (m === 0 || n === 0) return 0;

    const dp = Array(m + 1).fill(null).map(() => Array(n + 1).fill(0));

    for (let i = 1; i <= m; i++) {
        for (let j = 1; j <= n; j++) {
            if (arr1[i - 1] === arr2[j - 1]) {
                dp[i][j] = dp[i - 1][j - 1] + 1;
            } else {
                dp[i][j] = Math.max(dp[i - 1][j], dp[i][j - 1]);
            }
        }
    }

    return dp[m][n];
}
