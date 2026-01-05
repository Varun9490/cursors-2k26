'use client';

import React, { useState, useEffect } from 'react';
import TextEditor from '@/components/TextEditor';
import FileUpload from '@/components/FileUpload';
import AnalyzeButton from '@/components/AnalyzeButton';
import DashboardStats from '@/components/DashboardStats';
import { Card, CardContent } from '@/components/ui/card';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { motion } from 'framer-motion';
import { FileText, Clock, ArrowRight, Activity } from 'lucide-react';
import Link from 'next/link';
import ActivityGraph from '@/components/ActivityGraph';

import ProcessingOverlay from '@/components/ProcessingOverlay';
import { toast } from 'sonner';

import { driver } from 'driver.js';
import 'driver.js/dist/driver.css';
import { dashboardSteps } from '@/lib/onboardingSteps';

export default function DashboardClient({ initialHistory = [], stats }) {
    const [activeInput, setActiveInput] = useState('text');
    const [textContent, setTextContent] = useState('');
    const [file, setFile] = useState(null);
    const [isAnalyzing, setIsAnalyzing] = useState(false);
    const [processingStep, setProcessingStep] = useState(1);

    // Onboarding Tour
    useEffect(() => {
        const hasSeenTour = localStorage.getItem('plagdetect_tour_seen');
        if (!hasSeenTour) {
            const driverObj = driver({
                showProgress: true,
                steps: dashboardSteps,
                onDestroyStarted: () => {
                    localStorage.setItem('plagdetect_tour_seen', 'true');
                    driverObj.destroy();
                },
            });

            // Small delay to ensure render
            setTimeout(() => {
                driverObj.drive();
            }, 1000);
        }
    }, []);

    const handleAnalyze = async () => {
        setIsAnalyzing(true);
        setProcessingStep(1);

        try {
            let documentId;
            let finalFilename = 'Direct Input';

            // Step 1: Upload / Prepare (2s simulated delay for text, real upload for file)
            if (activeInput === 'file' && file) {
                const formData = new FormData();
                formData.append('file', file);

                const uploadRes = await fetch('/api/documents/upload', {
                    method: 'POST',
                    body: formData,
                });

                if (!uploadRes.ok) {
                    const err = await uploadRes.json();
                    throw new Error(err.error || 'Upload failed');
                }

                const uploadData = await uploadRes.json();
                documentId = uploadData.documentId;
                finalFilename = uploadData.filename;

                toast.success('File uploaded and processed successfully');
            } else {
                if (!textContent || textContent.trim().length === 0) {
                    toast.error("Please enter some text");
                    setIsAnalyzing(false);
                    return;
                }
                // Small delay to show "Processing" state for text
                await new Promise(r => setTimeout(r, 800));
            }

            // Step 2: Semantic Analysis
            setProcessingStep(3); // Jump to analysis

            const response = await fetch('/api/plagiarism/semantic', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    text: activeInput === 'text' ? textContent : undefined,
                    documentId,
                    filename: finalFilename
                }),
            });

            if (!response.ok) {
                const err = await response.json();
                throw new Error(err.error || 'Analysis failed');
            }

            const data = await response.json();

            toast.success('Analysis complete! Redirecting...');

            // Redirect to results
            window.location.href = `/dashboard/results/${data.reportId}`;

        } catch (error) {
            console.error(error);
            toast.error(error.message || "An error occurred");
            setIsAnalyzing(false);
        }
    };

    return (
        <div className="container mx-auto p-4 md:p-8 max-w-7xl animate-in fade-in slide-in-from-bottom-4 duration-500">
            {/* Header */}
            <div className="mb-8 space-y-2">
                <h1 className="text-3xl font-bold tracking-tight">Overview</h1>
                <p className="text-muted-foreground">Welcome back! Here's your activity summary.</p>
            </div>

            {/* Stats Overview */}
            {stats && <DashboardStats stats={stats} />}

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Main Analysis Area - Replaced with Graphs */}
                <div className="lg:col-span-2 space-y-6">
                    <Card className="border-border/50 shadow-sm bg-card/60 backdrop-blur-sm">
                        <CardContent className="p-6">
                            <Tabs defaultValue="text" value={activeInput} onValueChange={setActiveInput} className="w-full">
                                <TabsList className="grid w-full grid-cols-2 mb-6 max-w-[400px]">
                                    <TabsTrigger value="text" className="flex items-center gap-2">
                                        <FileText className="w-4 h-4" /> Text Input
                                    </TabsTrigger>
                                    <TabsTrigger value="file" className="flex items-center gap-2">
                                        <FileText className="w-4 h-4" /> File Upload
                                    </TabsTrigger>
                                </TabsList>

                                <TabsContent value="text" className="space-y-4 focus-visible:outline-none focus:outline-none">
                                    <TextEditor
                                        content={textContent}
                                        onChange={setTextContent}
                                    />
                                </TabsContent>

                                <TabsContent value="file" className="space-y-4 focus-visible:outline-none focus:outline-none">
                                    <div className="max-w-xl">
                                        <FileUpload onFileSelect={setFile} />
                                    </div>
                                </TabsContent>
                            </Tabs>

                            <div className="mt-8 flex justify-end">
                                <AnalyzeButton
                                    onClick={handleAnalyze}
                                    isLoading={isAnalyzing}
                                    disabled={isAnalyzing || (activeInput === 'text' ? !textContent : !file)}
                                />
                            </div>
                        </CardContent>
                    </Card>
                    <Card className="border-border/50 shadow-sm overflow-hidden h-[400px]">
                        <CardContent className="p-0 h-full flex flex-col">
                            <div className="p-4 border-b border-border/50 bg-muted/20 flex items-center justify-between">
                                <h2 className="font-semibold flex items-center gap-2">
                                    <Activity className="w-4 h-4 text-primary" />
                                    Performance Trends
                                </h2>
                            </div>
                            <div className="flex-1 p-4 w-full h-full">
                                <ActivityGraph data={initialHistory} />
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Sidebar: Recent & Tips */}
                <div className="space-y-6">
                    <Card className="border-border/50 shadow-sm h-full max-h-[600px] flex flex-col">
                        <div className="p-4 border-b border-border/50 flex items-center justify-between bg-muted/10">
                            <h3 className="font-semibold flex items-center gap-2">
                                <Clock className="w-4 h-4 text-muted-foreground" />
                                Recent Activity
                            </h3>
                            <Link href="/dashboard/history">
                                <Button variant="ghost" size="sm" className="h-8 text-xs gap-1">
                                    View All <ArrowRight className="w-3 h-3" />
                                </Button>
                            </Link>
                        </div>
                        <CardContent className="p-4 overflow-y-auto flex-1 custom-scrollbar">
                            {initialHistory.length > 0 ? (
                                <div className="space-y-3">
                                    {initialHistory.map((item) => (
                                        <Link key={item.id} href={`/dashboard/results/${item.id}`}>
                                            <div className="flex items-center justify-between p-3 rounded-lg bg-muted/30 hover:bg-muted transition-colors cursor-pointer group border border-transparent hover:border-border/50">
                                                <div className="flex items-center gap-3 overflow-hidden">
                                                    <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${item.originalityScore > 80 ? 'bg-green-500/10 text-green-500' :
                                                        item.originalityScore > 50 ? 'bg-yellow-500/10 text-yellow-500' :
                                                            'bg-red-500/10 text-red-500'
                                                        }`}>
                                                        <span className="text-xs font-bold">{Math.round(item.originalityScore)}</span>
                                                    </div>
                                                    <div className="text-sm overflow-hidden">
                                                        <div className="font-medium group-hover:text-primary transition-colors truncate max-w-[150px]">
                                                            {item.document?.filename || 'Untitled Doc'}
                                                        </div>
                                                        <div className="text-xs text-muted-foreground">
                                                            {new Date(item.createdAt).toLocaleDateString()}
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        </Link>
                                    ))}
                                </div>
                            ) : (
                                <div className="text-center py-12 text-muted-foreground">
                                    <p className="text-sm">No recent scans yet.</p>
                                    <Button variant="link" onClick={() => document.querySelector('textarea')?.focus()} className="mt-2 h-auto p-0">
                                        Start your first scan
                                    </Button>
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </div>
            </div>
            {/* Overlay */}
            <ProcessingOverlay
                isLoading={isAnalyzing}
                currentStep={processingStep}
                onCancel={() => setIsAnalyzing(false)}
            />
        </div>
    );
}
