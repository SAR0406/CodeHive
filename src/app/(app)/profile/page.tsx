'use client';

import { useAuth } from '@/hooks/use-auth';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { User, Mail, Save, Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useFirebase } from '@/lib/firebase/client-provider';
import React, { useState } from 'react';
import { updateUserProfile } from '@/lib/firebase/credits';

export default function ProfilePage() {
  const { user } = useAuth();
  const { app } = useFirebase();
  const { toast = useState(user?.displayName ?? '');

  const handleSave = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!app || !user) {
        toast({ title: "Not Authenticated", description: "You must be logged in to save your profile.", variant: "destructive"});
        return;
    }

    setIsLoading(true);

    try {
        // In a real app, you would handle photoURL uploads to Cloud Storage first,
        // then pass the URL to the function. For now, we only update the display name.
        const result = await updateUserProfile(app, { displayName });

        if (result.success) {
            toast({
              title: 'Profile Saved!',
              description: result.message,
            });
        } else {
            throw new Error(result.message);
        }
    } catch (error: any) {
        console.error("Error saving profile:", error);
        toast({
            title: 'Error Saving Profile',
            description: error.message || "An unexpected error occurred.",
            variant: "destructive"
        });
    } finally {
        setIsLoading(false);
    }
  };

  return (
    
      
        
          
          
        
        
          
            
              Personal Details
              Update your photo, name, and email address.
            
          
          
            
              
                 alt={user?.displayName ?? "User"} data-ai-hint="person portrait"/>
                {user?.displayName?.charAt(0) ?? 'U'}
              
              
                Profile Photo
                
                PNG, JPG, GIF up to 10MB.
              
            
            
              
                
                  Display Name
                  
                  
                   
                  
                
              
              
                
                  Email Address
                   
                  
                   
                
              
            
          
          
            
              
                
                  
                  Saving...
                
                 
                  Save Changes
                
              
            
          
        
      
    
  );
}
