
'use client';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/use-auth';
import { CodeHiveIcon } from "@/components/icons";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Check, Loader2, Star } from "lucide-react";
import Link from "next/link";
import { useToast } from '@/hooks/use-toast';
import { useFirebase } from '@/lib/firebase/client-provider';
import { useState } from 'react';
import { grantProAccess } from '@/lib/firebase/credits';

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
    const { user } = useAuth();
    const { app } = useFirebase();
    const router = useRouter();
    const { toast } = useToast();
    const [isLoading, setIsLoading] = useState(false);

    const handlePlanClick = async (plan: any) => {
        if (plan.cta === 'Contact Sales') {
            window.location.href = 'mailto:sales@codehive.com';
            return;
        }

        if (user && app) {
            if (plan.name === 'Pro') {
                setIsLoading(true);
                try {
                    const data = await grantProAccess(app);

                    if (data.success) {
                        toast({
                            title: 'Upgrade Successful!',
                            description: data.message || 'You now have Pro access.'
                        });
                        router.push('/dashboard');
                    } else {
                        throw new Error(data.message || 'An unknown error occurred.');
                    }
                    
                } catch (error: any) {
                    toast({
                        title: 'Error Upgrading',
                        description: error.message || 'Could not complete the upgrade. Please try again.',
                        variant: 'destructive'
                    });
                } finally {
                    setIsLoading(false);
                }
            } else {
                 router.push('/dashboard');
            }
        } else {
            router.push('/login');
        }
    }

    return (
        <div className="dark app-container flex flex-col items-center justify-center p-4">
            <Link href="/" className="flex items-center gap-2 mb-8">
                <CodeHiveIcon className="size-8 text-white" />
                <span className="font-bold text-xl font-headline text-white">CodeHive</span>
            </Link>

            <div className="flex flex-col gap-8 w-full max-w-5xl">
                <div className="text-center">
                    <h1 className="font-headline text-4xl md:text-5xl font-semibold">Choose Your Plan</h1>
                    <p className="text-muted-foreground mt-4 max-w-2xl mx-auto">Start for free and scale as you grow. All plans include access to our core features, with more credits and advanced tools for our paid users.</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    {plans.map((plan) => (
                        <Card key={plan.name} className={`flex flex-col ${plan.isPopular ? 'border-primary ring-2 ring-primary shadow-lg shadow-primary/20' : ''}`}>
                            {plan.isPopular && <div className="absolute top-0 -translate-y-1/2 w-full flex justify-center"><div className="bg-primary text-primary-foreground text-xs font-bold px-3 py-1 rounded-full">MOST POPULAR</div></div>}
                            <CardHeader className="pt-8">
                                <div className="text-center">
                                    <CardTitle className="text-2xl">{plan.name}</CardTitle>
                                    <CardDescription className="text-4xl font-bold mt-4">
                                        {plan.price === null ? 'Custom' : `$${plan.price}`}
                                        {plan.price !== null && <span className="text-base font-normal text-muted-foreground">/ month</span>}
                                    </CardDescription>
                                </div>
                            </CardHeader>
                            <CardContent className="flex-grow">
                                <ul className="space-y-4">
                                    {plan.features.map(feature => (
                                        <li key={feature} className="flex items-start gap-3">
                                            <div className="bg-green-500/20 text-green-400 rounded-full p-1">
                                                <Check className="size-4" />
                                            </div>
                                            <span>{feature}</span>
                                        </li>
                                    ))}
                                     {plan.credits !== null && (
                                        <li className="flex items-start gap-3">
                                            <div className="bg-yellow-500/20 text-yellow-400 rounded-full p-1">
                                                <Star className="size-4" />
                                            </div>
                                            <span>{plan.credits.toLocaleString()} Credits</span>
                                        </li>

                                     )}
                                </ul>
                            </CardContent>
                            <CardFooter>
                                <Button onClick={() => handlePlanClick(plan)} className="w-full" variant={plan.isPopular ? 'default' : 'outline'} disabled={isLoading && plan.isPopular}>
                                     {isLoading && plan.isPopular ? <><Loader2 className="mr-2 animate-spin"/> Processing...</> : (user ? plan.name === 'Free' ? 'Go to Dashboard' : plan.cta : plan.cta)}
                                </Button>
                            </CardFooter>
                        </Card>
                    ))}
                </div>
            </div>
        </div>
    );
}
