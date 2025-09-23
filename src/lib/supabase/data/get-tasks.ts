
'use client'
import { createClient } from '@/lib/supabase/client';

export interface Task {
  id: string;
  title: string;
  description: string;
  tags: string[];
  credits_reward: number;
  status: 'OPEN' | 'ASSIGNED' | 'COMPLETED' | 'CANCELLED' | 'PAID';
  created_by: string; // userId
  assigned_to?: string; // userId
  created_at: string;
  updated_at: string;
}

export async function getTasks(): Promise<Task[]> {
    const supabase = createClient();
    const { data, error } = await supabase.from('tasks').select('*').order('created_at', { ascending: false });

    if (error) {
        console.error("Error fetching tasks:", error);
        throw error;
    }
    
    // Supabase returns ISO strings for timestamps, which is fine for rendering.
    return data || [];
}
