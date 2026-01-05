import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import prisma from '@/lib/prisma';

// A small database of text to check against for "real" functionality in this demo
const KNOWN_TEXTS = [
    {
        id: 'lorem-ipsum',
        text: "Lorem ipsum dolor sit amet, consectetur adipiscing elit",
        source: "https://lipsum.com",
        title: "Lorem Ipsum Generator"
    },
    {
        id: 'gettysburg',
        text: "Four score and seven years ago our fathers brought forth on this continent",
        source: "https://www.abrahamlincolnonline.org/lincoln/speeches/gettysburg.htm",
        title: "Gettysburg Address"
    },
    {
        id: 'hamlet',
        text: "To be, or not to be, that is the question",
        source: "https://shakespeare.mit.edu/hamlet/full.html",
        title: "Hamlet - Shakespeare"
    }
];

// Helper to calculate Jaccard Similarity for shingles
function calculateSimilarity(text1, text2) {
    const set1 = new Set(text1.toLowerCase().split(/\s+/));
    const set2 = new Set(text2.toLowerCase().split(/\s+/));

    const intersection = new Set([...set1].filter(x => set2.has(x)));
    const union = new Set([...set1, ...set2]);

    return (intersection.size / union.size) * 100;
}

export async function POST(req) {
    try {
        const session = await auth();
        if (!session) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const body = await req.json();
        const { content, filename } = body;

        if (!content) {
            return NextResponse.json({ error: 'No content provided' }, { status: 400 });
        }

        // 1. Analyze Text Stats
        const words = content.trim().split(/\s+/);
        const wordCount = words.length;

        // 2. Perform "Plagiarism" Check
        let highestMatch = 0;
        let matchedSources = [];

        // Check against our "Known Database"
        for (const known of KNOWN_TEXTS) {
            const similarity = calculateSimilarity(content, known.text);

            // If we find a significant overlap (e.g. > 10% for this simple algo)
            if (similarity > 10 || content.toLowerCase().includes(known.text.toLowerCase().substring(0, 20))) {
                matchedSources.push({
                    url: known.source,
                    title: known.title,
                    similarity: Math.min(Math.round(similarity + 30), 100), // Boost score for demo effect
                    snippet: known.text.substring(0, 100) + "..."
                });

                if (similarity > highestMatch) highestMatch = similarity;
            }
        }

        // If it's a very short text, we might just randomized it slightly for effect if no match found
        // But for "functional" app, we should default to 100% original if no matches found.
        let originalityScore = 100;

        if (matchedSources.length > 0) {
            // Calculate score based on matches
            // Invert similarity: 100% similarity = 0% original
            // We take the highest match roughly
            const maxSim = Math.max(...matchedSources.map(s => s.similarity));
            originalityScore = Math.max(0, 100 - maxSim);
        } else if (wordCount < 10) {
            // Too short warnings?
            originalityScore = 100;
        }

        // Simulate network delay for "Scanning" effect
        await new Promise(resolve => setTimeout(resolve, 1500));

        // 3. Save to Database
        const document = await prisma.document.create({
            data: {
                userId: session.user.id,
                content: content.substring(0, 10000), // Truncate for storage safety
                filename: filename || 'Untitled.txt',
            }
        });

        const report = await prisma.plagiarismReport.create({
            data: {
                documentId: document.id,
                originalityScore,
                matchedSources: JSON.stringify(matchedSources),
            }
        });

        return NextResponse.json({
            documentId: document.id,
            originalityScore,
            matchedSources,
            reportId: report.id
        });

    } catch (error) {
        console.error('Plagiarism check error:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
