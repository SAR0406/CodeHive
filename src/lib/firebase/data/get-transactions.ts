
'use client';

import type { Database } from 'firebase/database';
import { ref, query, orderByChild, onValue } from 'firebase/database';

export interface Transaction {
  id: string;
  type: 'spend' | 'earn';
  amount: number;
  description: string;
  created_at: number; // RTDB timestamp is a number
  balance_after: number;
}

export function onTransactionsUpdate(
  db: Database,
  userId: string,
  callback: (transactions: Transaction[]) => void
): () => void {
  const transactionsRef = query(ref(db, `transactions/${userId}`), orderByChild('created_at'));

  const unsubscribe = onValue(
    transactionsRef,
    (snapshot) => {
      if (snapshot.exists()) {
        const data = snapshot.val();
        const transactionsArray = Object.keys(data)
            .map(key => ({ id: key, ...data[key] }))
            .reverse(); // To get descending order
        callback(transactionsArray as Transaction[]);
      } else {
        callback([]);
      }
    },
    (error) => {
      console.error('Error fetching transactions:', error);
      callback([]);
    }
  );

  return unsubscribe;
}
