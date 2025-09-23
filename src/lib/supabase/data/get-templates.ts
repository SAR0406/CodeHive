
'use client'
import { createClient } from '@/lib/supabase/client';

export interface Template {
  id: number;
  title: string;
  description: string;
  cost: number;
}

export async function getTemplates(): Promise<Template[]> {
  const supabase = createClient();
  const { data, error } = await supabase.from('templates').select('*');

  if (error) {
    console.error("Error fetching templates:", error);
    throw error;
  }

  return data || [];
}
