
import { db } from '@/lib/firebase/client-app';
import { collection, getDocs } from 'firebase/firestore';

export interface Task {
  title: string;
  description: string;
  tags: string[];
  credits: number;
  type: 'Bounty' | 'Task';
}

export async function getTasks(): Promise<Task[]> {
  const tasksCol = collection(db, 'tasks');
  const taskSnapshot = await getDocs(tasksCol);
  const taskList = taskSnapshot.docs.map(doc => doc.data() as Task);
  return taskList;
}
