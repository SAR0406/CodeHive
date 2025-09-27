
'use client';
import type { PropsWithChildren } from 'react';
import { useRouter } from 'next/navigation';
import AppShell from '@/components/layout/app-shell';
import { useAuth } from '@/hooks/use-auth';
import { Loader2 } from 'lucide-react';
import { useEffect } from 'react';

export default function AppLayout({ children }: PropsWithChildren) {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    // If loading is finished and there is no user, redirect to login.
    if (!loading && !user) {
      router.replace('/login');
    }
  }, [loading, user, router]);

  // While loading, or if there is no user yet, show a loading screen.
  // This prevents a flash of the app content before the redirect happens.
  if (loading || !user) {
    return (
      <div className="dark app-container flex items-center justify-center bg-background">
        <Loader2 className="size-10 animate-spin text-muted-foreground" />
      </div>
    );
  }

  // If loading is finished and there is a user, render the app shell.
  return (
    <div className="dark app-container">
      <AppShell>{children}</AppShell>
    </div>
  );
}
