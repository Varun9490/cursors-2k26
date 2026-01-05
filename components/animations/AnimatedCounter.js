'use client';

import { motion, useSpring, useTransform } from 'framer-motion';
import { useEffect, useState } from 'react';

export default function AnimatedCounter({ value, direction = 'up', className }) {
    const [targetValue, setTargetValue] = useState(0);

    // Parse numeric value from string if needed (e.g. "95%")
    const numericValue = typeof value === 'string' ? parseFloat(value) : value;
    const suffix = typeof value === 'string' ? value.replace(/[\d\.]/g, '') : '';

    const spring = useSpring(0, { damping: 20, stiffness: 100 });
    const displayValue = useTransform(spring, (current) => Math.round(current));

    useEffect(() => {
        spring.set(numericValue);
    }, [numericValue, spring]);

    return (
        <span className={className}>
            <motion.span>{displayValue}</motion.span>{suffix}
        </span>
    );
}
