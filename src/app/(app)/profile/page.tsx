
'use client';

import { useAuth } from '@/hooks/use-auth';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { User, Mail, Save, Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useFirebase } from '@/lib/firebase/client-provider';
import React, { useState, useEffect } from 'react';
import { updateUserProfile } from '@/lib/firebase/credits';

export default function ProfilePage() {
  const { user } = useAuth();
  const { app } = useFirebase();
  const { toast } = useToast();
  const [displayName, setDisplayName] = useState(user?.displayName ?? '');
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (user?.displayName) {
      setDisplayName(user.displayName);
    }
  }, [user]);


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
    <div className="flex flex-col gap-8">
      <div>
        <h1 className="font-headline text-3xl md:text-4xl font-semibold flex items-center gap-3">
          <User className="size-8 text-accent" />
          <span>My Profile</span>
        </h1>
        <p className="text-muted-foreground mt-2">View and edit your personal information.</p>
      </div>

      <form onSubmit={handleSave}>
        <Card>
          <CardHeader>
            <CardTitle>Personal Details</CardTitle>
            <CardDescription>Update your photo, name, and email address.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex items-center gap-4">
              <Avatar className="h-20 w-20">
                <AvatarImage src={user?.photoURL ?? undefined} alt={user?.displayName ?? "User"} data-ai-hint="person portrait"/>
                <AvatarFallback>{user?.displayName?.charAt(0) ?? 'U'}</AvatarFallback>
              </Avatar>
              <div>
                <Label htmlFor="photo">Profile Photo</Label>
                <Input id="photo" type="file" disabled className="mt-1" />
                <p className="text-xs text-muted-foreground mt-1">PNG, JPG, GIF up to 10MB.</p>
              </div>
            </div>
            <div className="space-y-2">
                <Label htmlFor="displayName">Display Name</Label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                  <Input id="displayName" value={displayName} onChange={(e) => setDisplayName(e.target.value)} className="pl-10" />
                </div>
            </div>
            <div className="space-y-2">
                <Label htmlFor="email">Email Address</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                  <Input id="email" type="email" value={user?.email ?? ''} disabled className="pl-10" />
                </div>
            </div>
          </CardContent>
          <CardFooter className="border-t pt-6">
            <Button type="submit" disabled={isLoading}>
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <Save className="mr-2" />
                  Save Changes
                </>
              )}
            </Button>
          </CardFooter>
        </Card>
      </form>
    </div>
  );
}
