
'use client';

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { ArrowUpRight, CheckCircle, Clock, Star, DollarSign, Activity, Users, ShoppingBag, Briefcase, GraduationCap, Check, Rocket } from "lucide-react"
import { DashboardCharts } from "@/components/dashboard-charts"
import Link from "next/link"

interface DashboardStats {
  creditsSpent: number;
  tasksInProgress: number;
  projectsCompleted: number;
  communityMentors: number;
}

export default function DashboardPage() {
  const [stats, setStats] = useState<DashboardStats | null>(null);

  useEffect(() => {
    // Generate dynamic data on the client side to avoid hydration errors
    setStats({
      creditsSpent: Math.floor(Math.random() * 5000) + 1000,
      tasksInProgress: Math.floor(Math.random() * 10) + 1,
      projectsCompleted: Math.floor(Math.random() * 50) + 5,
      communityMentors: Math.floor(Math.random() * 200) + 50,
    });
  }, []);

  return (
    <div className="flex flex-col gap-8">
      <div>
        <h1 className="font-headline text-3xl md:text-4xl font-semibold">Dashboard</h1>
        <p className="text-muted-foreground mt-2">Welcome back! Here's a summary of your account.</p>
      </div>
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Credits Spent</CardTitle>
            <Star className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats ? `${stats.creditsSpent.toLocaleString()}` : '...'}</div>
            <p className="text-xs text-muted-foreground">+15% from last month</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Tasks in Progress</CardTitle>
            <Briefcase className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats ? stats.tasksInProgress : '...'}</div>
            <p className="text-xs text-muted-foreground">Currently active tasks</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Completed Projects</CardTitle>
            <Rocket className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats ? stats.projectsCompleted : '...'}</div>
            <p className="text-xs text-muted-foreground">Across all your activities</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Community Mentors</CardTitle>
            <GraduationCap className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats ? `+${stats.communityMentors}` : '...'}</div>
            <p className="text-xs text-muted-foreground">Available to help you</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-7">
        <Card className="lg:col-span-4">
            <CardHeader>
                <CardTitle>Overview</CardTitle>
            </CardHeader>
            <CardContent className="pl-2">
                 <DashboardCharts />
            </CardContent>
        </Card>
        <Card className="lg:col-span-3 flex flex-col">
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
              <CardDescription>Start a new project or find tasks.</CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col gap-4 flex-grow justify-center">
              <Button asChild size="lg" className="w-full">
                <Link href="/builder">
                  Start Building with AI
                  <ArrowUpRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
              <Button asChild variant="secondary" size="lg" className="w-full">
                <Link href="/marketplace">
                  Browse Marketplace
                  <ArrowUpRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
            </CardContent>
          </Card>
      </div>
    </div>
  )
}
