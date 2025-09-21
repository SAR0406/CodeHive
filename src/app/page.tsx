import { Button } from '@/components/ui/button';
import { CodeHiveIcon } from '@/components/icons';
import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import Image from 'next/image';

export default function LandingPage() {
  return (
    <div className="dark bg-background text-foreground min-h-screen flex flex-col overflow-x-hidden">
      <div className="fixed top-0 left-0 w-full h-full sparkle-bg -z-10" />
      <header className="sticky top-0 z-50 w-full border-b border-white/10 bg-background/50 backdrop-blur-sm">
        <div className="container flex h-16 max-w-screen-2xl items-center justify-center">
          <Link href="/" className="flex items-center gap-2 mr-6">
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
              Docs
            </Link>
          </nav>
          <div className="hidden md:flex flex-1 items-center justify-end gap-2">
            <Button variant="ghost" asChild>
              <Link href="/dashboard">Login</Link>
            </Button>
            <Button asChild variant="default" className="bg-white text-black hover:bg-neutral-200">
              <Link href="/dashboard">
                Discover the platform
              </Link>
            </Button>
          </div>
        </div>
      </header>

      <main className="flex-1">
        <div className="container relative grid lg:grid-cols-2 gap-12 items-center pt-24 pb-40 md:pt-32">
          <div className="lg:pr-8 text-center">
            <h1 className="font-headline font-bold text-5xl md:text-7xl mt-6 bg-clip-text text-transparent bg-gradient-to-b from-white to-neutral-400 leading-tight">
              Managing your projects with AI
            </h1>
            <p className="mt-6 text-lg md:text-xl text-muted-foreground">
             An open source platform to automate various aspects of software creation, skill acquisition, and project collaboration.
            </p>
            <div className="mt-10 flex justify-center gap-4">
              <Button size="lg" asChild className="bg-white text-black hover:bg-neutral-200">
                <Link href="/dashboard">
                  Get Started for Free
                  <ArrowRight className="ml-2" />
                </Link>
              </Button>
            </div>
          </div>
          
          <div className="relative">
             <div className="absolute -inset-4 w-full h-full bg-gradient-to-br from-primary/10 via-transparent to-accent/10 rounded-2xl blur-2xl -z-10" />
            <div
              className="rounded-xl border border-white/10 bg-white/5 shadow-2xl shadow-black/80 backdrop-blur-lg"
            >
              <div className="p-2">
                <Image
                  src="https://images.unsplash.com/photo-1740059024857-9cdb2303a16e?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3NDE5ODJ8MHwxfHNlYXJjaHwxOHx8YnVpbGQlMjB5b3VyJTIwd2Vic2l0ZXMlMjB3aXRoJTIwQUl8ZW58MHx8fHwxNzU4NDI4NTA1fDA&ixlib=rb-4.1.0&q=80&w=1080"
                  alt="CodeHive Dashboard"
                  width={1200}
                  height={800}
                  data-ai-hint="dark dashboard UI"
                  className="rounded-lg border border-white/10"
                />
              </div>
            </div>
          </div>
        </div>
      </main>
      
      <footer className="border-t border-white/10 bg-transparent">
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
