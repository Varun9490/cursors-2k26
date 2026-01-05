'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Menu } from 'lucide-react';
import { Sheet, SheetContent, SheetTrigger, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { ThemeToggle } from '@/components/ThemeToggle';

export default function Navbar() {
    const pathname = usePathname();
    const [scrolled, setScrolled] = React.useState(false);

    React.useEffect(() => {
        const handleScroll = () => {
            setScrolled(window.scrollY > 20);
        };
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    const navLinks = [
        { href: '/features', label: 'Features' },
        { href: '/about', label: 'About' },
    ];

    return (
        <nav className={cn(
            "fixed top-0 left-0 right-0 z-50 transition-all duration-300 border-b border-transparent",
            scrolled ? "bg-background/80 backdrop-blur-md border-border shadow-sm py-2" : "bg-transparent py-4"
        )}>
            <div className="container mx-auto px-4 flex items-center justify-between">
                <Link href="/" className="flex items-center gap-2 group z-50">
                    <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center transform group-hover:rotate-12 transition-transform duration-300">
                        <span className="text-white font-bold text-lg">P</span>
                    </div>
                    <span className="font-bold text-xl tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-foreground to-foreground/70">
                        PlagDetect
                    </span>
                </Link>

                {/* Desktop Nav */}
                <div className="hidden md:flex items-center gap-8">
                    {navLinks.map((link) => (
                        <Link key={link.href} href={link.href} className="text-sm font-medium hover:text-primary transition-colors">
                            {link.label}
                        </Link>
                    ))}
                </div>

                <div className="flex items-center gap-4">
                    {/* Desktop Auth Buttons */}
                    <div className="hidden md:flex items-center gap-4">
                        <ThemeToggle />
                        <Link href="/auth/signin">
                            <Button variant="ghost" className="hover:bg-primary/10 hover:text-primary">Sign In</Button>
                        </Link>
                        <Link href="/dashboard">
                            <Button className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 shadow-lg hover:shadow-primary/25 transition-all hover:scale-105">
                                Get Started
                            </Button>
                        </Link>
                    </div>

                    {/* Mobile Menu Trigger */}
                    <Sheet>
                        <SheetTrigger asChild>
                            <Button variant="ghost" size="icon" className="md:hidden">
                                <Menu className="h-6 w-6" />
                            </Button>
                        </SheetTrigger>
                        <SheetContent side="right" className="w-[300px] border-l border-border/50 bg-background/95 backdrop-blur-xl">
                            <SheetHeader className="text-left border-b border-border/50 pb-4">
                                <SheetTitle>Menu</SheetTitle>
                            </SheetHeader>
                            <div className="flex flex-col gap-6 mt-8">
                                <div className="flex flex-col gap-4">
                                    {navLinks.map((link) => (
                                        <Link key={link.href} href={link.href} className="text-lg font-medium hover:text-primary transition-colors">
                                            {link.label}
                                        </Link>
                                    ))}
                                </div>
                                <div className="border-t border-border/50 pt-6 flex flex-col gap-4">
                                    <Link href="/auth/signin" className="w-full">
                                        <Button variant="outline" className="w-full justify-center">Sign In</Button>
                                    </Link>
                                    <Link href="/dashboard" className="w-full">
                                        <Button className="w-full justify-center bg-gradient-to-r from-blue-600 to-purple-600">Get Started</Button>
                                    </Link>
                                </div>
                            </div>
                        </SheetContent>
                    </Sheet>
                </div>
            </div>
        </nav>
    );
}
