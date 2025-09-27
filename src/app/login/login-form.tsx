
'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { Chrome, Github, Loader2 } from 'lucide-react';
import { 
  GoogleAuthProvider, 
  GithubAuthProvider, 
  signInWithPopup, 
  fetchSignInMethodsForEmail,
  linkWithCredential,
  type AuthProvider as FirebaseAuthProvider,
  type AuthError
} from 'firebase/auth';
import { useFirebase } from '@/lib/firebase/client-provider';

const GoogleIcon = () => <Chrome className="size-4" />;
const GitHubIcon = () => <Github className="size-4" />;

// Store credential across re-renders if linking is needed
let pendingCredential: any = null;

export default function LoginForm() {
  const { auth } = useFirebase();
  const router = useRouter();
  const [isLoading, setIsLoading] = useState<false | 'google' | 'github'>(false);
  const { toast } = useToast();

  const getProviderName = (providerId: string) => {
    switch (providerId) {
      case 'google.com':
        return 'Google';
      case 'github.com':
        return 'GitHub';
      default:
        return providerId;
    }
  };

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
    const provider: FirebaseAuthProvider = providerName === 'google' ? new GoogleAuthProvider() : new GithubAuthProvider();
    
    try {
      const result = await signInWithPopup(auth, provider);

      // If there was a pending credential, link it now.
      if (pendingCredential && result.user) {
        await linkWithCredential(result.user, pendingCredential);
        pendingCredential = null; // Clear it after linking
        toast({
          title: 'Account Linked!',
          description: 'Your accounts have been successfully linked.',
        });
      } else {
        toast({
          title: 'Login Successful!',
          description: `Welcome back, ${result.user.displayName || 'user'}!`,
        });
      }

      router.push('/dashboard');

    } catch (error: any) {
       const authError = error as AuthError;

       if (authError.code === 'auth/account-exists-with-different-credential') {
          // This is the specific error we need to handle.
          // Get the pending credential from the error.
          pendingCredential = authError.customData?._tokenResponse?.pendingCredential;
          const email = authError.customData.email as string;

          // Find out which provider the user originally signed up with.
          const methods = await fetchSignInMethodsForEmail(auth, email);
          
          if (methods.length > 0) {
            const existingProvider = getProviderName(methods[0]);
            const newProvider = getProviderName(provider.providerId);
            
            // Inform the user.
            toast({
              title: 'Account Exists',
              description: `You've already signed up with ${existingProvider}. Please sign in with ${existingProvider} to link your ${newProvider} account.`,
              variant: 'destructive',
              duration: 7000,
            });
          }
       } else if (authError.code === 'auth/popup-closed-by-user') {
         toast({
           title: 'Sign-in Cancelled',
           description: 'You closed the sign-in window before completing the process.',
           variant: 'destructive',
         });
       } else {
         console.error('Authentication Error:', authError);
         toast({
           title: 'Authentication Error',
           description: authError.message || 'An unknown error occurred.',
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
