
'use client'

import { createBrowserClient } from '@supabase/ssr'

export function createClient() {
  // NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY are required
  // to be set in the .env file and in the Vercel environment variables.
  // if they are not set, the app will throw an error.
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )
}
