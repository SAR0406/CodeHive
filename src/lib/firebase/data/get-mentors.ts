
'use client'

import type { Database } from "firebase/database";
import { ref, onValue } from "firebase/database";

export interface Mentor {
  id: string;
  name: string;
  specialties: string[];
  reputation: number;
  cost: number;
}

export function onMentorsUpdate(db: Database, callback: (mentors: Mentor[]) => void): () => void {
    const mentorsRef = ref(db, 'mentors');

    const unsubscribe = onValue(mentorsRef, (snapshot) => {
        if (snapshot.exists()) {
            const data = snapshot.val();
            const mentorsArray = Object.keys(data).map(key => ({
                id: key,
                ...data[key]
            }));
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
