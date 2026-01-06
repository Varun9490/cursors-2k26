'use client';

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { X, Download, Chrome, CheckCircle, ExternalLink } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function AddToChromeButton() {
    const [showModal, setShowModal] = useState(false);
    const [currentStep, setCurrentStep] = useState(0);

    const steps = [
        {
            title: 'Open Chrome Extensions',
            description: 'Go to chrome://extensions/ in your browser or click Menu (⋮) → More Tools → Extensions',
            action: 'Open Extensions Page',
            link: 'chrome://extensions/'
        },
        {
            title: 'Enable Developer Mode',
            description: 'Toggle the "Developer mode" switch in the top-right corner of the Extensions page',
            action: null
        },
        {
            title: 'Load the Extension',
            description: 'Click "Load unpacked" and select the plagiarism-extension folder from your project directory',
            action: 'Download Extension',
            isDownload: true
        },
        {
            title: 'Done! Pin the Extension',
            description: 'Click the puzzle icon (🧩) in Chrome toolbar and pin PlagDetect for easy access',
            action: null
        }
    ];

    const handleDownload = () => {
        // Create a simple instruction file as download
        const instructions = `
PlagDetect Chrome Extension - Installation Instructions
========================================================

1. Open chrome://extensions/ in Chrome
2. Enable "Developer mode" (top-right toggle)
3. Click "Load unpacked"
4. Navigate to: plagiarism-detector/plagiarism-extension/
5. Select the folder
6. The extension is now installed!

For the extension to work, make sure the development server is running:
    cd plagiarism-detector
    npm run dev

Then click the extension icon and start checking for plagiarism!
        `;

        const blob = new Blob([instructions], { type: 'text/plain' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'PlagDetect-Installation-Guide.txt';
        a.click();
        URL.revokeObjectURL(url);
    };

    return (
        <>
            {/* Add to Chrome Button */}
            <Button
                size="lg"
                onClick={() => setShowModal(true)}
                className="h-14 px-8 text-lg rounded-full bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white hover:scale-105 transition-all shadow-[0_0_20px_rgba(59,130,246,0.5)] flex items-center gap-2"
            >
                <Chrome className="w-5 h-5" />
                Add to Chrome
            </Button>

            {/* Installation Modal */}
            <AnimatePresence>
                {showModal && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm"
                        onClick={() => setShowModal(false)}
                    >
                        <motion.div
                            initial={{ scale: 0.9, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.9, opacity: 0 }}
                            onClick={(e) => e.stopPropagation()}
                            className="bg-gradient-to-br from-gray-900 to-gray-800 rounded-2xl p-8 max-w-lg w-full shadow-2xl border border-white/10"
                        >
                            {/* Header */}
                            <div className="flex items-center justify-between mb-6">
                                <div className="flex items-center gap-3">
                                    <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
                                        <Chrome className="w-6 h-6 text-white" />
                                    </div>
                                    <div>
                                        <h3 className="text-xl font-bold text-white">Install Extension</h3>
                                        <p className="text-sm text-gray-400">Follow these steps</p>
                                    </div>
                                </div>
                                <button
                                    onClick={() => setShowModal(false)}
                                    className="text-gray-400 hover:text-white transition-colors"
                                >
                                    <X className="w-6 h-6" />
                                </button>
                            </div>

                            {/* Steps */}
                            <div className="space-y-4 mb-6">
                                {steps.map((step, index) => (
                                    <div
                                        key={index}
                                        className={`flex gap-4 p-4 rounded-xl transition-all ${currentStep === index
                                                ? 'bg-blue-500/20 border border-blue-500/50'
                                                : currentStep > index
                                                    ? 'bg-green-500/10 border border-green-500/30'
                                                    : 'bg-white/5 border border-white/10'
                                            }`}
                                    >
                                        <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${currentStep > index
                                                ? 'bg-green-500 text-white'
                                                : currentStep === index
                                                    ? 'bg-blue-500 text-white'
                                                    : 'bg-white/10 text-gray-400'
                                            }`}>
                                            {currentStep > index ? (
                                                <CheckCircle className="w-5 h-5" />
                                            ) : (
                                                <span className="text-sm font-bold">{index + 1}</span>
                                            )}
                                        </div>
                                        <div className="flex-1">
                                            <h4 className="font-semibold text-white">{step.title}</h4>
                                            <p className="text-sm text-gray-400 mt-1">{step.description}</p>
                                            {step.action && currentStep === index && (
                                                <button
                                                    onClick={() => {
                                                        if (step.isDownload) {
                                                            handleDownload();
                                                        } else if (step.link) {
                                                            window.open(step.link, '_blank');
                                                        }
                                                    }}
                                                    className="mt-3 inline-flex items-center gap-2 text-sm text-blue-400 hover:text-blue-300 transition-colors"
                                                >
                                                    {step.isDownload ? <Download className="w-4 h-4" /> : <ExternalLink className="w-4 h-4" />}
                                                    {step.action}
                                                </button>
                                            )}
                                        </div>
                                    </div>
                                ))}
                            </div>

                            {/* Navigation */}
                            <div className="flex gap-3">
                                <Button
                                    variant="outline"
                                    onClick={() => setCurrentStep(Math.max(0, currentStep - 1))}
                                    disabled={currentStep === 0}
                                    className="flex-1 border-white/20 text-white hover:bg-white/10"
                                >
                                    Previous
                                </Button>
                                <Button
                                    onClick={() => {
                                        if (currentStep < steps.length - 1) {
                                            setCurrentStep(currentStep + 1);
                                        } else {
                                            setShowModal(false);
                                            setCurrentStep(0);
                                        }
                                    }}
                                    className="flex-1 bg-blue-500 hover:bg-blue-600 text-white"
                                >
                                    {currentStep === steps.length - 1 ? 'Done' : 'Next Step'}
                                </Button>
                            </div>

                            {/* Direct download note */}
                            <p className="text-xs text-gray-500 text-center mt-4">
                                Extension folder: <code className="bg-white/10 px-2 py-0.5 rounded">plagiarism-extension/</code>
                            </p>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </>
    );
}
