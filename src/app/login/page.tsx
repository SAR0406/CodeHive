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
      
        
          
        
        Loading your session...
      
    );
  }

  return (
    
      
        
          
            
                 CodeHiveIcon className="size-10 text-white" />
                
            
            
              Build, learn, and collaborate with the power of AI.
            
        
      
        
          
            
                 CodeHiveIcon className="size-8 text-white" />
                
            
          
          
        
      
    
  );
}
