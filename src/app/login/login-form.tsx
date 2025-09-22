
'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  getAuth,
  signInWithPopup,
  GoogleAuthProvider,
  GithubAuthProvider,
} from 'firebase/auth';
import { app } from '@/lib/firebase/client-app';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { Chrome, Github, Loader2 } from 'lucide-react';
import { Separator } from '@/components/ui/separator';

const GoogleIcon = () => <Chrome className="size-4" />;
const GitHubIcon = () => <Github className="size-4" />;

export default function LoginForm() {
  const [isLoading, setIsLoading] = useState<false | 'google' | 'github'>(false);
  const router = useRouter();
  const { toast } = useToast();
  const auth = getAuth(app);
  const googleProvider = new GoogleAuthProvider();
  const githubProvider = new GithubAuthProvider();

  const handleSignIn = async (provider: 'google' | 'github') => {
    setIsLoading(provider);
    try {
      if(provider === 'google') {
        await signInWithPopup(auth, googleProvider);
      } else {
        await signInWithPopup(auth, githubProvider);
      }
      router.push('/dashboard');
    } catch (error: any) {
      console.error(error);
      toast({
        title: 'Authentication Error',
        description: error.message,
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Sign In</CardTitle>
      </CardHeader>
      <CardContent className="grid gap-4">
        <Button
          variant="outline"
          onClick={() => handleSignIn('google')}
          disabled={!!isLoading}
        >
          {isLoading === 'google' ? (
            <Loader2 className="mr-2 animate-spin" />
          ) : (
            <GoogleIcon />
          )}
          Sign in with Google
        </Button>
        <Button
          variant="outline"
          onClick={() => handleSignIn('github')}
          disabled={!!isLoading}
        >
          {isLoading === 'github' ? (
            <Loader2 className="mr-2 animate-spin" />
          ) : (
            <GitHubIcon />
          )}
          Sign in with GitHub
        </Button>
      </CardContent>
    </Card>
  );
}
