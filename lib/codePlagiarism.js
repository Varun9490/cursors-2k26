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
            // Single-code analysis mode — AGGRESSIVE AI DETECTION
            prompt = `You are the world's foremost expert in detecting AI-generated code vs human-written code. You have studied millions of code samples from ChatGPT, Claude, Copilot, Gemini, DeepSeek, and other LLMs.

Analyze this code with EXTREME scrutiny for AI generation. Be SKEPTICAL — assume code is AI-generated unless there is strong evidence of human authorship.

## AI-GENERATED CODE FINGERPRINTS (check ALL of these):
1. **Comment style**: AI writes explanatory comments like "# This function...", "# Step 1:", "# Check if...", "# Handle edge case". Humans write terse or no comments.
2. **Variable naming**: AI uses generic names (result, data, temp, node, visited, output, ans, count). Humans use domain-specific names.
3. **Perfect structure**: AI code has perfect indentation, consistent style, logical flow. Human code has quirks, shortcuts, inconsistencies.
4. **Textbook solutions**: AI writes the standard textbook implementation. Humans write idiomatic or shortcut versions.
5. **Error handling**: AI either adds perfect try/catch or none at all. Humans add targeted error handling.
6. **Documentation**: AI over-documents with docstrings/JSDoc on every function. Humans document selectively.
7. **Edge cases**: AI handles edge cases it was trained on (null, empty, 0, 1) but in a formulaic way.
8. **Import style**: AI imports exactly what's needed, no unused imports. Humans often have extras.
9. **Function decomposition**: AI creates helper functions with descriptive names. Humans inline more.
10. **Type hints**: AI in Python adds type hints everywhere. Humans use them selectively.
11. **String formatting**: AI uses f-strings/template literals consistently. Humans mix styles.
12. **Return patterns**: AI has clean single-return or early-return patterns. Humans are messier.
13. **Code found on websites**: Code matching tutorials, GeeksForGeeks, LeetCode solutions, StackOverflow answers should score LOW originality.
14. **Algorithmic patterns**: Standard implementations of sorting, searching, graph traversal, dynamic programming are NOT original.
15. **Boilerplate patterns**: Flask/Express/React boilerplate that matches documentation examples is AI-likely.

## IMPORTANT SCORING RULES:
- A standard sorting algorithm implementation = originalityScore 10-25, isAIGenerated likely true
- Code matching common tutorial patterns = originalityScore 15-30
- Code with heavy comments explaining each step = strong AI indicator
- Code with perfect structure but generic naming = AI confidence 70%+
- Only give originalityScore > 70 if the code shows GENUINE human characteristics like: unusual variable names, personal coding style, domain-specific logic, inconsistent commenting, creative solutions

Language: ${language}
Code:
\`\`\`
${code.substring(0, 4000)}
\`\`\`

Respond ONLY with this exact JSON format (no markdown, no explanation outside JSON):
{
  "originalityScore": <number 0-100, BE HARSH — most code scores 20-50>,
  "isAIGenerated": <boolean — when in doubt, say true>,
  "aiConfidence": <number 0-100>,
  "isCommonAlgorithm": <boolean>,
  "algorithmName": "<name or null>",
  "plagiarismRisk": "<NONE|LOW|MODERATE|HIGH|VERY_HIGH>",
  "codeQuality": <number 0-100>,
  "reasoning": "<detailed 3-5 sentence forensic analysis explaining exactly WHY this looks AI-generated or human-written, citing specific lines/patterns>",
  "keyFindings": ["<specific finding with line reference>", "<finding2>", "<finding3>"],
  "suspiciousPatterns": ["<specific AI pattern found>", "<pattern2>"],
  "suggestedSources": ["<potential source website/tutorial>", "<source2>"]
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

/**
 * AST-based single-code analysis using token structure
 * Detects: variable naming patterns, code structure complexity, repetition,
 * whether variables are meaningfully used or just renamed copies
 */
export function analyzeCodeAST(code, format = 'javascript') {
    try {
        const tokens = tokenize(code, format);
        if (tokens.length === 0) return analyzeCodeASTFallback(code);

        const identifiers = tokens.filter(t => t.type === 'variable' || t.type === 'def' || t.type === 'variable-2' || t.type === 'variable-3' || t.type === 'property');
        const keywords = tokens.filter(t => t.type === 'keyword');
        const operators = tokens.filter(t => t.type === 'operator');
        const strings = tokens.filter(t => t.type === 'string' || t.type === 'string-2');
        const numbers = tokens.filter(t => t.type === 'number');
        const comments = tokens.filter(t => t.type === 'comment');

        // Extract unique identifier names
        const identifierNames = identifiers.map(t => t.value);
        const uniqueIdentifiers = [...new Set(identifierNames)];

        // Check for generic/AI-typical variable names
        const genericNames = ['result', 'data', 'value', 'item', 'temp', 'num', 'arr', 'lst', 'output', 'ret', 'ans', 'res', 'val', 'obj', 'str', 'cnt', 'idx', 'tmp', 'x', 'y', 'n', 'i', 'j', 'k', 'a', 'b', 'c', 'flag', 'count', 'sum', 'max_val', 'min_val', 'curr', 'prev', 'next_val', 'node', 'head', 'tail', 'left', 'right', 'mid', 'start', 'end', 'low', 'high', 'key', 'target', 'index', 'length', 'size'];
        const genericCount = uniqueIdentifiers.filter(name => genericNames.includes(name.toLowerCase())).length;
        const genericRatio = uniqueIdentifiers.length > 0 ? genericCount / uniqueIdentifiers.length : 0;

        // Check for single-letter variables (common in AI-generated code)
        const singleLetterVars = uniqueIdentifiers.filter(name => name.length === 1).length;
        const singleLetterRatio = uniqueIdentifiers.length > 0 ? singleLetterVars / uniqueIdentifiers.length : 0;

        // Check for camelCase vs snake_case consistency (AI is always consistent)
        const camelCase = uniqueIdentifiers.filter(n => /^[a-z][a-zA-Z0-9]*$/.test(n) && /[A-Z]/.test(n)).length;
        const snakeCase = uniqueIdentifiers.filter(n => /^[a-z][a-z0-9_]*$/.test(n) && /_/.test(n)).length;
        const namingConsistency = (camelCase > 0 && snakeCase === 0) || (snakeCase > 0 && camelCase === 0) ? 1.0 : 0.5;

        // Token type distribution (AI code has predictable distribution)
        const totalTokens = tokens.length;
        const keywordRatio = keywords.length / Math.max(1, totalTokens);
        const identifierRatio = identifiers.length / Math.max(1, totalTokens);
        const commentRatio = comments.length / Math.max(1, totalTokens);

        // Check for repetitive patterns in token sequence
        const tokenTypeSeq = tokens.map(t => t.type).join(',');
        const patterns4 = getNgrams(tokens.map(t => t.type), 4);
        const patterns8 = getNgrams(tokens.map(t => t.type), 8);
        const repetitionScore = 1 - (patterns4.size / Math.max(1, tokens.length - 3));

        // Detect if variable names look like they were systematically renamed
        // (AI or plagiarism tool renaming: all vars follow same pattern)
        const namePatterns = uniqueIdentifiers.map(n => {
            if (/^[a-z]$/.test(n)) return 'single';
            if (/^[a-z]{2,4}$/.test(n)) return 'short';
            if (/^[a-z]+_[a-z]+$/.test(n)) return 'snake';
            if (/^[a-z]+[A-Z][a-z]+/.test(n)) return 'camel';
            if (/^[A-Z][a-z]+/.test(n)) return 'pascal';
            return 'other';
        });
        const namePatternCounts = {};
        namePatterns.forEach(p => namePatternCounts[p] = (namePatternCounts[p] || 0) + 1);
        const dominantPattern = Math.max(...Object.values(namePatternCounts));
        const variableRenamingScore = uniqueIdentifiers.length > 3 ? dominantPattern / uniqueIdentifiers.length : 0;

        // Complexity metrics
        const lines = code.split('\n');
        const nonEmptyLines = lines.filter(l => l.trim().length > 0).length;
        const avgLineLength = lines.reduce((sum, l) => sum + l.length, 0) / Math.max(1, lines.length);
        const maxNesting = calculateMaxNesting(code);

        return {
            method: 'jscpd-ast',
            totalTokens,
            identifierCount: identifiers.length,
            uniqueIdentifiers: uniqueIdentifiers.length,
            genericVariableRatio: Math.round(genericRatio * 100),
            singleLetterRatio: Math.round(singleLetterRatio * 100),
            namingConsistency: Math.round(namingConsistency * 100),
            keywordRatio: Math.round(keywordRatio * 100),
            commentRatio: Math.round(commentRatio * 100),
            repetitionScore: Math.round(repetitionScore * 100),
            variableRenamingScore: Math.round(variableRenamingScore * 100),
            maxNesting,
            avgLineLength: Math.round(avgLineLength),
            tokenDistribution: {
                keywords: keywords.length,
                identifiers: identifiers.length,
                operators: operators.length,
                strings: strings.length,
                numbers: numbers.length,
                comments: comments.length,
            },
            variableNames: uniqueIdentifiers.slice(0, 20),
            issues: buildASTIssues(genericRatio, singleLetterRatio, namingConsistency, variableRenamingScore, repetitionScore, maxNesting, commentRatio),
        };
    } catch (error) {
        console.error('[AST] Error:', error.message);
        return analyzeCodeASTFallback(code);
    }
}

function analyzeCodeASTFallback(code) {
    const tokens = simpleTokenize(code);
    const uniqueTokens = [...new Set(tokens)];
    return {
        method: 'fallback-ast',
        totalTokens: tokens.length,
        uniqueIdentifiers: uniqueTokens.length,
        genericVariableRatio: 0,
        singleLetterRatio: 0,
        namingConsistency: 50,
        variableRenamingScore: 0,
        issues: [],
    };
}

function calculateMaxNesting(code) {
    let maxNest = 0, current = 0;
    for (const ch of code) {
        if (ch === '{' || ch === '(') { current++; maxNest = Math.max(maxNest, current); }
        if (ch === '}' || ch === ')') { current = Math.max(0, current - 1); }
    }
    // Also check Python-style indentation nesting
    const lines = code.split('\n');
    const indents = lines.map(l => (l.match(/^(\s*)/)?.[1]?.length || 0));
    const maxIndent = Math.max(...indents);
    const indentNest = Math.floor(maxIndent / 4);
    return Math.max(maxNest, indentNest);
}

function buildASTIssues(genericRatio, singleLetterRatio, namingConsistency, variableRenamingScore, repetitionScore, maxNesting, commentRatio) {
    const issues = [];
    if (genericRatio > 0.5) issues.push(`⚠️ ${Math.round(genericRatio * 100)}% of variables use generic names (AI pattern)`);
    else if (genericRatio > 0.3) issues.push(`${Math.round(genericRatio * 100)}% generic variable names detected`);
    if (singleLetterRatio > 0.4) issues.push(`⚠️ ${Math.round(singleLetterRatio * 100)}% single-letter variables (textbook/AI pattern)`);
    if (namingConsistency >= 100) issues.push('Perfect naming convention consistency (AI pattern)');
    if (variableRenamingScore > 80) issues.push('⚠️ Variables follow uniform naming pattern — possible systematic renaming');
    if (repetitionScore > 40) issues.push(`Repetitive token patterns: ${Math.round(repetitionScore)}%`);
    if (maxNesting <= 2 && commentRatio > 0.08) issues.push('Low complexity with high comments — typical AI output');
    return issues;
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

// AI-generated code patterns (language-agnostic) — EXPANDED
const AI_CODE_PATTERNS = [
    // Comment patterns
    { pattern: /# Example/i, weight: 3, description: 'AI placeholder comment' },
    { pattern: /\/\/ Example/i, weight: 3, description: 'AI placeholder comment' },
    { pattern: /# TODO:/i, weight: 2, description: 'TODO comment' },
    { pattern: /\/\/ TODO:/i, weight: 2, description: 'TODO comment' },
    { pattern: /# This (function|code|script|method|class|program|module|implementation)/i, weight: 5, description: 'Generic AI descriptive comment' },
    { pattern: /\/\/ This (function|code|script|method|class|program|module|implementation)/i, weight: 5, description: 'Generic AI descriptive comment' },
    { pattern: /\/\*\*\s*\n\s*\*\s*@(param|returns|throws)/gi, weight: 3, description: 'Overly-verbose JSDoc' },
    { pattern: /"""[\s\S]{10,200}"""/g, weight: 3, description: 'AI docstring pattern' },
    { pattern: /'''[\s\S]{10,200}'''/g, weight: 3, description: 'AI docstring pattern' },
    { pattern: /# (Generate|Create|Check|Calculate|Get|Set|Handle|Process|Validate|Initialize|Define|Return|Implement|Convert|Parse|Update|Remove|Add|Find|Sort|Filter|Transform|Extract|Build|Compute|Compare|Merge)/im, weight: 4, description: 'AI imperative comment' },
    { pattern: /\/\/ (Generate|Create|Check|Calculate|Get|Set|Handle|Process|Validate|Initialize|Define|Return|Implement|Convert|Parse|Update|Remove|Add|Find|Sort|Filter|Transform|Extract|Build|Compute|Compare|Merge)/im, weight: 4, description: 'AI imperative comment' },
    { pattern: /# Step \d+/im, weight: 5, description: 'AI step-by-step comment' },
    { pattern: /\/\/ Step \d+/im, weight: 5, description: 'AI step-by-step comment' },
    // AI explanation patterns
    { pattern: /# (Here|Below|The following|This will|We need to|First|Next|Then|Finally)/im, weight: 4, description: 'AI explanatory comment' },
    { pattern: /\/\/ (Here|Below|The following|This will|We need to|First|Next|Then|Finally)/im, weight: 4, description: 'AI explanatory comment' },
    { pattern: /# (Base case|Edge case|Boundary|Helper|Utility|Main logic)/im, weight: 4, description: 'AI section labeling' },
    { pattern: /\/\/ (Base case|Edge case|Boundary|Helper|Utility|Main logic)/im, weight: 4, description: 'AI section labeling' },
    // Perfect error messages (AI always writes clean error messages)
    { pattern: /raise (ValueError|TypeError|Exception)\s*\(['"][A-Z]/g, weight: 3, description: 'Perfect error messages' },
    { pattern: /throw new (Error|TypeError)\s*\(['"][A-Z]/g, weight: 3, description: 'Perfect error messages' },
    // Overly descriptive function names
    { pattern: /def (calculate|check|validate|process|handle|generate|create|convert|parse|extract|transform|build|compute|get|set|is|has)_[a-z_]+\s*\(/g, weight: 2, description: 'AI-style descriptive function name' },
    { pattern: /function (calculate|check|validate|process|handle|generate|create|convert|parse|extract|transform|build|compute|get|set|is|has)[A-Z][a-zA-Z]+\s*\(/g, weight: 2, description: 'AI-style descriptive function name' },
];

// AI structural patterns — EXPANDED
const AI_STRUCTURAL_PATTERNS = [
    { pattern: /if.*:\s*\n\s*return (True|False|true|false)\s*\n\s*if/g, weight: 3, description: 'Simple sequential boolean returns' },
    { pattern: /result\s*=\s*\[\]\s*\n.*for.*:\s*\n.*\.append/g, weight: 4, description: 'List accumulator pattern (textbook AI)' },
    { pattern: /try\s*{[^}]+}\s*catch\s*\([^)]*\)\s*{\s*}/g, weight: 5, description: 'Empty catch blocks (AI pattern)' },
    { pattern: /function\s+\w+\s*\([^)]*\)\s*{\s*}/g, weight: 4, description: 'Empty function stubs' },
    { pattern: /if\s*\(.*===.*\)\s*{\s*\n\s*return/g, weight: 2, description: 'Simple if-return chains' },
    { pattern: /for\s*\(let\s+i\s*=\s*0;\s*i\s*<\s*\w+\.length;\s*i\+\+\)/g, weight: 3, description: 'Classic for loop (textbook pattern)' },
    { pattern: /for\s+\w+\s+in\s+range\s*\(/g, weight: 2, description: 'Python range loop (textbook)' },
    { pattern: /def\s+\w+\s*\([^)]*\)\s*->\s*(int|str|bool|float|list|dict|None)/g, weight: 3, description: 'Type-hinted function (AI convention)' },
    { pattern: /\bif\b.*\n.*\belif\b.*\n.*\belse\b/g, weight: 2, description: 'Clean if-elif-else chain' },
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
 * Detect AI-generated code patterns (language-agnostic) — ENHANCED
 */
export function detectAICodePatterns(code) {
    let aiScore = 0;
    const issues = [];
    const lines = code.split('\n');

    // Check AI text patterns
    for (const { pattern, weight, description } of AI_CODE_PATTERNS) {
        // Reset regex lastIndex for global patterns
        if (pattern.global) pattern.lastIndex = 0;
        const matches = code.match(pattern);
        if (matches) {
            aiScore += weight * Math.min(matches.length, 5);
            issues.push(`${description}: ${matches.length} occurrence(s)`);
        }
    }

    // Check structural patterns
    for (const { pattern, weight, description } of AI_STRUCTURAL_PATTERNS) {
        if (pattern.global) pattern.lastIndex = 0;
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
        l.trim().startsWith('*') ||
        l.trim().startsWith('"""') ||
        l.trim().startsWith("'''")
    ).length;
    const codeLines = lines.filter(l => l.trim().length > 0).length;
    const commentRatio = commentLines / Math.max(1, codeLines);

    if (commentRatio > 0.4) {
        aiScore += 8;
        issues.push(`High comment ratio: ${(commentRatio * 100).toFixed(0)}% — AI over-explains code`);
    } else if (commentRatio > 0.25) {
        aiScore += 5;
        issues.push(`Elevated comment ratio: ${(commentRatio * 100).toFixed(0)}%`);
    } else if (commentRatio > 0.15) {
        aiScore += 3;
        issues.push(`Moderate comments: ${(commentRatio * 100).toFixed(0)}%`);
    }

    // No error handling in substantial code
    const hasErrorHandling = /try|except|catch|raise|throw|panic|error(?:f)?/i.test(code);
    if (!hasErrorHandling && lines.length > 15) {
        aiScore += 5;
        issues.push('No error handling in substantial code (AI shortcut)');
    }

    // Generic variable names — EXPANDED list
    const genericVars = code.match(/\b(result|data|value|item|temp|num|arr|lst|output|ret|ans|res|val|obj|cnt|idx|tmp|flag|count|sum|total|current|previous|target|index|node|head|tail|matrix|grid|dp|memo|cache|visited|queue|stack)\b/gi) || [];
    if (genericVars.length > 6) {
        aiScore += 6;
        issues.push(`Generic variable names: ${genericVars.length} — typical AI naming`);
    } else if (genericVars.length > 3) {
        aiScore += 3;
        issues.push(`Generic variable names: ${genericVars.length}`);
    }

    // Perfect indentation uniformity
    const indentations = lines
        .filter(l => l.trim().length > 0)
        .map(l => l.match(/^(\s*)/)?.[1]?.length || 0)
        .filter(i => i > 0);
    if (indentations.length > 5) {
        const uniqueIndents = new Set(indentations);
        const minIndent = Math.min(...indentations.filter(i => i > 0));
        const allMultiples = indentations.every(i => i % minIndent === 0);
        if (allMultiples && uniqueIndents.size <= 4) {
            aiScore += 4;
            issues.push('Perfect indentation uniformity (AI pattern)');
        }
    }

    // Consistent line lengths (AI generates uniform-length lines)
    const lineLengths = lines.filter(l => l.trim().length > 0).map(l => l.length);
    if (lineLengths.length > 5) {
        const avgLen = lineLengths.reduce((s, l) => s + l, 0) / lineLengths.length;
        const variance = lineLengths.reduce((s, l) => s + Math.pow(l - avgLen, 2), 0) / lineLengths.length;
        const stdDev = Math.sqrt(variance);
        if (stdDev < avgLen * 0.3 && avgLen > 20) {
            aiScore += 3;
            issues.push('Uniform line lengths (AI consistency pattern)');
        }
    }

    // Alphabetical or logical ordering of functions/methods
    const funcNames = [];
    const funcPattern = /(?:def|function|func|fn)\s+(\w+)/g;
    let fm;
    while ((fm = funcPattern.exec(code)) !== null) {
        funcNames.push(fm[1]);
    }
    if (funcNames.length >= 3) {
        // Check if functions are in alphabetical order
        const sorted = [...funcNames].sort();
        if (JSON.stringify(funcNames) === JSON.stringify(sorted)) {
            aiScore += 4;
            issues.push('Functions in alphabetical order (AI organization)');
        }
    }

    // Perfect docstring/comment for every function
    const funcCount = (code.match(/(?:def|function|func|fn)\s+\w+/g) || []).length;
    const docCount = (code.match(/"""[\s\S]*?"""|'''[\s\S]*?'''|\/\*\*[\s\S]*?\*\/|#\s+\w+/g) || []).length;
    if (funcCount > 0 && docCount >= funcCount) {
        aiScore += 4;
        issues.push('Every function has documentation (AI thoroughness)');
    }

    // Type hints everywhere (Python AI pattern)
    const typeHintCount = (code.match(/:\s*(int|str|float|bool|list|dict|tuple|set|Optional|Union|Any|None)/g) || []).length;
    if (typeHintCount > 3) {
        aiScore += 3;
        issues.push(`Extensive type hints: ${typeHintCount} — AI convention`);
    }

    // Short code boost: short, clean, complete code snippets are AI-typical
    // Humans rarely submit tiny perfect self-contained snippets
    if (lines.length <= 15 && lines.length >= 3) {
        // Check if code is "complete" (has function/main/class structure)
        const isComplete = /\b(int\s+main|void\s+main|def\s+\w+|function\s+\w+|class\s+\w+|public\s+static|module\.exports)\b/.test(code);
        const hasIncludesOrImports = /^\s*(#include|import|from|using|require)\b/m.test(code);
        if (isComplete || hasIncludesOrImports) {
            aiScore += 8;
            issues.push('Short complete code snippet — typical AI output');
        }
        // Short code with zero syntax errors/issues is AI-like
        const hasBalancedBraces = (code.match(/\{/g) || []).length === (code.match(/\}/g) || []).length;
        const hasBalancedParens = (code.match(/\(/g) || []).length === (code.match(/\)/g) || []).length;
        if (hasBalancedBraces && hasBalancedParens) {
            aiScore += 5;
            issues.push('Perfectly balanced syntax in short snippet');
        }
    }

    // Normalize: scale raw score to 0-100 with aggressive curve
    // Use higher multiplier for short code since fewer patterns can match
    const multiplier = lines.length <= 15 ? 4.0 : lines.length <= 30 ? 3.0 : 2.5;
    aiScore = Math.min(100, Math.round(aiScore * multiplier));

    return {
        aiScore,
        isLikelyAI: aiScore > 20,
        issues,
        confidence: Math.min(95, 30 + lines.length / 2),
    };
}

// ============================================
// ENGINE 5: ENTROPY & INFORMATION THEORY
// ============================================

/**
 * Shannon entropy analysis — AI code has distinct entropy signatures
 * AI code tends to have lower token entropy (more predictable) but
 * higher character entropy (more variety of characters used uniformly)
 */
export function analyzeCodeEntropy(code) {
    const lines = code.split('\n').filter(l => l.trim().length > 0);

    // Character-level entropy
    const charFreq = {};
    for (const ch of code) {
        charFreq[ch] = (charFreq[ch] || 0) + 1;
    }
    const totalChars = code.length;
    let charEntropy = 0;
    for (const count of Object.values(charFreq)) {
        const p = count / totalChars;
        if (p > 0) charEntropy -= p * Math.log2(p);
    }

    // Token-level entropy (word-level)
    const words = code.match(/[a-zA-Z_][a-zA-Z0-9_]*/g) || [];
    const wordFreq = {};
    for (const w of words) {
        const lw = w.toLowerCase();
        wordFreq[lw] = (wordFreq[lw] || 0) + 1;
    }
    const totalWords = words.length;
    let tokenEntropy = 0;
    for (const count of Object.values(wordFreq)) {
        const p = count / totalWords;
        if (p > 0) tokenEntropy -= p * Math.log2(p);
    }

    // Line length entropy (how varied are line lengths)
    const lineLengths = lines.map(l => l.length);
    const lengthFreq = {};
    for (const len of lineLengths) {
        const bucket = Math.floor(len / 5) * 5; // Group by 5-char buckets
        lengthFreq[bucket] = (lengthFreq[bucket] || 0) + 1;
    }
    let lineLengthEntropy = 0;
    for (const count of Object.values(lengthFreq)) {
        const p = count / lines.length;
        if (p > 0) lineLengthEntropy -= p * Math.log2(p);
    }

    // Unique token ratio (AI uses fewer unique words per total words)
    const uniqueTokenRatio = Object.keys(wordFreq).length / Math.max(1, totalWords);

    // Bigram entropy (adjacent token pairs — AI has predictable bigrams)
    const bigrams = {};
    for (let i = 0; i < words.length - 1; i++) {
        const bg = words[i].toLowerCase() + '|' + words[i + 1].toLowerCase();
        bigrams[bg] = (bigrams[bg] || 0) + 1;
    }
    const totalBigrams = words.length - 1;
    let bigramEntropy = 0;
    for (const count of Object.values(bigrams)) {
        const p = count / Math.max(1, totalBigrams);
        if (p > 0) bigramEntropy -= p * Math.log2(p);
    }

    // AI detection heuristics from entropy
    const issues = [];
    let aiIndicatorScore = 0;

    // AI code typically has token entropy between 3.5-5.0 (predictable but varied)
    if (tokenEntropy >= 3.5 && tokenEntropy <= 5.0 && totalWords > 8) {
        aiIndicatorScore += 15;
        issues.push(`Token entropy ${tokenEntropy.toFixed(2)} in AI-typical range (3.5-5.0)`);
    }
    // Very low entropy for short code = very formulaic
    if (tokenEntropy < 3.5 && tokenEntropy > 0 && totalWords >= 5 && totalWords <= 30) {
        aiIndicatorScore += 10;
        issues.push(`Low token entropy ${tokenEntropy.toFixed(2)} — formulaic short code`);
    }

    // Low unique token ratio = repetitive/formulaic code
    if (uniqueTokenRatio < 0.35 && totalWords > 5) {
        aiIndicatorScore += 20;
        issues.push(`Low vocabulary diversity: ${(uniqueTokenRatio * 100).toFixed(0)}% unique tokens`);
    } else if (uniqueTokenRatio < 0.50 && totalWords > 5) {
        aiIndicatorScore += 10;
        issues.push(`Moderate vocabulary diversity: ${(uniqueTokenRatio * 100).toFixed(0)}% unique tokens`);
    }

    // Low line length entropy = uniform line lengths (AI pattern)
    if (lineLengthEntropy < 2.5 && lines.length > 2) {
        aiIndicatorScore += 15;
        issues.push(`Low line-length variation (entropy: ${lineLengthEntropy.toFixed(2)})`);
    }

    // Low bigram entropy = predictable token sequences
    if (bigramEntropy < 3.0 && totalBigrams > 5) {
        aiIndicatorScore += 10;
        issues.push(`Predictable token sequences (bigram entropy: ${bigramEntropy.toFixed(2)})`);
    }

    return {
        charEntropy: parseFloat(charEntropy.toFixed(3)),
        tokenEntropy: parseFloat(tokenEntropy.toFixed(3)),
        lineLengthEntropy: parseFloat(lineLengthEntropy.toFixed(3)),
        bigramEntropy: parseFloat(bigramEntropy.toFixed(3)),
        uniqueTokenRatio: parseFloat(uniqueTokenRatio.toFixed(3)),
        totalTokens: totalWords,
        uniqueTokens: Object.keys(wordFreq).length,
        aiIndicatorScore: Math.min(100, aiIndicatorScore),
        issues,
    };
}

// ============================================
// ENGINE 6: HALSTEAD COMPLEXITY METRICS
// ============================================

/**
 * Halstead complexity — AI code has specific complexity signatures
 * AI generates code with moderate complexity, low "difficulty", high "effort" uniformity
 */
export function analyzeHalsteadComplexity(code) {
    // Operators
    const operatorPatterns = /[+\-*/%=<>!&|^~?:;,.{}()\[\]]/g;
    const operators = code.match(operatorPatterns) || [];
    const uniqueOperators = new Set(operators);

    // Operands (identifiers, literals)
    const operandPatterns = /\b[a-zA-Z_][a-zA-Z0-9_]*\b/g;
    const stringLiterals = code.match(/(['"`])(?:(?!\1)[^\\]|\\.)*\1/g) || [];
    const numLiterals = code.match(/\b\d+\.?\d*\b/g) || [];
    const identifiers = code.match(operandPatterns) || [];

    // Remove keywords from operands
    const keywords = new Set(['if', 'else', 'for', 'while', 'return', 'function', 'def', 'class', 'import', 'from', 'const', 'let', 'var', 'try', 'catch', 'except', 'finally', 'throw', 'raise', 'new', 'this', 'self', 'true', 'false', 'null', 'none', 'and', 'or', 'not', 'in', 'is', 'async', 'await', 'yield', 'break', 'continue', 'switch', 'case', 'default', 'do', 'elif', 'with', 'as', 'pass', 'lambda', 'void', 'typeof', 'instanceof']);
    const operands = identifiers.filter(id => !keywords.has(id.toLowerCase()));
    const allOperands = [...operands, ...stringLiterals, ...numLiterals];
    const uniqueOperands = new Set(allOperands.map(o => o.toLowerCase()));

    const n1 = uniqueOperators.size; // unique operators
    const n2 = uniqueOperands.size;  // unique operands
    const N1 = operators.length;     // total operators
    const N2 = allOperands.length;   // total operands

    const vocabulary = n1 + n2;
    const length = N1 + N2;
    const volume = length > 0 && vocabulary > 0 ? length * Math.log2(vocabulary) : 0;
    const difficulty = n2 > 0 ? (n1 / 2) * (N2 / n2) : 0;
    const effort = volume * difficulty;
    const estimatedBugs = volume / 3000;

    // AI code signatures in Halstead metrics
    const issues = [];
    let aiIndicatorScore = 0;

    // AI code has moderate difficulty (5-25) — not too simple, not too complex
    if (difficulty >= 5 && difficulty <= 25 && length > 10) {
        aiIndicatorScore += 10;
        issues.push(`Difficulty ${difficulty.toFixed(1)} in AI-typical range (5-25)`);
    }

    // Low operand reuse ratio (AI doesn't reuse variables as much)
    const operandReuse = N2 / Math.max(1, n2);
    if (operandReuse < 3.0 && length > 10) {
        aiIndicatorScore += 15;
        issues.push(`Low variable reuse (${operandReuse.toFixed(1)}x) — AI creates new names`);
    }

    // AI code has very low estimated bugs (it's "too clean")
    if (estimatedBugs < 0.5 && length > 15) {
        aiIndicatorScore += 12;
        issues.push(`Very clean code (est. bugs: ${estimatedBugs.toFixed(2)}) — AI precision`);
    }

    // High vocabulary-to-length ratio = diverse but not deep code
    const vocabRatio = vocabulary / Math.max(1, length);
    if (vocabRatio > 0.4 && length > 10) {
        aiIndicatorScore += 10;
        issues.push(`High vocabulary ratio (${(vocabRatio * 100).toFixed(0)}%) — AI variety`);
    }

    return {
        vocabulary, length, volume: parseFloat(volume.toFixed(1)),
        difficulty: parseFloat(difficulty.toFixed(2)),
        effort: parseFloat(effort.toFixed(1)),
        estimatedBugs: parseFloat(estimatedBugs.toFixed(3)),
        uniqueOperators: n1, uniqueOperands: n2,
        totalOperators: N1, totalOperands: N2,
        operandReuse: parseFloat(operandReuse.toFixed(2)),
        aiIndicatorScore: Math.min(100, aiIndicatorScore),
        issues,
    };
}

// ============================================
// ENGINE 7: CODE NATURALNESS SCORING
// ============================================

/**
 * Measures how "natural" vs "synthetic" code looks
 * Human code has personality; AI code is clinical
 */
export function analyzeCodeNaturalness(code) {
    const lines = code.split('\n');
    const nonEmptyLines = lines.filter(l => l.trim().length > 0);
    let naturalScore = 100; // Start perfect, subtract for AI indicators
    const issues = [];

    // 1. Check for mixed style (humans mix styles, AI is consistent)
    const hasSemicolons = /;\s*$/.test(code);
    const hasNoSemicolons = nonEmptyLines.some(l =>
        /^\s*(const|let|var|return)\b/.test(l) && !l.trim().endsWith(';') && !l.trim().endsWith('{') && !l.trim().endsWith(',')
    );
    const mixedSemicolons = hasSemicolons && hasNoSemicolons;
    if (!mixedSemicolons && nonEmptyLines.length > 3) {
        naturalScore -= 8;
        issues.push('Perfectly consistent semicolon usage (AI pattern)');
    }

    // 2. Check for trailing whitespace (humans leave it, AI doesn't)
    const trailingWhitespace = lines.filter(l => l !== l.trimEnd() && l.trim().length > 0).length;
    if (trailingWhitespace === 0 && lines.length > 2) {
        naturalScore -= 8;
        issues.push('Zero trailing whitespace (AI clean output)');
    }

    // 3. Check blank line patterns (AI uses uniform blank line spacing)
    const blankLinePositions = [];
    lines.forEach((l, i) => { if (l.trim().length === 0) blankLinePositions.push(i); });
    if (blankLinePositions.length >= 3) {
        const gaps = [];
        for (let i = 1; i < blankLinePositions.length; i++) {
            gaps.push(blankLinePositions[i] - blankLinePositions[i - 1]);
        }
        const avgGap = gaps.reduce((s, g) => s + g, 0) / gaps.length;
        const gapVariance = gaps.reduce((s, g) => s + Math.pow(g - avgGap, 2), 0) / gaps.length;
        if (gapVariance < 3 && gaps.length >= 2) {
            naturalScore -= 10;
            issues.push('Uniform blank line spacing (AI formatting)');
        }
    }

    // 4. Check comment placement (AI puts comments before every block)
    const commentBeforeBlock = lines.filter((l, i) => {
        if (i >= lines.length - 1) return false;
        const isComment = l.trim().startsWith('#') || l.trim().startsWith('//');
        const nextIsCode = lines[i + 1].trim().length > 0 && !lines[i + 1].trim().startsWith('#') && !lines[i + 1].trim().startsWith('//');
        return isComment && nextIsCode;
    }).length;
    const totalComments = lines.filter(l => l.trim().startsWith('#') || l.trim().startsWith('//')).length;
    if (totalComments > 0 && commentBeforeBlock / totalComments > 0.8) {
        naturalScore -= 12;
        issues.push('Comments always precede code blocks (AI documentation style)');
    }

    // 5. Check for inline comments (humans use inline comments more than AI)
    const inlineComments = lines.filter(l => {
        const trimmed = l.trim();
        return !trimmed.startsWith('#') && !trimmed.startsWith('//') &&
            (trimmed.includes(' # ') || trimmed.includes(' // '));
    }).length;
    if (inlineComments === 0 && totalComments > 2) {
        naturalScore -= 8;
        issues.push('No inline comments — only block comments (AI pattern)');
    }

    // 6. Check for print/log/debug statements (humans leave debug code, AI doesn't)
    const hasDebugCode = /\b(console\.log|print|System\.out|printf|fmt\.Print|log\.Print|Debug|debugger)\b/.test(code);
    if (!hasDebugCode && nonEmptyLines.length > 5) {
        naturalScore -= 8;
        issues.push('No debug/print statements (AI produces clean output)');
    }

    // 7. Check for commented-out code (humans leave dead code, AI doesn't)
    const commentedOutCode = lines.filter(l => {
        const t = l.trim();
        return (t.startsWith('# ') || t.startsWith('// ')) &&
            (/[={}()\[\];]/.test(t) || /^(#|\/\/)\s*(if|for|while|return|def|function|class|import)\b/.test(t));
    }).length;
    if (commentedOutCode === 0 && nonEmptyLines.length > 5) {
        naturalScore -= 8;
        issues.push('No commented-out code (AI produces final code)');
    }

    // 8. Perfect line length consistency (AI wraps at consistent column)
    const codeLengths = nonEmptyLines.filter(l => !l.trim().startsWith('#') && !l.trim().startsWith('//')).map(l => l.length);
    if (codeLengths.length > 2) {
        const maxLen = Math.max(...codeLengths);
        // Check if lines are wrapped near a common column (79, 80, 88, 100, 120)
        const nearWraps = [79, 80, 88, 100, 120];
        for (const wrap of nearWraps) {
            const nearWrap = codeLengths.filter(l => l >= wrap - 2 && l <= wrap + 2).length;
            if (nearWrap >= 2) {
                naturalScore -= 8;
                issues.push(`Lines wrap near column ${wrap} (AI line-length convention)`);
                break;
            }
        }
    }

    // 11. Short, self-contained, compilable code (AI hallmark)
    if (nonEmptyLines.length <= 20 && nonEmptyLines.length >= 3) {
        const hasReturn = /\breturn\b/.test(code);
        const hasFunction = /\b(function|def|int\s+main|void\s+main|public\s+static)\b/.test(code);
        const hasImport = /^\s*(#include|import|from|using|require)/m.test(code);
        const isComplete = (hasFunction || hasImport) && hasReturn;
        if (isComplete) {
            naturalScore -= 15;
            issues.push('Short, self-contained, complete code — strong AI indicator');
        }
        // No TODO/FIXME/HACK comments (humans leave these)
        const hasTodoMarkers = /\b(TODO|FIXME|HACK|XXX|TEMP|WORKAROUND)\b/.test(code);
        if (!hasTodoMarkers) {
            naturalScore -= 5;
            issues.push('No TODO/FIXME markers (AI produces finished code)');
        }
    }

    // 9. Check variable declaration grouping (AI groups declarations, humans scatter)
    const declPatterns = /^\s*(const|let|var|int|float|double|string|bool|char)\s/;
    const declLines = nonEmptyLines.map((l, i) => ({ line: l, idx: i, isDecl: declPatterns.test(l) }));
    const declarationRuns = [];
    let currentRun = 0;
    for (const dl of declLines) {
        if (dl.isDecl) currentRun++;
        else if (currentRun > 0) { declarationRuns.push(currentRun); currentRun = 0; }
    }
    if (currentRun > 0) declarationRuns.push(currentRun);
    const longDeclarationRuns = declarationRuns.filter(r => r >= 3).length;
    if (longDeclarationRuns >= 2) {
        naturalScore -= 7;
        issues.push('Variables declared in grouped blocks (AI organization)');
    }

    // 10. Early return pattern consistency (AI always uses early returns)
    const funcBodies = code.match(/(?:function|def|=>)\s*[^{]*\{([^}]*)\}/g) || [];
    const earlyReturns = (code.match(/^\s*if\s*\(.*\)\s*return/gm) || []).length;
    if (earlyReturns >= 3 && funcBodies.length <= 5) {
        naturalScore -= 6;
        issues.push('Consistent early-return pattern (AI guard clause style)');
    }

    const aiIndicatorScore = Math.max(0, 100 - naturalScore);

    return {
        naturalScore: Math.max(0, naturalScore),
        aiIndicatorScore: Math.min(100, aiIndicatorScore),
        issues,
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
        astAnalysis: null,
        entropyAnalysis: null,
        halsteadAnalysis: null,
        naturalnessAnalysis: null,
        commonAlgorithms: [],
        aiAnalysis: null,
        aiGeneratedPercentage: 0,
        humanWrittenPercentage: 100,
        originalityScore: 100,
        verdict: 'ORIGINAL',
        explanation: '',
        issues: [],
        processingTime: 0,
    };

    // Step 2: JSCPD Clone Detection
    try {
        if (compareWith) {
            results.jscpdAnalysis = await detectClonesWithJscpd(code, compareWith, jscpdFormat);
            console.log(`[JSCPD] Cross-clone similarity: ${results.jscpdAnalysis.similarity}%, Clones: ${results.jscpdAnalysis.cloneCount}`);
        } else {
            results.jscpdAnalysis = await detectClonesWithJscpd(code, null, jscpdFormat);
            console.log(`[JSCPD] Self-clones: ${results.jscpdAnalysis.selfCloneCount}`);
        }
    } catch (err) {
        console.error('[JSCPD] Error:', err.message);
    }

    // Step 3: Common Algorithm Detection
    results.commonAlgorithms = detectCommonAlgorithm(code);

    // Step 4: AI Pattern Detection (local — always runs)
    results.aiAnalysis = detectAICodePatterns(code);

    // Step 5: AST/Token Structural Analysis
    results.astAnalysis = analyzeCodeAST(code, jscpdFormat);
    console.log(`[AST] Generic vars: ${results.astAnalysis.genericVariableRatio}%, Renaming: ${results.astAnalysis.variableRenamingScore}%`);

    // Step 6: Entropy Analysis (NEW)
    results.entropyAnalysis = analyzeCodeEntropy(code);
    console.log(`[ENTROPY] Token entropy: ${results.entropyAnalysis.tokenEntropy}, AI score: ${results.entropyAnalysis.aiIndicatorScore}`);

    // Step 7: Halstead Complexity (NEW)
    results.halsteadAnalysis = analyzeHalsteadComplexity(code);
    console.log(`[HALSTEAD] Difficulty: ${results.halsteadAnalysis.difficulty}, AI score: ${results.halsteadAnalysis.aiIndicatorScore}`);

    // Step 8: Code Naturalness (NEW)
    results.naturalnessAnalysis = analyzeCodeNaturalness(code);
    console.log(`[NATURALNESS] Natural score: ${results.naturalnessAnalysis.naturalScore}, AI score: ${results.naturalnessAnalysis.aiIndicatorScore}`);

    // Step 9: Structural Comparison (if compareWith provided)
    if (compareWith) {
        results.structuralAnalysis = compareCodeStructure(code, compareWith, jscpdFormat);
        console.log(`[STRUCTURE] Combined similarity: ${results.structuralAnalysis.combined}%`);
    }

    // Step 10: Gemini Analysis (if available)
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

    // Step 11: Calculate AI Generated Percentage from ALL 7 engines
    const aiSources = [];

    // Engine 1: Local pattern AI score (weight: 0.20)
    if (results.aiAnalysis) {
        aiSources.push({ source: 'local_patterns', score: results.aiAnalysis.aiScore, weight: 0.20 });
    }

    // Engine 2: AST-based AI indicators (weight: 0.15)
    if (results.astAnalysis) {
        const ast = results.astAnalysis;
        const astAIScore = Math.min(100, Math.round(
            (ast.genericVariableRatio || 0) * 0.4 +
            (ast.variableRenamingScore || 0) * 0.3 +
            (ast.namingConsistency >= 100 ? 25 : 0) +
            (ast.repetitionScore || 0) * 0.3 +
            (ast.singleLetterRatio > 30 ? 15 : 0) +
            ((ast.commentRatio || 0) > 10 ? 15 : 0)
        ));
        aiSources.push({ source: 'ast_analysis', score: astAIScore, weight: 0.15 });
    }

    // Engine 3: Entropy analysis (weight: 0.15)
    if (results.entropyAnalysis) {
        aiSources.push({ source: 'entropy', score: results.entropyAnalysis.aiIndicatorScore, weight: 0.15 });
    }

    // Engine 4: Halstead complexity (weight: 0.10)
    if (results.halsteadAnalysis) {
        aiSources.push({ source: 'halstead', score: results.halsteadAnalysis.aiIndicatorScore, weight: 0.10 });
    }

    // Engine 5: Code naturalness (weight: 0.15)
    if (results.naturalnessAnalysis) {
        aiSources.push({ source: 'naturalness', score: results.naturalnessAnalysis.aiIndicatorScore, weight: 0.15 });
    }

    // Engine 6: Gemini AI score (weight: 0.25) — highest because it's the most intelligent
    if (results.geminiAnalysis) {
        const geminiAI = results.geminiAnalysis.isAIGenerated
            ? Math.max(results.geminiAnalysis.aiConfidence || 70, 65)
            : Math.max(0, 100 - (results.geminiAnalysis.originalityScore || 50));
        aiSources.push({ source: 'gemini', score: geminiAI, weight: 0.25 });
    }

    // Calculate combined AI percentage
    if (aiSources.length > 0) {
        const totalWeight = aiSources.reduce((s, a) => s + a.weight, 0);
        const weightedAI = aiSources.reduce((s, a) => s + a.score * a.weight, 0) / totalWeight;

        // Count how many engines agree code is AI (score > 30)
        const agreeing = aiSources.filter(a => a.score > 30).length;
        const strongAgreeing = aiSources.filter(a => a.score > 50).length;
        const maxAI = Math.max(...aiSources.map(a => a.score));

        // Multi-engine consensus boost: if 3+ engines agree, increase confidence
        let consensusBoost = 0;
        if (strongAgreeing >= 3) consensusBoost = 20;
        else if (agreeing >= 4) consensusBoost = 15;
        else if (agreeing >= 3) consensusBoost = 10;
        else if (agreeing >= 2) consensusBoost = 5;

        const rawAI = Math.max(weightedAI, maxAI * 0.80);
        results.aiGeneratedPercentage = Math.min(100, Math.round(rawAI + consensusBoost));
        results.humanWrittenPercentage = Math.max(0, 100 - results.aiGeneratedPercentage);

        console.log(`[AI SCORING] Sources: ${aiSources.map(a => `${a.source}=${a.score}`).join(', ')} | Agreeing: ${agreeing}/${aiSources.length} | Consensus boost: +${consensusBoost} | Final: ${results.aiGeneratedPercentage}%`);
    }

    // Step 12: Calculate Final Originality Score
    let penalties = [];

    // --- jscpd penalty ---
    if (compareWith && results.jscpdAnalysis?.similarity > 0) {
        const jscpdPenalty = results.jscpdAnalysis.similarity;
        penalties.push({ source: 'jscpd', penalty: jscpdPenalty, weight: 0.35 });
        if (jscpdPenalty > 30) results.issues.push(`🔴 Copy-paste detected: ${jscpdPenalty}% duplicated lines (jscpd)`);
        else if (jscpdPenalty > 10) results.issues.push(`🟡 Some code similarity: ${jscpdPenalty}% overlapping tokens`);
    }

    // --- Structural comparison penalty ---
    if (compareWith && results.structuralAnalysis?.combined > 0) {
        const structPenalty = results.structuralAnalysis.combined;
        penalties.push({ source: 'structural', penalty: structPenalty, weight: 0.25 });
        if (structPenalty > 70) results.issues.push(`🔴 High structural similarity: ${structPenalty}%`);
        else if (structPenalty > 40) results.issues.push(`🟠 Moderate structural similarity: ${structPenalty}%`);
    }

    // --- Gemini penalty ---
    if (results.geminiAnalysis) {
        const gemini = results.geminiAnalysis;
        if (compareWith) {
            const geminiSim = gemini.similarity || 0;
            penalties.push({ source: 'gemini', penalty: geminiSim, weight: 0.40 });
            if (gemini.isPlagiarized) results.issues.push(`🔴 Gemini: Plagiarism detected — ${gemini.plagiarismType}`);
        } else {
            const geminiOriginality = gemini.originalityScore ?? 100;
            const geminiPenalty = 100 - geminiOriginality;
            penalties.push({ source: 'gemini', penalty: geminiPenalty, weight: 0.35 });
            if (gemini.isAIGenerated) results.issues.push(`🤖 Gemini: AI-generated code (${gemini.aiConfidence}% confidence)`);
            if (gemini.isCommonAlgorithm) results.issues.push(`📚 Gemini: Common algorithm — ${gemini.algorithmName}`);
            if (gemini.plagiarismRisk === 'HIGH' || gemini.plagiarismRisk === 'VERY_HIGH') results.issues.push(`🔴 Gemini: High plagiarism risk`);
            if (gemini.keyFindings?.length > 0) gemini.keyFindings.slice(0, 3).forEach(f => results.issues.push(`🧠 ${f}`));
        }
    }

    // --- Common algorithm penalty ---
    if (results.commonAlgorithms.length > 0) {
        const topAlgo = results.commonAlgorithms[0];
        const algoPenalty = topAlgo.similarity * 0.7;
        penalties.push({ source: 'algorithm', penalty: algoPenalty, weight: 0.15 });
        results.issues.push(`📚 Matches "${topAlgo.algorithm}" pattern (${topAlgo.similarity}% match)`);
    }

    // --- AI detection penalty (ALWAYS apply if any AI detected) ---
    if (results.aiGeneratedPercentage > 0) {
        penalties.push({ source: 'ai_detection', penalty: results.aiGeneratedPercentage, weight: 0.35 });
        if (results.aiGeneratedPercentage > 10) {
            results.issues.push(`🤖 AI-generated code probability: ${results.aiGeneratedPercentage}%`);
        }
    }

    // --- Add detailed issues from each engine ---
    if (results.entropyAnalysis?.issues?.length > 0) {
        results.issues.push(...results.entropyAnalysis.issues.slice(0, 3).map(i => `📊 Entropy: ${i}`));
    }
    if (results.halsteadAnalysis?.issues?.length > 0) {
        results.issues.push(...results.halsteadAnalysis.issues.slice(0, 2).map(i => `📐 Halstead: ${i}`));
    }
    if (results.naturalnessAnalysis?.issues?.length > 0) {
        results.issues.push(...results.naturalnessAnalysis.issues.slice(0, 3).map(i => `🔍 Naturalness: ${i}`));
    }
    if (results.astAnalysis?.issues?.length > 0) {
        results.issues.push(...results.astAnalysis.issues.slice(0, 3).map(i => `🔬 AST: ${i}`));
    }
    if (results.aiAnalysis?.issues?.length > 0) {
        results.issues.push(...results.aiAnalysis.issues.slice(0, 4).map(i => `  └─ ${i}`));
    }

    // Calculate weighted penalty
    if (penalties.length > 0) {
        const totalWeight = penalties.reduce((sum, p) => sum + p.weight, 0);
        const weightedPenalty = penalties.reduce((sum, p) => sum + (p.penalty * p.weight), 0) / totalWeight;
        const maxPenalty = Math.max(...penalties.map(p => p.penalty));
        // Use higher of: weighted average or 85% of max penalty
        const finalPenalty = Math.max(weightedPenalty, maxPenalty * 0.85);
        results.originalityScore = Math.max(0, Math.round(100 - finalPenalty));
    }

    // CRITICAL: Originality can NEVER be 100% if any AI is detected
    if (results.aiGeneratedPercentage > 5 && results.originalityScore >= 100) {
        results.originalityScore = Math.max(0, 100 - results.aiGeneratedPercentage);
    }

    // Step 13: Determine final verdict
    const os = results.originalityScore;
    const aiPct = results.aiGeneratedPercentage;

    if (aiPct >= 65) {
        results.verdict = 'AI_GENERATED';
    } else if (aiPct >= 35) {
        results.verdict = 'LIKELY_AI_GENERATED';
    } else if (compareWith && results.jscpdAnalysis?.similarity > 70) {
        results.verdict = 'PLAGIARIZED';
    } else if (compareWith && (results.jscpdAnalysis?.similarity > 40 || results.structuralAnalysis?.combined > 60)) {
        results.verdict = 'HIGH_SIMILARITY';
    } else if (results.commonAlgorithms.length > 0 && results.commonAlgorithms[0].similarity > 80) {
        results.verdict = 'COMMON_ALGORITHM';
    } else if (os >= 70) {
        results.verdict = 'ORIGINAL';
    } else if (os >= 40) {
        results.verdict = 'MODERATE_SIMILARITY';
    } else {
        results.verdict = 'LIKELY_PLAGIARIZED';
    }

    // Step 14: Build detailed explanation
    const explanationParts = [];
    explanationParts.push(`Detected language: ${detectedLang.charAt(0).toUpperCase() + detectedLang.slice(1)} (${langDetection.confidence || 0}% confidence).`);
    explanationParts.push(`Code is ${code.split('\n').length} lines, ${code.length} characters.`);
    explanationParts.push(`Analysis used ${aiSources.length} detection engines.`);

    if (aiPct >= 65) {
        explanationParts.push(`This code is ${aiPct}% likely AI-generated. Strong AI indicators detected across multiple engines including pattern analysis, entropy measurement, code naturalness scoring, and structural analysis.`);
    } else if (aiPct >= 35) {
        explanationParts.push(`This code shows ${aiPct}% AI-generation probability. Several patterns suggest AI assistance, including uniform naming, predictable structure, and low code entropy.`);
    } else if (aiPct > 15) {
        explanationParts.push(`Mild AI indicators detected (${aiPct}%). Some patterns resemble AI output but the code may be human-written.`);
    } else {
        explanationParts.push(`Low AI probability (${aiPct}%). The code shows human authorship characteristics.`);
    }

    if (results.commonAlgorithms.length > 0) {
        explanationParts.push(`Matches known "${results.commonAlgorithms[0].algorithm}" pattern (${results.commonAlgorithms[0].similarity}%).`);
    }

    if (results.entropyAnalysis) {
        const ent = results.entropyAnalysis;
        if (ent.uniqueTokenRatio < 0.40) {
            explanationParts.push(`Entropy analysis: Low vocabulary diversity (${(ent.uniqueTokenRatio * 100).toFixed(0)}% unique tokens) suggests formulaic/AI code.`);
        }
    }

    if (results.naturalnessAnalysis && results.naturalnessAnalysis.naturalScore < 60) {
        explanationParts.push(`Code naturalness score: ${results.naturalnessAnalysis.naturalScore}/100 — code appears synthetic/AI-generated rather than naturally human-written.`);
    }

    if (results.astAnalysis) {
        const ast = results.astAnalysis;
        if (ast.genericVariableRatio > 30) {
            explanationParts.push(`AST: ${ast.genericVariableRatio}% generic variable names detected.`);
        }
        if (ast.variableRenamingScore > 60) {
            explanationParts.push(`AST: Uniform variable naming pattern (${ast.variableRenamingScore}%) — possible systematic renaming.`);
        }
    }

    if (results.geminiAnalysis?.reasoning) {
        explanationParts.push(`AI Analysis: ${results.geminiAnalysis.reasoning}`);
    }

    explanationParts.push(`Originality: ${results.originalityScore}%. Human: ${results.humanWrittenPercentage}%. AI: ${results.aiGeneratedPercentage}%.`);

    results.explanation = explanationParts.join(' ');

    results.processingTime = Date.now() - startTime;
    console.log(`[CODE PLAG] Done: orig=${results.originalityScore}%, ai=${results.aiGeneratedPercentage}%, verdict=${results.verdict}, ${results.processingTime}ms`);

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
