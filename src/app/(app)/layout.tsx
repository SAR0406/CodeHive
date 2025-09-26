
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
    if (!loading && !user) {
      router.replace('/login');
    }
  }, [loading, user, router]);

  if (loading || !user) {
    return (
      <div className="dark app-container flex items-center justify-center">
        <Loader2 className="size-10 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="dark app-container">
      <AppShell>{children}</AppShell>
    </div>
  );
}
