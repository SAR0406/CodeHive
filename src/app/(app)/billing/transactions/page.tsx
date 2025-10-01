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

export default function TransactionsPage() {
  const { user, credits } = useAuth();
  const { db } = useFirebase();
  const { toast } from '@/hooks/use-toast';
import { useState, useEffect } from 'react';
import { CreditPack, onCreditPacksUpdate } from '@/lib/firebase/data/get-credit-packs';
import { useFirebase } from '@/lib/firebase/client-provider';
import { onTasksUpdateForUser, type Task } from '@/lib/firebase/data/get-tasks';
import { onTransactionsUpdate, Transaction } from '@/lib/firebase/data/get-transactions';
import { formatDistanceToNow } from 'date-fns';

export default function TransactionsPage() {
  const { user, credits } = useAuth();
  const { db } = useFirebase();
  const { toast } } from '@/hooks/use-toast';
import { useState, useEffect } from 'react';
import { CreditPack, onCreditPacksUpdate } from '@/lib/firebase/data/get-credit-packs';
import { useFirebase } from '@/lib/firebase/client-provider';
import { onTasksUpdateForUser, type Task } from '@/lib/firebase/data/get-tasks';
import { onTransactionsUpdate, Transaction } from '@/lib/firebase/data/get-transactions';
import { formatDistanceToNow } from 'date-fns';

export default function TransactionsPage() {
  const { user, credits } = useAuth();
  const { db } = useFirebase();
  const { toast } = useState(null);
  const [loadingPack, setLoadingPack] = useState(null);
  const [creditPacks, setCreditPacks setEscrowedCredits = useState(null);
  const [transactions, setTransactions > 0 ? (
                transactions.slice(0, 5).map(tx => (
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
