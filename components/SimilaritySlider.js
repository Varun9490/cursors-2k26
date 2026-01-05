'use client';

import React from 'react';
import { Slider } from '@/components/ui/slider';
import { cn } from '@/lib/utils';
import { Info } from 'lucide-react';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

export default function SimilaritySlider({ value, onValueChange }) {
    return (
        <div className="space-y-4 p-4 bg-muted/20 rounded-lg border border-border/50">
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <span className="font-medium text-sm">Sensitivity Threshold</span>
                    <TooltipProvider>
                        <Tooltip>
                            <TooltipTrigger>
                                <Info className="w-4 h-4 text-muted-foreground" />
                            </TooltipTrigger>
                            <TooltipContent>
                                <p className="max-w-xs text-xs">Adjusting this filters matches. Lower values show more "similar" concepts, higher values strictly show direct copying.</p>
                            </TooltipContent>
                        </Tooltip>
                    </TooltipProvider>
                </div>
                <span className="font-bold text-primary">{Math.round(value[0])}%</span>
            </div>

            <div className="pt-2">
                <Slider
                    defaultValue={[75]}
                    value={value}
                    max={95}
                    min={50}
                    step={1}
                    onValueChange={onValueChange}
                    className="cursor-pointer"
                />
            </div>

            <div className="flex justify-between text-xs text-muted-foreground px-1">
                <span>Loose (50%)</span>
                <span>Strict (95%)</span>
            </div>
        </div>
    );
}
