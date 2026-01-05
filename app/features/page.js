import FeatureCard from '@/components/FeatureCard';
import Navbar from '@/components/Navbar';
import { Search, Shield, Zap, Cloud, Smartphone, Globe } from 'lucide-react';

export default function FeaturesPage() {
    return (
        <div className="min-h-screen bg-background">
            <Navbar />
            <div className="container mx-auto px-4 py-24">
                <div className="text-center mb-16">
                    <h1 className="text-4xl md:text-6xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-purple-500 mb-6">
                        Powerful Features
                    </h1>
                    <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
                        Everything you need to ensure originality and academic integrity.
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    <FeatureCard
                        icon={<Search className="w-8 h-8 text-blue-500" />}
                        title="Deep Web Search"
                        description="Our algorithm scans billions of online sources including academic journals, news articles, and web pages."
                    />
                    <FeatureCard
                        icon={<Shield className="w-8 h-8 text-purple-500" />}
                        title="Secure & Private"
                        description="Bank-grade encryption ensures your documents remain private. We never share your data."
                    />
                    <FeatureCard
                        icon={<Zap className="w-8 h-8 text-yellow-500" />}
                        title="Instant Analysis"
                        description="Get results in seconds. Our optimized engine processes documents with lightning speed."
                    />
                    <FeatureCard
                        icon={<Cloud className="w-8 h-8 text-sky-500" />}
                        title="Cloud Storage"
                        description="History of all your scans is saved automatically. Access your reports from anywhere."
                    />
                    <FeatureCard
                        icon={<Globe className="w-8 h-8 text-green-500" />}
                        title="Multi-Language"
                        description="Support for over 50 languages. Detect cross-language plagiarism with advanced translation matching."
                    />
                    <FeatureCard
                        icon={<Smartphone className="w-8 h-8 text-pink-500" />}
                        title="Mobile Friendly"
                        description="Check your documents on the go with our fully responsive mobile formatting."
                    />
                </div>
            </div>
        </div>
    );
}
