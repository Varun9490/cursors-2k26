'use client';

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    CheckCircle2, AlertTriangle, XCircle, ChevronDown, ChevronUp, ExternalLink
} from 'lucide-react';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover";

export default function CitationTable({ citations }) {
    const [expandedRow, setExpandedRow] = React.useState(null);

    const toggleRow = (id) => {
        setExpandedRow(expandedRow === id ? null : id);
    };

    const getStatusIcon = (status) => {
        switch (status) {
            case 'VERIFIED': return <CheckCircle2 className="w-4 h-4 text-green-500" />;
            case 'SUSPICIOUS': return <AlertTriangle className="w-4 h-4 text-yellow-500" />;
            case 'INVALID': return <XCircle className="w-4 h-4 text-red-500" />;
            default: return null;
        }
    };

    const getStatusBadge = (status) => {
        switch (status) {
            case 'VERIFIED': return <Badge variant="outline" className="border-green-500/50 text-green-500 bg-green-500/10 gap-1 pl-1"> {getStatusIcon(status)} Verified </Badge>;
            case 'SUSPICIOUS': return <Badge variant="outline" className="border-yellow-500/50 text-yellow-500 bg-yellow-500/10 gap-1 pl-1"> {getStatusIcon(status)} Suspicious </Badge>;
            case 'INVALID': return <Badge variant="outline" className="border-red-500/50 text-red-500 bg-red-500/10 gap-1 pl-1"> {getStatusIcon(status)} Invalid </Badge>;
            default: return <Badge variant="outline">Unknown</Badge>;
        }
    };

    return (
        <div className="rounded-md border border-border/50 bg-card overflow-hidden shadow-sm">
            <Table>
                <TableHeader className="bg-muted/50">
                    <TableRow>
                        <TableHead className="w-[50px]">#</TableHead>
                        <TableHead>Citation Text</TableHead>
                        <TableHead className="w-[100px]">Format</TableHead>
                        <TableHead className="w-[120px]">Status</TableHead>
                        <TableHead className="w-[80px]">Score</TableHead>
                        <TableHead className="w-[80px]">Issues</TableHead>
                        <TableHead className="w-[50px]"></TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {citations.map((citation, index) => (
                        <React.Fragment key={citation.id || index}>
                            <TableRow
                                className={`cursor-pointer transition-colors hover:bg-muted/30 ${expandedRow === citation.id ? 'bg-muted/30 border-l-4 border-l-primary' : ''}`}
                                onClick={() => toggleRow(citation.id)}
                            >
                                <TableCell className="font-medium text-muted-foreground">{index + 1}</TableCell>
                                <TableCell className="font-serif text-sm">
                                    <div className="line-clamp-1 max-w-[400px]">
                                        {citation.rawText}
                                    </div>
                                </TableCell>
                                <TableCell>
                                    <Badge variant="secondary" className="text-xs uppercase bg-primary/10 text-primary hover:bg-primary/20">{citation.format}</Badge>
                                </TableCell>
                                <TableCell>
                                    {getStatusBadge(citation.status)}
                                </TableCell>
                                <TableCell>
                                    <span className={`font-bold ${citation.validityScore >= 80 ? 'text-green-500' :
                                            citation.validityScore >= 50 ? 'text-yellow-500' : 'text-red-500'
                                        }`}>
                                        {citation.validityScore}%
                                    </span>
                                </TableCell>
                                <TableCell>
                                    {citation.issues?.length > 0 ? (
                                        <Popover>
                                            <PopoverTrigger asChild>
                                                <Badge variant="destructive" className="cursor-pointer hover:scale-105 transition-transform">
                                                    {citation.issues.length} Issues
                                                </Badge>
                                            </PopoverTrigger>
                                            <PopoverContent className="w-60 p-3 space-y-2">
                                                <h4 className="font-semibold text-sm mb-2">Issue Details</h4>
                                                <ul className="text-xs space-y-1 list-disc pl-4 text-muted-foreground">
                                                    {citation.issues.map((issue, i) => (
                                                        <li key={i}>{issue}</li>
                                                    ))}
                                                </ul>
                                            </PopoverContent>
                                        </Popover>
                                    ) : (
                                        <Badge variant="outline" className="text-muted-foreground bg-muted">0</Badge>
                                    )}
                                </TableCell>
                                <TableCell>
                                    {expandedRow === citation.id ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                                </TableCell>
                            </TableRow>

                            {/* Expanded Details */}
                            <AnimatePresence>
                                {expandedRow === citation.id && (
                                    <TableRow>
                                        <TableCell colSpan={7} className="p-0 border-b border-border/50 bg-muted/10">
                                            <motion.div
                                                initial={{ height: 0, opacity: 0 }}
                                                animate={{ height: "auto", opacity: 1 }}
                                                exit={{ height: 0, opacity: 0 }}
                                                transition={{ duration: 0.3 }}
                                                className="overflow-hidden"
                                            >
                                                <div className="p-6 grid gap-6 md:grid-cols-2">
                                                    <div className="space-y-4">
                                                        <h4 className="font-semibold text-sm">Full Citation</h4>
                                                        <div className="p-3 bg-background rounded-md border border-border text-sm font-serif italic text-foreground/80 leading-relaxed shadow-sm">
                                                            {citation.rawText}
                                                        </div>
                                                        {citation.suggestedCorrection && (
                                                            <div className="space-y-2">
                                                                <h4 className="font-semibold text-sm text-green-600 flex items-center gap-2">
                                                                    <CheckCircle2 className="w-4 h-4" /> Suggested Correction
                                                                </h4>
                                                                <div className="p-3 bg-green-500/10 rounded-md border border-green-500/20 text-sm font-serif italic text-green-700 dark:text-green-300">
                                                                    {citation.suggestedCorrection}
                                                                </div>
                                                                <Button size="sm" variant="outline" className="text-xs h-8">Apply Correction</Button>
                                                            </div>
                                                        )}
                                                    </div>

                                                    <div className="space-y-4">
                                                        <h4 className="font-semibold text-sm">Verification Checks</h4>
                                                        <div className="space-y-2">
                                                            <CheckItem
                                                                label="DOI Lookip"
                                                                result={citation.verificationDetails?.doi}
                                                            />
                                                            <CheckItem
                                                                label="URL Check"
                                                                result={citation.verificationDetails?.url}
                                                            />
                                                            <CheckItem
                                                                label="AI Hallucination Analysis"
                                                                aiResult={citation.verificationDetails?.ai}
                                                            />
                                                        </div>
                                                    </div>
                                                </div>
                                            </motion.div>
                                        </TableCell>
                                    </TableRow>
                                )}
                            </AnimatePresence>
                        </React.Fragment>
                    ))}
                </TableBody>
            </Table>
        </div>
    );
}

function CheckItem({ label, result, aiResult }) {
    let status = 'neutral'; // neutral, success, error
    let text = 'Not applicable';

    if (aiResult) {
        status = aiResult.likelyFake ? 'error' : 'success';
        text = aiResult.likelyFake
            ? `Flagged as suspicious (${(aiResult.confidence * 100).toFixed(0)}% confidence)`
            : `Passed Check (${(aiResult.confidence * 100).toFixed(0)}% confidence)`;
    } else if (result) {
        status = result.valid ? 'success' : 'error';
        text = result.valid
            ? (result.metadata?.title || 'Verified')
            : (result.reason || result.error || 'Failed');
    }

    return (
        <div className="flex items-center justify-between p-2 rounded-md bg-background border border-border/50 text-sm">
            <span className="text-muted-foreground">{label}</span>
            <div className="flex items-center gap-2">
                <span className={`text-xs font-medium truncate max-w-[200px] ${status === 'success' ? 'text-green-500' :
                        status === 'error' ? 'text-red-500' : 'text-muted-foreground'
                    }`}>
                    {text}
                </span>
                {status === 'success' && <CheckCircle2 className="w-4 h-4 text-green-500" />}
                {status === 'error' && <XCircle className="w-4 h-4 text-red-500" />}
            </div>
        </div>
    )
}
