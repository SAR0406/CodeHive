
'use client'

import type { Firestore } from "firebase/firestore";
import { collection, onSnapshot } from "firebase/firestore";

export interface CreditPack {
  id: string;
  name: string;
  credits: number;
  price: number;
  description: string;
}

export function onCreditPacksUpdate(db: Firestore, callback: (packs: CreditPack[]) => void): () => void {
    const packsRef = collection(db, 'credit_packs');
    
    const unsubscribe = onSnapshot(packsRef, (snapshot) => {
        if (!snapshot.empty) {
            const packsArray = snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            } as CreditPack));
            callback(packsArray);
        } else {
            callback([]);
        }
    }, (error) => {
        console.error("Error fetching credit packs:", error);
        callback([]);
    });

    return unsubscribe;
}
