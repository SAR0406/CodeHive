'use client';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { Chrome, Github, Loader2 } from 'lucide-react';
import { getAuth, GoogleAuthProvider, GithubAuthProvider, signInWithRedirect } from 'firebase/auth';
import { useFirebase } from '@/lib/firebase/client-provider';


const GoogleIcon = () => <Chrome className="size-4" />;
const GitHubIcon = () => <Github className="size-4" />;

export default function LoginForm() {
  const { app } = useFirebase();
  const [isLoading, setIsLoading] = useState<false | 'google' | 'github'>(false);
  const { toast } = useToast();

  const handleSignIn = async (providerName: 'google' | 'github') => {
    if (!app) return;
    setIsLoading(providerName);
    const auth = getAuth(app);
    const provider = providerName === 'google' ? new GoogleAuthProvider() : new GithubAuthProvider();
    
    try {
      await signInWithRedirect(auth, provider);
    } catch (error: any) {
       toast({
        title: 'Authentication Error',
        description: error.message,
        variant: 'destructive',
      });
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
          size="lg"
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
