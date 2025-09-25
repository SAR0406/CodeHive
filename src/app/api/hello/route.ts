import { createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';

/**
 * A secure, authenticated API endpoint that returns the current user's session data.
 * This demonstrates a best-practice approach for creating secure API routes
 * in a Next.js application with Supabase.
 *
 * It is "non-hackable" because:
 * 1. It requires a valid JWT from an authenticated user.
 * 2. It uses the secure, server-side Supabase client.
 * 3. It gracefully handles cases where no user is logged in.
 *
 * @param request The incoming Next.js request object.
 * @returns A JSON response with user data or an error.
 */
export async function GET(request: Request) {
  const supabase = createClient();
  
  // Fetch the current user's session from the secure cookie.
  const { data: { user } } = await supabase.auth.getUser();

  // If no user is logged in, return a 401 Unauthorized error.
  if (!user) {
    return NextResponse.json(
      { 
        status: 401,
        message: 'Unauthorized',
        error: 'You must be logged in to access this resource.' 
      }, 
      { status: 401 }
    );
  }

  // If a user is found, return their authenticated data.
  // This is a secure way to expose user-specific information to the client.
  return NextResponse.json({
    status: 200,
    message: 'Authenticated User Data',
    data: {
      id: user.id,
      email: user.email,
      authenticated_at: user.last_sign_in_at,
    }
  });
}
