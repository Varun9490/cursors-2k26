/**
 * Code Plagiarism Detection — Multi-Engine, Multi-Language
 * =========================================================
 * 
 * Engine 1: jscpd — industry-standard copy/paste detector (token-based clone detection)
 * Engine 2: Gemini AI — LLM-powered code plagiarism & originality analysis
 * Engine 3: AST / Token structure — structural similarity comparison
 * Engine 4: Pattern matching — common algorithm & AI-generated code detection
 * 
 * Supports: JavaScript, TypeScript, Python, Java, C, C++, C#, Go, Ruby, 
 *           Rust, Swift, Kotlin, PHP, Scala, R, Lua, Perl, Shell/Bash,
 *           HTML, CSS, SQL, and more via jscpd's 150+ language support.
 */

import { Detector, MemoryStore, Statistic } from '@jscpd/core';
import { Tokenizer, tokenize, FORMATS, getSupportedFormats } from '@jscpd/tokenizer';

// ============================================
// LANGUAGE DETECTION — comprehensive auto-detect
// ============================================

const LANGUAGE_SIGNATURES = [
    {
        lang: 'python',
        jscpdFormat: 'python',
        patterns: [
            { regex: /^def\s+\w+\s*\([^)]*\)\s*(->\s*\w+)?\s*:/m, weight: 10 },
            { regex: /^from\s+\w+(\.\w+)*\s+import\s+/m, weight: 10 },
            { regex: /^import\s+\w+(\s*,\s*\w+)*\s*$/m, weight: 8 },
            { regex: /^class\s+\w+(\s*\(.*\))?\s*:/m, weight: 9 },
            { regex: /^\s*if\s+__name__\s*==\s*['"]__main__['"]\s*:/m, weight: 15 },
            { regex: /\bself\.\w+/m, weight: 6 },
            { regex: /\bprint\s*\(/m, weight: 3 },
            { regex: /\belif\s+/m, weight: 8 },
            { regex: /\bfor\s+\w+\s+in\s+/m, weight: 5 },
            { regex: /\bdef\s+__\w+__\s*\(/m, weight: 12 },
            { regex: /\blambda\s+\w+\s*:/m, weight: 7 },
            { regex: /\bNone\b/m, weight: 4 },
            { regex: /\bTrue\b|\bFalse\b/m, weight: 3 },
            { regex: /\[:.*\]/m, weight: 4 }, // slicing
            { regex: /#\s*.+$/m, weight: 2 }, // python comments
        ]
    },
    {
        lang: 'javascript',
        jscpdFormat: 'javascript',
        patterns: [
            { regex: /\bconst\s+\w+\s*=/, weight: 6 },
            { regex: /\blet\s+\w+\s*=/, weight: 6 },
            { regex: /\bvar\s+\w+\s*=/, weight: 4 },
            { regex: /=>\s*[{(]/, weight: 8 },
            { regex: /\bfunction\s+\w+\s*\(/, weight: 7 },
            { regex: /\bconsole\.(log|error|warn)\s*\(/, weight: 8 },
            { regex: /\brequire\s*\(\s*['"]/, weight: 9 },
            { regex: /\bmodule\.exports\b/, weight: 10 },
            { regex: /\bexport\s+(default\s+)?/, weight: 7 },
            { regex: /\bimport\s+.*\s+from\s+['"]/, weight: 8 },
            { regex: /\basync\s+function\b/, weight: 6 },
            { regex: /\bawait\s+/, weight: 4 },
            { regex: /\b(document|window)\.\w+/, weight: 8 },
            { regex: /\bnew\s+Promise\b/, weight: 6 },
            { regex: /===|!==/, weight: 5 },
        ]
    },
    {
        lang: 'typescript',
        jscpdFormat: 'typescript',
        patterns: [
            { regex: /:\s*(string|number|boolean|any|void|never)\b/, weight: 10 },
            { regex: /\binterface\s+\w+\s*{/, weight: 12 },
            { regex: /\btype\s+\w+\s*=/, weight: 10 },
            { regex: /<\w+(\s*,\s*\w+)*>/, weight: 5 }, // generics
            { regex: /\bas\s+\w+/, weight: 7 },
            { regex: /\benum\s+\w+\s*{/, weight: 10 },
            { regex: /\bimport\s+.*\s+from\s+['"]/, weight: 4 },
            { regex: /\bReadonly</, weight: 12 },
            { regex: /\bRecord</, weight: 10 },
            { regex: /\bPartial</, weight: 10 },
        ]
    },
    {
        lang: 'java',
        jscpdFormat: 'java',
        patterns: [
            { regex: /\bpublic\s+(static\s+)?void\s+main\s*\(/, weight: 15 },
            { regex: /\bSystem\.out\.print(ln)?\s*\(/, weight: 12 },
            { regex: /\bpublic\s+(class|interface|enum)\s+\w+/, weight: 10 },
            { regex: /\bprivate\s+(static\s+)?(final\s+)?\w+\s+\w+/, weight: 8 },
            { regex: /\bimport\s+java\.\w+/, weight: 12 },
            { regex: /\bpackage\s+[\w.]+;/, weight: 12 },
            { regex: /@Override\b/, weight: 10 },
            { regex: /\bString\[\]\s+args/, weight: 10 },
            { regex: /\bnew\s+\w+\s*\(/, weight: 4 },
            { regex: /\bthrows\s+\w+/, weight: 8 },
        ]
    },
    {
        lang: 'cpp',
        jscpdFormat: 'cpp',
        patterns: [
            { regex: /#include\s*<\w+/, weight: 12 },
            { regex: /\bstd::\w+/, weight: 10 },
            { regex: /\bint\s+main\s*\(/, weight: 10 },
            { regex: /\bcout\s*<</, weight: 10 },
            { regex: /\bcin\s*>>/, weight: 10 },
            { regex: /\busing\s+namespace\s+std/, weight: 12 },
            { regex: /\bvector</, weight: 8 },
            { regex: /\btemplate\s*</, weight: 10 },
            { regex: /\bnullptr\b/, weight: 8 },
            { regex: /\bclass\s+\w+\s*(:\s*(public|private|protected))?/, weight: 6 },
        ]
    },
    {
        lang: 'c',
        jscpdFormat: 'c',
        patterns: [
            { regex: /#include\s*<stdio\.h>/, weight: 15 },
            { regex: /#include\s*<stdlib\.h>/, weight: 12 },
            { regex: /\bprintf\s*\(/, weight: 10 },
            { regex: /\bscanf\s*\(/, weight: 10 },
            { regex: /\bmalloc\s*\(/, weight: 10 },
            { regex: /\bfree\s*\(/, weight: 8 },
            { regex: /\bint\s+main\s*\(\s*(void|int\s+argc)/, weight: 12 },
            { regex: /\btypedef\s+(struct|enum)\b/, weight: 10 },
            { regex: /\bstruct\s+\w+\s*{/, weight: 7 },
        ]
    },
    {
        lang: 'csharp',
        jscpdFormat: 'csharp',
        patterns: [
            { regex: /\busing\s+System(\.\w+)*;/, weight: 12 },
            { regex: /\bnamespace\s+\w+(\.\w+)*\s*{/, weight: 10 },
            { regex: /\bConsole\.(Write|ReadLine)/, weight: 12 },
            { regex: /\bvar\s+\w+\s*=\s*new\b/, weight: 7 },
            { regex: /\bstring\[\]\s+args/, weight: 8 },
            { regex: /\basync\s+Task/, weight: 8 },
            { regex: /\bLINQ\b|\b\.Select\s*\(|\b\.Where\s*\(/, weight: 8 },
        ]
    },
    {
        lang: 'go',
        jscpdFormat: 'go',
        patterns: [
            { regex: /^package\s+\w+$/m, weight: 12 },
            { regex: /\bfunc\s+(\(\w+\s+\*?\w+\)\s+)?\w+\s*\(/, weight: 10 },
            { regex: /\bfmt\.(Print|Sprintf|Errorf)/, weight: 12 },
            { regex: /:=/, weight: 8 },
            { regex: /\bgo\s+func\b/, weight: 12 },
            { regex: /\bchan\s+\w+/, weight: 10 },
            { regex: /\bdefer\s+/, weight: 10 },
            { regex: /\bif\s+err\s*!=\s*nil\b/, weight: 12 },
        ]
    },
    {
        lang: 'ruby',
        jscpdFormat: 'ruby',
        patterns: [
            { regex: /\bdef\s+\w+(\s*\(.*\))?\s*$/m, weight: 8 },
            { regex: /\bend\s*$/m, weight: 5 },
            { regex: /\bputs\s+/, weight: 8 },
            { regex: /\brequire\s+['"]/, weight: 8 },
            { regex: /\bdo\s*\|.*\|/, weight: 10 },
            { regex: /\b\w+\.each\s*(do|\{)/, weight: 8 },
            { regex: /\battr_(reader|writer|accessor)\b/, weight: 12 },
            { regex: /@\w+\s*=/, weight: 6 },
        ]
    },
    {
        lang: 'rust',
        jscpdFormat: 'rust',
        patterns: [
            { regex: /\bfn\s+\w+\s*(<.*>)?\s*\(/, weight: 10 },
            { regex: /\blet\s+mut\s+/, weight: 12 },
            { regex: /\bprintln!\s*\(/, weight: 12 },
            { regex: /\bimpl\s+\w+/, weight: 10 },
            { regex: /\buse\s+\w+(::\w+)*;/, weight: 10 },
            { regex: /\bOption</, weight: 8 },
            { regex: /\bResult</, weight: 8 },
            { regex: /\bmatch\s+\w+\s*{/, weight: 8 },
            { regex: /\b&(mut\s+)?self\b/, weight: 10 },
        ]
    },
    {
        lang: 'swift',
        jscpdFormat: 'swift',
        patterns: [
            { regex: /\bfunc\s+\w+\s*\(.*\)\s*(->\s*\w+)?\s*{/, weight: 8 },
            { regex: /\bvar\s+\w+\s*:\s*\w+/, weight: 8 },
            { regex: /\blet\s+\w+\s*:\s*\w+/, weight: 8 },
            { regex: /\bguard\s+let\b/, weight: 12 },
            { regex: /\bif\s+let\b/, weight: 10 },
            { regex: /\bprint\s*\("/, weight: 6 },
            { regex: /\bimport\s+(UIKit|Foundation|SwiftUI)/, weight: 12 },
            { regex: /\bstruct\s+\w+\s*:\s*\w+/, weight: 8 },
        ]
    },
    {
        lang: 'kotlin',
        jscpdFormat: 'kotlin',
        patterns: [
            { regex: /\bfun\s+\w+\s*\(/, weight: 10 },
            { regex: /\bval\s+\w+\s*(:\s*\w+)?/, weight: 8 },
            { regex: /\bvar\s+\w+\s*(:\s*\w+)?/, weight: 6 },
            { regex: /\bprintln\s*\(/, weight: 8 },
            { regex: /\bwhen\s*\(.*\)\s*{/, weight: 10 },
            { regex: /\bdata\s+class\b/, weight: 12 },
            { regex: /\bcompanion\s+object\b/, weight: 12 },
            { regex: /\bimport\s+kotlin\.\w+/, weight: 10 },
        ]
    },
    {
        lang: 'php',
        jscpdFormat: 'php',
        patterns: [
            { regex: /<\?php/, weight: 15 },
            { regex: /\$\w+\s*=/, weight: 8 },
            { regex: /\becho\s+/, weight: 8 },
            { regex: /\bfunction\s+\w+\s*\(.*\$/, weight: 8 },
            { regex: /->/, weight: 3 },
            { regex: /\bnamespace\s+\w+/, weight: 8 },
            { regex: /\buse\s+\w+\\/, weight: 8 },
        ]
    },
    {
        lang: 'sql',
        jscpdFormat: 'sql',
        patterns: [
            { regex: /\bSELECT\s+.*\bFROM\b/i, weight: 12 },
            { regex: /\bCREATE\s+TABLE\b/i, weight: 12 },
            { regex: /\bINSERT\s+INTO\b/i, weight: 10 },
            { regex: /\bWHERE\s+\w+/i, weight: 6 },
            { regex: /\bJOIN\s+\w+\s+ON\b/i, weight: 8 },
            { regex: /\bGROUP\s+BY\b/i, weight: 8 },
        ]
    },
    {
        lang: 'shell',
        jscpdFormat: 'bash',
        patterns: [
            { regex: /^#!\/bin\/(bash|sh|zsh)/m, weight: 15 },
            { regex: /\becho\s+["']/, weight: 6 },
            { regex: /\bif\s+\[\s+/, weight: 8 },
            { regex: /\bfi\s*$/m, weight: 8 },
            { regex: /\bdone\s*$/m, weight: 6 },
            { regex: /\bgrep\s+/, weight: 6 },
            { regex: /\|\s*\w+/, weight: 4 }, // pipe
        ]
    },
    {
        lang: 'html',
        jscpdFormat: 'htmlmixed',
        patterns: [
            { regex: /<html/i, weight: 10 },
            { regex: /<div\s+/i, weight: 6 },
            { regex: /<\/\w+>/i, weight: 4 },
            { regex: /class="[^"]+"/i, weight: 5 },
        ]
    },
    {
        lang: 'css',
        jscpdFormat: 'css',
        patterns: [
            { regex: /\w+\s*{\s*[\w-]+:/, weight: 8 },
            { regex: /\.([\w-]+)\s*{/, weight: 6 },
            { regex: /@media\s+/, weight: 8 },
            { regex: /:\s*(flex|grid|block|inline|none)\b/, weight: 5 },
        ]
    },
    {
        lang: 'scala',
        jscpdFormat: 'scala',
        patterns: [
            { regex: /\bdef\s+\w+(\[.*\])?\s*\(/, weight: 8 },
            { regex: /\bval\s+\w+\s*:\s*\w+/, weight: 8 },
            { regex: /\bobject\s+\w+\s*(extends)?/, weight: 10 },
            { regex: /\bcase\s+class\b/, weight: 12 },
            { regex: /\bimport\s+scala\./, weight: 10 },
        ]
    },
    {
        lang: 'r',
        jscpdFormat: 'r',
        patterns: [
            { regex: /<-\s*/, weight: 10 },
            { regex: /\blibrary\s*\(/, weight: 12 },
            { regex: /\bfunction\s*\(/, weight: 6 },
            { regex: /\bc\s*\(/, weight: 4 },
            { regex: /\bdata\.frame\s*\(/, weight: 10 },
        ]
    },
    {
        lang: 'lua',
        jscpdFormat: 'lua',
        patterns: [
            { regex: /\blocal\s+\w+\s*=/, weight: 10 },
            { regex: /\bfunction\s+\w+\s*\(.*\)\s*$/m, weight: 8 },
            { regex: /\bend\s*$/m, weight: 3 },
            { regex: /\bprint\s*\(/, weight: 4 },
            { regex: /\brequire\s*\(/, weight: 6 },
        ]
    },
    {
        lang: 'perl',
        jscpdFormat: 'perl',
        patterns: [
            { regex: /\bmy\s+\$\w+/, weight: 12 },
            { regex: /\bsub\s+\w+\s*{/, weight: 10 },
            { regex: /\buse\s+strict;/, weight: 12 },
            { regex: /\bprint\s+"/, weight: 6 },
            { regex: /=~\s*\//, weight: 10 },
        ]
    },
];

/**
 * Auto-detect programming language from code content
 */
export function detectLanguage(code) {
    if (!code || code.length < 10) return { lang: 'unknown', jscpdFormat: 'javascript', confidence: 0 };

    const scores = {};

    for (const sig of LANGUAGE_SIGNATURES) {
        let totalScore = 0;
        let matchCount = 0;

        for (const { regex, weight } of sig.patterns) {
            if (regex.test(code)) {
                totalScore += weight;
                matchCount++;
            }
        }

        if (matchCount > 0) {
            scores[sig.lang] = {
                score: totalScore,
                matchCount,
                jscpdFormat: sig.jscpdFormat,
                confidence: Math.min(95, totalScore * 2)
            };
        }
    }

    const sorted = Object.entries(scores).sort((a, b) => b[1].score - a[1].score);

    if (sorted.length === 0) {
        return { lang: 'unknown', jscpdFormat: 'javascript', confidence: 0 };
    }

    const [topLang, topData] = sorted[0];

    // If top two are very close and one is TS vs JS, prefer TS (since TS is a superset)
    if (sorted.length > 1) {
        const [secondLang, secondData] = sorted[1];
        if (topLang === 'javascript' && secondLang === 'typescript' && secondData.score > topData.score * 0.7) {
            return { lang: 'typescript', jscpdFormat: 'typescript', confidence: secondData.confidence };
        }
        // c vs cpp disambiguation
        if (topLang === 'c' && secondLang === 'cpp' && secondData.score > topData.score * 0.6) {
            return { lang: 'cpp', jscpdFormat: 'cpp', confidence: secondData.confidence };
        }
    }

    return {
        lang: topLang,
        jscpdFormat: topData.jscpdFormat,
        confidence: topData.confidence,
        allDetected: sorted.slice(0, 3).map(([l, d]) => ({ lang: l, score: d.score, confidence: d.confidence }))
    };
}

// ============================================
// ENGINE 1: JSCPD — Copy/Paste Clone Detection
// ============================================

/**
 * Use jscpd to detect clones between two code snippets
 * or analyze a single snippet for internal duplication
 */
export async function detectClonesWithJscpd(code1, code2, format = 'javascript') {
    try {
        const tokenizer = new Tokenizer();
        const store = new MemoryStore();
        const statistic = new Statistic();

        const options = {
            minLines: 2,
            minTokens: 15,
            threshold: 0,
            mode: 'mild',
            ignoreCase: true,
        };

        const detector = new Detector(tokenizer, store, [], options);

        // Subscribe statistics to clone events
        const subscribers = statistic.subscribe();
        for (const [event, handler] of Object.entries(subscribers)) {
            if (handler) {
                detector.on(event, handler);
            }
        }

        // Detect clones — feed both code snippets as separate "files"
        const clones1 = await detector.detect('source-a', code1, format);

        let clones2 = [];
        if (code2) {
            clones2 = await detector.detect('source-b', code2, format);
        }

        const allClones = [...clones1, ...clones2];

        // Find cross-file clones (clones between source-a and source-b)
        const crossClones = allClones.filter(clone => {
            return (
                clone.duplicationA.sourceId !== clone.duplicationB.sourceId
            );
        });

        // Find self-duplicates within single code
        const selfClones = allClones.filter(clone => {
            return clone.duplicationA.sourceId === clone.duplicationB.sourceId;
        });

        const stat = statistic.getStatistic();

        // Calculate similarity percentage from clones
        const code1Lines = code1.split('\n').length;
        const code2Lines = code2 ? code2.split('\n').length : 0;
        const totalLines = code1Lines + code2Lines;

        let duplicatedLines = 0;
        for (const clone of crossClones) {
            const linesA = clone.duplicationA.end.line - clone.duplicationA.start.line + 1;
            duplicatedLines += linesA;
        }

        const similarity = totalLines > 0 ? Math.round((duplicatedLines / Math.max(code1Lines, 1)) * 100) : 0;

        store.close();

        return {
            similarity: Math.min(100, similarity),
            cloneCount: allClones.length,
            crossCloneCount: crossClones.length,
            selfCloneCount: selfClones.length,
            clones: allClones.map(c => ({
                sourceA: c.duplicationA.sourceId,
                sourceB: c.duplicationB.sourceId,
                startA: c.duplicationA.start,
                endA: c.duplicationA.end,
                startB: c.duplicationB.start,
                endB: c.duplicationB.end,
                fragmentA: c.duplicationA.fragment?.substring(0, 200),
                fragmentB: c.duplicationB.fragment?.substring(0, 200),
            })),
            statistics: stat,
            duplicatedLines,
            totalLines,
        };
    } catch (error) {
        console.error('[JSCPD] Detection error:', error.message);
        return {
            similarity: 0,
            cloneCount: 0,
            crossCloneCount: 0,
            selfCloneCount: 0,
            clones: [],
            statistics: null,
            error: error.message,
        };
    }
}

/**
 * Tokenize code using jscpd's tokenizer for structural analysis
 */
export function tokenizeCode(code, format = 'javascript') {
    try {
        const tokens = tokenize(code, format);
        return {
            success: true,
            tokens,
            tokenCount: tokens.length,
            tokenTypes: [...new Set(tokens.map(t => t.type))],
            format,
        };
    } catch (error) {
        console.error('[TOKENIZER] Error:', error.message);
        return {
            success: false,
            tokens: [],
            tokenCount: 0,
            tokenTypes: [],
            error: error.message,
        };
    }
}

// ============================================
// ENGINE 2: GEMINI AI — Code Plagiarism Analysis
// ============================================

/**
 * Use Gemini to analyze code for plagiarism, originality, and AI-generation
 */
export async function analyzeCodeWithGemini(code, language, genAI, compareWith = null) {
    if (!genAI) return null;

    try {
        const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash' });

        let prompt;
        if (compareWith) {
            // Comparison mode
            prompt = `You are a senior code plagiarism forensics expert. Compare these two code snippets and determine if Code B is plagiarized from Code A (or vice versa). Look for:

1. Direct copy-paste
2. Variable/function renaming without logic changes
3. Structural similarity (same algorithm, different names)
4. Comment modifications only
5. Minor syntactic changes (whitespace, formatting)
6. Reordering of functions/blocks without logic changes

Code A (${language}):
\`\`\`
${code.substring(0, 3000)}
\`\`\`

Code B (${language}):
\`\`\`
${compareWith.substring(0, 3000)}
\`\`\`

Respond ONLY with this exact JSON format:
{
  "similarity": <number 0-100>,
  "isLikelyCopied": <boolean>,
  "isPlagiarized": <boolean>,
  "plagiarismType": "<NONE|DIRECT_COPY|RENAMED_VARIABLES|STRUCTURAL_COPY|PARAPHRASED|PARTIAL_COPY>",
  "confidence": <number 0-100>,
  "commonElements": ["<element1>", "<element2>", ...],
  "differences": ["<diff1>", "<diff2>", ...],
  "reasoning": "<detailed analysis>",
  "isAIGenerated": <boolean>,
  "aiConfidence": <number 0-100>
}`;
        } else {
            // Single-code analysis mode
            prompt = `You are a senior code plagiarism and AI-code forensics expert. Analyze this code snippet for:

1. **Originality**: Is this code original or does it look like a common textbook/tutorial/StackOverflow solution?
2. **AI Generation**: Does it look like it was generated by an AI (ChatGPT, Copilot, Claude, etc.)?
3. **Common Patterns**: Does it implement well-known algorithms or patterns in a standard way?
4. **Code Quality**: Variable naming, error handling, documentation style
5. **Plagiarism Indicators**: Generic variable names, overly-perfect structure, missing edge cases

Language: ${language}
Code:
\`\`\`
${code.substring(0, 4000)}
\`\`\`

Respond ONLY with this exact JSON format:
{
  "originalityScore": <number 0-100, where 100 is fully original>,
  "isAIGenerated": <boolean>,
  "aiConfidence": <number 0-100>,
  "isCommonAlgorithm": <boolean>,
  "algorithmName": "<name or null>",
  "plagiarismRisk": "<NONE|LOW|MODERATE|HIGH|VERY_HIGH>",
  "codeQuality": <number 0-100>,
  "reasoning": "<detailed analysis in 3-4 sentences>",
  "keyFindings": ["<finding1>", "<finding2>", "<finding3>"],
  "suspiciousPatterns": ["<pattern1>", "<pattern2>"],
  "suggestedSources": ["<potential source1>", "<potential source2>"]
}`;
        }

        const result = await model.generateContent(prompt);
        const responseText = result.response.text().trim();

        const jsonMatch = responseText.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
            return JSON.parse(jsonMatch[0]);
        }
    } catch (error) {
        console.error('[GEMINI CODE] Error:', error.message);
    }
    return null;
}

// ============================================
// ENGINE 3: AST / TOKEN STRUCTURAL COMPARISON
// ============================================

/**
 * Compare code structures using token sequences
 * Works for any language via jscpd tokenization
 */
export function compareCodeStructure(code1, code2, format = 'javascript') {
    try {
        const tokens1 = tokenize(code1, format);
        const tokens2 = tokenize(code2, format);

        if (tokens1.length === 0 || tokens2.length === 0) {
            // Fallback: simple token-based comparison
            return fallbackTokenComparison(code1, code2);
        }

        // Extract token type sequences (ignoring values — pure structural comparison)
        const types1 = tokens1.map(t => t.type);
        const types2 = tokens2.map(t => t.type);

        // LCS-based similarity
        const lcsLen = longestCommonSubsequence(types1, types2);
        const structuralSimilarity = (2 * lcsLen) / (types1.length + types2.length) * 100;

        // N-gram based similarity for more nuanced comparison
        const ngrams1 = getNgrams(types1, 4);
        const ngrams2 = getNgrams(types2, 4);
        const ngramSimilarity = jaccardSimilarity(ngrams1, ngrams2) * 100;

        // Token value comparison (includes identifier names)
        const values1 = tokens1.filter(t => t.type !== 'whitespace' && t.type !== 'newline').map(t => t.value.toLowerCase());
        const values2 = tokens2.filter(t => t.type !== 'whitespace' && t.type !== 'newline').map(t => t.value.toLowerCase());
        const valueLCS = longestCommonSubsequence(values1, values2);
        const valueSimilarity = values1.length > 0 && values2.length > 0
            ? (2 * valueLCS) / (values1.length + values2.length) * 100
            : 0;

        const combined = Math.round(
            Math.max(
                structuralSimilarity * 0.4 + ngramSimilarity * 0.3 + valueSimilarity * 0.3,
                valueSimilarity * 0.7 + structuralSimilarity * 0.3,
                ngramSimilarity
            )
        );

        return {
            structuralSimilarity: Math.round(structuralSimilarity),
            ngramSimilarity: Math.round(ngramSimilarity),
            valueSimilarity: Math.round(valueSimilarity),
            combined: Math.min(100, combined),
            method: 'jscpd-tokenizer',
            tokenCount1: tokens1.length,
            tokenCount2: tokens2.length,
        };
    } catch (error) {
        console.error('[STRUCTURE] Error:', error.message);
        return fallbackTokenComparison(code1, code2);
    }
}

function fallbackTokenComparison(code1, code2) {
    const tokens1 = simpleTokenize(code1);
    const tokens2 = simpleTokenize(code2);

    const lcs = longestCommonSubsequence(tokens1, tokens2);
    const similarity = tokens1.length > 0 && tokens2.length > 0
        ? Math.round((2 * lcs) / (tokens1.length + tokens2.length) * 100)
        : 0;

    return {
        structuralSimilarity: similarity,
        ngramSimilarity: similarity,
        valueSimilarity: similarity,
        combined: similarity,
        method: 'fallback-tokenizer',
        tokenCount1: tokens1.length,
        tokenCount2: tokens2.length,
    };
}

function simpleTokenize(code) {
    return code
        .replace(/#.*$/gm, '')
        .replace(/\/\/.*$/gm, '')
        .replace(/\/\*[\s\S]*?\*\//g, '')
        .split(/[\s\n\r\t]+/)
        .filter(t => t.length > 0)
        .map(t => t.replace(/[^\w]/g, '').toLowerCase())
        .filter(t => t.length > 0);
}

function getNgrams(arr, n) {
    const ngrams = new Set();
    for (let i = 0; i <= arr.length - n; i++) {
        ngrams.add(arr.slice(i, i + n).join('|'));
    }
    return ngrams;
}

function jaccardSimilarity(set1, set2) {
    const intersection = new Set([...set1].filter(x => set2.has(x)));
    const union = new Set([...set1, ...set2]);
    return union.size > 0 ? intersection.size / union.size : 0;
}

// ============================================
// ENGINE 4: PATTERN MATCHING — Common Algorithms & AI Detection
// ============================================

// Common algorithm patterns for multiple languages
const COMMON_ALGORITHMS = {
    isPrime: {
        patterns: [
            /if\s*\(?n\s*[<<=>]+\s*1\)?.*return\s*(false|False|0)/i,
            /if\s*\(?n\s*%\s*2\s*==\s*0/i,
            /while\s*\(?i\s*\*\s*i\s*[<<=>]+\s*n\)?/i,
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
    mergeSort: {
        patterns: [
            /merge\s*sort/i,
            /merge\s*\(/i,
            /left\s*=.*slice|left\s*=.*\[:mid\]/i,
            /right\s*=.*slice|right\s*=.*\[mid:\]/i,
        ],
        name: 'MergeSort',
        minMatches: 2
    },
    binarySearch: {
        patterns: [
            /left\s*=\s*0/i,
            /right\s*=.*length/i,
            /mid\s*=.*(left\s*\+\s*right)\s*\/\s*2/i,
            /while.*left\s*[<<=>]+\s*right/i,
            /binary.?search/i,
        ],
        name: 'Binary Search',
        minMatches: 2
    },
    fibonacci: {
        patterns: [
            /fib(onacci)?/i,
            /if.*n\s*[<<=>]+\s*1.*return\s*n/i,
            /return.*fib.*n\s*-\s*1.*\+.*fib.*n\s*-\s*2/i,
        ],
        name: 'Fibonacci',
        minMatches: 2
    },
    factorial: {
        patterns: [
            /factorial/i,
            /if.*n\s*[<<=>]+\s*(0|1).*return\s*1/i,
            /return.*n\s*\*.*factorial/i,
        ],
        name: 'Factorial',
        minMatches: 2
    },
    dfs: {
        patterns: [
            /dfs|depth.?first/i,
            /visited\s*\.\s*(add|push|append)/i,
            /stack\s*\.\s*(push|append|pop)/i,
        ],
        name: 'Depth-First Search',
        minMatches: 2
    },
    bfs: {
        patterns: [
            /bfs|breadth.?first/i,
            /queue\s*\.\s*(push|append|enqueue|shift|popleft)/i,
            /visited\b/i,
        ],
        name: 'Breadth-First Search',
        minMatches: 2
    },
    linkedList: {
        patterns: [
            /class\s+Node/i,
            /\.next\s*=|self\.next|this\.next/i,
            /head\s*=|\.head\b/i,
        ],
        name: 'Linked List',
        minMatches: 2
    },
    twoSum: {
        patterns: [
            /two.?sum/i,
            /hash|map|dict/i,
            /target\s*-\s*\w+/i,
        ],
        name: 'Two Sum (LeetCode Classic)',
        minMatches: 2
    },
    reverseString: {
        patterns: [
            /reverse/i,
            /\[::\s*-1\s*\]/,
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
    },
};

// AI-generated code patterns (language-agnostic)
const AI_CODE_PATTERNS = [
    { pattern: /# Example/i, weight: 2, description: 'AI placeholder comment' },
    { pattern: /\/\/ Example/i, weight: 2, description: 'AI placeholder comment' },
    { pattern: /# TODO:/i, weight: 1, description: 'TODO comment' },
    { pattern: /\/\/ TODO:/i, weight: 1, description: 'TODO comment' },
    { pattern: /# This (function|code|script|method|class)/i, weight: 3, description: 'Generic AI comment' },
    { pattern: /\/\/ This (function|code|script|method|class)/i, weight: 3, description: 'Generic AI comment' },
    { pattern: /\/\*\*\s*\n\s*\*\s*@(param|returns|throws)/gi, weight: 2, description: 'Overly-verbose JSDoc' },
    { pattern: /"""[\s\S]{10,200}"""/g, weight: 2, description: 'AI docstring pattern' },
    { pattern: /'''[\s\S]{10,200}'''/g, weight: 2, description: 'AI docstring pattern' },
    { pattern: /# (Generate|Create|Check|Calculate|Get|Set|Handle|Process|Validate|Initialize)/im, weight: 3, description: 'AI imperative comment' },
    { pattern: /\/\/ (Generate|Create|Check|Calculate|Get|Set|Handle|Process|Validate|Initialize)/im, weight: 3, description: 'AI imperative comment' },
    { pattern: /# Step \d+/im, weight: 4, description: 'AI step-by-step comment' },
    { pattern: /\/\/ Step \d+/im, weight: 4, description: 'AI step-by-step comment' },
];

// AI structural patterns
const AI_STRUCTURAL_PATTERNS = [
    { pattern: /if.*:\s*\n\s*return (True|False|true|false)\s*\n\s*if/g, weight: 2, description: 'Simple sequential boolean returns' },
    { pattern: /result\s*=\s*\[\]\s*\n.*for.*:\s*\n.*\.append/g, weight: 3, description: 'List accumulator pattern' },
    { pattern: /try\s*{[^}]+}\s*catch\s*\([^)]*\)\s*{\s*}/g, weight: 4, description: 'Empty catch blocks (lazy AI pattern)' },
    { pattern: /function\s+\w+\s*\([^)]*\)\s*{\s*}/g, weight: 3, description: 'Empty function stubs' },
];

/**
 * Detect common algorithms
 */
export function detectCommonAlgorithm(code) {
    const results = [];

    for (const [key, algo] of Object.entries(COMMON_ALGORITHMS)) {
        let matchCount = 0;
        const matchedPatterns = [];

        for (const pattern of algo.patterns) {
            if (pattern.test(code)) {
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

    // Check AI text patterns
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

    // Over-commented code (AI over-explains)
    const commentLines = lines.filter(l =>
        l.trim().startsWith('#') ||
        l.trim().startsWith('//') ||
        l.trim().startsWith('/*') ||
        l.trim().startsWith('*')
    ).length;
    const codeLines = lines.filter(l => l.trim().length > 0).length;
    const commentRatio = commentLines / Math.max(1, codeLines);

    if (commentRatio > 0.4) {
        aiScore += Math.floor(commentRatio * 12);
        issues.push(`High comment ratio: ${(commentRatio * 100).toFixed(0)}%`);
    } else if (commentRatio > 0.25) {
        aiScore += Math.floor(commentRatio * 6);
        issues.push(`Elevated comment ratio: ${(commentRatio * 100).toFixed(0)}%`);
    }

    // No error handling in substantial code
    const hasErrorHandling = /try|except|catch|raise|throw|panic|error(?:f)?/i.test(code);
    if (!hasErrorHandling && lines.length > 20) {
        aiScore += 4;
        issues.push('No error handling in substantial code');
    }

    // Generic variable names
    const genericVars = code.match(/\b(result|data|value|item|temp|num|arr|lst|output|ret|ans|res)\b/gi) || [];
    if (genericVars.length > 4) {
        aiScore += 3;
        issues.push(`Generic variable names: ${genericVars.length}`);
    }

    // Perfect indentation uniformity (AI is always perfectly consistent)
    const indentations = lines
        .filter(l => l.trim().length > 0)
        .map(l => l.match(/^(\s*)/)?.[1]?.length || 0)
        .filter(i => i > 0);
    if (indentations.length > 5) {
        const uniqueIndents = new Set(indentations);
        // Check if all indentations are multiples of a single value
        const minIndent = Math.min(...indentations.filter(i => i > 0));
        const allMultiples = indentations.every(i => i % minIndent === 0);
        if (allMultiples && uniqueIndents.size <= 4) {
            aiScore += 2;
            issues.push('Perfect indentation uniformity (AI pattern)');
        }
    }

    // Normalize to 0-100
    aiScore = Math.min(100, aiScore * 4);

    return {
        aiScore,
        isLikelyAI: aiScore > 35,
        issues,
        confidence: Math.min(90, 40 + lines.length / 3),
    };
}

// ============================================
// COMBINED ANALYSIS — Orchestrates all engines
// ============================================

/**
 * Run full code plagiarism analysis using all engines
 * 
 * @param {string} code - The code to analyze
 * @param {string} language - Programming language (or 'auto')
 * @param {object} genAI - GoogleGenerativeAI instance (optional)
 * @param {string} compareWith - Code to compare against (optional)
 * @returns {object} Complete analysis results
 */
export async function analyzeCodePlagiarism(code, language = 'auto', genAI = null, compareWith = null) {
    const startTime = Date.now();

    // Step 1: Detect language
    const langDetection = detectLanguage(code);
    const detectedLang = language === 'auto' ? langDetection.lang : language;
    const jscpdFormat = language === 'auto' ? langDetection.jscpdFormat : (
        LANGUAGE_SIGNATURES.find(s => s.lang === language)?.jscpdFormat || language
    );

    console.log(`[CODE PLAG] Language: ${detectedLang} (jscpd format: ${jscpdFormat}), Code: ${code.length} chars`);

    const results = {
        language: detectedLang,
        languageDetection: langDetection,
        codeLength: code.length,
        lineCount: code.split('\n').length,
        jscpdAnalysis: null,
        geminiAnalysis: null,
        structuralAnalysis: null,
        commonAlgorithms: [],
        aiAnalysis: null,
        originalityScore: 100,
        verdict: 'ORIGINAL',
        issues: [],
        processingTime: 0,
    };

    // Step 2: JSCPD Clone Detection
    try {
        if (compareWith) {
            results.jscpdAnalysis = await detectClonesWithJscpd(code, compareWith, jscpdFormat);
            console.log(`[JSCPD] Cross-clone similarity: ${results.jscpdAnalysis.similarity}%, Clones: ${results.jscpdAnalysis.cloneCount}`);
        } else {
            // Self-analysis: check for internal duplication
            results.jscpdAnalysis = await detectClonesWithJscpd(code, null, jscpdFormat);
            console.log(`[JSCPD] Self-clones: ${results.jscpdAnalysis.selfCloneCount}`);
        }
    } catch (err) {
        console.error('[JSCPD] Error:', err.message);
    }

    // Step 3: Common Algorithm Detection
    results.commonAlgorithms = detectCommonAlgorithm(code);

    // Step 4: AI Pattern Detection
    results.aiAnalysis = detectAICodePatterns(code);

    // Step 5: Structural Comparison (if compareWith provided)
    if (compareWith) {
        results.structuralAnalysis = compareCodeStructure(code, compareWith, jscpdFormat);
        console.log(`[STRUCTURE] Combined similarity: ${results.structuralAnalysis.combined}%`);
    }

    // Step 6: Gemini Analysis (if available)
    if (genAI) {
        try {
            results.geminiAnalysis = await analyzeCodeWithGemini(code, detectedLang, genAI, compareWith);
            if (results.geminiAnalysis) {
                console.log(`[GEMINI] Originality: ${results.geminiAnalysis.originalityScore || 'N/A'}%, AI: ${results.geminiAnalysis.isAIGenerated}`);
            }
        } catch (err) {
            console.error('[GEMINI] Error:', err.message);
        }
    }

    // Step 7: Calculate Final Originality Score
    let penalties = [];

    // --- jscpd penalty ---
    if (compareWith && results.jscpdAnalysis?.similarity > 0) {
        const jscpdPenalty = results.jscpdAnalysis.similarity;
        penalties.push({ source: 'jscpd', penalty: jscpdPenalty, weight: 0.35 });
        if (jscpdPenalty > 30) {
            results.issues.push(`🔴 Copy-paste detected: ${jscpdPenalty}% duplicated lines (jscpd)`);
        } else if (jscpdPenalty > 10) {
            results.issues.push(`🟡 Some code similarity: ${jscpdPenalty}% overlapping tokens`);
        }
    }

    // --- Structural comparison penalty ---
    if (compareWith && results.structuralAnalysis?.combined > 0) {
        const structPenalty = results.structuralAnalysis.combined;
        penalties.push({ source: 'structural', penalty: structPenalty, weight: 0.25 });
        if (structPenalty > 70) {
            results.issues.push(`🔴 High structural similarity: ${structPenalty}%`);
        } else if (structPenalty > 40) {
            results.issues.push(`🟠 Moderate structural similarity: ${structPenalty}%`);
        }
    }

    // --- Gemini penalty ---
    if (results.geminiAnalysis) {
        const gemini = results.geminiAnalysis;

        if (compareWith) {
            // Comparison mode — use Gemini's similarity score
            const geminiSim = gemini.similarity || 0;
            penalties.push({ source: 'gemini', penalty: geminiSim, weight: 0.40 });
            if (gemini.isPlagiarized) {
                results.issues.push(`🔴 Gemini: Plagiarism detected — ${gemini.plagiarismType}`);
            }
        } else {
            // Single code analysis
            const geminiOriginality = gemini.originalityScore || 100;
            const geminiPenalty = 100 - geminiOriginality;
            penalties.push({ source: 'gemini', penalty: geminiPenalty, weight: 0.40 });

            if (gemini.isAIGenerated) {
                results.issues.push(`🤖 Gemini: AI-generated code detected (${gemini.aiConfidence}% confidence)`);
            }
            if (gemini.isCommonAlgorithm) {
                results.issues.push(`📚 Gemini: Common algorithm — ${gemini.algorithmName}`);
            }
            if (gemini.plagiarismRisk === 'HIGH' || gemini.plagiarismRisk === 'VERY_HIGH') {
                results.issues.push(`🔴 Gemini: High plagiarism risk — ${gemini.reasoning}`);
            }
            if (gemini.keyFindings?.length > 0) {
                gemini.keyFindings.forEach(f => results.issues.push(`🧠 ${f}`));
            }
        }
    }

    // --- Common algorithm penalty ---
    if (results.commonAlgorithms.length > 0) {
        const topAlgo = results.commonAlgorithms[0];
        const algoPenalty = topAlgo.similarity * 0.5; // 50% weight: common ≠ plagiarized
        penalties.push({ source: 'algorithm', penalty: algoPenalty, weight: 0.15 });
        results.issues.push(`📚 Matches "${topAlgo.algorithm}" pattern (${topAlgo.similarity}% match)`);
    }

    // --- AI detection penalty ---
    if (results.aiAnalysis?.isLikelyAI) {
        const aiPenalty = results.aiAnalysis.aiScore * 0.6;
        penalties.push({ source: 'ai_detection', penalty: aiPenalty, weight: 0.20 });
        results.issues.push(`🤖 AI code patterns: ${results.aiAnalysis.aiScore}% AI probability`);
    }

    // Add AI issues
    if (results.aiAnalysis?.issues?.length > 0) {
        results.issues.push(...results.aiAnalysis.issues.map(i => `  └─ ${i}`));
    }

    // Calculate weighted average penalty
    if (penalties.length > 0) {
        const totalWeight = penalties.reduce((sum, p) => sum + p.weight, 0);
        const weightedPenalty = penalties.reduce((sum, p) => sum + (p.penalty * p.weight), 0) / totalWeight;

        // Also consider the maximum penalty (don't let averaging hide clear plagiarism)
        const maxPenalty = Math.max(...penalties.map(p => p.penalty));

        const finalPenalty = Math.max(
            weightedPenalty,
            maxPenalty * 0.7 // Max penalty still carries 70% weight
        );

        results.originalityScore = Math.max(0, Math.round(100 - finalPenalty));
    }

    // Step 8: Determine final verdict
    const os = results.originalityScore;
    const isAI = results.aiAnalysis?.isLikelyAI || results.geminiAnalysis?.isAIGenerated;
    const aiScore = Math.max(
        results.aiAnalysis?.aiScore || 0,
        results.geminiAnalysis?.aiConfidence || 0
    );

    if (isAI && aiScore > 60) {
        results.verdict = 'AI_GENERATED';
    } else if (compareWith && results.jscpdAnalysis?.similarity > 70) {
        results.verdict = 'PLAGIARIZED';
    } else if (compareWith && (results.jscpdAnalysis?.similarity > 40 || (results.structuralAnalysis?.combined > 60))) {
        results.verdict = 'HIGH_SIMILARITY';
    } else if (results.commonAlgorithms.length > 0 && results.commonAlgorithms[0].similarity > 80) {
        results.verdict = 'COMMON_ALGORITHM';
    } else if (os >= 80) {
        results.verdict = 'ORIGINAL';
    } else if (os >= 50) {
        results.verdict = 'MODERATE_SIMILARITY';
    } else {
        results.verdict = 'LIKELY_PLAGIARIZED';
    }

    results.processingTime = Date.now() - startTime;
    console.log(`[CODE PLAG] Done: ${results.originalityScore}%, ${results.verdict}, ${results.processingTime}ms`);

    return results;
}

// ============================================
// UTILITY: LCS Algorithm
// ============================================

function longestCommonSubsequence(arr1, arr2) {
    const m = arr1.length;
    const n = arr2.length;

    if (m === 0 || n === 0) return 0;

    // Optimize for very long sequences — limit to first 500 tokens
    const a = arr1.length > 500 ? arr1.slice(0, 500) : arr1;
    const b = arr2.length > 500 ? arr2.slice(0, 500) : arr2;

    const rows = a.length;
    const cols = b.length;

    // Space-optimized LCS (only keep two rows)
    let prev = new Array(cols + 1).fill(0);
    let curr = new Array(cols + 1).fill(0);

    for (let i = 1; i <= rows; i++) {
        for (let j = 1; j <= cols; j++) {
            if (a[i - 1] === b[j - 1]) {
                curr[j] = prev[j - 1] + 1;
            } else {
                curr[j] = Math.max(prev[j], curr[j - 1]);
            }
        }
        [prev, curr] = [curr, new Array(cols + 1).fill(0)];
    }

    return prev[cols];
}
