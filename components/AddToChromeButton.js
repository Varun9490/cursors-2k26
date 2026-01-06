'use client';

import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { X, Download, Chrome, CheckCircle, Copy, Check } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function AddToChromeButton() {
    const [showModal, setShowModal] = useState(false);
    const [currentStep, setCurrentStep] = useState(0);
    const [copied, setCopied] = useState(false);

    // Prevent body scroll when modal is open
    useEffect(() => {
        if (showModal) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = 'unset';
        }
        return () => {
            document.body.style.overflow = 'unset';
        };
    }, [showModal]);

    const steps = [
        {
            title: 'Download Extension',
            description: 'Get the extension folder from GitHub',
            link: 'https://github.com/Varun9490/cursors-2k26'
        },
        {
            title: 'Open Extensions Page',
            description: 'Copy & paste this URL in Chrome:',
            copyText: 'chrome://extensions/'
        },
        {
            title: 'Enable Developer Mode',
            description: 'Toggle "Developer mode" ON (top-right)'
        },
        {
            title: 'Load Extension',
            description: 'Click "Load unpacked" → Select folder'
        },
        {
            title: 'Done!',
            description: 'Pin extension & start checking! 🎉'
        }
    ];

    const handleCopy = (text) => {
        navigator.clipboard.writeText(text);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
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
                    <>
                        {/* Backdrop with blur */}
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => setShowModal(false)}
                            style={{
                                position: 'fixed',
                                top: 0,
                                left: 0,
                                right: 0,
                                bottom: 0,
                                backgroundColor: 'rgba(0, 0, 0, 0.8)',
                                backdropFilter: 'blur(8px)',
                                WebkitBackdropFilter: 'blur(8px)',
                                zIndex: 99998
                            }}
                        />

                        {/* Modal Container - Fixed Center */}
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.95 }}
                            transition={{ duration: 0.2 }}
                            style={{
                                position: 'fixed',
                                top: '50%',
                                left: '50%',
                                transform: 'translate(-50%, -50%)',
                                zIndex: 99999,
                                width: '90%',
                                maxWidth: '450px'
                            }}
                        >
                            <div
                                style={{
                                    backgroundColor: '#0f172a',
                                    borderRadius: '16px',
                                    padding: '24px',
                                    boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)',
                                    border: '1px solid rgba(255, 255, 255, 0.1)'
                                }}
                            >
                                {/* Header */}
                                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px' }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                        <div style={{
                                            width: '48px',
                                            height: '48px',
                                            borderRadius: '12px',
                                            background: 'linear-gradient(135deg, #3b82f6, #8b5cf6)',
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center'
                                        }}>
                                            <Chrome style={{ width: '24px', height: '24px', color: 'white' }} />
                                        </div>
                                        <div>
                                            <h3 style={{ fontSize: '18px', fontWeight: 700, color: '#ffffff', margin: 0 }}>
                                                Install Extension
                                            </h3>
                                            <p style={{ fontSize: '13px', color: '#94a3b8', margin: 0 }}>
                                                5 easy steps
                                            </p>
                                        </div>
                                    </div>
                                    <button
                                        onClick={() => setShowModal(false)}
                                        style={{
                                            background: 'rgba(255,255,255,0.1)',
                                            border: 'none',
                                            borderRadius: '8px',
                                            padding: '8px',
                                            cursor: 'pointer',
                                            color: '#94a3b8'
                                        }}
                                    >
                                        <X style={{ width: '20px', height: '20px' }} />
                                    </button>
                                </div>

                                {/* Steps - Compact */}
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '20px' }}>
                                    {steps.map((step, index) => (
                                        <div
                                            key={index}
                                            onClick={() => setCurrentStep(index)}
                                            style={{
                                                display: 'flex',
                                                alignItems: 'flex-start',
                                                gap: '12px',
                                                padding: '12px',
                                                borderRadius: '10px',
                                                cursor: 'pointer',
                                                backgroundColor: currentStep === index
                                                    ? 'rgba(59, 130, 246, 0.2)'
                                                    : currentStep > index
                                                        ? 'rgba(34, 197, 94, 0.1)'
                                                        : 'rgba(255, 255, 255, 0.03)',
                                                border: currentStep === index
                                                    ? '1px solid rgba(59, 130, 246, 0.5)'
                                                    : '1px solid transparent',
                                                transition: 'all 0.2s'
                                            }}
                                        >
                                            {/* Step Number */}
                                            <div style={{
                                                width: '28px',
                                                height: '28px',
                                                borderRadius: '50%',
                                                display: 'flex',
                                                alignItems: 'center',
                                                justifyContent: 'center',
                                                fontSize: '12px',
                                                fontWeight: 700,
                                                flexShrink: 0,
                                                backgroundColor: currentStep > index
                                                    ? '#22c55e'
                                                    : currentStep === index
                                                        ? '#3b82f6'
                                                        : 'rgba(255, 255, 255, 0.1)',
                                                color: currentStep >= index ? '#ffffff' : '#64748b'
                                            }}>
                                                {currentStep > index ? (
                                                    <CheckCircle style={{ width: '16px', height: '16px' }} />
                                                ) : (
                                                    index + 1
                                                )}
                                            </div>

                                            {/* Step Content */}
                                            <div style={{ flex: 1, minWidth: 0 }}>
                                                <p style={{
                                                    fontSize: '14px',
                                                    fontWeight: 600,
                                                    color: '#ffffff',
                                                    margin: 0
                                                }}>
                                                    {step.title}
                                                </p>
                                                <p style={{
                                                    fontSize: '12px',
                                                    color: '#94a3b8',
                                                    margin: '2px 0 0 0'
                                                }}>
                                                    {step.description}
                                                </p>

                                                {/* Copy URL button */}
                                                {step.copyText && currentStep === index && (
                                                    <button
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            handleCopy(step.copyText);
                                                        }}
                                                        style={{
                                                            marginTop: '8px',
                                                            display: 'flex',
                                                            alignItems: 'center',
                                                            justifyContent: 'space-between',
                                                            width: '100%',
                                                            padding: '8px 12px',
                                                            borderRadius: '6px',
                                                            border: 'none',
                                                            backgroundColor: 'rgba(59, 130, 246, 0.2)',
                                                            color: '#60a5fa',
                                                            fontSize: '12px',
                                                            fontFamily: 'monospace',
                                                            cursor: 'pointer'
                                                        }}
                                                    >
                                                        <span>{step.copyText}</span>
                                                        {copied ? (
                                                            <Check style={{ width: '14px', height: '14px', color: '#22c55e' }} />
                                                        ) : (
                                                            <Copy style={{ width: '14px', height: '14px' }} />
                                                        )}
                                                    </button>
                                                )}

                                                {/* GitHub link */}
                                                {step.link && currentStep === index && (
                                                    <a
                                                        href={step.link}
                                                        target="_blank"
                                                        rel="noopener noreferrer"
                                                        onClick={(e) => e.stopPropagation()}
                                                        style={{
                                                            marginTop: '8px',
                                                            display: 'inline-flex',
                                                            alignItems: 'center',
                                                            gap: '6px',
                                                            padding: '8px 12px',
                                                            borderRadius: '6px',
                                                            backgroundColor: 'rgba(59, 130, 246, 0.2)',
                                                            color: '#60a5fa',
                                                            fontSize: '12px',
                                                            textDecoration: 'none'
                                                        }}
                                                    >
                                                        <Download style={{ width: '14px', height: '14px' }} />
                                                        Open GitHub
                                                    </a>
                                                )}
                                            </div>
                                        </div>
                                    ))}
                                </div>

                                {/* Navigation Buttons */}
                                <div style={{ display: 'flex', gap: '12px' }}>
                                    <button
                                        onClick={() => setCurrentStep(Math.max(0, currentStep - 1))}
                                        disabled={currentStep === 0}
                                        style={{
                                            flex: 1,
                                            padding: '12px',
                                            borderRadius: '8px',
                                            border: '1px solid rgba(255, 255, 255, 0.2)',
                                            backgroundColor: 'transparent',
                                            color: currentStep === 0 ? '#475569' : '#ffffff',
                                            fontSize: '14px',
                                            fontWeight: 600,
                                            cursor: currentStep === 0 ? 'not-allowed' : 'pointer'
                                        }}
                                    >
                                        Previous
                                    </button>
                                    <button
                                        onClick={() => {
                                            if (currentStep < steps.length - 1) {
                                                setCurrentStep(currentStep + 1);
                                            } else {
                                                setShowModal(false);
                                                setCurrentStep(0);
                                            }
                                        }}
                                        style={{
                                            flex: 1,
                                            padding: '12px',
                                            borderRadius: '8px',
                                            border: 'none',
                                            backgroundColor: '#3b82f6',
                                            color: '#ffffff',
                                            fontSize: '14px',
                                            fontWeight: 600,
                                            cursor: 'pointer'
                                        }}
                                    >
                                        {currentStep === steps.length - 1 ? 'Done' : 'Next'}
                                    </button>
                                </div>
                            </div>
                        </motion.div>
                    </>
                )}
            </AnimatePresence>
        </>
    );
}
