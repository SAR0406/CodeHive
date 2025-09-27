'use client';

import type { Firestore, Timestamp } from 'firebase/firestore';
import { collection, query, orderBy, onSnapshot } from 'firebase/firestore';

export interface Transaction {
  id: string;
  type: 'spend' | 'earn';
  amount: number;
  description: string;
  created_at: Timestamp;
  balance_after: number;
}

export function onTransactionsUpdate(
  db: Firestore,
  userId: string,
  callback: (transactions: Transaction[]) => void
): () => void {
  const transactionsCollection = collection(db, 'profiles', userId, 'transactions');
  const q = query(transactionsCollection, orderBy('created_at', 'desc'));

  const unsubscribe = onSnapshot(
    q,
    (querySnapshot) => {
      if (querySnapshot.empty) {
        callback([]);
      } else {
        const transactions = querySnapshot.docs.map(
          (doc) =>
            ({
              id: doc.id,
              ...doc.data(),
            } as Transaction)
        );
        callback(transactions);
      }
    },
    (error) => {
      console.error('Error fetching transactions:', error);
      callback([]);
    }
  );

  return unsubscribe;
}
