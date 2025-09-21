import { Button } from '@/components/ui/button';
import { CodeHiveIcon } from '@/components/icons';
import Link from 'next/link';
import { ArrowRight, Code, LayoutDashboard, Star } from 'lucide-react';
import Image from 'next/image';

const logos = [
  { name: 'QuantumLeap' },
  { name: 'NexusFlow' },
  { name: 'StellarForge' },
  { name: 'InnovateIO' },
  { name: 'SynthCore' },
];

export default function LandingPage() {
  return (
    <div className="dark bg-transparent text-foreground min-h-screen flex flex-col overflow-x-hidden">
      <div className="flex flex-col flex-1">
        <header className="sticky top-0 z-50 w-full bg-background/30 backdrop-blur-lg border-b border-white/10">
          <div className="container flex h-20 max-w-screen-2xl items-center justify-between">
            <Link href="/" className="flex items-center gap-2">
              <CodeHiveIcon className="size-8 text-primary" />
              <span className="font-bold text-xl font-headline text-white">CodeHive</span>
            </Link>
            <nav className="hidden md:flex items-center gap-6 text-sm font-medium">
              <Link href="#" className="text-muted-foreground hover:text-white transition-colors">
                Features
              </Link>
              <Link href="/marketplace" className="text-muted-foreground hover:text-white transition-colors">
                Marketplace
              </Link>
              <Link href="/learn" className="text-muted-foreground hover:text-white transition-colors">
                Learn
              </Link>
              <Link href="#" className="text-muted-foreground hover:text-white transition-colors">
                Pricing
              </Link>
            </nav>
            <div className="hidden md:flex flex-1 items-center justify-end gap-4">
              <Button asChild variant="ghost" className="text-white">
                <Link href="/dashboard">
                  Log In
                </Link>
              </Button>
               <Button asChild className="bg-primary text-primary-foreground hover:bg-primary/90 shadow-[0_0_20px_hsl(var(--primary)/0.4)]">
                <Link href="/dashboard">
                  Start Building <ArrowRight className="ml-2" />
                </Link>
              </Button>
            </div>
          </div>
        </header>

        <main className="flex-1 flex flex-col">
          <section className="relative py-24 md:py-32 lg:py-40 text-center">
            <div className="absolute inset-0 -z-10 overflow-hidden">
                <div className="absolute inset-0 bg-grid-white/5 [mask-image:radial-gradient(ellipse_100%_50%_at_50%_50%,#000_20%,transparent_70%)]" />
            </div>

            <div className="container relative flex flex-col items-center">
                <h1 className="font-headline font-bold text-5xl md:text-7xl bg-clip-text text-transparent bg-gradient-to-b from-white to-neutral-300 leading-tight max-w-4xl">
                Build & Collaborate with AI
                </h1>
                <p className="mt-6 text-lg md:text-xl text-muted-foreground max-w-2xl">
                An open-source platform for software creation, learning, and collaboration, supercharged by generative AI.
                </p>
                <div className="mt-10 flex flex-wrap justify-center gap-4">
                <Button size="lg" asChild className="bg-primary text-primary-foreground hover:bg-primary/90 shadow-[0_0_20px_hsl(var(--primary)/0.4)] transition-all duration-300 hover:shadow-[0_0_30px_hsl(var(--primary)/0.6)]">
                    <Link href="/dashboard">
                    <LayoutDashboard className="mr-2" />
                    Explore Demo
                    </Link>
                </Button>
                <Button size="lg" asChild variant="outline" className="bg-white/5 border-white/20 hover:bg-white/10 text-white">
                    <Link href="#">
                    <Code className="mr-2" />
                    View on GitHub
                    </Link>
                </Button>
                </div>
            </div>
          </section>

          <section className="py-12">
            <div className="container text-center">
              <p className="text-sm text-muted-foreground uppercase tracking-widest">
                Trusted by the world's most innovative teams
              </p>
              <div className="mt-8 flex justify-center items-center flex-wrap gap-x-12 gap-y-4">
                {logos.map(logo => (
                  <div key={logo.name} className="flex items-center gap-2 text-muted-foreground font-semibold text-lg grayscale opacity-60 hover:opacity-100 hover:grayscale-0 transition-all">
                    {logo.name}
                  </div>
                ))}
              </div>
            </div>
          </section>
        </main>
        
        <footer className="py-12 border-t border-white/10">
            <div className="container text-center text-muted-foreground">
                <p>&copy; {new Date().getFullYear()} CodeHive. All rights reserved.</p>
            </div>
        </footer>
      </div>
    </div>
  );
}
