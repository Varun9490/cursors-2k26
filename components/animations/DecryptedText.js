'use client';

import { useRef, useState, useEffect } from 'react';

export default function DecryptedText({
    text,
    speed = 50,
    maxIterations = 10,
    sequential = false,
    revealDirection = 'start',
    useOriginalCharsOnly = false,
    className = '',
    parentClassName = '',
    encryptedClassName = '',
    animateOn = 'hover',
    somespecialchars = '!@#$%^&*()_+',
}) {
    const [displayText, setDisplayText] = useState(text);
    const [isHovering, setIsHovering] = useState(false);
    const [isScrambling, setIsScrambling] = useState(false);
    const revealedIndices = useRef(new Set());
    const intervalRef = useRef(null);

    useEffect(() => {
        let interval;
        if (animateOn === 'view') {
            const observer = new IntersectionObserver((entries) => {
                entries.forEach((entry) => {
                    if (entry.isIntersecting && !isScrambling) {
                        setIsScrambling(true);
                    }
                });
            }, { threshold: 0.1 });

            // Logic for view-based triggering would go here if we attached a ref to the element
            // For now, let's just trigger on mount if 'view' is selected for simplicity in this snippet
            setIsScrambling(true);

            return () => observer.disconnect();
        }
    }, [animateOn]);

    useEffect(() => {
        if (animateOn === 'always') {
            const loop = setInterval(() => {
                setIsScrambling(true);
                setTimeout(() => { setIsScrambling(false); revealedIndices.current.clear(); }, 2000);
            }, 5000);
            return () => clearInterval(loop);
        }
    }, [animateOn]);

    useEffect(() => {
        if (isHovering || isScrambling) {
            clearInterval(intervalRef.current);
            revealedIndices.current.clear();
            let iteration = 0;

            intervalRef.current = setInterval(() => {
                setDisplayText((prevText) => {
                    return text
                        .split('')
                        .map((char, index) => {
                            if (char === ' ') return ' ';
                            if (revealedIndices.current.has(index)) return char;

                            if (Math.random() < 0.1) { // Chance to reveal
                                revealedIndices.current.add(index);
                                return char;
                            }

                            // Scramble
                            const chars = useOriginalCharsOnly
                                ? text
                                : somespecialchars;
                            return chars[Math.floor(Math.random() * chars.length)];
                        })
                        .join('');
                });

                iteration++;
                if (revealedIndices.current.size === text.length || iteration > maxIterations) {
                    clearInterval(intervalRef.current);
                    setDisplayText(text);
                    setIsScrambling(false);
                }
            }, speed);
        } else {
            // Reset if needed (optional)
            // setDisplayText(text);
        }

        return () => clearInterval(intervalRef.current);
    }, [isHovering, isScrambling, text, speed, maxIterations, somespecialchars, useOriginalCharsOnly]);

    return (
        <span
            className={`inline-block whitespace-pre-wrap ${parentClassName}`}
            onMouseEnter={() => animateOn === 'hover' && setIsHovering(true)}
            onMouseLeave={() => animateOn === 'hover' && setIsHovering(false)}
        >
            <span className={className}>{displayText}</span>
        </span>
    );
}
