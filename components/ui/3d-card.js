"use client";
import React, { createContext, useState, useContext, useRef, useEffect } from "react";
import { motion, useMotionValue, useSpring } from "framer-motion";
import { cn } from "@/lib/utils";

const MouseEnterContext = createContext(undefined);

export const CardContainer = ({
    children,
    className,
    containerClassName,
}) => {
    const containerRef = useRef(null);
    const [isMouseEntered, setIsMouseEntered] = useState(false);

    // Mouse position
    const x = useMotionValue(0);
    const y = useMotionValue(0);

    // Rotation
    const rotateX = useSpring(0);
    const rotateY = useSpring(0);

    const handleMouseMove = (e) => {
        if (!containerRef.current) return;
        const rect = containerRef.current.getBoundingClientRect();
        const width = rect.width;
        const height = rect.height;

        // Calculate mouse position relative to center
        const mouseX = e.clientX - rect.left;
        const mouseY = e.clientY - rect.top;

        const xPct = (mouseX / width - 0.5) * 2; // -1 to 1
        const yPct = (mouseY / height - 0.5) * 2; // -1 to 1

        x.set(xPct);
        y.set(yPct);

        rotateX.set(-yPct * 20); // Max rotation deg
        rotateY.set(xPct * 20);
    };

    const handleMouseEnter = (e) => {
        setIsMouseEntered(true);
    };

    const handleMouseLeave = (e) => {
        setIsMouseEntered(false);
        x.set(0);
        y.set(0);
        rotateX.set(0);
        rotateY.set(0);
    };

    return (
        <MouseEnterContext.Provider value={[isMouseEntered, setIsMouseEntered]}>
            <div
                className={cn("py-5 flex items-center justify-center", containerClassName)}
                style={{ perspective: "1000px" }}
            >
                <motion.div
                    ref={containerRef}
                    onMouseEnter={handleMouseEnter}
                    onMouseMove={handleMouseMove}
                    onMouseLeave={handleMouseLeave}
                    className={cn(
                        "flex items-center justify-center relative transition-all duration-200 ease-linear",
                        className
                    )}
                    style={{
                        transformStyle: "preserve-3d",
                        rotateX,
                        rotateY
                    }}
                >
                    {children}
                </motion.div>
            </div>
        </MouseEnterContext.Provider>
    );
};

export const CardBody = ({
    children,
    className,
}) => {
    return (
        <div
            className={cn(
                "h-96 w-96 [transform-style:preserve-3d]  [&>*]:[transform-style:preserve-3d]",
                className
            )}
        >
            {children}
        </div>
    );
};

export const CardItem = ({
    as: Tag = "div",
    children,
    className,
    translateX = 0,
    translateY = 0,
    translateZ = 0,
    rotateX = 0,
    rotateY = 0,
    rotateZ = 0,
    ...rest
}) => {
    const ref = useRef(null);
    const [isMouseEntered] = useContext(MouseEnterContext);

    useEffect(() => {
        if (!ref.current) return;
        if (isMouseEntered) {
            ref.current.style.transform = `translateX(${translateX}px) translateY(${translateY}px) translateZ(${translateZ}px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) rotateZ(${rotateZ}deg)`;
        } else {
            ref.current.style.transform = `translateX(0px) translateY(0px) translateZ(0px) rotateX(0deg) rotateY(0deg) rotateZ(0deg)`;
        }
    }, [isMouseEntered, translateX, translateY, translateZ, rotateX, rotateY, rotateZ]);

    return (
        <Tag
            ref={ref}
            className={cn("w-fit transition-transform duration-200 ease-linear", className)}
            {...rest}
        >
            {children}
        </Tag>
    );
};
