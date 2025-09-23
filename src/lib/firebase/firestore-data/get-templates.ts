
import { db } from '@/lib/firebase/client-app';
import { collection, getDocs } from 'firebase/firestore';

export interface Template {
  id: string;
  title: string;
  description: string;
  cost: number;
}

export async function getTemplates(): Promise<Template[]> {
  const templatesCol = collection(db, 'templates');
  const templateSnapshot = await getDocs(templatesCol);
  return templateSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Template));
}
