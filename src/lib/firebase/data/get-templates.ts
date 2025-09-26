
'use client'
import type { Firestore } from "firebase/firestore";
import { collection, getDocs, query } from "firebase/firestore";

export interface Template {
  id: string; // Firestore ID
  title: string;
  description: string;
  cost: number;
}

export async function getTemplates(db: Firestore): Promise<Template[]> {
    const templatesCollection = collection(db, 'templates');
    const q = query(templatesCollection);
    const querySnapshot = await getDocs(q);
    
    if (querySnapshot.empty) {
        return [];
    }

    const templates = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
    } as Template));

    return templates;
}
