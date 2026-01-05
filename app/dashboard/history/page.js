import { auth } from '@/lib/auth';
import prisma from '@/lib/prisma';
import Sidebar from '@/components/Sidebar';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { FileText, Calendar, ExternalLink } from 'lucide-react';
import Link from 'next/link';
import HistoryGrid from '@/components/HistoryGrid';
import { redirect } from 'next/navigation';

export default async function HistoryPage() {
    const session = await auth();
    if (!session) redirect('/auth/signin');

    const reports = await prisma.plagiarismReport.findMany({
        where: {
            document: {
                userId: session.user.id
            }
        },
        orderBy: {
            createdAt: 'desc'
        },
        include: {
            document: true
        }
    });

    return (
        <div className="flex min-h-screen bg-background text-foreground bg-transparent">
            {/* Sidebar is handled by layout */}
            <div className="flex-1 p-8 h-full">
                <div className="max-w-5xl mx-auto space-y-8">
                    <div className="space-y-2">
                        <h1 className="text-3xl font-bold">Scan History</h1>
                        <p className="text-muted-foreground">View all your past plagiarism checks and reports.</p>
                    </div>

                    <div className="relative">
                        <HistoryGrid reports={reports} />
                    </div>
                </div>
            </div>
        </div>
    );
}
