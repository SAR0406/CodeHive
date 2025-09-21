import { Button } from '@/components/ui/button';
import { CodeHiveIcon } from '@/components/icons';
import Link from 'next/link';
import { Github } from 'lucide-react';

export default function LandingPage() {
  return (
    <div className="dark bg-background text-foreground min-h-screen flex flex-col overflow-x-hidden">
      <div className="animated-gradient-bg" />
      <div className="sparkle-bg" />

      <header className="sticky top-0 z-50 w-full bg-transparent">
        <div className="container flex h-20 max-w-screen-2xl items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <CodeHiveIcon className="size-8 text-primary" />
            <span className="font-bold text-xl font-headline text-white">CodeHive</span>
          </Link>
          <nav className="hidden md:flex items-center gap-6 text-sm font-medium">
            <Link href="#" className="text-muted-foreground hover:text-white transition-colors">
              Docs
            </Link>
            <Link href="/marketplace" className="text-muted-foreground hover:text-white transition-colors">
              Marketplace
            </Link>
            <Link href="/learn" className="text-muted-foreground hover:text-white transition-colors">
              Learn
            </Link>
             <Link href="/builder" className="text-muted-foreground hover:text-white transition-colors">
              AI
            </Link>
            <Link href="#" className="text-muted-foreground hover:text-white transition-colors">
              Pricing
            </Link>
          </nav>
          <div className="hidden md:flex flex-1 items-center justify-end gap-4">
             <Button asChild variant="outline" className="text-white border-white/30 hover:bg-white/10 hover:text-white">
              <Link href="#">
                <Github className="mr-2"/>
                Star us
              </Link>
            </Button>
            <Button asChild className="bg-primary text-primary-foreground hover:bg-primary/90">
              <Link href="/dashboard">
                Sign Up
              </Link>
            </Button>
          </div>
        </div>
      </header>

      <main className="flex-1 flex flex-col justify-center items-center text-center">
        <section className="py-24 md:py-32">
          <div className="container flex flex-col items-center">
             <h1 className="font-headline font-semibold text-6xl md:text-7xl lg:text-8xl text-white leading-tight">
                Powering next gen
                <br/>
                AI apps with CodeHive
              </h1>
              <p className="mt-6 text-lg text-muted-foreground max-w-2xl">
                Build and scale transformative LLM applications with vector
                indexes and similarity search. Achieve more with less. Our intelligent automation allows you to innovate, generate and evolve your business effectively.
              </p>
              <Button size="lg" asChild className="mt-10 bg-primary text-primary-foreground hover:bg-primary/90 shadow-lg shadow-primary/20">
                <Link href="/dashboard">
                  Get Started
                </Link>
              </Button>
          </div>
        </section>
      </main>

      <footer className="py-12 border-t border-white/10">
        <div className="container text-center text-muted-foreground">
          <p>&copy; {new Date().getFullYear()} CodeHive. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}