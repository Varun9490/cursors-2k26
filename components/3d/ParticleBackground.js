'use client';

import React, { useRef, useMemo } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';

export default function ParticleBackground() {
    const { mouse, viewport } = useThree();
    const count = 500;
    const dummy = useMemo(() => new THREE.Object3D(), []);
    const particles = useRef();

    // Generate random positions and speeds
    const initialData = useMemo(() => {
        return Array.from({ length: count }, () => ({
            position: [
                (Math.random() - 0.5) * 20,
                (Math.random() - 0.5) * 20,
                (Math.random() - 0.5) * 10
            ],
            factor: Math.random() * 2 + 1, // Speed factor
            phase: Math.random() * Math.PI * 2 // Initial wave phase
        }));
    }, [count]);

    useFrame((state) => {
        const t = state.clock.getElapsedTime();

        // Convert mouse position to target
        const targetX = (mouse.x * viewport.width) / 2;
        const targetY = (mouse.y * viewport.height) / 2;

        initialData.forEach((data, i) => {
            let { position, factor, phase } = data;
            let [x, y, z] = position;

            // Wave motion
            const waveX = Math.sin(t * 0.5 + phase) * 0.5;
            const waveY = Math.cos(t * 0.3 + phase) * 0.5;

            // Mouse interaction (repel/attract)
            const dx = x - targetX;
            const dy = y - targetY;
            const dist = Math.sqrt(dx * dx + dy * dy);

            if (dist < 4) {
                const force = (4 - dist) * 0.05; // Repel strength
                x += dx * force;
                y += dy * force;
            }

            // Apply updates
            dummy.position.set(
                x + waveX,
                y + waveY,
                z
            );

            // Rotate particles slightly
            dummy.rotation.set(
                Math.sin(t * factor * 0.1),
                Math.cos(t * factor * 0.1),
                0
            );

            // Scale pulse
            const scale = (Math.sin(t * factor + phase) + 2) * 0.1;
            dummy.scale.set(scale, scale, scale);

            dummy.updateMatrix();
            particles.current.setMatrixAt(i, dummy.matrix);
        });

        particles.current.instanceMatrix.needsUpdate = true;
    });

    return (
        <instancedMesh ref={particles} args={[null, null, count]}>
            <sphereGeometry args={[0.2, 8, 8]} />
            <meshPhysicalMaterial
                color="#8b5cf6"
                emissive="#3b82f6"
                emissiveIntensity={0.5}
                transparent
                opacity={0.6}
                roughness={0}
                metalness={0.5}
            />
        </instancedMesh>
    );
}
