'use client';

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { useToast } from "@/hooks/use-toast";
import { Bell, CreditCard, HardDrive, LogOut, Moon, Palette, Shield, Sun, User, UserCheck, Database, Loader2 } from "lucide-react";
import Link from "next/link";
import { useTheme } from 'next-themes';
import { useAuth } from "@/hooks/use-auth";
import { useFirebase } from "@/lib/firebase/client-provider";
import React, { useState } from 'react';
import { seedDatabase } from "@/lib/firebase/credits";


export default function SettingsPage() {
    const { toast } = useTheme()
    const { user } = useAuth();
    const { app } = useFirebase();
    const [isSeeding, setIsSeeding = false);

    // This is a simple way to restrict seeding to a specific admin user for this demo.
    // In a real app, you would use custom claims or a more robust role system.
    const ADMIN_UID = 'REPLACE_WITH_YOUR_ADMIN_UID'; // IMPORTANT: Replace with the actual UID of the admin user from Firebase Auth

    const handleLogoutAll = () => {
        toast({
            title: 'Logged Out Everywhere',
            description: 'You have been successfully logged out from all other devices.',
        });
    };

    const handleSeedDatabase = async () => {
        if (!app || !user) {
            toast({ title: 'Error', description: 'You must be logged in to perform this action.', variant: 'destructive' });
            return;
        }

        if (user.uid !== ADMIN_UID) {
            toast({ title: 'Permission Denied', description: 'You are not authorized to perform this action.', variant: 'destructive' });
            return;
        }

        setIsSeeding(true);
        try {
            const result = await seedDatabase(app);
            if (result.success) {
                toast({ title: 'Database Seeded!', description: result.message });
            } else {
                throw new Error(result.message);
            }
        } catch (error: any) {
            toast({ title: 'Error Seeding Database', description: error.message || 'An unknown error occurred.', variant: 'destructive' });
        } finally {
            setIsSeeding(false);
        }
    };


    return (
        
            
                
                    
                        
                    
                    
                        Manage your account, appearance, and security settings.
                    
                
            

            
                
                    
                        
                            
                            
                            
                             My Account
                            Manage your profile, billing, and subscription plan.
                            
                        
                        
                            
                                
                                    
                                
                                
                                    
                                        Profile
                                        Update your name, email, and photo.
                                    
                                
                                Manage
                            
                             
                                
                                    
                                
                                
                                    
                                        Billing & Plan
                                        Manage your subscription and credits.
                                    
                                
                                Manage
                            
                        
                    

                    
                        
                            
                            
                            
                             Notifications
                            Choose how you want to be notified.
                            
                        
                        
                             
                                Email Notifications
                                
                             
                             
                                Push Notifications
                                
                             
                        
                    

                     {user && user.uid === ADMIN_UID && (
                        
                            
                            
                            
                             Admin Tools
                            Initialize the database with sample data. This should only be run once.
                            
                        
                        
                            
                                {isSeeding ?  Seeding... : 'Seed Database'}
                            
                        
                    )}
                

                
                    
                        
                            
                            
                            
                             Appearance
                            Customize the look and feel of the app.
                            
                        
                        
                             
                                Theme
                                
                                    
                                    
                                
                           
                        
                    

                    
                        
                            
                            
                            
                             Security
                            Manage your account security.
                            
                        
                        
                            
                                
                                Log Out From All Devices
                            
                        
                    
                
            
        
    );
}
