
'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { Chrome, Github, Loader2 } from 'lucide-react';
import { GoogleAuthProvider, GithubAuthProvider, signInWithPopup } from 'firebase/auth';
import { useFirebase } from '@/lib/firebase/client-provider';

const GoogleIcon = () => <Chrome className="size-4" />;
const GitHubIcon = () => <Github className="size-4" />;

export default function LoginForm() {
  const { auth } = useFirebase();
  const router = useRouter();
  const [isLoading, setIsLoading] = useState<false | 'google' | 'github'>(false);
  const { toast } = useToast();

  const handleSignIn = async (providerName: 'google' | 'github') => {
    if (!auth) {
      toast({
        title: 'Authentication Error',
        description: 'Firebase is not configured correctly. Please try again later.',
        variant: 'destructive',
      });
      return;
    }
    setIsLoading(providerName);
    const provider = providerName === 'google' ? new GoogleAuthProvider() : new GithubAuthProvider();
    
    try {
      const result = await signInWithPopup(auth, provider);
      // On successful sign-in, the onAuthStateChanged listener in useAuth
      // will handle the user state update. We can then redirect.
      toast({
        title: 'Login Successful!',
        description: `Welcome, ${result.user.displayName || 'user'}!`,
      });
      router.push('/dashboard');
    } catch (error: any) {
       // Handle specific errors, like user closing the popup
       if (error.code === 'auth/popup-closed-by-user') {
         toast({
           title: 'Sign-in Cancelled',
           description: 'You closed the sign-in window before completing the process.',
           variant: 'destructive',
         });
       } else {
         toast({
           title: 'Authentication Error',
           description: error.message || 'An unknown error occurred.',
           variant: 'destructive',
         });
       }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="bg-card/80 backdrop-blur-sm">
      <CardHeader>
        <CardTitle>Welcome to CodeHive</CardTitle>
        <CardDescription>Choose your preferred sign-in method to continue.</CardDescription>
      </CardHeader>
      <CardContent className="grid gap-4">
        <Button
          variant="outline"
          onClick={() => handleSignIn('google')}
          disabled={!!isLoading}
          size="lg"
        >
          {isLoading === 'google' ? (
            <>
              <Loader2 className="mr-2 animate-spin" />
              Signing in...
            </>
          ) : (
            <><GoogleIcon /><span className="ml-2">Sign in with Google</span></>
          )}
        </Button>
        <Button
          variant="outline"
          onClick={() => handleSignIn('github')}
          disabled={!!isLoading}
          size="lg"
        >
          {isLoading === 'github' ? (
            <>
              <Loader2 className="mr-2 animate-spin" />
              Signing in...
            </>
          ) : (
            <><GitHubIcon /><span className="ml-2">Sign in with GitHub</span></>
          )}
        </Button>
      </CardContent>
    </Card>
  );
}
