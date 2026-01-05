import { auth } from '@/lib/auth';
import prisma from '@/lib/prisma';
import DashboardClient from '@/components/DashboardClient';
import { redirect } from 'next/navigation';

export default async function NewCheckPage() {
    const session = await auth();

    if (!session) {
        redirect('/auth/signin');
    }

    // Reuse the dashboard logic but specifically for a "New Check" route
    // This avoids the redirect flicker and renders the dashboard directly

    // We can still fetch history to show in the sidebar widget if we want
    const recentReports = await prisma.plagiarismReport.findMany({
        where: {
            document: {
                userId: session.user.id
            }
        },
        orderBy: {
            createdAt: 'desc'
        },
        take: 5,
        include: {
            document: {
                select: {
                    filename: true,
                    uploadedAt: true
                }
            }
        }
    });

    const serializedReports = recentReports.map(report => ({
        ...report,
        createdAt: report.createdAt.toISOString(),
        document: {
            ...report.document,
            uploadedAt: report.document.uploadedAt.toISOString()
        }
    }));

    return <DashboardClient initialHistory={serializedReports} />;
}
