
'use client'

import type { Firestore } from "firebase/firestore";
import { collection, getDocs, query } from "firebase/firestore";

export interface LearningModule {
  id: string; // Firestore ID
  title: string;
  description: string;
  cost: number;
}

export async function getModules(db: Firestore): Promise<LearningModule[]> {
    const modulesCollection = collection(db, 'learning_modules');
    const q = query(modulesCollection);
    const querySnapshot = await getDocs(q);

    if (querySnapshot.empty) {
        return [];
    }

    const modules = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
    } as LearningModule));

    return modules;
}
