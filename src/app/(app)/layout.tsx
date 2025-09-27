
'use client';
import type { PropsWithChildren } from 'react';
import { useRouter } from 'next/navigation';
import AppShell from '@/components/layout/app-shell';
import { useAuth } from '@/hooks/use-auth';
import { CodeHiveIcon } from '@/components/icons';
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
      <div className="dark app-container flex flex-col items-center justify-center bg-background gap-4">
        <CodeHiveIcon className="size-12 text-accent animate-pulse" />
        <p className="text-muted-foreground">Authenticating...</p>
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
