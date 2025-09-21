import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { ArrowUpRight, CheckCircle, Clock, Star } from "lucide-react"
import { DashboardCharts } from "@/components/dashboard-charts"
import Link from "next/link"

export default function DashboardPage() {
  return (
    <div className="flex flex-col gap-8">
      <div>
        <h1 className="font-headline text-3xl md:text-4xl font-semibold bg-clip-text text-transparent bg-gradient-to-b from-white to-neutral-400">Welcome to CodeHive</h1>
        <p className="text-muted-foreground mt-2">Your hub for building, learning, and collaborating.</p>
      </div>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium font-headline">Credits</CardTitle>
            <span className="text-primary">
              <Star className="h-4 w-4" />
            </span>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">1,250</div>
            <p className="text-xs text-muted-foreground">+150 from last week</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium font-headline">Reputation</CardTitle>
             <span className="text-accent">
              <CheckCircle className="h-4 w-4" />
            </span>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">4.8 / 5.0</div>
            <p className="text-xs text-muted-foreground">Top 10% of contributors</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium font-headline">Tasks Completed</CardTitle>
            <span className="text-primary">
              <Clock className="h-4 w-4" />
            </span>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">28</div>
            <p className="text-xs text-muted-foreground">+5 this month</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium font-headline">Active Projects</CardTitle>
            <span className="text-accent">
              <ArrowUpRight className="h-4 w-4" />
            </span>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">3</div>
            <p className="text-xs text-muted-foreground">1 pending review</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-7">
        <div className="lg:col-span-4">
            <DashboardCharts />
        </div>
        <div className="lg:col-span-3 flex flex-col gap-6">
           <Card className="flex-grow flex flex-col">
            <CardHeader>
              <CardTitle className="font-headline">Quick Actions</CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col gap-4 flex-grow justify-center">
              <Button asChild size="lg" className="w-full bg-white text-black hover:bg-neutral-200">
                <Link href="/builder">
                  Start Building with AI
                  <ArrowUpRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
              <Button asChild variant="secondary" size="lg" className="w-full">
                <Link href="/marketplace">
                  Browse Marketplace Tasks
                  <ArrowUpRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
