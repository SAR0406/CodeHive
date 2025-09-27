
'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/use-auth';
import { useFirebase } from '@/lib/firebase/client-provider';
import { onTransactionsUpdate, Transaction } from '@/lib/firebase/data/get-transactions';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { TrendingDown, TrendingUp, History, Loader2 } from 'lucide-react';
import { format } from 'date-fns';

export default function TransactionsPage() {
  const { user } = useAuth();
  const { db } = useFirebase();
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!user || !db) return;

    setIsLoading(true);
    const unsubscribe = onTransactionsUpdate(db, user.uid, (newTransactions) => {
      setTransactions(newTransactions);
      setIsLoading(false);
    });

    return () => unsubscribe();
  }, [user, db]);

  return (
    <div className="flex flex-col gap-8">
      <div>
        <h1 className="font-headline text-3xl md:text-4xl font-semibold flex items-center gap-3">
          <History className="size-8 text-accent" />
          <span>Transaction History</span>
        </h1>
        <p className="text-muted-foreground mt-2">A complete log of all your credit activity.</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>All Transactions</CardTitle>
          <CardDescription>Your full transaction history is listed below.</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Description</TableHead>
                <TableHead>Date</TableHead>
                <TableHead className="text-center">Type</TableHead>
                <TableHead className="text-right">Amount</TableHead>
                <TableHead className="text-right">Balance After</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={5} className="h-24 text-center">
                    <Loader2 className="mx-auto animate-spin text-muted-foreground" />
                  </TableCell>
                </TableRow>
              ) : transactions.length > 0 ? (
                transactions.map((tx) => (
                  <TableRow key={tx.id}>
                    <TableCell className="font-medium">{tx.description}</TableCell>
                    <TableCell>{format(tx.created_at.toDate(), 'PPp')}</TableCell>
                    <TableCell className="text-center">
                      <Badge variant={tx.type === 'spend' ? 'destructive' : 'secondary'} className="capitalize gap-1">
                        {tx.type === 'spend' ? 
                            <TrendingDown className="size-3" /> : 
                            <TrendingUp className="size-3" />
                        }
                        {tx.type}
                      </Badge>
                    </TableCell>
                    <TableCell className={`text-right font-semibold ${tx.type === 'spend' ? 'text-destructive' : 'text-green-500'}`}>
                      {tx.type === 'spend' ? '-' : '+'}
                      {tx.amount.toLocaleString()}
                    </TableCell>
                     <TableCell className="text-right">{tx.balance_after.toLocaleString()}</TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={5} className="h-24 text-center">
                    No transactions found.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
