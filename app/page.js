'use client';

import React, { useEffect } from 'react';
import Navbar from '@/components/Navbar';
// import Hero3D from '@/components/Hero3D'; // Replaced with dynamic import
import FeatureCard from '@/components/FeatureCard';
import Example3DCard from '@/components/Example3DCard'; // New import
import { Button } from '@/components/ui/button';
import { ArrowRight, Shield, Search, FileText, Zap } from 'lucide-react';
import { motion, useScroll, useTransform } from 'framer-motion';
import Link from 'next/link';
import dynamic from 'next/dynamic';

const Hero3D = dynamic(() => import('@/components/Hero3D'), { ssr: false });

export default function LandingPage() {
  const { scrollY } = useScroll();
  const y1 = useTransform(scrollY, [0, 500], [0, 200]);
  const y2 = useTransform(scrollY, [0, 500], [0, -100]);

  // Use Locomotive Scroll for smooth scrolling
  useEffect(() => {
    (async () => {
      const LocomotiveScroll = (await import('locomotive-scroll')).default;
      const locomotiveScroll = new LocomotiveScroll();
    })();
  }, []);

  return (
    <div className="min-h-screen bg-background selection:bg-primary/30">
      <Navbar />

      {/* Hero Section */}
      <section className="relative h-screen w-full flex items-center justify-center overflow-hidden">
        <Hero3D />

        <div className="container relative z-10 px-4 pt-20 text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="space-y-6 max-w-4xl mx-auto"
          >
            <h1 className="text-5xl md:text-7xl font-bold tracking-tight bg-clip-text text-transparent bg-gradient-to-b from-white to-white/60 drop-shadow-lg leading-tight p-2">
              Verify Originality with <br />
              <span className="bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-purple-500">
                AI Precision
              </span>
            </h1>

            <p className="text-xl md:text-2xl text-muted-foreground max-w-2xl mx-auto backdrop-blur-sm">
              Advanced plagiarism detection powered by next-gen algorithms.
              Secure, fast, and incredibly accurate.
            </p>

            <motion.div
              className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-8"
              whileHover={{ scale: 1.02 }}
            >
              <Link href="/dashboard">
                <Button size="lg" className="h-14 px-8 text-lg rounded-full bg-white text-black hover:bg-gray-100 hover:scale-105 transition-all shadow-[0_0_20px_rgba(255,255,255,0.3)]">
                  Start Scanning Now <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </Link>
              <Button size="lg" variant="outline" className="h-14 px-8 text-lg rounded-full border-white/20 hover:bg-white/10 glass">
                View Demo
              </Button>
            </motion.div>
          </motion.div>
        </div>

        {/* Scroll Indicator */}
        <motion.div
          className="absolute bottom-10 left-1/2 -translate-x-1/2"
          animate={{ y: [0, 10, 0] }}
          transition={{ duration: 2, repeat: Infinity }}
        >
          <div className="w-6 h-10 rounded-full border-2 border-white/20 flex items-start justify-center p-1">
            <div className="w-1 h-2 bg-white rounded-full animate-scroll-down" />
          </div>
        </motion.div>
      </section>

      {/* Features Section */}
      <section className="py-24 bg-gradient-to-b from-background to-black/50 relative z-20">
        <div className="container px-4">
          <div className="text-center mb-16 space-y-4">
            <h2 className="text-3xl md:text-5xl font-bold">Why Choose PlagDetect?</h2>
            <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
              We leverage state-of-the-art technology to ensure your content is unique and protected.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 items-center">
            <FeatureCard
              delay={0.1}
              icon={<Search className="w-6 h-6" />}
              title="Deep Search"
              description="Scans billions of web pages and academic documents to find matches with high precision."
            />

            <FeatureCard
              delay={0.2}
              icon={<Shield className="w-6 h-6" />}
              title="Privacy First"
              description="Your documents are encrypted and processed securely. We never store your data without permission."
            />
            <FeatureCard
              delay={0.3}
              icon={<Zap className="w-6 h-6" />}
              title="Instant Results"
              description="Get detailed reports in seconds, not minutes. Real-time analysis as you type."
            />
            <FeatureCard
              delay={0.4}
              icon={<FileText className="w-6 h-6" />}
              title="Citation Check"
              description="Automatically verify citations and detect AI-generated fabrications."
            />
          </div>
        </div>
      </section>

      {/* Stats / CTA Section */}
      <section className="py-24 relative overflow-hidden">
        <div className="absolute inset-0 bg-primary/5 -skew-y-3 transform origin-top-left scale-110" />

        <div className="container relative z-10 px-4">
          <div className="flex flex-col md:flex-row items-center justify-between gap-12 bg-gradient-to-r from-blue-900/50 to-purple-900/50 rounded-3xl p-12 border border-white/10 backdrop-blur-xl">
            <div className="space-y-6 max-w-xl">
              <h2 className="text-3xl md:text-4xl font-bold">Ready to verify your content?</h2>
              <p className="text-lg text-blue-100/80">
                Join thousands of students, educators, and professionals who trust PlagDetect.
              </p>
              <div className="flex gap-4">
                <div className="text-center">
                  <div className="text-3xl font-bold text-white mb-1">10M+</div>
                  <div className="text-sm text-blue-200">Docs Scanned</div>
                </div>
                <div className="w-px bg-white/10 h-12 self-center" />
                <div className="text-center">
                  <div className="text-3xl font-bold text-white mb-1">99.9%</div>
                  <div className="text-sm text-blue-200">Accuracy</div>
                </div>
              </div>
            </div>

            <Link href="/auth/signin">
              <Button size="lg" className="h-16 px-10 text-xl shadow-2xl shadow-blue-500/20 bg-white text-blue-900 hover:bg-blue-50 transition-all transform hover:scale-105">
                Get Started for Free
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 border-t border-white/10 bg-black/40">
        <div className="container px-4 text-center text-muted-foreground">
          <p>&copy; 2026 PlagDetect. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}
