
'use client'

import type { Database } from "firebase/database";
import { ref, onValue } from "firebase/database";

export interface LearningModule {
  id: string;
  title: string;
  description: string;
  cost: number;
}

export function onModulesUpdate(db: Database, callback: (modules: LearningModule[]) => void): () => void {
    const modulesRef = ref(db, 'learning_modules');

    const unsubscribe = onValue(modulesRef, (snapshot) => {
        if (snapshot.exists()) {
            const data = snapshot.val();
            const modulesArray = Object.keys(data).map(key => ({
                id: key,
                ...data[key]
            }));
            callback(modulesArray);
        } else {
            callback([]);
        }
    }, (error) => {
        console.error("Error fetching learning modules:", error);
        callback([]);
    });

    return unsubscribe;
}
