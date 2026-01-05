'use client';

import React from 'react';
import { CardContainer, CardBody, CardItem } from '@/components/ui/3d-card';
import { FileText, Calendar, ExternalLink, ArrowRight } from 'lucide-react';
import Link from 'next/link';
import { motion } from 'framer-motion';

export default function HistoryGrid({ reports }) {
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
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 py-10">
            {reports.map((report, idx) => (
                <motion.div
                    key={report.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: idx * 0.1 }}
                >
                    <CardContainer className="inter-var w-full h-full">
                        <CardBody className="bg-card relative group/card dark:hover:shadow-2xl dark:hover:shadow-emerald-500/[0.1] dark:bg-black dark:border-white/[0.2] border-black/[0.1] w-full h-auto rounded-xl p-6 border transition-all duration-300">
                            <CardItem
                                translateZ="50"
                                className="text-xl font-bold text-neutral-600 dark:text-white"
                            >
                                {report.document.filename || 'Untitled Document'}
                            </CardItem>
                            <CardItem
                                as="p"
                                translateZ="60"
                                className="text-neutral-500 text-sm max-w-sm mt-2 dark:text-neutral-300"
                            >
                                Scanned on {new Date(report.createdAt).toLocaleDateString()}
                            </CardItem>

                            <CardItem translateZ="100" className="w-full mt-8">
                                <div className={`w-full h-40 rounded-xl flex items-center justify-center relative overflow-hidden group-hover/card:scale-105 transition-transform duration-300 ${report.originalityScore > 80 ? 'bg-gradient-to-br from-green-500/20 to-emerald-500/20' :
                                        report.originalityScore > 50 ? 'bg-gradient-to-br from-yellow-500/20 to-orange-500/20' :
                                            'bg-gradient-to-br from-red-500/20 to-pink-500/20'
                                    }`}>
                                    <div className="text-center">
                                        <h3 className={`text-4xl font-bold ${report.originalityScore > 80 ? 'text-green-500' :
                                                report.originalityScore > 50 ? 'text-yellow-500' : 'text-red-500'
                                            }`}>
                                            {Math.round(report.originalityScore)}%
                                        </h3>
                                        <p className="text-xs uppercase tracking-widest opacity-70">Originality</p>
                                    </div>
                                </div>
                            </CardItem>

                            <div className="flex justify-between items-center mt-10">
                                <CardItem
                                    translateZ={20}
                                    as={Link}
                                    href={`/dashboard/results/${report.id}`}
                                    className="px-4 py-2 rounded-xl text-xs font-normal dark:text-white hover:underline flex items-center gap-1"
                                >
                                    View Details <ArrowRight className="w-3 h-3" />
                                </CardItem>
                                <CardItem
                                    translateZ={20}
                                    as="button"
                                    className="px-4 py-2 rounded-xl bg-black dark:bg-white dark:text-black text-white text-xs font-bold"
                                >
                                    Download
                                </CardItem>
                            </div>
                        </CardBody>
                    </CardContainer>
                </motion.div>
            ))}
        </div>
    );
}
