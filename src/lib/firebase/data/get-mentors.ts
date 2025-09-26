
'use client'

import type { Firestore } from "firebase/firestore";
import { collection, getDocs, query } from "firebase/firestore";

export interface Mentor {
  id: string; // Firestore ID
  name: string;
  specialties: string[];
  reputation: number;
  cost: number;
}

export async function getMentors(db: Firestore): Promise<Mentor[]> {
    const mentorsCollection = collection(db, 'mentors');
    const q = query(mentorsCollection);
    const querySnapshot = await getDocs(q);
    
    if (querySnapshot.empty) {
        return [];
    }

    const mentors = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
    } as Mentor));

    return mentors;
}
