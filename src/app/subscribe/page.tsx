
'use client';
import { CodeHiveIcon } from "@/components/icons";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Check, Star } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/use-auth";
import { useEffect } from "react";

const plans = [
    {
        name: 'Free',
        price: 0,
        credits: 100,
        features: [
            '100 initial credits',
            'Access to community marketplace',
            'Basic AI tools',
            'Community support'
        ],
        cta: 'Get Started'
    },
    {
        name: 'Pro',
        price: 25,
        credits: 5000,
        isPopular: true,
        features: [
            '5,000 monthly credits',
            'Access to Pro templates',
            'Advanced AI App Builder',
            'Priority support'
        ],
        cta: 'Upgrade to Pro'
    },
    {
        name: 'Enterprise',
        price: null,
        credits: null,
        features: [
            'Unlimited credits',
            'Custom integrations',
            'Dedicated account manager',
            'On-premise deployment'
        ],
        cta: 'Contact Sales'
    }
];

export default function SubscribePage() {
    const { user, loading } = useAuth();
    const router = useRouter();

    useEffect(() => {
        if (!loading && user) {
            router.replace('/dashboard');
        }
    }, [user, loading, router]);


    const handlePlanClick = (plan: any) => {
        if(plan.cta === 'Get Started'){
             router.push('/login');
        } else if (plan.cta === 'Contact Sales'){
            window.location.href = 'mailto:sales@codehive.com';
        } else {
            // Handle upgrade logic, e.g., redirect to a payment gateway
        }
    }

    return (
        <div className="flex min-h-screen flex-col items-center p-4 bg-background text-foreground">
            <header className="w-full max-w-6xl mx-auto py-8">
                 <Link href="/" className="flex items-center gap-2">
                    <CodeHiveIcon className="size-8 text-white" />
                    <span className="font-bold text-2xl font-headline text-white">CodeHive</span>
                </Link>
            </header>

            <main className="flex flex-col items-center text-center gap-8 py-12">
                <h1 className="font-headline text-4xl md:text-5xl font-bold">Choose Your Plan</h1>
                <p className="text-lg text-muted-foreground max-w-2xl">Start for free and scale as you grow. All plans include access to our core features, with more credits and advanced tools for our paid users.</p>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-8 w-full max-w-6xl">
                    {plans.map((plan) => (
                        <Card key={plan.name} className={`flex flex-col ${plan.isPopular ? 'border-accent shadow-accent/20 shadow-xl' : ''}`}>
                            {plan.isPopular && <div className="bg-accent text-accent-foreground text-xs font-bold text-center py-1 rounded-t-lg">MOST POPULAR</div>}
                            <CardHeader className="text-center">
                                <CardTitle className="text-2xl font-headline">{plan.name}</CardTitle>
                                <CardDescription className="text-4xl font-bold">
                                    {plan.price === null ? <span className="text-2xl">Custom</span> : `$${plan.price}`}
                                    {plan.price !== null && <span className="text-sm font-normal text-muted-foreground">/ month</span>}
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="flex-grow">
                                <ul className="space-y-3 text-left">
                                    {plan.features.map(feature => (
                                        <li key={feature} className="flex items-center gap-3">
                                            <Check className="text-green-500" size={16} />
                                            <span>{feature}</span>
                                        </li>
                                    ))}
                                     {plan.credits !== null && (
                                        <li className="flex items-center gap-3">
                                            <Star className="text-amber-400 fill-current" size={16} />
                                            <span>{plan.credits.toLocaleString()} credits</span>
                                        </li>
                                     )}
                                </ul>
                            </CardContent>
                            <CardFooter>
                                <Button 
                                    className="w-full" 
                                    variant={plan.isPopular ? 'default' : 'secondary'}
                                    onClick={() => handlePlanClick(plan)}
                                >
                                    {plan.cta}
                                </Button>
                            </CardFooter>
                        </Card>
                    ))}
                </div>
            </main>
        </div>
    );
}
