'use client';

import React from 'react';
import { Button } from '@/components/ui/button';
import { Loader2, Check, Search, Sparkles } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';

export default function AnalyzeButton({ onClick, isLoading, isSuccess, disabled }) {
    return (
        <div className="relative group w-full">
            {/* Glow effect */}
            {!disabled && !isLoading && !isSuccess && (
                <div className="absolute -inset-1 bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 rounded-xl blur-md opacity-40 group-hover:opacity-100 transition duration-500 will-change-transform" />
            )}

            <Button
                onClick={onClick}
                disabled={disabled || isLoading}
                className={cn(
                    "relative w-full h-14 text-lg font-bold transition-all duration-300 overflow-hidden shadow-xl rounded-xl border-none",
                    disabled
                        ? "bg-muted text-muted-foreground opacity-50 cursor-not-allowed"
                        : "bg-gradient-to-r from-blue-600 to-purple-700 text-white hover:brightness-110 active:scale-[0.98]",
                    isSuccess && "bg-green-600 hover:bg-green-700 from-green-600 to-green-700 cursor-default"
                )}
            >
                {/* Internal Shimmer for Loading */}
                {isLoading && (
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent animate-shimmer" style={{ backgroundSize: '200% 100%' }} />
                )}

                <AnimatePresence mode="wait">
                    {isLoading ? (
                        <motion.div
                            key="loading"
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -10 }}
                            className="flex items-center gap-2"
                        >
                            <Loader2 className="w-5 h-5 animate-spin" />
                            <span>Scanning Document...</span>
                        </motion.div>
                    ) : isSuccess ? (
                        <motion.div
                            key="success"
                            initial={{ opacity: 0, scale: 0.8 }}
                            animate={{ opacity: 1, scale: 1 }}
                            className="flex items-center gap-2"
                        >
                            <div className="bg-white/20 p-1 rounded-full">
                                <Check className="w-5 h-5" />
                            </div>
                            <span>Scan Complete</span>
                        </motion.div>
                    ) : (
                        <motion.div
                            key="default"
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.9 }}
                            className="flex items-center gap-2"
                        >
                            <Sparkles className="w-5 h-5 animate-pulse" />
                            <span>Check for Plagiarism</span>
                        </motion.div>
                    )}
                </AnimatePresence>
            </Button>
        </div>
    );
}
