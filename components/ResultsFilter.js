'use client';

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Filter, SortAsc, SortDesc, X } from 'lucide-react';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
    DropdownMenuCheckboxItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu';
import { Badge } from '@/components/ui/badge';

export default function ResultsFilter({ filters, setFilters, onSort, matches }) {
    const activeFiltersCount = (filters.types?.length || 0) + (filters.minScore > 0 ? 1 : 0);

    return (
        <div className="flex flex-wrap items-center gap-2 mb-6">
            <DropdownMenu>
                <DropdownMenuTrigger asChild>
                    <Button variant="outline" size="sm" className="gap-2 h-9 border-dashed">
                        <Filter className="w-4 h-4" />
                        Filters
                        {activeFiltersCount > 0 && (
                            <Badge variant="secondary" className="ml-1 h-5 px-1.5 text-[10px]">
                                {activeFiltersCount}
                            </Badge>
                        )}
                    </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="start" className="w-56">
                    <DropdownMenuLabel>Match Type</DropdownMenuLabel>
                    {['DIRECT', 'PARAPHRASED', 'SIMILAR'].map(type => (
                        <DropdownMenuCheckboxItem
                            key={type}
                            checked={filters.types?.includes(type)}
                            onCheckedChange={(checked) => {
                                const current = filters.types || [];
                                setFilters({
                                    ...filters,
                                    types: checked
                                        ? [...current, type]
                                        : current.filter(t => t !== type)
                                });
                            }}
                        >
                            {type.charAt(0) + type.slice(1).toLowerCase()}
                        </DropdownMenuCheckboxItem>
                    ))}
                    <DropdownMenuSeparator />
                    <DropdownMenuLabel>Similarity Score</DropdownMenuLabel>
                    <DropdownMenuCheckboxItem
                        checked={filters.minScore === 90}
                        onCheckedChange={(checked) => setFilters({ ...filters, minScore: checked ? 90 : 0 })}
                    >
                        High {'>'} 90%
                    </DropdownMenuCheckboxItem>
                    <DropdownMenuCheckboxItem
                        checked={filters.minScore === 75}
                        onCheckedChange={(checked) => setFilters({ ...filters, minScore: checked ? 75 : 0 })}
                    >
                        Moderate {'>'} 75%
                    </DropdownMenuCheckboxItem>
                </DropdownMenuContent>
            </DropdownMenu>

            <DropdownMenu>
                <DropdownMenuTrigger asChild>
                    <Button variant="outline" size="sm" className="gap-2 h-9 border-dashed">
                        <SortDesc className="w-4 h-4" />
                        Sort
                    </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="start">
                    <DropdownMenuItem onClick={() => onSort('scoreDesc')}>
                        Highest Similarity
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => onSort('scoreAsc')}>
                        Lowest Similarity
                    </DropdownMenuItem>
                </DropdownMenuContent>
            </DropdownMenu>

            <AnimatePresence>
                {activeFiltersCount > 0 && (
                    <motion.div
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.8 }}
                    >
                        <Button
                            variant="ghost"
                            size="sm"
                            className="h-9 px-2 text-muted-foreground"
                            onClick={() => setFilters({ types: [], minScore: 0 })}
                        >
                            Reset
                            <X className="w-4 h-4 ml-1" />
                        </Button>
                    </motion.div>
                )}
            </AnimatePresence>

            <div className="ml-auto text-sm text-muted-foreground">
                Showing {matches.length} matches
            </div>
        </div>
    );
}
