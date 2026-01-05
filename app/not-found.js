'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { FileQuestion } from 'lucide-react';

export default function NotFound() {
    return (
        <div className="min-h-screen flex flex-col items-center justify-center bg-background text-foreground p-4">
            <div className="w-24 h-24 bg-muted/20 rounded-2xl flex items-center justify-center mb-6 animate-bounce">
                <FileQuestion className="w-12 h-12 text-muted-foreground" />
            </div>
            <h1 className="text-4xl font-bold mb-2 text-center">Page Not Found</h1>
            <p className="text-muted-foreground mb-8 text-center max-w-md">
                The page you are looking for might have been removed, had its name changed, or is temporarily unavailable.
            </p>
            <Link href="/">
                <Button size="lg" className="bg-gradient-to-r from-blue-600 to-purple-600">
                    Return Home
                </Button>
            </Link>
        </div>
    );
}
