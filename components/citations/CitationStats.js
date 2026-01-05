'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { CheckCircle2, AlertTriangle, XCircle, BookOpen } from 'lucide-react';
import CountUp from 'react-countup';

export default function CitationStats({ stats }) {
    const cards = [
        {
            label: "Total Citations",
            value: stats.total,
            icon: BookOpen,
            color: "text-blue-500",
            bg: "bg-blue-500/10",
            border: "border-blue-500/20"
        },
        {
            label: "Verified",
            value: stats.verified,
            icon: CheckCircle2,
            color: "text-green-500",
            bg: "bg-green-500/10",
            border: "border-green-500/20"
        },
        {
            label: "Suspicious",
            value: stats.suspicious,
            icon: AlertTriangle,
            color: "text-yellow-500",
            bg: "bg-yellow-500/10",
            border: "border-yellow-500/20"
        },
        {
            label: "Invalid",
            value: stats.invalid,
            icon: XCircle,
            color: "text-red-500",
            bg: "bg-red-500/10",
            border: "border-red-500/20"
        }
    ];

    // Calculate Integrity Score
    const integrityScore = stats.total > 0 ? Math.round((stats.verified / stats.total) * 100) : 0;

    return (
        <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {cards.map((card, index) => (
                    <motion.div
                        key={card.label}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.1 }}
                        className={`p-4 rounded-xl border ${card.border} ${card.bg} relative overflow-hidden group hover:-translate-y-1 transition-transform duration-300`}
                    >
                        <div className="flex justify-between items-start">
                            <div>
                                <p className="text-sm font-medium text-muted-foreground mb-1">{card.label}</p>
                                <h3 className={`text-3xl font-bold ${card.color}`}>
                                    <CountUp end={card.value} duration={2} />
                                </h3>
                            </div>
                            <div className={`p-2 rounded-lg bg-background/50 ${card.color}`}>
                                <card.icon className="w-5 h-5" />
                            </div>
                        </div>
                    </motion.div>
                ))}
            </div>

            <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.4 }}
                className="bg-card/50 border border-border/50 rounded-lg p-4"
            >
                <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-semibold">Overall Citation Integrity</span>
                    <span className="text-sm font-bold">{integrityScore}% Verified</span>
                </div>
                <div className="h-3 w-full bg-muted rounded-full overflow-hidden">
                    <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${integrityScore}%` }}
                        transition={{ duration: 1.5, ease: "easeOut" }}
                        className={`h-full ${integrityScore > 80 ? 'bg-gradient-to-r from-green-500 to-emerald-400' :
                                integrityScore > 50 ? 'bg-gradient-to-r from-yellow-500 to-orange-400' :
                                    'bg-gradient-to-r from-red-500 to-pink-500'
                            }`}
                    />
                </div>
            </motion.div>
        </div>
    );
}
