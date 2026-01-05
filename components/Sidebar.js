'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import {
    LayoutDashboard,
    FileText,
    History,
    Settings,
    ChevronLeft,
    ChevronRight,
    LogOut
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { signOut } from 'next-auth/react';

const menuItems = [
    { icon: LayoutDashboard, label: 'Dashboard', href: '/dashboard' },
    { icon: FileText, label: 'New Check', href: '/dashboard/new' },
    { icon: History, label: 'History', href: '/dashboard/history' },
    { icon: Settings, label: 'Settings', href: '/dashboard/settings' },
];

export default function Sidebar() {
    const [collapsed, setCollapsed] = useState(false);
    const pathname = usePathname();

    return (
        <motion.div
            className={cn(
                "h-screen bg-card border-r border-border flex flex-col relative transition-all duration-300 z-40",
                collapsed ? "w-20" : "w-64"
            )}
            initial={{ x: -100, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ type: 'spring', stiffness: 100 }}
        >
            <div className="p-4 flex items-center justify-between border-b border-border/50">
                <div className={cn("flex items-center gap-2 overflow-hidden", collapsed && "justify-center w-full")}>
                    <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-500 to-purple-600 flex-shrink-0 flex items-center justify-center">
                        <span className="text-white font-bold text-sm">P</span>
                    </div>
                    {!collapsed && (
                        <motion.span
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="font-bold text-lg tracking-tight truncate"
                        >
                            PlagDetect
                        </motion.span>
                    )}
                </div>

                <Button
                    variant="ghost"
                    size="icon"
                    className={cn("absolute -right-4 top-6 rounded-full border border-border bg-background shadow-md w-8 h-8 z-50", collapsed && "hidden group-hover:flex")}
                    onClick={() => setCollapsed(!collapsed)}
                >
                    {collapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
                </Button>
            </div>

            <nav className="flex-1 py-6 px-2 space-y-2 overflow-y-auto overflow-x-hidden">
                {menuItems.map((item) => {
                    const isActive = pathname === item.href;
                    return (
                        <Link key={item.href} href={item.href} className="block group">
                            <div
                                className={cn(
                                    "flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-200 relative",
                                    isActive
                                        ? "bg-primary/10 text-primary"
                                        : "text-muted-foreground hover:bg-muted hover:text-foreground"
                                )}
                            >
                                {isActive && (
                                    <motion.div
                                        layoutId="sidebar-active"
                                        className="absolute left-0 top-0 bottom-0 w-1 bg-primary rounded-full my-1 ml-0.5"
                                        initial={{ height: 0 }}
                                        animate={{ height: 'auto' }}
                                    />
                                )}

                                <item.icon className={cn("h-5 w-5 flex-shrink-0", isActive ? "text-primary" : "text-muted-foreground/70 group-hover:text-foreground")} />

                                <AnimatePresence>
                                    {!collapsed && (
                                        <motion.span
                                            initial={{ opacity: 0, width: 0 }}
                                            animate={{ opacity: 1, width: 'auto' }}
                                            exit={{ opacity: 0, width: 0 }}
                                            className="font-medium truncate"
                                        >
                                            {item.label}
                                        </motion.span>
                                    )}
                                </AnimatePresence>
                            </div>
                        </Link>
                    );
                })}
            </nav>

            <div className="p-4 border-t border-border/50">
                <Button
                    variant="ghost"
                    className={cn("w-full justify-start text-muted-foreground hover:text-destructive hover:bg-destructive/10", collapsed && "justify-center px-0")}
                    onClick={() => signOut()}
                >
                    <LogOut className="h-5 w-5 flex-shrink-0" />
                    {!collapsed && <span className="ml-2 truncate">Sign Out</span>}
                </Button>
            </div>
        </motion.div>
    );
}
