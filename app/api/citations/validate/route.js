import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import prisma from '@/lib/prisma';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { parseCitations } from '@/lib/citationParser';
import { validateDOI, checkURL, detectAIHallucination } from '@/lib/citationValidation';
import pLimit from 'p-limit';

let genAI;
if (process.env.GEMINI_API_KEY) {
    genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
}

export async function POST(req) {
    try {
        const session = await auth();
        if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

        const { text, documentId } = await req.json();

        // 1. Parse Citations
        const citations = parseCitations(text);

        if (citations.length === 0) {
            return NextResponse.json({ message: "No citations found", citations: [] });
        }

        // 2. Validate Citations (Concurrency Limit: 5)
        const limit = pLimit(5);

        const validationPromises = citations.map((citation) => limit(async () => {
            let score = 0; // 0-100
            let status = 'INVALID';
            let issues = [];
            let details = {};

            // A. Check for URL/DOI in text
            const doiMatch = citation.rawText.match(/10.\d{4,9}\/[-._;()/:A-Z0-9]+/i);
            const urlMatch = citation.rawText.match(/https?:\/\/[^\s]+/);

            if (doiMatch) {
                const doiRes = await validateDOI(doiMatch[0]);
                details.doi = doiRes;
                if (doiRes.valid) score += 50;
                else issues.push(`Invalid DOI: ${doiRes.reason}`);
            }

            if (urlMatch) {
                const urlRes = await checkURL(urlMatch[0]);
                details.url = urlRes;
                if (urlRes.valid) score += 30; // Live link is good sign
                else issues.push(`Broken Link (Status: ${urlRes.status})`);
            }

            // B. AI Hallucination Check
            // If we verified via DOI/URL, we trust it more. If not, AI opinion matters more.
            const aiRes = await detectAIHallucination(citation.rawText, genAI);
            details.ai = aiRes;

            if (aiRes.likelyFake) {
                score -= 50; // Penalty
                issues.push(...(aiRes.reasons || ["AI flagged as suspicious"]));
            } else {
                if (!doiMatch && !urlMatch) score += 40; // Looks real to AI
            }

            // C. Final Scoring
            if (doiMatch || urlMatch) {
                if (score >= 50) status = 'VERIFIED';
                else status = 'SUSPICIOUS';
            } else {
                // No digital identifiers
                if (score > 30) status = 'SUSPICIOUS'; // Can't verify but looks ok
                else status = 'INVALID';
            }

            // Normalize score
            score = Math.max(0, Math.min(100, score));

            return {
                ...citation,
                validityScore: score,
                status,
                issues,
                verificationDetails: details,
                verifiedAt: new Date()
            };
        }));

        const validatedCitations = await Promise.all(validationPromises);

        // 3. Save to DB (if documentId provided)
        if (documentId) {
            await prisma.citation.createMany({
                data: validatedCitations.map(c => ({
                    documentId,
                    citationText: c.rawText, // truncated
                    validityStatus: c.status,
                    status: c.status,
                    validityScore: c.validityScore,
                    issues: JSON.stringify(c.issues),
                    verificationDetails: JSON.stringify(c.verificationDetails),
                    suggestedCorrection: null // TODO implementation
                }))
            });
        }

        return NextResponse.json({
            total: validatedCitations.length,
            verified: validatedCitations.filter(c => c.status === 'VERIFIED').length,
            suspicious: validatedCitations.filter(c => c.status === 'SUSPICIOUS').length,
            invalid: validatedCitations.filter(c => c.status === 'INVALID').length,
            citations: validatedCitations
        });

    } catch (error) {
        console.error("Citation Validation Error:", error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
