import { auth } from '@/lib/auth';
import prisma from '@/lib/prisma';
import { redirect } from 'next/navigation';
import ResultsPageClient from '../ResultsPageClient';

export default async function ResultsPage({ params }) {
    const session = await auth();
    const { reportId } = await params; // Await params in Nextjs 15
    if (!session) redirect('/auth/signin');

    const report = await prisma.plagiarismReport.findUnique({
        where: { id: reportId },
        include: {
            document: true
        }
    });

    if (!report) {
        return <div>Report not found</div>;
    }

    // Prepare data for client
    // If we used the JSON 'matchedSources' field previously, we might need to unify
    // Ideally we use the new 'matches' relation for robust data
    let matchesData = report.matches || [];

    // Fallback for reports created before schema migration if matches is empty but json is not
    if (matchesData.length === 0 && report.matchedSources) {
        // Parse matchedSources - it might be a string or already parsed JSON
        let jsonSources;
        try {
            jsonSources = typeof report.matchedSources === 'string'
                ? JSON.parse(report.matchedSources)
                : report.matchedSources;
        } catch (e) {
            jsonSources = [];
        }

        if (Array.isArray(jsonSources)) {
            matchesData = jsonSources.map((s, i) => ({
                id: `legacy-${i}`,
                originalText: s.originalText || "Content...",
                matchedText: s.matchedText || "...",
                sourceUrl: s.url || s.sourceUrl || '#',
                sourceTitle: s.title || s.sourceTitle || 'Unknown Source',
                similarityScore: s.score || s.similarityScore || 0,
                matchType: s.matchType || 'SIMILAR',
                position: s.position || { startIndex: 0, endIndex: 0 }
            }));
        }
    }

    // Serialize dates
    const serializedReport = {
        ...report,
        createdAt: report.createdAt.toISOString(),
        matches: matchesData,
        document: {
            ...report.document,
            uploadedAt: report.document.uploadedAt.toISOString()
        }
    };

    return <ResultsPageClient report={serializedReport} />;
}
