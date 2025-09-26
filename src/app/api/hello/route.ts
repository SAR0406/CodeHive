import { createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json(
      {
        status: 401,
        message: 'Unauthorized',
        error: 'You must be logged in to access this resource.',
      },
      { status: 401 }
    );
  }

  return NextResponse.json({
    status: 200,
    message: 'Authenticated User Data',
    data: {
      id: user.id,
      email: user.email,
      // Add other user data you want to expose
    },
  });
}
