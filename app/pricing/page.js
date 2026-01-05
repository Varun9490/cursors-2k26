import Navbar from '@/components/Navbar';
import { Button } from '@/components/ui/button';
import { Check } from 'lucide-react';

const plans = [
    {
        name: "Basic",
        price: "$0",
        description: "Perfect for students.",
        features: ["5 Scans per day", "Standard Analysis Speed", "Basic Result Summary", "10MB File Limit"],
        buttonVariant: "outline"
    },
    {
        name: "Pro",
        price: "$9.99",
        description: "For researchers & professionals.",
        features: ["Unlimited Scans", "Priority Processing", "Detailed Citation Analysis", "100MB File Limit", "Deep Web Search"],
        buttonVariant: "default",
        popular: true
    },
    {
        name: "Institution",
        price: "Custom",
        description: "For schools and universities.",
        features: ["API Access", "SSO Integration", "Admin Dashboard", "Custom Limits", "24/7 Support"],
        buttonVariant: "outline"
    }
];

export default function PricingPage() {
    return (
        <div className="min-h-screen bg-background">
            <Navbar />
            <div className="container mx-auto px-4 py-24">
                <div className="text-center mb-16">
                    <h1 className="text-4xl md:text-6xl font-bold mb-6">Simple Pricing</h1>
                    <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
                        Choose the plan that fits your needs. No hidden fees.
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
                    {plans.map((plan, index) => (
                        <div key={index} className={`relative p-8 rounded-2xl border ${plan.popular ? 'border-primary bg-primary/5 ring-1 ring-primary' : 'border-border bg-card/50'} flex flex-col`}>
                            {plan.popular && (
                                <div className="absolute top-0 right-0 -mt-3 mr-6 px-3 py-1 bg-primary text-primary-foreground text-xs font-bold rounded-full uppercase">
                                    Popular
                                </div>
                            )}
                            <h3 className="text-2xl font-bold mb-2">{plan.name}</h3>
                            <div className="text-4xl font-bold mb-4">{plan.price}<span className="text-base font-normal text-muted-foreground">/mo</span></div>
                            <p className="text-muted-foreground mb-8">{plan.description}</p>

                            <ul className="space-y-4 mb-8 flex-1">
                                {plan.features.map((feature, i) => (
                                    <li key={i} className="flex items-center gap-3">
                                        <div className="w-5 h-5 rounded-full bg-green-500/20 flex items-center justify-center text-green-500 shrink-0">
                                            <Check className="w-3 h-3" />
                                        </div>
                                        <span className="text-sm">{feature}</span>
                                    </li>
                                ))}
                            </ul>

                            <Button className="w-full" variant={plan.buttonVariant}>
                                {plan.price === 'Custom' ? 'Contact Sales' : 'Get Started'}
                            </Button>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
