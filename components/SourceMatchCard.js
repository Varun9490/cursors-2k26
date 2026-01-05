'use client';

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ExternalLink, Copy, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { scaleIn } from '@/lib/animations';

export default function SourceMatchCard({ match, delay }) {
    const [copied, setCopied] = React.useState(false);
    const [expanded, setExpanded] = React.useState(false);

    const handleCopy = () => {
        navigator.clipboard.writeText(match.matchedText);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    const getScoreColor = (score) => {
        if (score >= 90) return 'text-red-500 bg-red-500/10 border-red-500/20';
        if (score >= 75) return 'text-orange-500 bg-orange-500/10 border-orange-500/20';
        return 'text-yellow-500 bg-yellow-500/10 border-yellow-500/20';
    };

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: delay * 0.1 }}
            className="group"
        >
            <Card className="h-full border-border/50 bg-card hover:bg-card/80 transition-all duration-300 hover:-translate-y-1 hover:shadow-xl overflow-hidden">
                <div className="p-4 space-y-4">
                    <div className="flex items-start justify-between gap-4">
                        <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-1">
                                <img
                                    src={`https://www.google.com/s2/favicons?domain=${match.sourceUrl}`}
                                    alt="favicon"
                                    className="w-4 h-4 rounded-sm"
                                    onError={(e) => e.target.style.display = 'none'}
                                />
                                <h3 className="font-semibold truncate text-sm hover:text-primary transition-colors cursor-help" title={match.sourceTitle}>
                                    {match.sourceTitle || match.sourceUrl}
                                </h3>
                            </div>
                            <a href={match.sourceUrl} target="_blank" rel="noopener noreferrer" className="text-xs text-muted-foreground hover:underline truncate block">
                                {match.sourceUrl}
                            </a>
                        </div>

                        <div className={`px-2 py-1 rounded-md text-sm font-bold border ${getScoreColor(match.similarityScore)}`}>
                            {Math.round(match.similarityScore)}%
                        </div>
                    </div>

                    <div className="space-y-2">
                        <div className="text-xs font-medium text-muted-foreground uppercase tracking-wide flex items-center justify-between">
                            <span>Matched Content</span>
                            <div className="flex gap-2">
                                <button onClick={handleCopy} className="hover:text-primary transition-colors">
                                    {copied ? <Check className="w-3 h-3 text-green-500" /> : <Copy className="w-3 h-3" />}
                                </button>
                            </div>
                        </div>

                        <div className="relative bg-muted/30 rounded-md p-3 text-sm font-mono text-muted-foreground/80 leading-relaxed border border-border/50">
                            <p className={!expanded ? "line-clamp-3" : ""}>
                                {match.matchedText}
                            </p>
                            {match.matchedText.length > 150 && (
                                <button
                                    onClick={() => setExpanded(!expanded)}
                                    className="text-xs text-primary hover:underline mt-2 block w-full text-left"
                                >
                                    {expanded ? "Show Less" : "...Read More"}
                                </button>
                            )}
                        </div>
                    </div>

                    <div className="pt-2 flex justify-end">
                        <a href={match.sourceUrl} target="_blank" rel="noopener noreferrer">
                            <Button size="sm" variant="ghost" className="h-8 text-xs gap-1 group/btn">
                                View Source
                                <ExternalLink className="w-3 h-3 transition-transform group-hover/btn:translate-x-1" />
                            </Button>
                        </a>
                    </div>
                </div>
            </Card>
        </motion.div>
    );
}
