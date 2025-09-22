
'use client';

import { useAuth } from '@/hooks/use-auth';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Check, CreditCard, Star } from 'lucide-react';
import Link from 'next/link';

const creditPacks = [
  { name: 'Starter Pack', credits: 500, price: 5 },
  { name: 'Developer Pack', credits: 1200, price: 10 },
  { name: 'Pro Pack', credits: 3000, price: 20 },
];

export default function BillingPage() {
  const { credits } = useAuth();

  return (
    <div className="flex flex-col gap-8">
      <div>
        <h1 className="font-headline text-3xl md:text-4xl font-semibold flex items-center gap-3">
          <CreditCard className="size-8 text-accent" />
          <span>Billing & Plans</span>
        </h1>
        <p className="text-muted-foreground mt-2">Manage your subscription, credits, and view payment history.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Current Plan</CardTitle>
            <CardDescription>You are currently on the Free Plan.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Card className="bg-muted/30">
              <CardContent className="pt-6 flex justify-between items-center">
                <div>
                  <h3 className="font-bold text-lg">Your Credits</h3>
                  <p className="text-4xl font-bold text-amber-400">{credits?.toLocaleString() ?? '...'}</p>
                </div>
                <div className="text-right">
                  <p className="text-sm text-muted-foreground">Need more?</p>
                   <Button variant="outline" size="sm" asChild>
                     <Link href="/subscribe">Upgrade Plan</Link>
                   </Button>
                </div>
              </CardContent>
            </Card>
            <div>
              <h3 className="text-lg font-semibold mb-2">Buy More Credits</h3>
               <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {creditPacks.map((pack) => (
                  <Card key={pack.name} className='text-center'>
                    <CardHeader>
                        <CardTitle className='text-xl'>{pack.name}</CardTitle>
                        <div className="flex items-center justify-center gap-2 text-amber-400">
                            <Star className="w-5 h-5 fill-current" />
                            <span className="text-2xl font-bold">{pack.credits.toLocaleString()}</span>
                        </div>
                    </CardHeader>
                    <CardContent>
                       <p className="text-muted-foreground">{pack.description}</p>
                    </CardContent>
                    <CardFooter>
                         <Button className="w-full" variant="secondary">
                            Buy for ${pack.price}
                        </Button>
                    </CardFooter>
                  </Card>
                ))}
              </div>
            </div>
          </CardContent>
           <CardFooter>
                <Button asChild>
                    <Link href="/subscribe">
                        Upgrade to Pro
                    </Link>
                </Button>
            </CardFooter>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Payment History</CardTitle>
            <CardDescription>No recent transactions found.</CardDescription>
          </CardHeader>
          <CardContent className="text-center text-muted-foreground py-16">
            <p>Your payment history will appear here.</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
