'use client';

import React, { useState } from 'react';
import { signIn } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Tilt } from 'react-tilt';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import { Loader2 } from 'lucide-react';

const defaultOptions = {
    reverse: false,
    max: 15,
    perspective: 1000,
    scale: 1.02,
    speed: 1000,
    transition: true,
    axis: null,
    reset: true,
    easing: "cubic-bezier(.03,.98,.52,.99)",
}

export default function SignInPage() {
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        const email = e.target.email.value;
        const password = e.target.password.value;

        try {
            const result = await signIn('credentials', {
                redirect: false,
                email,
                password,
            });

            if (result?.error) {
                setError('Invalid credentials');
            } else {
                router.push('/dashboard');
                router.refresh();
            }
        } catch (err) {
            setError('Something went wrong');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen w-full flex items-center justify-center bg-background relative overflow-hidden">
            {/* Background decoration */}
            <div className="absolute inset-0 z-0">
                <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-blue-600/20 rounded-full blur-[100px] animate-pulse-3d" />
                <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-purple-600/20 rounded-full blur-[100px] animate-pulse-3d" style={{ animationDelay: '1s' }} />
            </div>

            <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5, ease: "easeOut" }}
                className="relative z-10 w-full max-w-md p-4"
            >
                <Tilt options={defaultOptions}>
                    <Card className="border-border/50 bg-black/40 backdrop-blur-xl shadow-2xl overflow-hidden glass-dark">
                        <CardHeader className="space-y-1 text-center pb-6 border-b border-white/5">
                            <div className="mx-auto w-12 h-12 rounded-lg bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center mb-4 shadow-lg shadow-purple-500/20">
                                <span className="text-white font-bold text-xl">P</span>
                            </div>
                            <CardTitle className="text-2xl font-bold tracking-tight">Welcome back</CardTitle>
                            <CardDescription>
                                Sign in to your account
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4 pt-8">
                            <form onSubmit={handleSubmit} className="space-y-4">
                                <div className="space-y-2">
                                    <Input
                                        id="email"
                                        name="email"
                                        type="email"
                                        placeholder="Email address"
                                        required
                                        className="bg-white/5 border-white/10 focus:border-primary/50"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Input
                                        id="password"
                                        name="password"
                                        type="password"
                                        placeholder="Password"
                                        required
                                        className="bg-white/5 border-white/10 focus:border-primary/50"
                                    />
                                </div>

                                <AnimatePresence>
                                    {error && (
                                        <motion.div
                                            initial={{ opacity: 0, y: -10 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            exit={{ opacity: 0 }}
                                            className="text-red-500 text-sm text-center"
                                        >
                                            {error}
                                        </motion.div>
                                    )}
                                </AnimatePresence>

                                <Button
                                    type="submit"
                                    className="w-full h-11 bg-primary hover:bg-primary/90 text-white shadow-lg shadow-primary/20"
                                    disabled={loading}
                                >
                                    {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : "Sign In"}
                                </Button>
                            </form>

                            <div className="text-center text-sm pt-4">
                                <span className="text-muted-foreground">Don't have an account? </span>
                                <Link href="/auth/signup" className="text-primary hover:underline font-medium">
                                    Sign up
                                </Link>
                            </div>
                        </CardContent>
                    </Card>
                </Tilt>
            </motion.div>
        </div>
    );
}
