import { auth } from '@/lib/auth';
import prisma from '@/lib/prisma';
import { redirect } from 'next/navigation';
import CitationDashboardClient from './CitationDashboardClient';

export default async function CitationPage({ params }) {
    const session = await auth();
    const { reportId } = await params;
    if (!session) redirect('/auth/signin');

    // Fetch Document and its citations
    // NOTE: In a real flow, we'd lookup by reportId if it was a dedicated CitationReport model.
    // For now, let's assume reportId IS the documentId or we find citations linked to it.
    // Or, more likely, we just fetch a "Citation Check" result if we stored it.
    // Let's implement a fallback: Try to find Document by ID, then get its citations.

    // We already updated Schema to store Citations linked to Document.
    // We'll treat reportId as documentId for this specialized view.

    // Fetch Citations
    const citations = await prisma.citation.findMany({
        where: { documentId: reportId },
        orderBy: { createdAt: 'desc' }
    });

    // Construct checkData for client
    const checkData = {
        total: citations.length,
        verified: citations.filter(c => c.status === 'VERIFIED').length,
        suspicious: citations.filter(c => c.status === 'SUSPICIOUS').length,
        invalid: citations.filter(c => c.status === 'INVALID').length,
        citations: citations.map(c => ({
            ...c,
            // Parse JSON fields safely? Prisma usually handles this but let's be sure for Client
            issues: c.issues, // Prisma Json is object/array automatically in JS
            verificationDetails: c.verificationDetails,
            createdAt: c.createdAt.toISOString()
        }))
    };

    return <CitationDashboardClient checkData={checkData} />;
}
