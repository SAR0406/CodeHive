
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

const GoogleIcon = () => <svg role="img" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" className="size-5"><title>Google</title><path d="M12.48 10.92v3.28h7.84c-.24 1.84-.85 3.18-1.78 4.1-1.29 1.3-3.37 2.67-7.05 2.67-5.45 0-9.9-4.45-9.9-9.9s4.45-9.9 9.9-9.9c3.1 0 5.14 1.25 6.32 2.39l2.44-2.44C19.4 2.82 16.2.9 12.48.9c-6.63 0-12 5.37-12 12s5.37 12 12 12c6.94 0 11.7-4.93 11.7-11.97v-.99H12.48z" fill="currentColor"/></svg>;

export default function LoginForm() {
  const { auth } = useFirebase();
  const router = useRouter();
  const { toast } = useToast();
  const [loading, setLoading] = useState<null | 'google' | 'github'>(null);

  const handleSignIn = async (provider: FirebaseAuthProvider) => {
    if (!auth) {
        toast({ title: 'Auth service not available', description: 'Firebase Auth is not configured properly.', variant: 'destructive'});
        return;
    };

    const providerId = provider.providerId as 'google.com' | 'github.com';
    setLoading(providerId === 'google.com' ? 'google' : 'github');

    try {
        await signInWithPopup(auth, provider);
        toast({ title: 'Signed in successfully!', description: 'Redirecting you to the dashboard.'});
        router.push('/dashboard');
    } catch (error) {
        const authError = error as AuthError;
        if (authError.code === 'auth/account-exists-with-different-credential') {
            const email = authError.customData?.email as string;
            if (!email) {
                toast({ title: 'Error', description: 'Could not retrieve email for linking.', variant: 'destructive'});
                setLoading(null);
                return;
            }

            const methods = await fetchSignInMethodsForEmail(auth, email);
            const method = methods[0];
            const newProvider = method === 'google.com' ? new GoogleAuthProvider() : new GithubAuthProvider();

            toast({ title: 'Account exists', description: `You have an account with ${method}. Please sign in with that to link accounts.`});
            
            try {
                const result = await signInWithPopup(auth, newProvider);
                if (authError.credential) {
                    await linkWithCredential(result.user, authError.credential);
                    toast({ title: 'Accounts linked!', description: 'Your accounts have been successfully linked.'});
                    router.push('/dashboard');
                }
            } catch (linkError) {
                toast({ title: 'Linking Error', description: (linkError as AuthError).message, variant: 'destructive'});
            }

        } else {
            toast({ title: 'Sign-in Error', description: authError.message, variant: 'destructive' });
        }
    } finally {
        setLoading(null);
    }
  };
  
  return (
      <Card className="w-full max-w-sm glass-container">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl">Welcome to CodeHive</CardTitle>
          <CardDescription>Sign in to continue to the platform</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col gap-4">
              <Button variant="outline" className="w-full" onClick={() => handleSignIn(new GoogleAuthProvider())} disabled={!!loading}>
                {loading === 'google' ? <Loader2 className="animate-spin" /> : <GoogleIcon />}
                {loading === 'google' ? 'Signing in...' : 'Sign in with Google'}
              </Button>
               <Button variant="outline" className="w-full" onClick={() => handleSignIn(new GithubAuthProvider())} disabled={!!loading}>
                 {loading === 'github' ? <Loader2 className="animate-spin" /> : <Github />}
                 {loading === 'github' ? 'Signing in...' : 'Sign in with GitHub'}
              </Button>
          </div>
        </CardContent>
      </Card>
  );
}
