import type { PropsWithChildren } from 'react';
import AppShell from '@/components/layout/app-shell';

export default function AppLayout({ children }: PropsWithChildren) {
  return (
    <div className="dark app-container">
      <AppShell>{children}</AppShell>
    </div>
  );
}
