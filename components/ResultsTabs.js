'use client';

import React from 'react';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { motion } from 'framer-motion';
import { Badge } from '@/components/ui/badge';
import { AlertCircle, CheckCircle, ExternalLink } from 'lucide-react';
import { Progress } from '@/components/ui/progress';

export default function ResultsTabs({ data }) {
    if (!data) return null;

    const { originalityScore, matchedSources, reportId } = data;

    return (
        <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="mt-8"
        >
            <Tabs defaultValue="overview" className="w-full">
                <TabsList className="grid w-full grid-cols-3 bg-muted/50 p-1 mb-6">
                    <TabsTrigger value="overview">Overview</TabsTrigger>
                    <TabsTrigger value="matches" className="relative">
                        Detailed Report
                        {matchedSources?.length > 0 && (
                            <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-[10px] text-white animate-pulse">
                                {matchedSources.length}
                            </span>
                        )}
                    </TabsTrigger>
                    <TabsTrigger value="citations">Citations</TabsTrigger>
                </TabsList>

                <TabsContent value="overview">
                    <div className="grid gap-6 md:grid-cols-2">
                        <Card className="md:col-span-2 overflow-hidden border-border/50 bg-card/50 backdrop-blur-sm">
                            <CardHeader>
                                <CardTitle>Originality Score</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="flex flex-col items-center justify-center py-8">
                                    <div className="relative w-48 h-48 flex items-center justify-center">
                                        {/* Simplified Circular Progress (SVG) */}
                                        <svg className="w-full h-full transform -rotate-90">
                                            <circle cx="96" cy="96" r="88" stroke="currentColor" strokeWidth="12" fill="transparent" className="text-muted/20" />
                                            <motion.circle
                                                cx="96" cy="96" r="88"
                                                stroke="currentColor"
                                                strokeWidth="12"
                                                fill="transparent"
                                                className={originalityScore > 80 ? "text-green-500" : originalityScore > 50 ? "text-yellow-500" : "text-red-500"}
                                                strokeDasharray={2 * Math.PI * 88}
                                                initial={{ strokeDashoffset: 2 * Math.PI * 88 }}
                                                animate={{ strokeDashoffset: 2 * Math.PI * 88 * (1 - originalityScore / 100) }}
                                                transition={{ duration: 1.5, ease: "easeOut" }}
                                                strokeLinecap="round"
                                            />
                                        </svg>
                                        <div className="absolute inset-0 flex flex-col items-center justify-center">
                                            <span className="text-5xl font-bold tracking-tighter">{originalityScore}%</span>
                                            <span className="text-sm text-muted-foreground uppercase tracking-wider mt-1">Unique</span>
                                        </div>
                                    </div>

                                    <div className="mt-8 grid grid-cols-2 gap-8 w-full max-w-lg text-center">
                                        <div>
                                            <p className="text-3xl font-bold text-red-500">{100 - originalityScore}%</p>
                                            <p className="text-sm text-muted-foreground">Plagiarized</p>
                                        </div>
                                        <div>
                                            <p className="text-3xl font-bold text-blue-500">{matchedSources?.length || 0}</p>
                                            <p className="text-sm text-muted-foreground">Matches Found</p>
                                        </div>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                </TabsContent>

                <TabsContent value="matches">
                    <Card className="border-border/50 bg-card/50 backdrop-blur-sm">
                        <CardHeader>
                            <CardTitle>Matched Sources</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            {matchedSources?.length > 0 ? (
                                matchedSources.map((source, i) => (
                                    <motion.div
                                        key={i}
                                        initial={{ opacity: 0, x: -20 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        transition={{ delay: i * 0.1 }}
                                        className="p-4 rounded-lg bg-muted/40 border border-border hover:bg-muted/60 transition-colors"
                                    >
                                        <div className="flex items-start justify-between gap-4">
                                            <div>
                                                <h4 className="font-semibold text-blue-500 flex items-center gap-2">
                                                    <ExternalLink className="w-4 h-4" />
                                                    {source.title}
                                                </h4>
                                                <a href={source.url} target="_blank" className="text-xs text-muted-foreground hover:underline truncate block max-w-md">{source.url}</a>
                                            </div>
                                            <Badge variant={source.similarity > 50 ? "destructive" : "warning"}>{source.similarity}% Match</Badge>
                                        </div>
                                        <div className="mt-3 p-3 bg-background/50 rounded text-sm font-mono text-muted-foreground">
                                            "{source.snippet}"
                                        </div>
                                    </motion.div>
                                ))
                            ) : (
                                <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
                                    <CheckCircle className="w-12 h-12 text-green-500 mb-4" />
                                    <p>No matches found. Good job!</p>
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </TabsContent>

                <TabsContent value="citations">
                    <Card className="border-border/50 bg-card/50 backdrop-blur-sm">
                        <CardContent className="py-12 text-center text-muted-foreground">
                            <AlertCircle className="w-12 h-12 mx-auto mb-4 opacity-50" />
                            <p>Citation analysis requires full document scan.</p>
                        </CardContent>
                    </Card>
                </TabsContent>
            </Tabs>
        </motion.div>
    );
}
