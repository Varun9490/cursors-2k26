'use client';

import React from 'react';
import { Tilt } from 'react-tilt';
import { motion } from 'framer-motion';
import { Card } from '@/components/ui/card';

const defaultOptions = {
    reverse: false,  // reverse the tilt direction
    max: 35,     // max tilt rotation (degrees)
    perspective: 1000,   // Transform perspective, the lower the more extreme the tilt gets.
    scale: 1.05,   // 2 = 200%, 1.5 = 150%, etc..
    speed: 1000,   // Speed of the enter/exit transition
    transition: true,   // Set a transition on enter/exit.
    axis: null,   // What axis should be disabled. Can be X or Y.
    reset: true,   // If the tilt effect has to be reset on exit.
    easing: "cubic-bezier(.03,.98,.52,.99)",    // Easing on enter/exit.
}

export default function FeatureCard({ icon, title, description, delay = 0 }) {
    return (
        <motion.div
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay }}
        >
            <Tilt options={defaultOptions} className="h-full">
                <Card className="h-full p-6 glass-dark border border-white/10 hover:border-primary/50 transition-colors group relative overflow-hidden bg-white/5 backdrop-blur-sm">
                    <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-purple-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

                    <div className="relative z-10">
                        <div className="mb-4 inline-flex items-center justify-center w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500/20 to-purple-500/20 border border-white/10 text-primary group-hover:scale-110 group-hover:rotate-6 transition-all duration-300">
                            {icon}
                        </div>

                        <h3 className="text-xl font-bold mb-2 group-hover:text-primary transition-colors">{title}</h3>
                        <p className="text-muted-foreground leading-relaxed">
                            {description}
                        </p>
                    </div>

                    {/* Shine effect */}
                    <div className="absolute -inset-full top-0 block h-full w-1/2 -skew-x-12 bg-gradient-to-r from-transparent to-white opacity-20 group-hover:animate-shine left-[-100%]" style={{ animationDuration: '1s' }} />
                </Card>
            </Tilt>
        </motion.div>
    );
}
