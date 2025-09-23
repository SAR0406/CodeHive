
import { db } from '@/lib/firebase/client-app';
import { collection, getDocs, orderBy, query } from 'firebase/firestore';

export interface Task {
  id: string;
  title: string;
  description: string;
  tags: string[];
  creditsReward: number;
  status: 'OPEN' | 'ASSIGNED' | 'COMPLETED' | 'CANCELLED' | 'PAID';
  createdBy: string; // userId
  assignedTo?: string; // userId
  createdAt: Date;
  updatedAt: Date;
}

export async function getTasks(): Promise<Task[]> {
  const tasksCol = collection(db, 'tasks');
  const q = query(tasksCol, orderBy('createdAt', 'desc'));
  const taskSnapshot = await getDocs(q);
  const taskList = taskSnapshot.docs.map(doc => {
    const data = doc.data();
    return {
      id: doc.id,
      ...data,
      // Convert Firestore Timestamps to JS Dates
      createdAt: data.createdAt.toDate(),
      updatedAt: data.updatedAt.toDate(),
    } as Task;
  });
  return taskList;
}
