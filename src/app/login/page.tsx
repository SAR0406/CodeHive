
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
      <div className="flex min-h-screen items-center justify-center bg-background">
        <Loader2 className="size-10 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="flex min-h-screen items-stretch bg-background">
      <div className="hidden lg:flex lg:w-1/2 items-center justify-center relative bg-card/40">
        <div className="absolute inset-0 z-0">
          <Spline scene="https://prod.spline.design/gm0ksJtPHZQblNTV/scene.splinecode" />
        </div>
         <div className="z-10 text-white text-center p-8">
           <Link href="/" className="flex items-center justify-center gap-3 mb-4">
                <CodeHiveIcon className="size-10 text-white" />
                <span className="font-bold text-4xl font-headline text-white">CodeHive</span>
            </Link>
            <p className="text-xl text-muted-foreground mt-4">
              Build, learn, and collaborate with the power of AI.
            </p>
        </div>
      </div>
      <div className="flex w-full lg:w-1/2 items-center justify-center p-4">
        <div className="w-full max-w-sm">
          <div className="mb-8 flex flex-col items-center lg:hidden">
            <Link href="/" className="flex items-center gap-2 mb-4">
                <CodeHiveIcon className="size-8 text-white" />
                <span className="font-bold text-2xl font-headline text-white">CodeHive</span>
            </Link>
          </div>
          <LoginForm />
        </div>
      </div>
    </div>
  );
}
