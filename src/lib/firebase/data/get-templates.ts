
'use client'
import type { Database } from "firebase/database";
import { ref, onValue } from "firebase/database";

export interface Template {
  id: string;
  title: string;
  description: string;
  cost: number;
}

export function onTemplatesUpdate(db: Database, callback: (templates: Template[]) => void): () => void {
    const templatesRef = ref(db, 'templates');
    
    const unsubscribe = onValue(templatesRef, (snapshot) => {
        if (snapshot.exists()) {
            const data = snapshot.val();
            const templatesArray = Object.keys(data).map(key => ({
                id: key,
                ...data[key]
            }));
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
