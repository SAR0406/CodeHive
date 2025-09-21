import { Button } from '@/components/ui/button';
import { CodeHiveIcon } from '@/components/icons';
import Link from 'next/link';
import Image from 'next/image';
import { Briefcase, Mountain, Zap } from 'lucide-react';

export default function LandingPage() {
  return (
    <div className="dark bg-background text-foreground min-h-screen flex flex-col overflow-x-hidden">
      <div className="app-container absolute inset-0 z-0" />
      <header className="sticky top-0 z-50 w-full">
        <div className="container flex h-20 max-w-screen-xl items-center justify-between mx-auto">
          <Link href="/" className="flex items-center gap-2">
            <CodeHiveIcon className="size-7 text-white" />
            <span className="font-bold text-lg font-headline text-white">CodeHive</span>
          </Link>
          <nav className="hidden md:flex items-center gap-8 text-sm font-medium">
            <Link href="#" className="text-muted-foreground hover:text-white transition-colors">
              About Us
            </Link>
            <Link href="#" className="text-muted-foreground hover:text-white transition-colors">
              Products
            </Link>
            <Link href="#" className="text-muted-foreground hover:text-white transition-colors">
              News
            </Link>
            <Link href="#" className="text-muted-foreground hover:text-white transition-colors">
              Contact
            </Link>
          </nav>
          <div className="hidden md:flex items-center justify-end gap-4">
            <Button asChild className="bg-primary text-primary-foreground hover:bg-neutral-200">
              <Link href="/dashboard">
                Discover Platform
              </Link>
            </Button>
          </div>
        </div>
      </header>

      <main className="flex-1 flex flex-col justify-center z-10">
        <section className="w-full">
          <div className="container grid grid-cols-1 md:grid-cols-2 gap-12 items-center max-w-screen-xl mx-auto">
            <div className="flex flex-col gap-8">
              <h1 className="font-headline font-extrabold text-5xl md:text-6xl lg:text-7xl text-white tracking-tighter">
                Build better sites, faster
              </h1>
              <div className="grid grid-cols-2 gap-8 text-sm text-muted-foreground">
                 <p>
                  Harness the power of AI to create sophisticated, high-performance applications with unparalleled ease and elegance.
                </p>
                <p>
                  Our platform provides the tools and infrastructure to bring your most ambitious software visions to life.
                </p>
              </div>
              <div className="flex items-center gap-4 mt-6">
                <Button size="lg" variant="outline" asChild className="bg-transparent hover:bg-white hover:text-black border-2 border-white text-white">
                  <Link href="#">
                    Get In Touch
                  </Link>
                </Button>
              </div>
            </div>
            <div className="relative aspect-square">
              <Image
                src="https://images.unsplash.com/photo-1740059024857-9cdb2303a16e?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3NDE5ODJ8MHwxfHNlYXJjaHwxOHx8YnVpbGQlMjB5b3VyJTIwd2Vic2l0ZXMlMjB3aXRoJTIwQUl8ZW58MHx8fHwxNzU4NDI4NTA1fDA&ixlib=rb-4.1.0&q=80&w=1080"
                alt="Luxury Abstract AI"
                fill
                data-ai-hint="dark dashboard UI"
                className="object-contain"
              />
            </div>
          </div>
        </section>
        
        <section className="py-24">
            <div className="container max-w-screen-xl mx-auto">
                <div className="grid grid-cols-2 md:grid-cols-5 gap-8 items-center justify-items-center">
                    <div className="flex items-center gap-2 text-muted-foreground font-bold text-2xl grayscale opacity-60">
                        <Briefcase />
                        <span>Workday</span>
                    </div>
                     <div className="flex items-center gap-2 text-muted-foreground font-bold text-2xl grayscale opacity-60">
                        <Mountain />
                        <span>Everest</span>
                    </div>
                     <div className="flex items-center gap-2 text-muted-foreground font-bold text-2xl grayscale opacity-60">
                        <Zap />
                        <span>PowerCo</span>
                    </div>
                     <div className="flex items-center gap-2 text-muted-foreground font-bold text-2xl grayscale opacity-60">
                        <CodeHiveIcon className="size-8"/>
                        <span>Innovate</span>
                    </div>
                     <div className="flex items-center gap-2 text-muted-foreground font-bold text-2xl grayscale opacity-60">
                        <Briefcase />
                        <span>Quantum</span>
                    </div>
                </div>
            </div>
        </section>
      </main>
    </div>
  );
}
