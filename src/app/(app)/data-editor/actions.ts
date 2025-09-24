
'use server';

import { createClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';

// Whitelist of tables and their editable columns
const TABLE_WHITELIST: Record<string, string[]> = {
  profiles: ['id', 'email', 'display_name', 'credits', 'reputation'],
  tasks: ['id', 'created_at', 'updated_at', 'title', 'description', 'tags', 'credits_reward', 'status', 'created_by', 'assigned_to'],
  // Add other tables as needed, e.g., 'templates', 'mentors'
};

const getSupabaseAdmin = () => {
    // This uses the service_role key for admin-level access
    // IMPORTANT: This should ONLY be used in server-side code like this.
    return createClient();
};

export async function getRows(table: string) {
    if (!TABLE_WHITELIST[table]) {
        return { error: 'Access to this table is not allowed.' };
    }

    const supabase = getSupabaseAdmin();
    const { data, error } = await supabase.from(table).select('*').limit(100);

    if (error) {
        console.error(`Error fetching rows from ${table}:`, error);
        return { error: error.message };
    }
    return { data };
}

export type Action =
  | { type: 'insert'; row: Record<string, any> }
  | { type: 'update'; row: Record<string, any>; id: string | number }
  | { type: 'delete'; id: string | number };

export async function updateRows(table: string, actions: Action[]) {
  if (!TABLE_WHITELIST[table]) {
    return { error: 'Access to this table is not allowed.' };
  }

  const supabase = getSupabaseAdmin();
  const results = [];
  const editableColumns = TABLE_WHITELIST[table];

  for (const action of actions) {
    // Sanitize row data to only include whitelisted columns
    const sanitizeRow = (row: Record<string, any>) => {
      return Object.fromEntries(
        Object.entries(row).filter(([key]) => editableColumns.includes(key) && key !== 'id')
      );
    };
    
    try {
      let error = null;
      let data = null;

      switch (action.type) {
        case 'insert': {
            const cleanRow = sanitizeRow(action.row);
            const response = await supabase.from(table).insert(cleanRow).select().single();
            error = response.error;
            data = response.data;
            break;
        }
        case 'update': {
            const cleanRow = sanitizeRow(action.row);
             const response = await supabase.from(table).update(cleanRow).eq('id', action.id).select().single();
            error = response.error;
            data = response.data;
            break;
        }
        case 'delete': {
            const response = await supabase.from(table).delete().eq('id', action.id);
            error = response.error;
            data = { id: action.id };
            break;
        }
      }

      if (error) {
        throw new Error(error.message);
      }
      results.push({ id: data.id ?? action.id, success: true, action: action.type });
    } catch (e: any) {
      results.push({ id: action.type === 'insert' ? 'new' : action.id, success: false, error: e.message, action: action.type });
    }
  }

  revalidatePath('/data-editor');
  return { results };
}
