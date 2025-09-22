
'use client';

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { useToast } from "@/hooks/use-toast";
import { Bell, CreditCard, HardDrive, LogOut, Moon, Palette, Shield, Sun, User, UserCheck } from "lucide-react";
import Link from "next/link";
import { useTheme } from 'next-themes'


export default function SettingsPage() {
    const { toast } = useToast();
    const { theme, setTheme } = useTheme()

    const handleLogoutAll = () => {
        toast({
            title: 'Logged Out Everywhere',
            description: 'You have been successfully logged out from all other devices.',
        });
    };

    return (
        <div className="flex flex-col gap-8">
            <div>
                <h1 className="font-headline text-3xl md:text-4xl font-semibold flex items-center gap-3">
                    <HardDrive className="size-8 text-accent" />
                    <span>Settings</span>
                </h1>
                <p className="text-muted-foreground mt-2">Manage your account, appearance, and security settings.</p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2 flex flex-col gap-8">
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2"><UserCheck className="text-accent" /> My Account</CardTitle>
                            <CardDescription>Manage your profile, billing, and subscription plan.</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <Link href="/profile" className="flex items-center justify-between p-4 rounded-lg border hover:bg-muted/30 transition-colors">
                                <div className="flex items-center gap-4">
                                    <div className="p-3 bg-muted rounded-lg"><User className="text-foreground" /></div>
                                    <div>
                                        <h3 className="font-semibold">Profile</h3>
                                        <p className="text-sm text-muted-foreground">Update your name, email, and photo.</p>
                                    </div>
                                </div>
                                <Button variant="outline" size="sm">Manage</Button>
                            </Link>
                             <Link href="/billing" className="flex items-center justify-between p-4 rounded-lg border hover:bg-muted/30 transition-colors">
                                <div className="flex items-center gap-4">
                                    <div className="p-3 bg-muted rounded-lg"><CreditCard className="text-foreground" /></div>
                                    <div>
                                        <h3 className="font-semibold">Billing & Plan</h3>
                                        <p className="text-sm text-muted-foreground">Manage your subscription and credits.</p>
                                    </div>
                                </div>
                                <Button variant="outline" size="sm">Manage</Button>
                            </Link>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2"><Bell className="text-accent" /> Notifications</CardTitle>
                            <CardDescription>Choose how you want to be notified.</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                           <div className="flex items-center justify-between">
                                <Label htmlFor="email-notifications">Email Notifications</Label>
                                <Switch id="email-notifications" defaultChecked />
                           </div>
                           <div className="flex items-center justify-between">
                                <Label htmlFor="push-notifications">Push Notifications</Label>
                                <Switch id="push-notifications" />
                           </div>
                        </CardContent>
                    </Card>
                </div>
                <div className="flex flex-col gap-8">
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2"><Palette className="text-accent"/> Appearance</CardTitle>
                            <CardDescription>Customize the look and feel of the app.</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                             <div className="flex items-center justify-between">
                                <Label>Theme</Label>
                                <div className="flex items-center gap-2">
                                    <Button variant={theme === 'light' ? 'secondary' : 'ghost'} size="icon" onClick={() => setTheme('light')}>
                                        <Sun />
                                    </Button>
                                    <Button variant={theme === 'dark' ? 'secondary' : 'ghost'} size="icon" onClick={() => setTheme('dark')}>
                                        <Moon />
                                    </Button>
                                </div>
                           </div>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2"><Shield className="text-accent" /> Security</CardTitle>
                            <CardDescription>Manage your account security.</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <Button variant="destructive" className="w-full" onClick={handleLogoutAll}>
                                <LogOut className="mr-2" />
                                Log Out From All Devices
                            </Button>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
}
