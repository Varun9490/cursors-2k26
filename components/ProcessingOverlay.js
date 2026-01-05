'use client';

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Check, Loader2, Brain, FileText, ScanSearch, X } from 'lucide-react';
import { Button } from '@/components/ui/button';

const steps = [
    { id: 1, label: 'Uploading file...', icon: FileText },
    { id: 2, label: 'Extracting content...', icon: ScanSearch },
    { id: 3, label: 'Analyzing semantics...', icon: Brain },
];

export default function ProcessingOverlay({ isLoading, currentStep = 1, onCancel }) {
    if (!isLoading) return null;

    return (
        <AnimatePresence>
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 z-50 bg-background/80 backdrop-blur-sm flex items-center justify-center p-4"
            >
                <motion.div
                    initial={{ scale: 0.95, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    className="bg-card border border-border rounded-xl shadow-2xl p-8 max-w-md w-full relative"
                >
                    <button
                        onClick={onCancel}
                        className="absolute top-4 right-4 text-muted-foreground hover:text-foreground transition-colors"
                    >
                        <X className="w-5 h-5" />
                    </button>

                    <div className="text-center mb-8">
                        <h3 className="text-2xl font-bold mb-2">Processing Document</h3>
                        <p className="text-muted-foreground">Please wait while we analyze your content</p>
                    </div>

                    <div className="space-y-6">
                        {steps.map((step, index) => {
                            const StepIcon = step.icon;
                            const isCompleted = currentStep > step.id;
                            const isCurrent = currentStep === step.id;
                            const isPending = currentStep < step.id;

                            return (
                                <div key={step.id} className="flex items-center gap-4 relative">
                                    {/* Connecting Line */}
                                    {index !== steps.length - 1 && (
                                        <div className={`absolute left-5 top-10 w-0.5 h-6 ${isCompleted ? 'bg-primary' : 'bg-muted'}`} />
                                    )}

                                    <div className={`
                                        w-10 h-10 rounded-full flex items-center justify-center border-2 transition-all duration-300
                                        ${isCompleted ? 'bg-primary border-primary text-primary-foreground' :
                                            isCurrent ? 'border-primary text-primary' : 'border-muted text-muted-foreground'}
                                    `}>
                                        {isCompleted ? (
                                            <Check className="w-5 h-5" />
                                        ) : isCurrent ? (
                                            <StepIcon className="w-5 h-5 animate-pulse" />
                                        ) : (
                                            <StepIcon className="w-5 h-5" />
                                        )}
                                    </div>

                                    <div className="flex-1">
                                        <p className={`font-medium ${isCurrent ? 'text-foreground' : 'text-muted-foreground'}`}>
                                            {step.label}
                                        </p>
                                        {isCurrent && (
                                            <motion.div
                                                className="h-1 bg-muted mt-2 rounded-full overflow-hidden"
                                                initial={{ width: 0 }}
                                                animate={{ width: "100%" }}
                                            >
                                                <motion.div
                                                    className="h-full bg-primary"
                                                    initial={{ width: "0%" }}
                                                    animate={{ width: "100%" }}
                                                    transition={{ duration: 2, repeat: Infinity }}
                                                />
                                            </motion.div>
                                        )}
                                    </div>
                                </div>
                            );
                        })}
                    </div>

                    <div className="mt-8 flex justify-center">
                        <Button variant="outline" onClick={onCancel}>
                            Cancel Operation
                        </Button>
                    </div>
                </motion.div>
            </motion.div>
        </AnimatePresence>
    );
}
