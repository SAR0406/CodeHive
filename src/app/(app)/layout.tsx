import type { PropsWithChildren } from 'react';
import AppShell from '@/components/layout/app-shell';

export default function AppLayout({ children }: PropsWithChildren) {
  return (
    <div className="dark">
      <div className="fixed top-0 left-0 w-full h-full sparkle-bg -z-10" />
      <AppShell>{children}</AppShell>
    </div>
  );
}
