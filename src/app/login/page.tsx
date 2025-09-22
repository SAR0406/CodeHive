
import { CodeHiveIcon } from '@/components/icons';
import Link from 'next/link';
import LoginForm from './login-form';

export default function LoginPage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center p-4">
      <div className="w-full max-w-sm">
        <div className="mb-8 flex flex-col items-center">
            <Link href="/" className="flex items-center gap-2 mb-4">
                <CodeHiveIcon className="size-8 text-white" />
                <span className="font-bold text-2xl font-headline text-white">CodeHive</span>
            </Link>
            <p className="text-muted-foreground">Welcome back</p>
        </div>
        <LoginForm />
      </div>
    </div>
  );
}
