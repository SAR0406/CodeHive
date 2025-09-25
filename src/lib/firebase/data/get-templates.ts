
'use client'
import { db } from "@/firebase/config";
import { collection, getDocs, query } from "firebase/firestore";

export interface Template {
  id: string; // Firestore ID
  title: string;
  description: string;
  cost: number;
}

export async function getTemplates(): Promise<Template[]> {
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

    