import { Button } from '@/components/ui/button';
import { CodeHiveIcon } from '@/components/icons';
import Link from 'next/link';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Check } from 'lucide-react';

export default function LandingPage() {
  return (
    <div className="dark bg-background text-foreground min-h-screen flex flex-col overflow-x-hidden">
      <div className="app-container absolute inset-0 z-0"/>
      <header className="sticky top-0 z-50 w-full">
        <div className="container flex h-20 max-w-screen-xl items-center justify-between mx-auto">
          <Link href="/" className="flex items-center gap-2">
            <CodeHiveIcon className="size-7 text-white" />
            <span className="font-bold text-lg font-headline text-white">CodeHive</span>
          </Link>
          <nav className="hidden md:flex items-center gap-8 text-sm font-medium">
            <Link href="#" className="text-muted-foreground hover:text-white transition-colors">
              Resources
            </Link>
            <Link href="#" className="text-muted-foreground hover:text-white transition-colors">
              Blog
            </Link>
             <Link href="#" className="text-muted-foreground hover:text-white transition-colors">
              Pricing
            </Link>
            <Link href="#" className="text-muted-foreground hover:text-white transition-colors">
              Docs
            </Link>
          </nav>
          <div className="hidden md:flex items-center justify-end gap-4">
            <Button asChild variant="ghost" className="text-muted-foreground hover:text-white">
              <Link href="#">
                Book a call
              </Link>
            </Button>
            <Button asChild className="bg-primary text-primary-foreground hover:bg-neutral-200">
              <Link href="/dashboard">
                Discover the platform
              </Link>
            </Button>
          </div>
        </div>
      </header>

      <main className="flex-1 flex flex-col justify-center items-center z-10 px-4">
        <section className="py-24 md:py-32 w-full">
          <div className="container flex flex-col items-center gap-8 text-center max-w-4xl mx-auto">
            <div className="flex items-center">
              <div className="flex -space-x-2 mr-2">
                <Avatar className="h-6 w-6 border-2 border-background">
                  <AvatarImage src="https://picsum.photos/seed/p1/32/32" alt="User 1" />
                  <AvatarFallback>U1</AvatarFallback>
                </Avatar>
                <Avatar className="h-6 w-6 border-2 border-background">
                  <AvatarImage src="https://picsum.photos/seed/p2/32/32" alt="User 2" />
                  <AvatarFallback>U2</AvatarFallback>
                </Avatar>
                <Avatar className="h-6 w-6 border-2 border-background">
                  <AvatarImage src="https://picsum.photos/seed/p3/32/32" alt="User 3" />
                  <AvatarFallback>U3</AvatarFallback>
                </Avatar>
              </div>
              <p className="text-sm text-muted-foreground">Trusted by 35,000+ people</p>
            </div>

            <h1 className="font-headline font-extrabold text-5xl md:text-6xl lg:text-7xl text-white tracking-tighter">
              Managing your <br /> content with AI
            </h1>
            <p className="mt-4 text-lg text-muted-foreground max-w-2xl">
              An open source content management system that uses AI to automate
              various aspects of content creation, optimization, and distribution.
            </p>
            <div className="flex items-center gap-4 mt-6">
              <Button size="lg" asChild className="bg-primary text-primary-foreground hover:bg-neutral-200">
                <Link href="/dashboard">
                  Get started for free
                </Link>
              </Button>
            </div>
          </div>
        </section>

        <div className="w-full max-w-4xl px-4 relative -mt-16">
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-4xl h-32 bg-background blur-2xl opacity-50" />
            <Card className="relative bg-card/60 backdrop-blur-xl border-white/10 shadow-2xl shadow-black/50">
              <CardContent className="p-4 flex items-center justify-between gap-4">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <div className="h-2 w-2 rounded-full bg-green-400 animate-pulse"/>
                    Create Content
                </div>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                     <div className="h-2 w-2 rounded-full bg-orange-400 animate-pulse"/>
                    Content Optimization
                </div>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                     <div className="h-2 w-2 rounded-full bg-blue-400 animate-pulse"/>
                    Distribute
                </div>
              </CardContent>
            </Card>
        </div>
      </main>
    </div>
  );
}
