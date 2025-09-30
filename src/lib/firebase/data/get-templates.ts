
'use client'
import type { Firestore } from "firebase/firestore";
import { collection, onSnapshot } from "firebase/firestore";

export interface Template {
  id: string;
  title: string;
  description: string;
  cost: number;
}

export function onTemplatesUpdate(db: Firestore, callback: (templates: Template[]) => void): () => void {
    const templatesRef = collection(db, 'templates');
    
    const unsubscribe = onSnapshot(templatesRef, (snapshot) => {
        if (!snapshot.empty) {
            const templatesArray = snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            } as Template));
            callback(templatesArray);
        } else {
            callback([]);
        }
    }, (error) => {
        console.error("Error fetching templates:", error);
        callback([]);
    });

    return unsubscribe;
}
