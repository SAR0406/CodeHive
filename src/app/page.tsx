'use client';
import { Button } from '@/components/ui/button';
import { CodeHiveIcon, CreateContentIcon } from '@/components/icons';
import Link from 'next/link';
import Image from 'next/image';
import { ArrowRight, BookOpen, BarChart2, Zap, ShieldCheck, Accessibility } from 'lucide-react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { useEffect, useState } from 'react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';


const features = [
  {
    icon: <BarChart2 className="w-8 h-8 text-accent" />,
    title: 'Efficiency',
    description: 'Saves time and resources for content creation and optimization.',
  },
  {
    icon: <Zap className="w-8 h-8 text-accent" />,
    title: 'Analytics',
    description: 'Improved ability to analyze and optimize content strategies.',
  },
  {
    icon: <ShieldCheck className="w-8 h-8 text-accent" />,
    title: 'Quality',
    description: 'Improved content quality through automatic optimization and recommendations.',
  },
  {
    icon: <Accessibility className="w-8 h-8 text-accent" />,
    title: 'Accessibility',
    description: 'Can be used by small teams and individual bloggers thanks to the open source model.',
  },
];

export default function LandingPage() {
  const [splineViewerHtml, setSplineViewerHtml] = useState('');

  useEffect(() => {
    // Spline viewer is loaded only on the client-side to prevent SSR issues
    setSplineViewerHtml(`<spline-viewer loading-anim-type="spinner-small-dark" url="https://prod.spline.design/gm0ksJtPHZQblNTV/scene.splinecode"></spline-viewer>`);
  }, []);
  
  return (
    <div className="dark bg-background text-foreground min-h-screen flex flex-col">
       <header className="sticky top-0 z-50 w-full p-4">
        <div className="container flex h-16 max-w-screen-xl items-center justify-between mx-auto px-4 glass-container">
          <Link href="/" className="flex items-center gap-2">
            <CodeHiveIcon className="size-7 text-accent" />
            <span className="font-bold text-lg font-headline">CodeHive</span>
          </Link>
          <nav className="hidden md:flex items-center gap-6 text-sm font-medium">
            <Link href="#" className="text-muted-foreground hover:text-foreground transition-colors">
              Resources
            </Link>
            <Link href="#" className="text-muted-foreground hover:text-foreground transition-colors">
              Blog
            </Link>
            <Link href="#" className="text-muted-foreground hover:text-foreground transition-colors">
              Pricing
            </Link>
            <Link href="#" className="text-muted-foreground hover:text-foreground transition-colors">
              Docs
            </Link>
          </nav>
          <div className="hidden md:flex items-center justify-end gap-4">
            <Button variant="ghost" asChild>
                <Link href="#" className="flex items-center gap-2">
                    <BookOpen />
                    Book a call
                </Link>
            </Button>
            <Button asChild>
              <Link href="/dashboard">
                Discover the platform
              </Link>
            </Button>
          </div>
        </div>
      </header>

      <main className="flex-1 flex flex-col z-10 px-4">
        <section className="w-full py-20 md:py-32 relative">
          <div className="container mx-auto grid md:grid-cols-1 gap-12 items-center relative z-10">
            <div className="flex flex-col items-center text-center gap-6">
                <div className="inline-flex items-center gap-2 rounded-full bg-card px-4 py-2 text-sm">
                    <div className="flex -space-x-2 overflow-hidden">
                        <Avatar className="inline-block h-6 w-6 rounded-full ring-2 ring-card">
                            <AvatarImage src="https://picsum.photos/seed/p1/32/32" />
                            <AvatarFallback>A</AvatarFallback>
                        </Avatar>
                         <Avatar className="inline-block h-6 w-6 rounded-full ring-2 ring-card">
                            <AvatarImage src="https://picsum.photos/seed/p2/32/32" />
                            <AvatarFallback>B</AvatarFallback>
                        </Avatar>
                         <Avatar className="inline-block h-6 w-6 rounded-full ring-2 ring-card">
                            <AvatarImage src="https://picsum.photos/seed/p3/32/32" />
                            <AvatarFallback>C</AvatarFallback>
                        </Avatar>
                    </div>
                    <span className="font-medium text-muted-foreground">Trusted by 35,000+ people</span>
                </div>
              <h1 className="font-headline font-bold text-5xl md:text-6xl lg:text-7xl tracking-tighter leading-tight">
                Build better sites, faster.
              </h1>
              <p className="max-w-xl text-lg text-muted-foreground">
                An open source content management system that uses AI to automate various aspects of content creation, optimization, and distribution.
              </p>
              <div className="flex items-center gap-4">
                <Button size="lg" asChild>
                  <Link href="/dashboard">
                    Get started for free
                  </Link>
                </Button>
              </div>
            </div>
             <div className="absolute inset-0 w-full h-full flex items-center justify-center pointer-events-none">
                {splineViewerHtml && <div className="w-full h-full" dangerouslySetInnerHTML={{ __html: splineViewerHtml }} />}
            </div>
          </div>
           <Card className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[300px] glass-container z-20">
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                    <CardContent className="p-0">
                        <div className="text-sm text-muted-foreground">Total traffic</div>
                        <div className="text-3xl font-bold">240.8K</div>
                    </CardContent>
                    <Button>
                        <CreateContentIcon />
                        Create Content
                    </Button>
                </CardHeader>
            </Card>
        </section>

        <section className="w-full py-20 md:py-32">
            <div className="container mx-auto">
                <div className="text-center mb-12">
                    <h2 className="font-headline font-bold text-4xl md:text-5xl tracking-tighter leading-tight">
                        Why CodeHive?
                    </h2>
                    <p className="max-w-2xl mx-auto mt-4 text-lg text-muted-foreground">
                        Unlock unparalleled performance and collaboration with our suite of AI-powered tools.
                    </p>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    {features.map((feature, index) => (
                        <Card key={index} className="glass-container p-6">
                            <CardHeader className="p-0">
                                <div className="flex items-center gap-4">
                                    <div className="p-3 bg-accent/10 rounded-lg">
                                      {feature.icon}
                                    </div>
                                    <h3 className="font-headline text-2xl font-semibold">{feature.title}</h3>
                                </div>
                            </CardHeader>
                            <CardContent className="p-0 mt-4">
                                <p className="text-muted-foreground">{feature.description}</p>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            </div>
        </section>

         <section className="w-full py-20 md:py-32">
            <div className="container mx-auto text-center flex flex-col items-center gap-6">
                <p className="font-semibold text-accent">Start exploring today</p>
                 <h2 className="font-headline font-bold text-4xl md:text-5xl tracking-tighter leading-tight">
                    What will you create?
                </h2>
                <Button size="lg" asChild className="mt-4">
                    <Link href="/dashboard">
                    Get started for free
                    </Link>
                </Button>
            </div>
        </section>
      </main>

       <footer className="w-full z-10 px-4 py-16">
        <div className="container mx-auto grid grid-cols-1 md:grid-cols-5 gap-8">
          <div className="md:col-span-2 flex flex-col gap-4">
             <Link href="/" className="flex items-center gap-2">
                <CodeHiveIcon className="size-7 text-accent" />
                <span className="font-bold text-lg font-headline">CodeHive</span>
            </Link>
            <p className="text-muted-foreground max-w-sm">
                Join us to shape the future of open-source software together.
            </p>
          </div>
          <div className="flex flex-col gap-3">
            <h4 className="font-semibold">Company</h4>
            <Link href="#" className="text-muted-foreground hover:text-foreground">About</Link>
            <Link href="#" className="text-muted-foreground hover:text-foreground">Blog</Link>
            <Link href="#" className="text-muted-foreground hovertext-foreground">Careers</Link>
          </div>
          <div className="flex flex-col gap-3">
             <h4 className="font-semibold">Product</h4>
            <Link href="#" className="text-muted-foreground hover:text-foreground">Features</Link>
            <Link href="#" className="text-muted-foreground hover:text-foreground">Pricing</Link>
            <Link href="#" className="text-muted-foreground hover:text-foreground">Docs</Link>
          </div>
          <div className="flex flex-col gap-3">
             <h4 className="font-semibold">Legal</h4>
            <Link href="#" className="text-muted-foreground hover:text-foreground">Terms of Service</Link>
            <Link href="#" className="text-muted-foreground hover:text-foreground">Privacy Policy</Link>
          </div>
        </div>
        <div className="container mx-auto mt-12 pt-8 border-t flex justify-between items-center text-sm text-muted-foreground">
            <p>&copy; {new Date().getFullYear()} CodeHive. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}
