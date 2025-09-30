
'use client'

import type { Database } from "firebase/database";
import { ref, onValue } from "firebase/database";

export interface CreditPack {
  id: string;
  name: string;
  credits: number;
  price: number;
  description: string;
}

export function onCreditPacksUpdate(db: Database, callback: (packs: CreditPack[]) => void): () => void {
    const packsRef = ref(db, 'credit_packs');
    
    const unsubscribe = onValue(packsRef, (snapshot) => {
        if (snapshot.exists()) {
            const data = snapshot.val();
            const packsArray = Object.keys(data).map(key => ({
                id: key,
                ...data[key]
            }));
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
