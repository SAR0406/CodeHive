
'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { Chrome, Github, Loader2 } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';

const GoogleIcon = () => <Chrome className="size-4" />;
const GitHubIcon = () => <Github className="size-4" />;

export default function LoginForm() {
  const [isLoading, setIsLoading] = useState<false | 'google' | 'github'>(false);
  const router = useRouter();
  const { toast } = useToast();
  const supabase = createClient();

  const getURL = () => {
    let url =
      process?.env?.NEXT_PUBLIC_SITE_URL ?? // Set this to your site URL in production
      process?.env?.NEXT_PUBLIC_VERCEL_URL ?? // Automatically set by Vercel.
      'http://localhost:9002/';
    // Make sure to include `https` in production
    url = url.includes('http') ? url : `https://${url}`;
    // Make sure to include a trailing `/`
    url = url.charAt(url.length - 1) === '/' ? url : `${url}/`;
    return url;
  };

  const handleSignIn = async (provider: 'google' | 'github') => {
    setIsLoading(provider);
    const { error } = await supabase.auth.signInWithOAuth({
      provider,
      options: {
        redirectTo: `${getURL()}auth/callback`,
      },
    });

    if (error) {
      toast({
        title: 'Authentication Error',
        description: error.message,
        variant: 'destructive',
      });
      setIsLoading(false);
    }
    // The user will be redirected, so no need to push router or stop loading indicator here
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
