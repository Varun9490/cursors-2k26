'use client';

import React, { useRef, useState } from 'react';
import { useFrame } from '@react-three/fiber';
import { Float, Text, Html } from '@react-three/drei';
import { motion } from 'framer-motion-3d';

export default function FloatingDocument() {
    const meshRef = useRef();
    const [hovered, setHovered] = useState(false);

    useFrame((state) => {
        if (!hovered) {
            const t = state.clock.getElapsedTime();
            meshRef.current.rotation.x = Math.cos(t / 4) / 8;
            meshRef.current.rotation.y = Math.sin(t / 4) / 8;
            meshRef.current.rotation.z = -0.2 - (1 + Math.sin(t / 1.5)) / 20;
            meshRef.current.position.y = (1 + Math.sin(t / 1.5)) / 10;
        }
    });

    return (
        <Float
            speed={2} // Animation speed, defaults to 1
            rotationIntensity={1} // XYZ rotation intensity, defaults to 1
            floatIntensity={2} // Up/down float intensity, defaults to 1
            floatingRange={[-0.1, 0.1]} // Range of y-axis values the object will float within, defaults to [-0.1,0.1]
        >
            <group
                rotation={[0, 0, -0.2]}
                onPointerOver={() => setHovered(true)}
                onPointerOut={() => setHovered(false)}
            >
                {/* Paper Sheet */}
                <motion.mesh
                    ref={meshRef}
                    whileHover={{ scale: 1.05 }}
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ duration: 1, ease: 'easeOut' }}
                >
                    <boxGeometry args={[3, 4, 0.05]} />
                    <meshStandardMaterial color="#ffffff" roughness={0.2} metalness={0.1} />
                </motion.mesh>

                {/* Text Lines Simulation */}
                <group position={[0, 0, 0.03]} rotation={[0, 0, -0.2]}>
                    {Array.from({ length: 12 }).map((_, i) => (
                        <mesh key={i} position={[-0.8, 1.2 - i * 0.25, 0]}>
                            <boxGeometry args={[1.6 + Math.random() * 0.5, 0.05, 0.01]} />
                            <meshBasicMaterial color="#e5e5e5" />
                        </mesh>
                    ))}
                </group>

                {/* Scanning Laser Effect (Optional) */}
                {/* Can be added as a separate mesh moving up and down */}
            </group>
        </Float>
    );
}
