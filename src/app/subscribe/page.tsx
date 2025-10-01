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
    const { toast } = useState(false);

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
        
            
                 CodeHiveIcon className="size-8 text-white" />
                
            

            
                
                    Choose Your Plan
                    Start for free and scale as you grow. All plans include access to our core features, with more credits and advanced tools for our paid users.
                

                
                    {plans.map((plan) => (
                        
                            {plan.isPopular &&  MOST POPULAR }
                            
                                
                                    {plan.name}
                                    
                                        {plan.price === null ? Custom : `$${plan.price}`}
                                        {plan.price !== null && / month}
                                    
                                
                            
                            
                                
                                    {plan.features.map(feature => (
                                        
                                            
                                                
                                            
                                            
                                        
                                    ))}
                                     {plan.credits !== null && (
                                        
                                            
                                                
                                            
                                            
                                        

                                     )}
                                
                            
                            
                                
                                     {isLoading && plan.isPopular ?  Go to Dashboard' : plan.cta)}
                                
                            
                        
                    ))}
                
            
        
    );
}
