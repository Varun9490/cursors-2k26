'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import {
    LayoutDashboard,
    FileText,
    History,
    Settings,
    Menu,
    LogOut
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetTrigger, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { signOut } from 'next-auth/react';

const menuItems = [
    { icon: LayoutDashboard, label: 'Dashboard', href: '/dashboard' },
    { icon: FileText, label: 'New Check', href: '/dashboard/new' },
    { icon: History, label: 'History', href: '/dashboard/history' },
    { icon: Settings, label: 'Settings', href: '/dashboard/settings' },
];

export default function MobileNav() {
    const pathname = usePathname();
    const [open, setOpen] = React.useState(false);

    return (
        <div className="md:hidden flex items-center justify-between p-4 border-b border-border bg-background sticky top-0 z-50">
            <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
                    <span className="text-white font-bold text-sm">P</span>
                </div>
                <span className="font-bold text-lg tracking-tight">PlagDetect</span>
            </div>

            <Sheet open={open} onOpenChange={setOpen}>
                <SheetTrigger asChild>
                    <Button variant="ghost" size="icon">
                        <Menu className="h-6 w-6" />
                    </Button>
                </SheetTrigger>
                <SheetContent side="left" className="w-[300px] sm:w-[400px] p-0">
                    <SheetHeader className="p-4 border-b border-border">
                        <SheetTitle className="flex items-center gap-2">
                            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
                                <span className="text-white font-bold text-sm">P</span>
                            </div>
                            <span className="font-bold text-lg">PlagDetect</span>
                        </SheetTitle>
                    </SheetHeader>

                    <div className="flex flex-col h-full py-6">
                        <nav className="flex-1 px-4 space-y-2">
                            {menuItems.map((item) => {
                                const isActive = pathname === item.href;
                                return (
                                    <Link
                                        key={item.href}
                                        href={item.href}
                                        onClick={() => setOpen(false)}
                                        className="block"
                                    >
                                        <div
                                            className={cn(
                                                "flex items-center gap-3 px-3 py-3 rounded-lg transition-all duration-200",
                                                isActive
                                                    ? "bg-primary/10 text-primary font-medium"
                                                    : "text-muted-foreground hover:bg-muted hover:text-foreground"
                                            )}
                                        >
                                            <item.icon className={cn("h-5 w-5", isActive ? "text-primary" : "text-muted-foreground")} />
                                            <span>{item.label}</span>
                                        </div>
                                    </Link>
                                );
                            })}
                        </nav>

                        <div className="p-4 mt-auto border-t border-border">
                            <Button
                                variant="ghost"
                                className="w-full justify-start text-muted-foreground hover:text-destructive hover:bg-destructive/10 gap-3"
                                onClick={() => signOut()}
                            >
                                <LogOut className="h-5 w-5" />
                                <span>Sign Out</span>
                            </Button>
                        </div>
                    </div>
                </SheetContent>
            </Sheet>
        </div>
    );
}
