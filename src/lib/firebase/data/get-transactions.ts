
'use client';

import type { Firestore } from 'firebase/firestore';
import { collection, query, orderBy, onSnapshot } from 'firebase/firestore';

export interface Transaction {
  id: string;
  type: 'spend' | 'earn';
  amount: number;
  description: string;
  created_at: { seconds: number, nanoseconds: number }; // Firestore Timestamp
  balance_after: number;
}

export function onTransactionsUpdate(
  db: Firestore,
  userId: string,
  callback: (transactions: Transaction[]) => void
): () => void {
  const transactionsRef = query(collection(db, 'transactions', userId, 'history'), orderBy('created_at', 'desc'));

  const unsubscribe = onSnapshot(
    transactionsRef,
    (snapshot) => {
      if (!snapshot.empty) {
        const transactionsArray = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Transaction));
        callback(transactionsArray);
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
