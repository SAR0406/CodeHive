
'use client'

import type { Firestore } from "firebase/firestore";
import { collection, onSnapshot } from "firebase/firestore";

export interface LearningModule {
  id: string;
  title: string;
  description: string;
  cost: number;
}

export function onModulesUpdate(db: Firestore, callback: (modules: LearningModule[]) => void): () => void {
    const modulesRef = collection(db, 'learning_modules');

    const unsubscribe = onSnapshot(modulesRef, (snapshot) => {
        if (!snapshot.empty) {
            const modulesArray = snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            } as LearningModule));
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
