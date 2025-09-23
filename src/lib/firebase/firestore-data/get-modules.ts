
import { db } from '@/lib/firebase/client-app';
import { collection, getDocs } from 'firebase/firestore';

export interface LearningModule {
  title: string;
  description: string;
  cost: number;
}

export async function getModules(): Promise<LearningModule[]> {
  const modulesCol = collection(db, 'modules');
  const modulesSnapshot = await getDocs(modulesCol);
  return modulesSnapshot.docs.map(doc => doc.data() as LearningModule);
}
