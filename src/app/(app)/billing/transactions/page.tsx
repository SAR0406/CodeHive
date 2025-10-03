
'use client';

import { useAuth } from '@/hooks/use-auth';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowLeft, TrendingUp, TrendingDown } from 'lucide-react';
import Link from 'next/link';
import { useToast } from '@/hooks/use-toast';
import { useState, useEffect } from 'react';
import { useFirebase } from '@/lib/firebase/client-provider';
import { onTransactionsUpdate, Transaction } from '@/lib/firebase/data/get-transactions';
import { format } from 'date-fns';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';

export default function TransactionsPage() {
  const { user } = useAuth();
  const { db } = useFirebase();
  const { toast } = useToast();
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [isLoadingTransactions, setIsLoadingTransactions] = useState(true);

  useEffect(() => {
    if (!db || !user) return;

    setIsLoadingTransactions(true);
    const unsubscribeTransactions = onTransactionsUpdate(db, user.uid, (newTransactions) => {
        setTransactions(newTransactions);
        setIsLoadingTransactions(false);
    });
    
    return () => {
      unsubscribeTransactions();
    };
  }, [db, user]);

  const toDate = (timestamp: { seconds: number, nanoseconds: number }) => {
    if (!timestamp) return new Date();
    return new Date(timestamp.seconds * 1000 + timestamp.nanoseconds / 1000000);
  }

  return (
    <div className="flex flex-col gap-8">
      <div className="flex items-center gap-4">
        <Button variant="outline" size="icon" asChild>
            <Link href="/billing"><ArrowLeft/></Link>
        </Button>
        <div>
            <h1 className="font-headline text-3xl md:text-4xl font-semibold">Transaction History</h1>
            <p className="text-muted-foreground mt-2">A complete log of all your credit activity.</p>
        </div>
      </div>

      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Description</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Date</TableHead>
                <TableHead className="text-right">Amount</TableHead>
                <TableHead className="text-right">Balance After</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoadingTransactions ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center py-12">
                    Loading transactions...
                  </TableCell>
                </TableRow>
              ) : transactions.length > 0 ? (
                transactions.map((tx) => (
                  <TableRow key={tx.id}>
                    <TableCell className="font-medium">{tx.description}</TableCell>
                    <TableCell>
                      <span
                        className={`inline-flex items-center gap-2 rounded-md px-2 py-1 text-xs font-medium ${
                          tx.type === 'spend'
                            ? 'bg-red-500/10 text-red-500'
                            : 'bg-green-500/10 text-green-500'
                        }`}
                      >
                        {tx.type === 'spend' ? (
                          <TrendingDown className="h-3 w-3" />
                        ) : (
                          <TrendingUp className="h-3 w-3" />
                        )}
                        {tx.type}
                      </span>
                    </TableCell>
                    <TableCell>{format(toDate(tx.created_at), 'MMM d, yyyy')}</TableCell>
                    <TableCell
                      className={`text-right font-semibold ${
                        tx.type === 'spend' ? 'text-destructive' : 'text-green-500'
                      }`}
                    >
                      {tx.type === 'spend' ? '-' : '+'} {tx.amount.toLocaleString()}
                    </TableCell>
                    <TableCell className="text-right">{tx.balance_after.toLocaleString()}</TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={5} className="text-center py-12 text-muted-foreground">
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
