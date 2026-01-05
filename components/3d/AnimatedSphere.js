'use client';

import React, { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { Sphere, MeshDistortMaterial } from '@react-three/drei';

export default function AnimatedSphere({ position = [0, 0, 0], scale = 1, color = "#3b82f6", speed = 1 }) {
    const ref = useRef();

    useFrame((state) => {
        const t = state.clock.getElapsedTime();
        ref.current.distort = THREE.MathUtils.lerp(ref.current.distort, Math.sin(t * speed) * 0.4, 0.05);
    });

    return (
        <Sphere args={[1, 32, 32]} position={position} scale={scale}>
            <MeshDistortMaterial
                ref={ref}
                color={color}
                envMapIntensity={0.4}
                clearcoat={1}
                clearcoatRoughness={0}
                metalness={0.1}
                distort={0.4} // Strength, 0 disables the effect (default=1)
                speed={2 * speed} // Speed (default=1)
            />
        </Sphere>
    );
}

import * as THREE from 'three';
