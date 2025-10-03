
'use client';

import { useAuth } from '@/hooks/use-auth';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { CreditCard, Loader2, Star, ArrowRight, TrendingUp, TrendingDown } from 'lucide-react';
import Link from 'next/link';
import { useToast } from '@/hooks/use-toast';
import { useState, useEffect } from 'react';
import { CreditPack, onCreditPacksUpdate } from '@/lib/firebase/data/get-credit-packs';
import { useFirebase } from '@/lib/firebase/client-provider';
import { onTasksUpdateForUser, type Task } from '@/lib/firebase/data/get-tasks';
import { onTransactionsUpdate, Transaction } from '@/lib/firebase/data/get-transactions';
import { formatDistanceToNow } from 'date-fns';
import { Skeleton } from '@/components/ui/skeleton';

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
    
    const unsubscribeTasks = onTasksUpdateForUser(db, user.uid, (userTasks) => {
        const openTasks = userTasks.filter(task => task.status === 'OPEN' || task.status === 'ASSIGNED' || task.status === 'COMPLETED');
        const totalEscrow = openTasks.reduce((acc, task) => acc + task.credit_reward, 0);
        setEscrowedCredits(totalEscrow);
    });

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
    toast({ title: 'Coming Soon!', description: 'Purchase will be connected to a payment provider soon.' });
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
            <CreditCard className="size-8 text-accent"/>
            <span>Billing & Credits</span>
        </h1>
        <p className="text-muted-foreground mt-2">Manage your credits, subscription, and view your transaction history.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
        <div className="flex flex-col gap-8">
            <div className="grid grid-cols-2 gap-6">
                <Card>
                    <CardHeader className="pb-2">
                        <CardDescription>Available Credits</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <p className="text-3xl font-bold">{credits?.credits.toLocaleString() ?? '...'}</p>
                        <p className="text-xs text-muted-foreground">Credits in your wallet</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="pb-2">
                        <CardDescription>In Escrow</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <p className="text-3xl font-bold">{escrowedCredits === null ? '...' : escrowedCredits.toLocaleString()}</p>
                        <p className="text-xs text-muted-foreground">Credits reserved for open tasks</p>
                    </CardContent>
                </Card>
            </div>
            <Card>
              <CardHeader>
                <CardTitle>Buy More Credits</CardTitle>
              </CardHeader>
              <CardContent className="grid sm:grid-cols-3 gap-4">
                {isLoadingPacks ? (
                    Array.from({ length: 3 }).map((_, i) => (
                        <Skeleton key={i} className="h-40" />
                    ))
                ) : (
                    creditPacks.map((pack) => (
                      <Card key={pack.name} className="flex flex-col justify-between">
                        <CardHeader>
                            <CardTitle className="text-lg">{pack.name}</CardTitle>
                            <div className="text-2xl font-bold flex items-center gap-1">
                                <Star className="w-5 h-5 text-yellow-400 fill-current" /> {pack.credits.toLocaleString()}
                            </div>
                        </CardHeader>
                        <CardContent>
                          <p className="text-sm text-muted-foreground">{pack.description}</p>
                        </CardContent>
                        <CardFooter>
                            <Button className="w-full" onClick={() => handleBuyCredits(pack)} disabled={!!loadingPack}>
                               {loadingPack === pack.name ? <Loader2 className="animate-spin" /> : `Buy for $${pack.price}`}
                            </Button>
                        </CardFooter>
                      </Card>
                    ))
                )}
              </CardContent>
            </Card>
            <Button asChild variant="secondary">
              <Link href="/subscribe">Upgrade to Pro <ArrowRight className="ml-2"/></Link>
            </Button>
        </div>

        <Card>
            <CardHeader>
              <CardTitle>Recent Transactions</CardTitle>
              <CardDescription>A log of your recent credit activity.</CardDescription>
            </CardHeader>
            <CardContent>
              {isLoadingTransactions ? (
                  <div className="text-center text-muted-foreground">Loading transactions...</div>
              ) : transactions.length > 0 ? (
                  transactions.slice(0, 5).map(tx => (
                      <div key={tx.id} className="flex justify-between items-center py-3 border-b last:border-b-0">
                          <div className="flex items-center gap-3">
                             {tx.type === 'spend' ? <TrendingDown className="text-destructive"/> : <TrendingUp className="text-green-500"/>}
                             <div>
                              <p className="font-medium">{tx.description}</p>
                              <p className="text-xs text-muted-foreground">{formatDistanceToNow(toDate(tx.created_at), { addSuffix: true })}</p>
                             </div>
                          </div>
                          <div className={`font-semibold ${tx.type === 'spend' ? 'text-destructive' : 'text-green-500'}`}>
                           {tx.type === 'spend' ? '-' : '+'} {tx.amount.toLocaleString()}
                          </div>
                      </div>
                  ))
              ) : (
                  <div className="text-center py-8 text-muted-foreground"> No recent transactions found.</div>
              )}
            </CardContent>
            <CardFooter>
              <Button variant="outline" className="w-full" asChild>
                <Link href="/billing/transactions">View All Transactions</Link>
              </Button>
            </CardFooter>
        </Card>
      </div>
    </div>
  );

    