'use client';

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { X, Download, Chrome, CheckCircle, Copy, Check } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function AddToChromeButton() {
    const [showModal, setShowModal] = useState(false);
    const [currentStep, setCurrentStep] = useState(0);
    const [copied, setCopied] = useState(false);

    const steps = [
        {
            title: 'Download Extension Files',
            description: 'Download the extension folder from our GitHub repository',
            action: 'Download from GitHub',
            link: 'https://github.com/Varun9490/cursors-2k26/tree/main/plagiarism-extension'
        },
        {
            title: 'Open Chrome Extensions',
            description: 'Copy this URL and paste it in Chrome address bar:',
            copyText: 'chrome://extensions/'
        },
        {
            title: 'Enable Developer Mode',
            description: 'Look at the top-right corner and toggle the "Developer mode" switch to ON (blue)',
            action: null
        },
        {
            title: 'Load the Extension',
            description: 'Click "Load unpacked" button → Navigate to the downloaded plagiarism-extension folder → Select it',
            action: null
        },
        {
            title: 'Done! Start Using',
            description: 'Click the puzzle icon (🧩) in Chrome toolbar, pin PlagDetect, and start checking content!',
            action: null
        }
    ];

    const handleCopy = (text) => {
        navigator.clipboard.writeText(text);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    const handleDownload = () => {
        // Create installation guide
        const instructions = `
PlagDetect Chrome Extension - Installation Guide
=================================================

STEP 1: Download the Extension
------------------------------
Download the 'plagiarism-extension' folder from:
https://github.com/Varun9490/cursors-2k26/tree/main/plagiarism-extension

STEP 2: Open Chrome Extensions
------------------------------
Copy and paste this in Chrome address bar:
chrome://extensions/

STEP 3: Enable Developer Mode
-----------------------------
Toggle "Developer mode" switch ON (top-right corner)

STEP 4: Load the Extension
--------------------------
- Click "Load unpacked"
- Navigate to the downloaded 'plagiarism-extension' folder
- Select the folder

STEP 5: Pin & Use
-----------------
- Click puzzle icon (🧩) in toolbar
- Pin PlagDetect
- Visit any website and click the extension to check!

The extension connects to: https://cursors-2k26.vercel.app/
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
                        className="fixed inset-0 z-[9999] flex items-center justify-center p-4"
                        style={{ backgroundColor: 'rgba(0, 0, 0, 0.85)' }}
                        onClick={() => setShowModal(false)}
                    >
                        <motion.div
                            initial={{ scale: 0.9, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.9, opacity: 0 }}
                            onClick={(e) => e.stopPropagation()}
                            className="rounded-2xl p-6 max-w-lg w-full shadow-2xl border border-gray-700 max-h-[90vh] overflow-y-auto"
                            style={{
                                backgroundColor: '#1a1a2e',
                                boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)'
                            }}
                        >
                            {/* Header */}
                            <div className="flex items-center justify-between mb-6">
                                <div className="flex items-center gap-3">
                                    <div className="w-12 h-12 rounded-xl flex items-center justify-center" style={{ background: 'linear-gradient(135deg, #3b82f6, #8b5cf6)' }}>
                                        <Chrome className="w-6 h-6 text-white" />
                                    </div>
                                    <div>
                                        <h3 className="text-xl font-bold" style={{ color: '#ffffff' }}>Install Extension</h3>
                                        <p className="text-sm" style={{ color: '#9ca3af' }}>Follow these simple steps</p>
                                    </div>
                                </div>
                                <button
                                    onClick={() => setShowModal(false)}
                                    className="p-2 rounded-lg hover:bg-white/10 transition-colors"
                                    style={{ color: '#9ca3af' }}
                                >
                                    <X className="w-5 h-5" />
                                </button>
                            </div>

                            {/* Quick Download Button */}
                            <button
                                onClick={handleDownload}
                                className="w-full mb-6 p-4 rounded-xl flex items-center justify-center gap-3 transition-all hover:opacity-90"
                                style={{
                                    background: 'linear-gradient(135deg, #3b82f6, #8b5cf6)',
                                    color: '#ffffff'
                                }}
                            >
                                <Download className="w-5 h-5" />
                                <span className="font-semibold">Download Installation Guide</span>
                            </button>

                            {/* Steps */}
                            <div className="space-y-3 mb-6">
                                {steps.map((step, index) => (
                                    <div
                                        key={index}
                                        className="flex gap-3 p-3 rounded-xl transition-all"
                                        style={{
                                            backgroundColor: currentStep === index
                                                ? 'rgba(59, 130, 246, 0.2)'
                                                : currentStep > index
                                                    ? 'rgba(34, 197, 94, 0.1)'
                                                    : 'rgba(255, 255, 255, 0.05)',
                                            border: currentStep === index
                                                ? '1px solid rgba(59, 130, 246, 0.5)'
                                                : currentStep > index
                                                    ? '1px solid rgba(34, 197, 94, 0.3)'
                                                    : '1px solid rgba(255, 255, 255, 0.1)'
                                        }}
                                    >
                                        <div
                                            className="w-7 h-7 rounded-full flex items-center justify-center shrink-0 text-sm font-bold"
                                            style={{
                                                backgroundColor: currentStep > index
                                                    ? '#22c55e'
                                                    : currentStep === index
                                                        ? '#3b82f6'
                                                        : 'rgba(255, 255, 255, 0.1)',
                                                color: currentStep >= index ? '#ffffff' : '#9ca3af'
                                            }}
                                        >
                                            {currentStep > index ? (
                                                <CheckCircle className="w-4 h-4" />
                                            ) : (
                                                <span>{index + 1}</span>
                                            )}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <h4 className="font-semibold text-sm" style={{ color: '#ffffff' }}>{step.title}</h4>
                                            <p className="text-xs mt-0.5" style={{ color: '#9ca3af' }}>{step.description}</p>

                                            {/* Copy text box for chrome://extensions */}
                                            {step.copyText && currentStep === index && (
                                                <button
                                                    onClick={() => handleCopy(step.copyText)}
                                                    className="mt-2 w-full flex items-center justify-between p-2 rounded-lg text-xs font-mono transition-all"
                                                    style={{
                                                        backgroundColor: 'rgba(255, 255, 255, 0.1)',
                                                        color: '#60a5fa'
                                                    }}
                                                >
                                                    <span>{step.copyText}</span>
                                                    {copied ? <Check className="w-4 h-4 text-green-400" /> : <Copy className="w-4 h-4" />}
                                                </button>
                                            )}

                                            {/* Link action */}
                                            {step.link && currentStep === index && (
                                                <a
                                                    href={step.link}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="mt-2 inline-flex items-center gap-1 text-xs transition-colors"
                                                    style={{ color: '#60a5fa' }}
                                                >
                                                    <Download className="w-3 h-3" />
                                                    {step.action}
                                                </a>
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
                                    className="flex-1 border-gray-600 text-white hover:bg-white/10 disabled:opacity-50"
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
                                    className="flex-1"
                                    style={{ backgroundColor: '#3b82f6', color: '#ffffff' }}
                                >
                                    {currentStep === steps.length - 1 ? 'Done' : 'Next Step'}
                                </Button>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </>
    );
}
