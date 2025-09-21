import { Button } from '@/components/ui/button';
import { CodeHiveIcon } from '@/components/icons';
import Link from 'next/link';
import { ArrowRight, Code, Zap } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import Image from 'next/image';

export default function LandingPage() {
  return (
    <div className="dark bg-background text-foreground min-h-screen flex flex-col">
      <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-14 max-w-screen-2xl items-center">
          <Link href="/" className="flex items-center gap-2 mr-6">
            <CodeHiveIcon className="size-8 text-primary" />
            <span className="font-bold text-xl font-headline">CodeHive</span>
          </Link>
          <nav className="flex items-center gap-4 text-sm font-medium">
            <Link href="#" className="text-muted-foreground/80 hover:text-foreground transition-colors">
              Features
            </Link>
            <Link href="#" className="text-muted-foreground/80 hover:text-foreground transition-colors">
              Pricing
            </Link>
            <Link href="#" className="text-muted-foreground/80 hover:text-foreground transition-colors">
              Docs
            </Link>
          </nav>
          <div className="flex flex-1 items-center justify-end gap-4">
            <Button variant="ghost" asChild>
              <Link href="/dashboard">Login</Link>
            </Button>
            <Button asChild>
              <Link href="/dashboard">
                Get Started <ArrowRight className="ml-2" />
              </Link>
            </Button>
          </div>
        </div>
      </header>

      <main className="flex-1">
        <div className="container relative py-20 md:py-32">
          <div className="absolute top-0 left-0 -translate-x-1/4 -translate-y-1/4 w-[800px] h-[800px] rounded-full bg-primary/10 blur-3xl -z-10" />
          <div className="absolute bottom-0 right-0 translate-x-1/4 translate-y-1/4 w-[600px] h-[600px] rounded-full bg-accent/10 blur-3xl -z-10" />
          
          <div className="mx-auto max-w-4xl text-center">
            <Badge variant="outline" className="py-1 px-4 rounded-full text-primary border-primary/50 text-sm">
              <Zap className="mr-2 text-accent" />
              <span>Powered by AI, Built for Tomorrow</span>
            </Badge>
            <h1 className="font-headline font-bold text-5xl md:text-7xl mt-6 bg-clip-text text-transparent bg-gradient-to-b from-white to-neutral-300">
              Build, Learn, and Collaborate
            </h1>
            <p className="mt-6 text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto">
              CodeHive is your all-in-one platform to find tasks, contribute to projects, and turn your code into credits. Level up your skills with AI-powered tools and expert mentors.
            </p>
            <div className="mt-10 flex justify-center gap-4">
              <Button size="lg" asChild>
                <Link href="/dashboard">
                  Start Building Now
                  <ArrowRight className="ml-2" />
                </Link>
              </Button>
              <Button size="lg" variant="secondary" asChild>
                <Link href="#">
                  <Code className="mr-2" />
                  View the Code
                </Link>
              </Button>
            </div>
          </div>
          
          <div className="relative mt-24">
            <div className="absolute -top-4 -left-4 w-full h-full bg-gradient-to-br from-primary to-accent rounded-lg blur-xl opacity-20 -z-10 animate-[spin_20s_linear_infinite]"></div>
            <Image
              src="https://picsum.photos/seed/dashboard-dark/1200/800"
              alt="CodeHive Dashboard"
              width={1200}
              height={800}
              data-ai-hint="dark dashboard UI"
              className="rounded-lg border-2 border-primary/20 shadow-2xl shadow-primary/20 mx-auto"
            />
          </div>
        </div>
      </main>
      
      <footer className="border-t border-border/40">
        <div className="container py-8 flex items-center justify-between">
            <p className="text-sm text-muted-foreground">&copy; {new Date().getFullYear()} CodeHive. All rights reserved.</p>
            <div className="flex gap-4">
                <Link href="#" className="text-sm text-muted-foreground hover:text-foreground">Terms of Service</Link>
                <Link href="#" className="text-sm text-muted-foreground hover:text-foreground">Privacy Policy</Link>
            </div>
        </div>
      </footer>
    </div>
  );
}
