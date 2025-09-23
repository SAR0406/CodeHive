
'use client'
import { createClient } from '@/lib/supabase/client';

export interface LearningModule {
  id: number;
  title: string;
  description: string;
  cost: number;
}

export async function getModules(): Promise<LearningModule[]> {
    const supabase = createClient();
    const { data, error } = await supabase.from('learning_modules').select('*');

    if (error) {
        console.error("Error fetching learning modules:", error);
        throw error;
    }

    return data || [];
}
