
'use client';

import { useAuth } from '@/hooks/use-auth';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Check, CreditCard, Loader2, Star } from 'lucide-react';
import Link from 'next/link';
import { useToast } from '@/hooks/use-toast';
import { doc, updateDoc, increment } from 'firebase/firestore';
import { db } from '@/lib/firebase/client-app';
import { useState, useEffect } from 'react';
import { CreditPack, getCreditPacks } from '@/lib/firebase/firestore-data/get-credit-packs';


export default function BillingPage() {
  const { user, credits } = useAuth();
  const { toast } = useToast();
  const [loadingPack, setLoadingPack] = useState<string | null>(null);
  const [creditPacks, setCreditPacks] = useState<CreditPack[]>([]);
  const [isLoadingPacks, setIsLoadingPacks] = useState(true);

  useEffect(() => {
    async function fetchPacks() {
      try {
        const packs = await getCreditPacks();
        setCreditPacks(packs);
      } catch (error) {
        toast({ title: 'Error', description: 'Could not load credit packs.', variant: 'destructive' });
      } finally {
        setIsLoadingPacks(false);
      }
    }
    fetchPacks();
  }, [toast]);

  const handleBuyCredits = async (pack: CreditPack) => {
    if (!user) {
        toast({ title: 'Not Authenticated', description: 'Please log in to purchase credits.', variant: 'destructive' });
        return;
    }
    setLoadingPack(pack.name);
    try {
        const creditRef = doc(db, 'credits', user.uid);
        await updateDoc(creditRef, {
            balance: increment(pack.credits)
        });
        toast({
            title: 'Purchase Successful!',
            description: `${pack.credits.toLocaleString()} credits have been added to your account.`
        });
    } catch (error) {
        toast({ title: 'Purchase Failed', description: 'Could not complete the purchase. Please try again.', variant: 'destructive' });
    } finally {
        setLoadingPack(null);
    }
  }

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
                {isLoadingPacks ? (
                    Array.from({ length: 3 }).map((_, i) => (
                        <Card key={i} className="text-center p-6 flex flex-col items-center justify-center">
                            <Loader2 className="animate-spin text-muted-foreground" />
                        </Card>
                    ))
                ) : (
                    creditPacks.map((pack) => (
                      <Card key={pack.name} className='text-center'>
                        <CardHeader>
                            <CardTitle className='text-xl'>{pack.name}</CardTitle>
                            <div className="flex items-center justify-center gap-2 text-amber-400">
                                <Star className="w-5 h-5 fill-current" />
                                <span className="text-2xl font-bold">{pack.credits.toLocaleString()}</span>
                            </div>
                        </CardHeader>
                        <CardContent>
                           <p className="text-muted-foreground text-sm">{pack.description}</p>
                        </CardContent>
                        <CardFooter>
                             <Button className="w-full" variant="secondary" onClick={() => handleBuyCredits(pack)} disabled={!!loadingPack}>
                                {loadingPack === pack.name ? <Loader2 className="animate-spin" /> : `Buy for $${pack.price}`}
                            </Button>
                        </CardFooter>
                      </Card>
                    ))
                )}
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
