import { auth } from '@/lib/auth';
import prisma from '@/lib/prisma';
import DashboardClient from '@/components/DashboardClient';
import { redirect } from 'next/navigation';

export default async function DashboardPage() {
    const session = await auth();

    if (!session) {
        redirect('/auth/signin');
    }

    // Fetch recent reports for the user
    // We navigate to reports -> document -> user
    // Or easier: find reports where document.userId = session.user.id
    // Fetch comprehensive stats
    const reports = await prisma.plagiarismReport.findMany({
        where: { document: { userId: session.user.id } },
        select: {
            originalityScore: true,
            createdAt: true,
            document: {
                select: {
                    filename: true,
                    uploadedAt: true
                }
            }
        },
        orderBy: { createdAt: 'desc' },
        take: 100 // Limit history fetch
    });

    const totalScans = reports.length;

    // Calculate robust average (0 if empty)
    const avgOriginality = totalScans > 0
        ? Math.round(reports.reduce((acc, curr) => acc + curr.originalityScore, 0) / totalScans)
        : 100;

    // Get citation count (Mock for now or real if query allows)
    // We can do a separate count query
    const totalCitations = await prisma.citation.count({
        where: { document: { userId: session.user.id } }
    });

    // Prepare serialized history (top 5)
    const serializedReports = reports.slice(0, 5).map(report => ({
        ...report,
        // Since we didn't select ID in the optimized query above, we need to make sure we get it if needed.
        // Actually, let's just use the previous query structure but expand it.
    }));

    // Redo query for simplicity to match existing structure + Aggregates
    const fullReports = await prisma.plagiarismReport.findMany({
        where: { document: { userId: session.user.id } },
        orderBy: { createdAt: 'desc' },
        include: { document: true }
    });

    const stats = {
        totalScans: fullReports.length,
        avgOriginality: fullReports.length > 0
            ? Math.round(fullReports.reduce((acc, curr) => acc + curr.originalityScore, 0) / fullReports.length)
            : 0,
        totalCitations: await prisma.citation.count({
            where: { document: { userId: session.user.id } }
        }),
        recentActivity: fullReports.length > 0 ? new Date(fullReports[0].createdAt).toLocaleDateString() : 'N/A'
    };

    const serializedHistory = fullReports.slice(0, 5).map(report => ({
        ...report,
        createdAt: report.createdAt.toISOString(),
        document: {
            ...report.document,
            uploadedAt: report.document.uploadedAt.toISOString()
        }
    }));

    return <DashboardClient initialHistory={serializedHistory} stats={stats} />;
}
