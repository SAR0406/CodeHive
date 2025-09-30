
'use client'

import type { Firestore } from "firebase/firestore";
import { collection, onSnapshot } from "firebase/firestore";

export interface Mentor {
  id: string;
  name: string;
  specialties: string[];
  reputation: number;
  cost: number;
}

export function onMentorsUpdate(db: Firestore, callback: (mentors: Mentor[]) => void): () => void {
    const mentorsRef = collection(db, 'mentors');

    const unsubscribe = onSnapshot(mentorsRef, (snapshot) => {
        if (!snapshot.empty) {
            const mentorsArray = snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            } as Mentor));
            callback(mentorsArray);
        } else {
            callback([]);
        }
    }, (error) => {
        console.error("Error fetching mentors:", error);
        callback([]);
    });

    return unsubscribe;
}
