'use client';

import React from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

export default function ActivityGraph({ data }) {
    // Transform data for chart
    // Assuming data is an array of report objects with createdAt and originalityScore
    // We want to group by date or just show the sequence

    // Sort by date ascending for graph
    const chartData = [...data].sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt)).map(item => ({
        date: new Date(item.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric' }),
        score: Math.round(item.originalityScore),
        name: item.document.filename
    }));

    // If no data, show mock data for visualization
    const displayData = chartData.length > 0 ? chartData : [
        { date: 'Jan 1', score: 65 },
        { date: 'Jan 5', score: 80 },
        { date: 'Jan 10', score: 95 },
        { date: 'Jan 15', score: 88 },
        { date: 'Jan 20', score: 92 },
    ];

    return (
        <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
                <AreaChart
                    data={displayData}
                    margin={{
                        top: 10,
                        right: 10,
                        left: 0,
                        bottom: 0,
                    }}
                >
                    <defs>
                        <linearGradient id="colorScore" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3} />
                            <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                        </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(255,255,255,0.1)" />
                    <XAxis
                        dataKey="date"
                        stroke="#888888"
                        fontSize={12}
                        tickLine={false}
                        axisLine={false}
                    />
                    <YAxis
                        stroke="#888888"
                        fontSize={12}
                        tickLine={false}
                        axisLine={false}
                        tickFormatter={(value) => `${value}%`}
                        domain={[0, 100]}
                    />
                    <Tooltip
                        contentStyle={{ backgroundColor: 'rgba(0,0,0,0.8)', border: 'none', borderRadius: '8px' }}
                        itemStyle={{ color: '#fff' }}
                        labelStyle={{ color: '#aaa' }}
                    />
                    <Area
                        type="monotone"
                        dataKey="score"
                        stroke="#3b82f6"
                        fillOpacity={1}
                        fill="url(#colorScore)"
                        strokeWidth={2}
                    />
                </AreaChart>
            </ResponsiveContainer>
        </div>
    );
}
