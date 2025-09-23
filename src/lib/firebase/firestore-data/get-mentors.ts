
import { db } from '@/lib/firebase/client-app';
import { collection, getDocs } from 'firebase/firestore';

export interface Mentor {
  id: string;
  name: string;
  specialties: string[];
  reputation: number;
  cost: number;
}

export async function getMentors(): Promise<Mentor[]> {
  const mentorsCol = collection(db, 'mentors');
  const mentorsSnapshot = await getDocs(mentorsCol);
  return mentorsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Mentor));
}
