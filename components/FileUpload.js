'use client';

import React, { useRef, useState } from 'react';
import { cn } from '@/lib/utils';
import { Upload, File, X, CheckCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function FileUpload({ onFileSelect }) {
    const [isDragging, setIsDragging] = useState(false);
    const [file, setFile] = useState(null);
    const inputRef = useRef(null);

    const handleDragEnter = (e) => {
        e.preventDefault();
        setIsDragging(true);
    };

    const handleDragLeave = (e) => {
        e.preventDefault();
        setIsDragging(false);
    };

    const handleDrop = (e) => {
        e.preventDefault();
        setIsDragging(false);

        if (e.dataTransfer.files && e.dataTransfer.files[0]) {
            handleFile(e.dataTransfer.files[0]);
        }
    };

    const handleChange = (e) => {
        if (e.target.files && e.target.files[0]) {
            handleFile(e.target.files[0]);
        }
    };

    const handleFile = (selectedFile) => {
        // Validate file type/size if needed
        setFile(selectedFile);
        onFileSelect?.(selectedFile);
    };

    const removeFile = (e) => {
        e.stopPropagation();
        setFile(null);
        onFileSelect?.(null);
        if (inputRef.current) inputRef.current.value = '';
    };

    return (
        <div className="w-full">
            <div
                onClick={() => inputRef.current?.click()}
                onDragOver={(e) => e.preventDefault()}
                onDragEnter={handleDragEnter}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                className={cn(
                    "relative border-2 border-dashed rounded-xl p-8 transition-all duration-300 cursor-pointer overflow-hidden",
                    isDragging
                        ? "border-primary bg-primary/5 scale-[1.02] shadow-lg"
                        : "border-border/50 hover:border-primary/50 hover:bg-muted/30",
                    "group"
                )}
            >
                <input
                    ref={inputRef}
                    type="file"
                    className="hidden"
                    accept=".txt,.docx,.pdf,.pptx"
                    onChange={handleChange}
                />

                <AnimatePresence mode="wait">
                    {!file ? (
                        <motion.div
                            key="empty"
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95 }}
                            className="flex flex-col items-center justify-center text-center space-y-4"
                        >
                            <div className={cn(
                                "w-16 h-16 rounded-full bg-muted flex items-center justify-center transition-colors group-hover:bg-primary/10",
                                isDragging && "animate-bounce bg-primary/20"
                            )}>
                                <Upload className={cn("w-8 h-8 text-muted-foreground transition-colors group-hover:text-primary", isDragging && "text-primary")} />
                            </div>
                            <div>
                                <p className="text-lg font-medium">Click to upload or drag and drop</p>
                                <p className="text-sm text-muted-foreground mt-1">.txt, .pdf, .docx, .pptx (max 10MB)</p>
                            </div>
                        </motion.div>
                    ) : (
                        <motion.div
                            key="file"
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, y: -20 }}
                            className="flex items-center justify-between bg-card border border-border rounded-lg p-4 shadow-sm"
                            onClick={(e) => e.stopPropagation()}
                        >
                            <div className="flex items-center gap-4">
                                <div className="w-12 h-12 rounded-lg bg-blue-500/10 flex items-center justify-center text-blue-500">
                                    <File className="w-6 h-6" />
                                </div>
                                <div>
                                    <p className="font-medium text-sm truncate max-w-[200px]">{file.name}</p>
                                    <p className="text-xs text-muted-foreground">{(file.size / 1024 / 1024).toFixed(2)} MB</p>
                                </div>
                            </div>

                            <div className="flex items-center gap-2">
                                <motion.div
                                    initial={{ scale: 0 }}
                                    animate={{ scale: 1 }}
                                    className="w-6 h-6 rounded-full bg-green-500/20 flex items-center justify-center text-green-500"
                                >
                                    <CheckCircle className="w-4 h-4" />
                                </motion.div>

                                <button
                                    onClick={removeFile}
                                    className="p-2 hover:bg-destructive/10 hover:text-destructive rounded-full transition-colors"
                                >
                                    <X className="w-5 h-5" />
                                </button>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* Scanning effect overlay */}
                {isDragging && (
                    <div className="absolute inset-0 pointer-events-none bg-gradient-to-b from-transparent via-primary/5 to-transparent animate-scan" style={{ height: '30%', top: '-30%' }} />
                )}
            </div>
        </div>
    );
}
