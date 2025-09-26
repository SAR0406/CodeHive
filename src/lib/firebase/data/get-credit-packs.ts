
'use client'

import type { Firestore } from "firebase/firestore";
import { collection, getDocs, query } from "firebase/firestore";

export interface CreditPack {
  id: string; // Firestore ID
  name: string;
  credits: number;
  price: number;
  description: string;
}

export async function getCreditPacks(db: Firestore): Promise<CreditPack[]> {
    const packsCollection = collection(db, 'credit_packs');
    const q = query(packsCollection);
    const querySnapshot = await getDocs(q);
    
    if (querySnapshot.empty) {
        return [];
    }

    const packs = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
    } as CreditPack));

    return packs;
}
