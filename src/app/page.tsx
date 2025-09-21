import { Button } from '@/components/ui/button';
import { CodeHiveIcon } from '@/components/icons';
import Link from 'next/link';
import Image from 'next/image';
import { ArrowRight, CheckCircle } from 'lucide-react';
import { Card } from '@/components/ui/card';

export default function LandingPage() {
  return (
    <div className="dark bg-background text-foreground min-h-screen flex flex-col">
      <div className="stars absolute inset-0 z-0" />
      <header className="sticky top-0 z-50 w-full">
        <div className="container flex h-20 max-w-screen-xl items-center justify-between mx-auto px-4">
          <Link href="/" className="flex items-center gap-2">
            <CodeHiveIcon className="size-7 text-white" />
            <span className="font-bold text-lg font-headline text-white">CodeHive</span>
          </Link>
          <nav className="hidden md:flex items-center gap-6 text-sm font-medium">
            <Link href="#" className="text-muted-foreground hover:text-white transition-colors">
              Features
            </Link>
            <Link href="#" className="text-muted-foreground hover:text-white transition-colors">
              Pricing
            </Link>
            <Link href="#" className="text-muted-foreground hover:text-white transition-colors">
              Docs
            </Link>
             <Link href="#" className="text-muted-foreground hover:text-white transition-colors">
              Company
            </Link>
          </nav>
          <div className="hidden md:flex items-center justify-end gap-4">
            <Button variant="ghost" asChild>
                <Link href="/dashboard">
                    Log in
                </Link>
            </Button>
            <Button asChild className="bg-primary text-primary-foreground hover:bg-neutral-200">
              <Link href="/dashboard">
                Discover Platform
              </Link>
            </Button>
          </div>
        </div>
      </header>

      <main className="flex-1 flex flex-col justify-center z-10 px-4">
        <section className="w-full py-20 md:py-32">
          <div className="container mx-auto text-center flex flex-col items-center gap-8">
            
            <div className="inline-flex items-center gap-2 text-sm font-medium text-muted-foreground bg-card/80 border border-border px-3 py-1 rounded-full">
                <div className="flex -space-x-2 overflow-hidden">
                    <Image className="inline-block h-5 w-5 rounded-full ring-2 ring-background" src="https://picsum.photos/seed/p1/40/40" alt="p1" width={20} height={20}/>
                    <Image className="inline-block h-5 w-5 rounded-full ring-2 ring-background" src="https://picsum.photos/seed/p2/40/40" alt="p2" width={20} height={20}/>
                    <Image className="inline-block h-5 w-5 rounded-full ring-2 ring-background" src="https://picsum.photos/seed/p3/40/40" alt="p3" width={20} height={20}/>
                </div>
                <span>Trusted by 35,000+ people</span>
            </div>

            <h1 className="font-headline font-bold text-5xl md:text-6xl lg:text-7xl text-white tracking-tighter leading-tight">
              Build better sites, faster
            </h1>
            <p className="max-w-2xl text-lg text-muted-foreground">
              An open source content management system that uses AI to automate various aspects of content creation, optimization, and distribution.
            </p>
            <div className="flex items-center gap-4">
              <Button size="lg" asChild className="bg-primary text-primary-foreground hover:bg-neutral-200">
                <Link href="/dashboard">
                  Get started for free <ArrowRight className="ml-2"/>
                </Link>
              </Button>
            </div>
            
            <Card className="mt-16 w-full max-w-4xl p-4 glass-container">
                 <div className="flex justify-between items-center p-2 border-b border-border/50">
                    <div className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded-full bg-red-500"></div>
                        <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
                        <div className="w-3 h-3 rounded-full bg-green-500"></div>
                    </div>
                    <div className="text-sm text-muted-foreground flex items-center gap-4">
                        <span><CheckCircle className="inline mr-1 h-4 w-4"/> Create Content</span>
                        <span><CheckCircle className="inline mr-1 h-4 w-4"/> Content Optimization</span>
                        <span><CheckCircle className="inline mr-1 h-4 w-4"/> Distribute</span>
                    </div>
                    <div></div>
                 </div>
                 <div className="p-4">
                    <Image
                        src="https://images.unsplash.com/photo-1551288049-bebda4e38f71?q=80&w=2070&auto=format&fit=crop"
                        alt="Dashboard UI"
                        width={1200}
                        height={600}
                        data-ai-hint="dashboard charts"
                        className="rounded-lg shadow-2xl"
                    />
                 </div>
            </Card>
          </div>
        </section>
      </main>
    </div>
  );
}
