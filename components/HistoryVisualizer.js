'use client';

import React from 'react';
import CardSwap, { Card } from '@/components/animations/CardSwap';
import { FileText, Calendar, ExternalLink } from 'lucide-react';
import Link from 'next/link';

export default function HistoryVisualizer({ reports }) {
    if (!reports || reports.length === 0) {
        return (
            <div className="text-center py-20 bg-muted/5 rounded-xl border border-dashed border-border w-full">
                <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4 opacity-50" />
                <h3 className="text-xl font-medium mb-2">No history found</h3>
                <p className="text-muted-foreground mb-6">You haven't scanned any documents yet.</p>
                <Link href="/dashboard" className="text-primary hover:underline">
                    Start a New Scan
                </Link>
            </div>
        )
    }

    return (
        <div className="w-full h-[600px] relative overflow-hidden flex items-center justify-center bg-transparent">
            {/* Text Hint */}
            <div className="absolute top-10 left-10 md:left-20 z-0 opacity-50 pointer-events-none">
                <h2 className="text-4xl md:text-6xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-primary/20 to-secondary/20 select-none">
                    Your<br />Timeline
                </h2>
            </div>

            <CardSwap cardDistance={40} verticalDistance={30} width={320} height={400} skewAmount={0}>
                {reports.map((report) => (
                    <Card key={report.id} customClass="bg-card border border-border/50 shadow-xl overflow-hidden cursor-pointer group">
                        <Link href={`/dashboard/results/${report.id}`} className="block h-full w-full p-6 relative">
                            {/* Score Background Blob */}
                            <div className={`absolute -right-20 -top-20 w-40 h-40 rounded-full blur-3xl opacity-20 ${report.originalityScore > 80 ? 'bg-green-500' :
                                    report.originalityScore > 50 ? 'bg-yellow-500' : 'bg-red-500'
                                }`} />

                            <div className="flex flex-col h-full justify-between relative z-10">
                                <div className="space-y-4">
                                    <div className="flex items-start justify-between">
                                        <div className="p-3 bg-muted/20 rounded-xl">
                                            <FileText className="w-6 h-6 text-primary" />
                                        </div>
                                        <div className={`px-3 py-1 rounded-full text-sm font-bold border ${report.originalityScore > 80 ? 'border-green-500/30 text-green-500 bg-green-500/10' :
                                                report.originalityScore > 50 ? 'border-yellow-500/30 text-yellow-500 bg-yellow-500/10' :
                                                    'border-red-500/30 text-red-500 bg-red-500/10'
                                            }`}>
                                            {Math.round(report.originalityScore)}% Origin
                                        </div>
                                    </div>

                                    <div>
                                        <h3 className="text-xl font-bold line-clamp-2 mb-2 group-hover:text-primary transition-colors">
                                            {report.document.filename || 'Untitled'}
                                        </h3>
                                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                            <Calendar className="w-4 h-4" />
                                            {new Date(report.createdAt).toLocaleDateString()}
                                        </div>
                                    </div>
                                </div>

                                <div className="pt-4 border-t border-border/50 flex items-center justify-between text-sm">
                                    <span className="text-muted-foreground">Tap to view report</span>
                                    <ExternalLink className="w-4 h-4 opacity-0 group-hover:opacity-100 transition-opacity transform translate-x-3 group-hover:translate-x-0" />
                                </div>
                            </div>
                        </Link>
                    </Card>
                ))}
            </CardSwap>
        </div>
    );
}
