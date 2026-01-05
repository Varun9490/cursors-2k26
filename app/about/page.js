import Navbar from '@/components/Navbar';
import { Card, CardContent } from '@/components/ui/card';

export default function AboutPage() {
    return (
        <div className="min-h-screen bg-background text-foreground">
            <Navbar />
            <div className="container mx-auto px-4 py-24 max-w-4xl">
                <div className="space-y-12">
                    <section className="text-center space-y-6">
                        <h1 className="text-4xl md:text-6xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-green-400">
                            Our Mission
                        </h1>
                        <p className="text-xl text-muted-foreground leading-relaxed">
                            At PlagDetect, we believe that originality is the currency of creativity. Our mission is to empower students, educators, and creators to express themselves authentically by providing the world's most accessible and accurate technology for text integrity.
                        </p>
                    </section>

                    <section className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        <Card className="bg-card/50 border-border/50">
                            <CardContent className="p-8 space-y-4">
                                <h3 className="text-2xl font-bold text-blue-400">Accuracy First</h3>
                                <p className="text-muted-foreground">
                                    We utilize advanced semantic matching algorithms that go beyond simple text comparison. Our engine understands context, recognizing paraphrased content and maintaining extremely low false-positive rates.
                                </p>
                            </CardContent>
                        </Card>
                        <Card className="bg-card/50 border-border/50">
                            <CardContent className="p-8 space-y-4">
                                <h3 className="text-2xl font-bold text-purple-400">Education Focused</h3>
                                <p className="text-muted-foreground">
                                    We are not just a policing tool. We provide actionable feedback on citations and sourcing, helping students learn proper academic standards and become better writers.
                                </p>
                            </CardContent>
                        </Card>
                    </section>

                    <section className="space-y-6">
                        <h2 className="text-3xl font-bold">How it Works</h2>
                        <div className="prose prose-invert max-w-none text-muted-foreground">
                            <p>
                                PlagDetect employs a modified <strong>Jaccard Similarity algorithm</strong> combined with shingling techniques.
                            </p>
                            <ul className="list-disc pl-6 space-y-2 mt-4">
                                <li>
                                    <strong>Tokenization:</strong> First, your text is broken down into "tokens" (words), removing common stopwords (like "the", "and") to focus on meaningful content.
                                </li>
                                <li>
                                    <strong>Shingling:</strong> We group these tokens into overlapping sequences called "n-grams". This allows us to detect phrases even if a few words are changed.
                                </li>
                                <li>
                                    <strong>Set Intersection:</strong> We compare the set of unique shingles from your document against our massive database of known sources.
                                </li>
                                <li>
                                    <strong>Scoring:</strong> The Similarity Score (0-100%) represents the size of the intersection divided by the size of the union of the two sets. A higher score means more overlap.
                                </li>
                            </ul>
                            <p className="mt-4">
                                In addition to this, we run heuristic checks for citation formatting, ensuring that borrowed ideas are properly credited according to APA/MLA standards.
                            </p>
                        </div>
                    </section>
                </div>
            </div>
        </div>
    );
}
