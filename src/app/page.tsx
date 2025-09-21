import { Button } from '@/components/ui/button';
import { CodeHiveIcon } from '@/components/icons';
import Link from 'next/link';
import { ArrowRight, Sparkles, Star } from 'lucide-react';
import Image from 'next/image';

const logos = [
    { name: 'EXTFLOWS', icon: <Sparkles /> },
    { name: 'dataBites.', icon: <Sparkles /> },
    { name: 'MarketSavy', icon: <Sparkles /> },
    { name: 'EpicDev', icon: <Sparkles /> },
    { name: 'BestBes', icon: <Sparkles /> },
]

export default function LandingPage() {
  return (
    <div className="dark bg-transparent text-foreground min-h-screen flex flex-col overflow-x-hidden">
      <div className="app-container flex flex-col">
        <header className="sticky top-0 z-50 w-full">
          <div className="container flex h-20 max-w-screen-2xl items-center justify-between">
            <Link href="/" className="flex items-center gap-2">
              <CodeHiveIcon className="size-8 text-foreground" />
              <span className="font-bold text-xl font-headline">CodeHive</span>
            </Link>
            <nav className="hidden md:flex items-center gap-6 text-sm font-medium">
              <Link href="#" className="text-muted-foreground hover:text-foreground transition-colors">
                Features
              </Link>
              <Link href="/marketplace" className="text-muted-foreground hover:text-foreground transition-colors">
                Marketplace
              </Link>
              <Link href="/learn" className="text-muted-foreground hover:text-foreground transition-colors">
                Learn
              </Link>
              <Link href="#" className="text-muted-foreground hover:text-foreground transition-colors">
                Pricing
              </Link>
            </nav>
            <div className="hidden md:flex flex-1 items-center justify-end gap-2">
              <Button asChild variant="outline" className="bg-white/5 border-white/20 hover:bg-white/10">
                <Link href="/dashboard">
                  Start Free Trial
                </Link>
              </Button>
            </div>
          </div>
        </header>

        <main className="flex-1 flex flex-col justify-center">
          <div className="container relative text-center flex flex-col items-center">
             <div className="absolute -inset-24 w-full h-full bg-gradient-to-br from-primary/20 via-transparent to-accent/10 rounded-full blur-3xl -z-10" />
            <h1 className="font-headline font-bold text-5xl md:text-7xl mt-6 bg-clip-text text-transparent bg-gradient-to-b from-white to-neutral-400 leading-tight max-w-4xl">
              Smarter Insights. Faster Execution. Better Outcomes.
            </h1>
            <p className="mt-6 text-lg md:text-xl text-muted-foreground max-w-2xl">
              Transform workflows and decision-making through next-generation AI intelligence. An open source platform for software creation and collaboration.
            </p>
            <div className="mt-10 flex justify-center gap-4">
              <Button size="lg" asChild className="bg-white text-black hover:bg-neutral-200 shadow-lg shadow-white/10">
                <Link href="/dashboard">
                  <Sparkles className="mr-2" />
                  Explore Demo
                </Link>
              </Button>
            </div>
          </div>
        </main>
        
        <footer className="py-12">
            <div className="container text-center">
                <p className="text-sm text-muted-foreground flex items-center justify-center gap-2">
                    <Star className="w-4 h-4 text-yellow-400" />
                    Trusted by innovators & enterprises worldwide
                </p>
                 <div className="mt-8 flex justify-center items-center gap-12">
                    {logos.map(logo => (
                        <div key={logo.name} className="flex items-center gap-2 text-muted-foreground font-semibold text-lg grayscale o-80">
                           {logo.name}
                        </div>
                    ))}
                </div>
            </div>
        </footer>
      </div>
    </div>
  );
}
