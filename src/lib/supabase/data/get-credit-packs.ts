
'use client'
import { createClient } from '@/lib/supabase/client';

export interface CreditPack {
  id: number;
  name: string;
  credits: number;
  price: number;
  description: string;
}

export async function getCreditPacks(): Promise<CreditPack[]> {
  const supabase = createClient();
  const { data, error } = await supabase.from('credit_packs').select('*').order('price', { ascending: true });
  
  if (error) {
    console.error("Error fetching credit packs:", error);
    throw error;
  }
  
  return data || [];
}
