'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { FolderOpen } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function EmptyState({
    title = "No items found",
    description = "Get started by creating your first item.",
    actionLabel,
    onAction
}) {
    return (
        <div className="flex flex-col items-center justify-center p-8 text-center h-64 border-2 border-dashed border-border/50 rounded-xl bg-muted/5">
            <motion.div
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ duration: 0.5 }}
                className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mb-4"
            >
                <FolderOpen className="w-8 h-8 text-primary" />
            </motion.div>

            <motion.div
                initial={{ y: 10, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.2 }}
            >
                <h3 className="text-lg font-semibold">{title}</h3>
                <p className="text-sm text-muted-foreground mt-1 max-w-sm mx-auto">{description}</p>

                {actionLabel && (
                    <Button
                        onClick={onAction}
                        className="mt-6"
                        variant="default"
                    >
                        {actionLabel}
                    </Button>
                )}
            </motion.div>
        </div>
    );
}
