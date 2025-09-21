import { Button } from '@/components/ui/button';
import { CodeHiveIcon } from '@/components/icons';
import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
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
    <div className="dark bg-background text-foreground min-h-screen flex flex-col overflow-x-hidden">
      <div className="absolute inset-0 -z-10 h-full w-full bg-background bg-[linear-gradient(to_right,#8080800a_1px,transparent_1px),linear-gradient(to_bottom,#8080800a_1px,transparent_1px)] bg-[size:14px_24px]"></div>
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
            <Button asChild variant="outline" className="text-primary border-primary/50 hover:bg-primary/10 hover:text-primary">
              <Link href="/dashboard">
                Go to Dashboard <ArrowRight className="ml-2" />
              </Link>
            </Button>
          </div>
        </div>
      </header>

      <main className="flex-1 flex flex-col justify-center">
        <section className="py-24 md:py-32">
          <div className="container grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div className="flex flex-col items-start text-left">
              <h1 className="font-headline font-semibold text-6xl md:text-7xl lg:text-8xl text-white leading-tight">
                Live Better, <br/> Live Luxury
              </h1>
              <p className="mt-6 text-lg text-muted-foreground max-w-md">
                Achieve more with less. Our intelligent automation allows you to innovate, generate and evolve your business effectively, and step into the future of technology.
              </p>
              <Button size="lg" asChild variant="outline" className="mt-10 border-white/50 hover:bg-white/10 text-white">
                <Link href="#">
                  Get In Touch
                </Link>
              </Button>
            </div>
             <div className="flex items-center justify-center">
               <Image
                src="https://images.unsplash.com/photo-1617051111244-16a2b2b9f874?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3NDE5ODJ8MHwxfHNlYXJjaHwzfHxsdXh1cnklMjBwcm9kdWN0fGVufDB8fHx8MTc1ODU4ODMxNnww&ixlib=rb-4.1.0&q=80&w=1080"
                alt="Luxury Product"
                width={800}
                height={600}
                className="rounded-xl shadow-2xl shadow-black/50"
                data-ai-hint="luxury product dark"
              />
            </div>
          </div>
        </section>

        <section className="py-12">
          <div className="container text-center">
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
  );
}
