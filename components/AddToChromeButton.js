'use client';

import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { X, Download, Chrome, CheckCircle, Copy, Check, ExternalLink } from 'lucide-react';
import { createPortal } from 'react-dom';

export default function AddToChromeButton() {
    const [showModal, setShowModal] = useState(false);
    const [currentStep, setCurrentStep] = useState(0);
    const [copied, setCopied] = useState(false);
    const [downloading, setDownloading] = useState(false);
    const [mounted, setMounted] = useState(false);

    // Track if component is mounted (for portal)
    useEffect(() => {
        setMounted(true);
        return () => setMounted(false);
    }, []);

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

    const handleDownload = async () => {
        setDownloading(true);
        try {
            // Download the extension ZIP file from public folder
            const link = document.createElement('a');
            link.href = '/plagiarism-extension.zip';
            link.download = 'plagdetect-extension.zip';
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);

            // Move to next step after download
            setTimeout(() => {
                setDownloading(false);
                setCurrentStep(1);
            }, 1000);
        } catch (err) {
            console.error('Download failed:', err);
            setDownloading(false);
        }
    };

    const steps = [
        {
            title: 'Download Extension',
            description: 'Click the button below to download the extension',
            action: 'download'
        },
        {
            title: 'Extract ZIP File',
            description: 'Extract the downloaded ZIP to a folder on your computer'
        },
        {
            title: 'Open Extensions Page',
            description: 'Copy & paste this URL in Chrome:',
            copyText: 'chrome://extensions/'
        },
        {
            title: 'Enable Developer Mode',
            description: 'Toggle "Developer mode" ON (top-right corner)'
        },
        {
            title: 'Load Extension',
            description: 'Click "Load unpacked" → Select the extracted folder'
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

    const handleOpenModal = () => {
        setShowModal(true);
    };

    const handleCloseModal = () => {
        setShowModal(false);
        setCurrentStep(0);
    };

    // Modal content
    const modalContent = (
        <div
            style={{
                position: 'fixed',
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                width: '100vw',
                height: '100vh',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                zIndex: 99999,
                backgroundColor: 'rgba(0, 0, 0, 0.85)',
                backdropFilter: 'blur(10px)',
                WebkitBackdropFilter: 'blur(10px)'
            }}
            onClick={handleCloseModal}
        >
            {/* Modal Box */}
            <div
                onClick={(e) => e.stopPropagation()}
                style={{
                    width: '90%',
                    maxWidth: '460px',
                    backgroundColor: '#0f172a',
                    borderRadius: '20px',
                    padding: '24px',
                    boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.8)',
                    border: '1px solid rgba(255, 255, 255, 0.15)',
                    maxHeight: '90vh',
                    overflowY: 'auto'
                }}
            >
                {/* Header */}
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <div style={{
                            width: '44px',
                            height: '44px',
                            borderRadius: '12px',
                            background: 'linear-gradient(135deg, #3b82f6, #8b5cf6)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center'
                        }}>
                            <Chrome style={{ width: '22px', height: '22px', color: 'white' }} />
                        </div>
                        <div>
                            <h3 style={{ fontSize: '17px', fontWeight: 700, color: '#ffffff', margin: 0 }}>
                                Install Extension
                            </h3>
                            <p style={{ fontSize: '12px', color: '#94a3b8', margin: 0 }}>
                                {steps.length} easy steps
                            </p>
                        </div>
                    </div>
                    <button
                        onClick={handleCloseModal}
                        style={{
                            background: 'rgba(255,255,255,0.1)',
                            border: 'none',
                            borderRadius: '8px',
                            padding: '8px',
                            cursor: 'pointer',
                            color: '#94a3b8',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center'
                        }}
                    >
                        <X style={{ width: '18px', height: '18px' }} />
                    </button>
                </div>

                {/* Steps */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', marginBottom: '20px' }}>
                    {steps.map((step, index) => (
                        <div
                            key={index}
                            onClick={() => setCurrentStep(index)}
                            style={{
                                display: 'flex',
                                alignItems: 'flex-start',
                                gap: '10px',
                                padding: '10px',
                                borderRadius: '10px',
                                cursor: 'pointer',
                                backgroundColor: currentStep === index
                                    ? 'rgba(59, 130, 246, 0.15)'
                                    : currentStep > index
                                        ? 'rgba(34, 197, 94, 0.08)'
                                        : 'transparent',
                                border: currentStep === index
                                    ? '1px solid rgba(59, 130, 246, 0.4)'
                                    : '1px solid transparent',
                                transition: 'all 0.15s'
                            }}
                        >
                            {/* Step Number */}
                            <div style={{
                                width: '26px',
                                height: '26px',
                                borderRadius: '50%',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                fontSize: '11px',
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
                                    <CheckCircle style={{ width: '14px', height: '14px' }} />
                                ) : (
                                    index + 1
                                )}
                            </div>

                            {/* Step Content */}
                            <div style={{ flex: 1, minWidth: 0 }}>
                                <p style={{ fontSize: '13px', fontWeight: 600, color: '#ffffff', margin: 0 }}>
                                    {step.title}
                                </p>
                                <p style={{ fontSize: '11px', color: '#94a3b8', margin: '2px 0 0 0' }}>
                                    {step.description}
                                </p>

                                {/* Download button */}
                                {step.action === 'download' && currentStep === index && (
                                    <button
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            handleDownload();
                                        }}
                                        disabled={downloading}
                                        style={{
                                            marginTop: '8px',
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            gap: '8px',
                                            width: '100%',
                                            padding: '10px 16px',
                                            borderRadius: '8px',
                                            border: 'none',
                                            background: downloading
                                                ? 'rgba(59, 130, 246, 0.3)'
                                                : 'linear-gradient(135deg, #3b82f6, #8b5cf6)',
                                            color: '#ffffff',
                                            fontSize: '13px',
                                            fontWeight: 600,
                                            cursor: downloading ? 'wait' : 'pointer',
                                            transition: 'all 0.2s'
                                        }}
                                    >
                                        <Download style={{ width: '16px', height: '16px' }} />
                                        {downloading ? 'Downloading...' : 'Download Extension (.zip)'}
                                    </button>
                                )}

                                {/* Copy URL button */}
                                {step.copyText && currentStep === index && (
                                    <button
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            handleCopy(step.copyText);
                                        }}
                                        style={{
                                            marginTop: '6px',
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
                                            marginTop: '6px',
                                            display: 'inline-flex',
                                            alignItems: 'center',
                                            gap: '4px',
                                            padding: '6px 10px',
                                            borderRadius: '6px',
                                            backgroundColor: 'rgba(59, 130, 246, 0.2)',
                                            color: '#60a5fa',
                                            fontSize: '11px',
                                            textDecoration: 'none'
                                        }}
                                    >
                                        <ExternalLink style={{ width: '12px', height: '12px' }} />
                                        Open GitHub
                                    </a>
                                )}
                            </div>
                        </div>
                    ))}
                </div>

                {/* Navigation Buttons */}
                <div style={{ display: 'flex', gap: '10px' }}>
                    <button
                        onClick={() => setCurrentStep(Math.max(0, currentStep - 1))}
                        disabled={currentStep === 0}
                        style={{
                            flex: 1,
                            padding: '10px',
                            borderRadius: '8px',
                            border: '1px solid rgba(255, 255, 255, 0.2)',
                            backgroundColor: 'transparent',
                            color: currentStep === 0 ? '#475569' : '#ffffff',
                            fontSize: '13px',
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
                                handleCloseModal();
                            }
                        }}
                        style={{
                            flex: 1,
                            padding: '10px',
                            borderRadius: '8px',
                            border: 'none',
                            backgroundColor: '#3b82f6',
                            color: '#ffffff',
                            fontSize: '13px',
                            fontWeight: 600,
                            cursor: 'pointer'
                        }}
                    >
                        {currentStep === steps.length - 1 ? 'Done' : 'Next'}
                    </button>
                </div>
            </div>
        </div>
    );

    return (
        <>
            {/* Button - Always rendered in a stable container */}
            <div style={{ display: 'inline-block' }}>
                <Button
                    size="lg"
                    onClick={handleOpenModal}
                    className="h-14 px-8 text-lg rounded-full bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white transition-colors duration-200 shadow-[0_0_20px_rgba(59,130,246,0.5)] hover:shadow-[0_0_30px_rgba(59,130,246,0.7)] flex items-center gap-2"
                >
                    <Chrome className="w-5 h-5" />
                    Add to Chrome
                </Button>
            </div>

            {/* Modal - Rendered via Portal to body */}
            {mounted && showModal && createPortal(modalContent, document.body)}
        </>
    );
}
