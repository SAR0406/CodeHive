
'use client'
import { createClient } from '@/lib/supabase/client';

export interface Mentor {
  id: number;
  name: string;
  specialties: string[];
  reputation: number;
  cost: number;
}

export async function getMentors(): Promise<Mentor[]> {
  const supabase = createClient();
  const { data, error } = await supabase.from('mentors').select('*');
  
  if (error) {
    console.error("Error fetching mentors:", error);
    throw error;
  }
  
  return data || [];
}
