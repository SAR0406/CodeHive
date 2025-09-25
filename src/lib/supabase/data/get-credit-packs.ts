
'use client'

export interface CreditPack {
  id: number;
  name: string;
  credits: number;
  price: number;
  description: string;
}

export async function getCreditPacks(): Promise<CreditPack[]> {
    // MOCK DATA - Replace with Firestore call
    return [
        {id: 1, name: 'Starter Pack', credits: 500, price: 5, description: 'A small boost to get you going.'},
        {id: 2, name: 'Developer Pack', credits: 2500, price: 20, description: 'Perfect for active developers.'},
        {id: 3, name: 'Agency Pack', credits: 10000, price: 75, description: 'For teams and power users.'},
    ];
}
