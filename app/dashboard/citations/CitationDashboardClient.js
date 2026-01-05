'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Loader2, ArrowLeft, RotateCw } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import CitationStats from '@/components/citations/CitationStats';
import CitationTable from '@/components/citations/CitationTable';

export default function CitationDashboardClient({ checkData }) {
    // This component receives the initial check result (if available) 
    // or fetches it if we are loading from a saved report ID.
    // For simplicity sake, assume we pass in the `checkData` object directly from the server component wrapper.
    const [data, setData] = useState(checkData);

    // If data is just a skeleton or we want to re-validate:
    const reValidate = async () => {
        // Call API logic again
        alert("Re-validation triggered (Integration Pending)");
    };

    if (!data) {
        return (
            <div className="flex h-screen items-center justify-center">
                <Loader2 className="w-10 h-10 animate-spin text-primary" />
                <span className="ml-4 text-lg">Loading Citation Report...</span>
            </div>
        )
    }

    const stats = {
        total: data.total || 0,
        verified: data.verified || 0,
        suspicious: data.suspicious || 0,
        invalid: data.invalid || 0
    };

    return (
        <div className="min-h-screen bg-background pb-20">
            {/* Header */}
            <div className="border-b border-border/40 bg-background/80 backdrop-blur-md sticky top-0 z-40">
                <div className="container mx-auto px-4 h-16 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <Link href="/dashboard">
                            <Button variant="ghost" size="icon">
                                <ArrowLeft className="w-5 h-5" />
                            </Button>
                        </Link>
                        <div>
                            <h1 className="font-semibold text-lg">Citation Integrity Report</h1>
                            <p className="text-xs text-muted-foreground">AI Hallucination & Fact Check</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-2">
                        <Button variant="outline" size="sm" onClick={reValidate} className="gap-2">
                            <RotateCw className="w-4 h-4" /> Re-Check
                        </Button>
                        <Button size="sm" className="bg-blue-600 hover:bg-blue-700">
                            Download Report
                        </Button>
                    </div>
                </div>
            </div>

            <main className="container mx-auto px-4 py-8 space-y-8 max-w-7xl">
                {/* Stats Section */}
                <CitationStats stats={stats} />

                {/* Filters & Actions (Placeholder for layout) */}
                <div className="flex items-center justify-between">
                    <h2 className="text-xl font-bold">Citation List</h2>
                    {/* Filters would go here */}
                </div>

                {/* Data Table */}
                <CitationTable citations={data.citations || []} />
            </main>
        </div>
    );
}
