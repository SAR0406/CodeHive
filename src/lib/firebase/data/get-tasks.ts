
'use client'

import { db } from "@/firebase/config";
import { collection, getDocs, query, orderBy } from "firebase/firestore";
import { Timestamp } from "firebase/firestore";

export interface Task {
  id: string;
  title: string;
  description: string;
  tags: string[];
  credits_reward: number;
  status: 'OPEN' | 'ASSIGNED' | 'COMPLETED' | 'CANCELLED' | 'PAID';
  created_by: string; // userId
  assigned_to?: string; // userId
  created_at: Timestamp;
  updated_at: Timestamp;
}

export async function getTasks(): Promise<Task[]> {
    const tasksCollection = collection(db, 'tasks');
    const q = query(tasksCollection, orderBy('created_at', 'desc'));

    const querySnapshot = await getDocs(q);

    if (querySnapshot.empty) {
        console.log("No tasks found in Firestore.");
        return [];
    }

    const tasks = querySnapshot.docs.map(doc => {
        const data = doc.data();
        return {
            id: doc.id,
            ...data,
            // Timestamps are automatically handled by Firestore, no need to convert
        } as Task;
    });

    return tasks;
}

    