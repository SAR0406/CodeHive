'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/use-auth';
import { CodeHiveIcon } from '@/components/icons';
import Link from 'next/link';
import LoginForm from './login-form';
import Spline from '@splinetool/react-spline';
import { Loader2 } from 'lucide-react';

export default function LoginPage() {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && user) {
      router.replace('/dashboard');
    }
  }, [user, loading, router]);

  if (loading || user) {
    return (
      <div className="dark app-container flex flex-col items-center justify-center bg-background gap-4">
        <CodeHiveIcon className="size-12 text-accent animate-pulse" />
        <p className="text-muted-foreground">Loading your session...</p>
      </div>
    );
  }

  return (
    <div className="dark app-container flex flex-col md:flex-row items-center justify-center bg-background gap-4 p-4">
      <div className="w-full md:w-1/2 h-64 md:h-full flex items-center justify-center relative">
         <Spline
          className="pointer-events-none"
          scene="https://prod.spline.design/gm0ksJtPHZQblNTV/scene.splinecode"
        />
      </div>
      <div className="w-full max-w-md flex flex-col items-center justify-center">
        <Link href="/" className="flex items-center gap-2 mb-8 md:hidden">
            <CodeHiveIcon className="size-8 text-white" />
            <span className="font-bold text-xl font-headline text-white">CodeHive</span>
        </Link>
        <LoginForm />
      </div>
    </div>
  );
}
