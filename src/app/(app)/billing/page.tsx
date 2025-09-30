
'use client';

import { useAuth } from '@/hooks/use-auth';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { CreditCard, Loader2, Star, ArrowRight, TrendingUp, TrendingDown } from 'lucide-react';
import Link from 'next/link';
import { useToast } from '@/hooks/use-toast';
import { useState, useEffect } from 'react';
import { CreditPack, onCreditPacksUpdate } from '@/lib/firebase/data/get-credit-packs';
import { useFirebase } from '@/lib/firebase/client-provider';
import { onTasksUpdateForUser, type Task } from '@/lib/firebase/data/get-tasks';
import { onTransactionsUpdate, Transaction } from '@/lib/firebase/data/get-transactions';
import { formatDistanceToNow } from 'date-fns';

export default function BillingPage() {
  const { user, credits } = useAuth();
  const { db } = useFirebase();
  const { toast } = useToast();
  const [loadingPack, setLoadingPack] = useState<string | null>(null);
  const [creditPacks, setCreditPacks] = useState<CreditPack[]>([]);
  const [isLoadingPacks, setIsLoadingPacks] = useState(true);
  const [escrowedCredits, setEscrowedCredits] = useState<number | null>(null);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [isLoadingTransactions, setIsLoadingTransactions] = useState(true);

  useEffect(() => {
    if (!db) return;

    const unsubscribePacks = onCreditPacksUpdate(db, (packs) => {
      setCreditPacks(packs);
      setIsLoadingPacks(false);
    });

    return () => unsubscribePacks();
  }, [db, toast]);
  
  useEffect(() => {
    if (!db || !user) return;
    
    // Listen for user's tasks to calculate escrow
    const unsubscribeTasks = onTasksUpdateForUser(db, user.uid, (userTasks) => {
        const openTasks = userTasks.filter(task => task.status === 'OPEN' || task.status === 'ASSIGNED' || task.status === 'COMPLETED');
        const totalEscrow = openTasks.reduce((acc, task) => acc + task.credit_reward, 0);
        setEscrowedCredits(totalEscrow);
    });

    // Listen for transactions
    setIsLoadingTransactions(true);
    const unsubscribeTransactions = onTransactionsUpdate(db, user.uid, (newTransactions) => {
        setTransactions(newTransactions);
        setIsLoadingTransactions(false);
    });
    
    return () => {
      unsubscribeTasks();
      unsubscribeTransactions();
    };

  }, [db, user]);

  const handleBuyCredits = async (pack: CreditPack) => {
    if (!user) {
        toast({ title: 'Not Authenticated', description: 'Please log in to purchase credits.', variant: 'destructive' });
        return;
    }
    setLoadingPack(pack.name);
    toast({ title: 'Coming Soon!', description: 'Purchasing will be connected to Stripe or another payment provider soon.' });
    // In a real app, you would redirect to a checkout page here
    // For now, we'll just simulate the loading
    setTimeout(() => {
        setLoadingPack(null);
    }, 2000);
  }
  
  const toDate = (timestamp: { seconds: number, nanoseconds: number }) => {
    if (!timestamp) return new Date();
    return new Date(timestamp.seconds * 1000 + timestamp.nanoseconds / 1000000);
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
            <div className="grid grid-cols-2 gap-4">
                <Card className="bg-muted/30">
                    <CardHeader>
                        <CardTitle className="text-lg font-semibold">Available Credits</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p className="text-4xl font-bold text-primary">{credits?.credits.toLocaleString() ?? '...'}</p>
                        <p className="text-sm text-muted-foreground">Credits in your wallet</p>
                    </CardContent>
                </Card>
                 <Card className="bg-muted/30">
                    <CardHeader>
                        <CardTitle className="text-lg font-semibold">In Escrow</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p className="text-4xl font-bold">
                           {escrowedCredits === null ? '...' : escrowedCredits.toLocaleString()}
                        </p>
                         <p className="text-sm text-muted-foreground">Credits reserved for your open tasks</p>
                    </CardContent>
                </Card>
            </div>
            <div>
              <h3 className="text-lg font-semibold mb-2 mt-6">Buy More Credits</h3>
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
                            <div className="flex items-center justify-center gap-2 text-primary">
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
            <CardTitle>Recent Transactions</CardTitle>
            <CardDescription>A log of your recent credit activity.</CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col gap-4">
            {isLoadingTransactions ? (
                <div className="text-center text-muted-foreground py-16">
                    <Loader2 className="animate-spin mx-auto"/>
                </div>
            ) : transactions.length > 0 ? (
                transactions.slice(0, 5).map(tx => (
                    <div key={tx.id} className="flex items-center justify-between text-sm">
                        <div className="flex items-center gap-3">
                           {tx.type === 'spend' ? <TrendingDown className="size-5 text-destructive" /> : <TrendingUp className="size-5 text-green-500" />}
                           <div>
                            <p className="font-medium line-clamp-1">{tx.description}</p>
                            <p className="text-xs text-muted-foreground">{formatDistanceToNow(toDate(tx.created_at), { addSuffix: true })}</p>
                           </div>
                        </div>
                        <div className={`font-semibold ${tx.type === 'spend' ? 'text-destructive' : 'text-green-500'}`}>
                           {tx.type === 'spend' ? '-' : '+'}
                           {tx.amount.toLocaleString()}
                        </div>
                    </div>
                ))
            ) : (
                <div className="text-center text-muted-foreground py-16">
                     <p>No recent transactions found.</p>
                </div>
            )}
          </CardContent>
          <CardFooter>
            <Button variant="outline" asChild className="w-full">
                <Link href="/billing/transactions">
                    View All Transactions
                    <ArrowRight className="ml-2"/>
                </Link>
            </Button>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
}
