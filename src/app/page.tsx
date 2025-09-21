'use client';
import { Button } from '@/components/ui/button';
import { AmazonLogo, CodeHiveIcon, DellLogo, MicrosoftLogo, OracleLogo, SapLogo, ShopifyLogo, SlackLogo, WebflowLogo, WixLogo, WordpressLogo, ZapierLogo } from '@/components/icons';
import Link from 'next/link';
import Image from 'next/image';
import { ArrowRight, BarChart2, Zap, ShieldCheck, Accessibility, Scaling, BookOpen } from 'lucide-react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { useEffect, useState } from 'react';

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

const integrations = [
    { icon: <WordpressLogo className="w-10 h-10" />, name: 'Wordpress' },
    { icon: <WixLogo className="w-10 h-10" />, name: 'Wix' },
    { icon: <WebflowLogo className="w-10 h-10" />, name: 'Webflow' },
    { icon: <ShopifyLogo className="w-10 h-10" />, name: 'Shopify' },
    { icon: <ZapierLogo className="w-10 h-10" />, name: 'Zapier' },
    { icon: <SlackLogo className="w-10 h-10" />, name: 'Slack' },
];

const companyLogos = [
  { icon: <AmazonLogo className="w-24 h-auto" />, name: "Amazon" },
  { icon: <DellLogo className="w-24 h-auto" />, name: "Dell" },
  { icon: <SapLogo className="w-20 h-auto" />, name: "SAP" },
  { icon: <MicrosoftLogo className="w-28 h-auto" />, name: "Microsoft" },
  { icon: <OracleLogo className="w-24 h-auto" />, name: "Oracle" },
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
                <Link href="#">
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
           {splineViewerHtml && <div className="absolute top-0 left-0 w-full h-full z-0 opacity-50" dangerouslySetInnerHTML={{ __html: splineViewerHtml }} />}
          <div className="container mx-auto text-center flex flex-col items-center gap-8 relative z-10">
            <h1 className="font-headline font-bold text-5xl md:text-6xl lg:text-7xl tracking-tighter leading-tight">
              Build, Ship, and Collaborate <br /> Like Never Before
            </h1>
            <p className="max-w-2xl text-lg text-muted-foreground">
              An open source platform that uses AI to automate various aspects of development, optimization, and distribution.
            </p>
            <div className="flex items-center gap-4">
              <Button size="lg" asChild>
                <Link href="/dashboard">
                  Get started for free
                  <ArrowRight className="ml-2" />
                </Link>
              </Button>
              <Button size="lg" variant="outline" asChild>
                <Link href="#">
                  Learn More
                </Link>
              </Button>
            </div>
            
            <div className="mt-16 w-full max-w-4xl text-center">
                <p className="text-sm text-muted-foreground mb-4">TRUSTED BY THE WORLD'S BEST COMPANIES</p>
                <div className="flex items-center justify-center flex-wrap gap-x-8 gap-y-4 text-muted-foreground">
                  {companyLogos.map((logo, index) => (
                      <div key={index} title={logo.name}>
                          {logo.icon}
                      </div>
                  ))}
                </div>
            </div>
          </div>
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
            <div className="container mx-auto text-center flex flex-col items-center gap-8">
                 <h2 className="font-headline font-bold text-4xl md:text-5xl tracking-tighter leading-tight">
                    Integrations and Extensibility
                </h2>
                <p className="max-w-2xl text-lg text-muted-foreground">
                    Integrate seamlessly with your favorite platforms and extend functionality through plugins and APIs.
                </p>

                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-6 w-full max-w-4xl mt-8">
                    {integrations.map((integration, index) => (
                        <div key={index} className="flex flex-col items-center justify-center gap-4 p-6 rounded-xl bg-card/80 border border-border transition-all duration-300 hover:bg-card hover:border-accent">
                            {integration.icon}
                            <span className="text-sm font-medium">{integration.name}</span>
                        </div>
                    ))}
                </div>

                <Button variant="outline" size="lg" className="mt-8">
                    Show all integrations
                    <ArrowRight className="ml-2"/>
                </Button>
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
            <Link href="#" className="text-muted-foreground hover:text-foreground">Careers</Link>
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
