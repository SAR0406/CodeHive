import { Button } from '@/components/ui/button';
import { CodeHiveIcon } from '@/components/icons';
import Link from 'next/link';
import { ArrowRight, Code, Zap } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import Image from 'next/image';

export default function LandingPage() {
  return (
    <div className="dark bg-background text-foreground min-h-screen flex flex-col sparkle-bg">
      <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-16 max-w-screen-2xl items-center">
          <Link href="/" className="flex items-center gap-2 mr-6">
            <CodeHiveIcon className="size-8 text-foreground" />
            <span className="font-bold text-xl font-headline">CodeHive</span>
          </Link>
          <nav className="hidden md:flex items-center gap-6 text-sm font-medium">
            <Link href="#" className="text-muted-foreground hover:text-foreground transition-colors">
              Features
            </Link>
            <Link href="#" className="text-muted-foreground hover:text-foreground transition-colors">
              Marketplace
            </Link>
             <Link href="#" className="text-muted-foreground hover:text-foreground transition-colors">
              Learn
            </Link>
            <Link href="#" className="text-muted-foreground hover:text-foreground transition-colors">
              Docs
            </Link>
          </nav>
          <div className="flex flex-1 items-center justify-end gap-2">
            <Button variant="ghost" asChild>
              <Link href="/dashboard">Login</Link>
            </Button>
            <Button asChild variant="default" size="lg" className="shadow-lg shadow-primary/20 hover:shadow-primary/30 transition-shadow">
              <Link href="/dashboard">
                Discover the platform
              </Link>
            </Button>
          </div>
        </div>
      </header>

      <main className="flex-1">
        <div className="container relative pt-24 pb-40 md:pt-32">
           <div className="absolute top-0 left-0 -translate-x-1/2 -translate-y-1/2 w-[1000px] h-[1000px] rounded-full bg-accent/5 blur-3xl -z-10" />
           <div className="absolute bottom-0 right-0 translate-x-1/3 translate-y-1/2 w-[800px] h-[800px] rounded-full bg-primary/5 blur-3xl -z-10" />

          <div className="mx-auto max-w-4xl text-center">
             <div className="flex justify-center items-center gap-2 mb-4 text-sm text-muted-foreground">
              <div className="flex -space-x-2 overflow-hidden">
                <Image className="inline-block h-6 w-6 rounded-full ring-2 ring-background" src="https://picsum.photos/seed/p1/40/40" alt="User 1" width={40} height={40}/>
                <Image className="inline-block h-6 w-6 rounded-full ring-2 ring-background" src="https://picsum.photos/seed/p2/40/40" alt="User 2" width={40} height={40}/>
                <Image className="inline-block h-6 w-6 rounded-full ring-2 ring-background" src="https://picsum.photos/seed/p3/40/40" alt="User 3" width={40} height={40}/>
              </div>
              <span>Trusted by 10,000+ builders</span>
            </div>
            <h1 className="font-headline font-bold text-5xl md:text-7xl mt-6 bg-clip-text text-transparent bg-gradient-to-b from-white to-neutral-400 leading-tight">
              Build, Collaborate, and Monetize Your Code
            </h1>
            <p className="mt-6 text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto">
              An open source platform that uses AI to automate various aspects of software creation, skill acquisition, and project collaboration.
            </p>
            <div className="mt-10 flex justify-center gap-4">
              <Button size="lg" asChild>
                <Link href="/dashboard">
                  Get Started for Free
                  <ArrowRight className="ml-2" />
                </Link>
              </Button>
            </div>
          </div>
          
          <div className="relative mt-24">
             <div className="absolute inset-0 w-full h-full bg-gradient-to-br from-primary/10 via-transparent to-accent/10 rounded-xl blur-2xl -z-10" />
            <div
              className="rounded-xl border-2 border-border/80 bg-background/50 shadow-2xl shadow-black/40 backdrop-blur-md"
            >
              <div className="p-2">
                <Image
                  src="https://picsum.photos/seed/dashboard-dark/1200/800"
                  alt="CodeHive Dashboard"
                  width={1200}
                  height={800}
                  data-ai-hint="dark dashboard UI"
                  className="rounded-lg border border-border"
                />
              </div>
            </div>
          </div>
        </div>
      </main>
      
      <footer className="border-t border-border/40 bg-background/50">
        <div className="container py-8 flex items-center justify-between">
            <p className="text-sm text-muted-foreground">&copy; {new Date().getFullYear()} CodeHive. All rights reserved.</p>
            <div className="flex gap-4">
                <Link href="#" className="text-sm text-muted-foreground hover:text-foreground">Terms</Link>
                <Link href="#" className="text-sm text-muted-foreground hover:text-foreground">Privacy Policy</Link>
            </div>
        </div>
      </footer>
    </div>
  );
}
