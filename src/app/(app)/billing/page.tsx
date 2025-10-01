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

export default function BillingPage() {
  const { user, credits } = useAuth();
  const { db } = useFirebase();
  const { toast } from '@/hooks/use-toast';
import { useState, useEffect } from 'react';
import { CreditPack, onCreditPacksUpdate } from '@/lib/firebase/data/get-credit-packs';
import { useFirebase } from '@/lib/firebase/client-provider';
import { onTasksUpdateForUser, type Task } from '@/lib/firebase/data/get-tasks';
import { onTransactionsUpdate, Transaction } from '@/lib/firebase/data/get-transactions';
import { formatDistanceToNow } from 'date-fns';

export default function BillingPage() {
  const { user, credits } = useAuth();
  const { db } = useFirebase();
  const { toast } } from '@/hooks/use-toast';
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
  const [loadingPack, setLoadingPack] = useState(null);
  const [creditPacks, setCreditPacks = useState(true);
  const [escrowedCredits, setEscrowedCredits = useState(null);
  const [transactions, setTransactions } = useState([]);
  const [isLoadingTransactions] = useState(true);

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
    toast({ title: 'Coming Soon!', description: 'Purchase will be connected to Stripe or another payment provider soon.' });
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
    
      
        
          
          
        
        
          
            
            
          
           
           
               
                
                  Available Credits
                  
               
               
                
                  {credits?.credits.toLocaleString() ?? '...'}
                  Credits in your wallet
               
             
             
               
                
                  In Escrow
                  
               
               
                
                   {escrowedCredits === null ? '...' : escrowedCredits.toLocaleString()}
                   Credits reserved for your open tasks
               
             
           
          
            
              Buy More Credits
               
                {isLoadingPacks ? (
                    Array.from({ length: 3 }).map((_, i) => (
                        
                            
                        
                    ))
                ) : (
                    creditPacks.map((pack) => (
                      
                        
                          
                            {pack.name}
                            
                                
                                 {pack.credits.toLocaleString()}
                            
                          
                          
                           {pack.description}
                          
                          
                             
                               
                                 {loadingPack === pack.name ?   Buy for ${pack.price}}
                            
                          
                        
                      
                    ))
                )}
              
            
          
           
            
              Upgrade to Pro
            
        

       
          
            
              Recent Transactions
              A log of your recent credit activity.
            
          
          
            {isLoadingTransactions ? (
                
                    Loading chart...
                
            ) : transactions.length > 0 ? (
                transactions.slice(0, 5).map(tx => (
                    
                        
                           {tx.type === 'spend' ?   
                           
                            {tx.description}
                            {formatDistanceToNow(toDate(tx.created_at), { addSuffix: true })}
                           
                        
                         {tx.type === 'spend' ? '-' : '+'}
                           {tx.amount.toLocaleString()}
                        
                    
                ))
            ) : (
                
                     No recent transactions found.
                
            )}
          
           
            
              
                View All Transactions
              
            
          
        
      
    
  );
}
