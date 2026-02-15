import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { analyzeCodePlagiarism, detectLanguage } from '@/lib/codePlagiarism';
import { GoogleGenerativeAI } from '@google/generative-ai';

// Initialize Gemini AI
let genAI = null;
if (process.env.GEMINI_API_KEY) {
    genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
}

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

        console.log(`\n========== CODE PLAGIARISM ANALYSIS START ==========`);
        console.log(`Code length: ${code.length} chars | Language: ${language} | Compare: ${compareWith ? 'Yes' : 'No'}`);

        // Run the full multi-engine analysis
        const results = await analyzeCodePlagiarism(code, language, genAI, compareWith || null);

        console.log(`========== CODE PLAGIARISM DONE: ${results.originalityScore}%, ${results.verdict}, ${results.processingTime}ms ==========\n`);

        return NextResponse.json(results);

    } catch (error) {
        console.error('Code Plagiarism Error:', error);
        return NextResponse.json({ error: 'Internal Server Error: ' + error.message }, { status: 500 });
    }
}
