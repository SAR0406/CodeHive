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

const GoogleIcon = () =>  Signing in...
                   Sign in with Google
                
 Sign in with GitHub
              
            
          
        
      
    
  );
}
