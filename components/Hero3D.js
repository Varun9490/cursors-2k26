'use client';

import React, { Suspense } from 'react';
import { Canvas } from '@react-three/fiber';
import { Environment, PerspectiveCamera, OrbitControls } from '@react-three/drei';
import FloatingDocument from './3d/FloatingDocument';
import ParticleBackground from './3d/ParticleBackground';
import AnimatedSphere from './3d/AnimatedSphere';

export default function Hero3D() {
    return (
        <div className="absolute inset-0 z-0 h-full w-full pointer-events-none">
            <Canvas dpr={[1, 2]}>
                <PerspectiveCamera makeDefault position={[0, 0, 8]} fov={50} />
                <ambientLight intensity={0.5} />
                <pointLight position={[10, 10, 10]} intensity={1} color="#3b82f6" />
                <pointLight position={[-10, -10, -10]} intensity={0.5} color="#8b5cf6" />
                <spotLight position={[0, 10, 0]} angle={0.3} penumbra={1} intensity={1} castShadow />

                <Suspense fallback={null}>
                    <ParticleBackground />
                    <group position={[2.5, 0, 0]}>
                        <FloatingDocument />
                    </group>
                    <group position={[-3, 1, -2]}>
                        <AnimatedSphere position={[0, 0, 0]} scale={1.5} color="#8b5cf6" speed={0.5} />
                    </group>
                    <group position={[-2, -2, -1]}>
                        <AnimatedSphere position={[0, 0, 0]} scale={0.8} color="#3b82f6" speed={0.8} />
                    </group>
                    <Environment preset="city" />
                </Suspense>

                {/* Helper to allow mouse interaction if we enable pointer events on container */}
                <OrbitControls enableZoom={false} enablePan={false} autoRotate autoRotateSpeed={0.5} maxPolarAngle={Math.PI / 1.8} minPolarAngle={Math.PI / 2.2} />
            </Canvas>
        </div>
    );
}
