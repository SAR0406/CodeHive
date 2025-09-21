import type { PropsWithChildren } from 'react';
import AppShell from '@/components/layout/app-shell';

export default function AppLayout({ children }: PropsWithChildren) {
  return (
    <div className="dark">
      <AppShell>{children}</AppShell>
    </div>
  );
}
