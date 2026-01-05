import React from 'react';
import SpotLightCard from '@/components/animations/SpotlightCard'; // Previous step created this
import CountUp from '@/components/animations/CountUp';
import { Activity, ShieldCheck, FileText, CheckCircle } from 'lucide-react';

export default function DashboardStats({ stats }) {
    const cards = [
        {
            label: "Total Scans",
            value: stats.totalScans || 0,
            icon: Activity,
            color: "text-blue-500",
            bg: "bg-blue-500/10",
        },
        {
            label: "Avg Originality",
            value: stats.avgOriginality || 0,
            suffix: '%',
            icon: ShieldCheck,
            color: "text-green-500",
            bg: "bg-green-500/10",
        },
        {
            label: "Citations Checked",
            value: stats.totalCitations || 0,
            icon: FileText,
            color: "text-purple-500",
            bg: "bg-purple-500/10",
        },
        {
            label: "Last Activity",
            textValue: stats.recentActivity || 'N/A',
            icon: CheckCircle,
            color: "text-orange-500",
            bg: "bg-orange-500/10",
            isText: true
        }
    ];

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            {cards.map((card, index) => (
                <SpotLightCard
                    key={card.label}
                    className="h-full"
                    spotlightColor="rgba(59, 130, 246, 0.2)"
                >
                    <div className="p-5 relative z-10">
                        <div className="flex justify-between items-start mb-2">
                            <p className="text-sm font-medium text-muted-foreground">{card.label}</p>
                            <div className={`p-2 rounded-lg ${card.bg} ${card.color}`}>
                                <card.icon className="w-4 h-4" />
                            </div>
                        </div>
                        <h3 className="text-2xl font-bold tracking-tight flex items-baseline">
                            {card.isText ? (
                                card.textValue
                            ) : (
                                <>
                                    <CountUp
                                        to={card.value}
                                        duration={1.5}
                                        className="inline-block"
                                    />
                                    {card.suffix && <span className="text-lg ml-0.5">{card.suffix}</span>}
                                </>
                            )}
                        </h3>
                    </div>
                </SpotLightCard>
            ))}
        </div>
    );
}
