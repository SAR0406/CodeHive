
import { db } from '@/lib/firebase/client-app';
import { collection, getDocs } from 'firebase/firestore';

export interface CreditPack {
  name: string;
  credits: number;
  price: number;
  description: string;
}

export async function getCreditPacks(): Promise<CreditPack[]> {
  const packsCol = collection(db, 'creditPacks');
  const packsSnapshot = await getDocs(packsCol);
  const packsList = packsSnapshot.docs.map(doc => doc.data() as CreditPack);
  return packsList.sort((a, b) => a.price - b.price);
}
