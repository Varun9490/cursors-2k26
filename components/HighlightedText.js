'use client';

import React, { useRef, useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';
import { AlertCircle } from 'lucide-react';

export default function HighlightedText({ text, matches, threshold }) {
    // We need to construct a unified view where text is split into segments:
    // [normal] [highlighted] [normal] [highlighted] ...

    // 1. Process matches based on threshold
    const filteredMatches = matches.filter(m => m.similarityScore >= threshold);

    // 2. Sort matches by position to handle rendering order
    // Note: Overlapping matches are complex. For this demo, we'll assume simplified non-overlapping or take the first one.
    // In a robust app, use an interval tree or merge intervals.
    const sortedMatches = [...filteredMatches].sort((a, b) => {
        const posA = typeof a.position === 'string' ? JSON.parse(a.position) : a.position;
        const posB = typeof b.position === 'string' ? JSON.parse(b.position) : b.position;
        return (posA?.startIndex || 0) - (posB?.startIndex || 0);
    });

    // 3. Build segments
    const segments = [];
    let currentIndex = 0;

    sortedMatches.forEach((match, index) => {
        const pos = typeof match.position === 'string' ? JSON.parse(match.position) : match.position;
        if (!pos) return;

        const { startIndex, endIndex } = pos;

        // Add non-matched text before this match
        if (startIndex > currentIndex) {
            segments.push({
                type: 'normal',
                text: text.substring(currentIndex, startIndex),
                id: `normal-${currentIndex}`
            });
        }

        // Add matched text
        // Determine color class
        let bgClass = "bg-yellow-500/20 hover:bg-yellow-500/30";
        if (match.matchType === 'DIRECT') bgClass = "bg-red-500/20 hover:bg-red-500/30 border-b-2 border-red-500/40";
        else if (match.matchType === 'PARAPHRASED') bgClass = "bg-orange-500/20 hover:bg-orange-500/30 border-b-2 border-orange-500/40";

        segments.push({
            type: 'match',
            text: text.substring(startIndex, endIndex) || match.originalText, // Fallback
            match,
            className: bgClass,
            id: match.id || `match-${index}`
        });

        currentIndex = Math.max(currentIndex, endIndex);
    });

    // Add remaining text
    if (currentIndex < text.length) {
        segments.push({
            type: 'normal',
            text: text.substring(currentIndex),
            id: `normal-end`
        });
    }

    return (
        <div className="relative font-serif text-lg leading-relaxed text-foreground/90 whitespace-pre-wrap">
            {segments.map((segment) => {
                if (segment.type === 'normal') {
                    return <span key={segment.id}>{segment.text}</span>;
                }

                return (
                    <TooltipWrapper key={segment.id} match={segment.match}>
                        <motion.span
                            initial={{ backgroundColor: "rgba(0,0,0,0)" }}
                            animate={{ backgroundColor: "var(--highlight-color)" }}
                            className={cn(
                                "cursor-pointer transition-colors duration-200 rounded-sm px-0.5",
                                segment.className
                            )}
                            style={{ "--highlight-color": segment.match.matchType === 'DIRECT' ? 'rgba(239, 68, 68, 0.2)' : 'rgba(245, 158, 11, 0.2)' }}
                        >
                            {segment.text}
                        </motion.span>
                    </TooltipWrapper>
                );
            })}
        </div>
    );
}

import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from "@/components/ui/tooltip"

function TooltipWrapper({ children, match }) {
    return (
        <TooltipProvider delayDuration={100}>
            <Tooltip>
                <TooltipTrigger asChild>{children}</TooltipTrigger>
                <TooltipContent className="max-w-xs bg-card border-border shadow-xl z-50">
                    <div className="space-y-2 p-1">
                        <div className="flex items-center justify-between gap-4">
                            <span className="font-bold text-xs uppercase text-muted-foreground">{match.matchType}</span>
                            <span className="font-bold text-primary">{Math.round(match.similarityScore)}% Match</span>
                        </div>
                        <p className="text-xs line-clamp-2 italic text-muted-foreground">
                            Source: {match.sourceTitle}
                        </p>
                    </div>
                </TooltipContent>
            </Tooltip>
        </TooltipProvider>
    )
}
