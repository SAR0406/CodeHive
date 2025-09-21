'use client';
import { Button } from '@/components/ui/button';
import { AmazonLogo, CodeHiveIcon, DellLogo, MicrosoftLogo, OracleLogo, SapLogo, ShopifyLogo, SlackLogo, WebflowLogo, WixLogo, WordpressLogo, CreateContentIcon, OptimizeContentIcon, DistributeContentIcon, ZapierLogo } from '@/components/icons';
import Link from 'next/link';
import Image from 'next/image';
import { ArrowRight, BookOpen, BarChart2, Zap, ShieldCheck, Accessibility, Scaling } from 'lucide-react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { DashboardCharts } from '@/components/dashboard-charts';

const features = [
  {
    icon: <BarChart2 className="w-8 h-8 text-white" />,
    title: 'Efficiency',
    description: 'Saves time and resources for content creation and optimization.',
  },
  {
    icon: <Zap className="w-8 h-8 text-white" />,
    title: 'Analytics',
    description: 'Improved ability to analyze and optimize content strategies.',
  },
  {
    icon: <ShieldCheck className="w-8 h-8 text-white" />,
    title: 'Quality',
    description: 'Improved content quality through automatic optimization and recommendations.',
  },
  {
    icon: <Accessibility className="w-8 h-8 text-white" />,
    title: 'Accessibility',
    description: 'Can be used even by small teams and individual bloggers thanks to the open source model.',
  },
];

const integrations = [
    { icon: <WordpressLogo className="w-10 h-10" />, name: 'Wordpress' },
    { icon: <WixLogo className="w-10 h-10" />, name: 'Wix' },
    { icon: <WebflowLogo className="w-10 h-10" />, name: 'Webflow' },
    { icon: <ShopifyLogo className="w-10 h-10" />, name: 'Shopify' },
    { icon: <ZapierLogo className="w-10 h-10" />, name: 'Zapier' },
    { icon: <SlackLogo className="w-10 h-10" />, name: 'Slack' },
]

export default function LandingPage() {
  const splineViewerHtml = `<spline-viewer loading-anim-type="spinner-small-dark" url="https://prod.spline.design/gm0ksJtPHZQblNTV/scene.splinecode"></spline-viewer>`;
  
  return (
    <div className="dark bg-background text-foreground min-h-screen flex flex-col">
      <header className="sticky top-0 z-50 w-full p-4">
        <div className="container flex h-16 max-w-screen-xl items-center justify-between mx-auto px-4 glass-container">
          <Link href="/" className="flex items-center gap-2">
            <CodeHiveIcon className="size-7 text-white" />
            <span className="font-bold text-lg font-headline text-white">CodeHive</span>
          </Link>
          <nav className="hidden md:flex items-center gap-6 text-sm font-medium">
            <Link href="#" className="text-muted-foreground hover:text-white transition-colors">
              Resources
            </Link>
            <Link href="#" className="text-muted-foreground hover:text-white transition-colors">
              Blog
            </Link>
            <Link href="#" className="text-muted-foreground hover:text-white transition-colors">
              Pricing
            </Link>
            <Link href="#" className="text-muted-foreground hover:text-white transition-colors">
              Docs
            </Link>
          </nav>
          <div className="hidden md:flex items-center justify-end gap-4">
            <Button variant="ghost" asChild>
                <Link href="#">
                    <BookOpen />
                    Book a call
                </Link>
            </Button>
            <Button asChild className="bg-primary text-primary-foreground hover:bg-neutral-200">
              <Link href="/dashboard">
                Discover the platform
              </Link>
            </Button>
          </div>
        </div>
      </header>

      <main className="flex-1 flex flex-col z-10 px-4">
        <section className="w-full py-20 md:py-32 relative">
           <div className="absolute top-0 left-0 w-full h-full z-0" dangerouslySetInnerHTML={{ __html: splineViewerHtml }} />
          <div className="container mx-auto text-center flex flex-col items-center gap-8 relative z-10">
            
            <div className="inline-flex items-center gap-2 text-sm font-medium text-muted-foreground bg-card/80 border border-border px-3 py-1 rounded-full">
                <div className="flex -space-x-2 overflow-hidden">
                    <Image className="inline-block h-5 w-5 rounded-full ring-2 ring-background" src="https://picsum.photos/seed/p1/40/40" alt="p1" width={20} height={20}/>
                    <Image className="inline-block h-5 w-5 rounded-full ring-2 ring-background" src="https://picsum.photos/seed/p2/40/40" alt="p2" width={20} height={20}/>
                    <Image className="inline-block h-5 w-5 rounded-full ring-2 ring-background" src="https://picsum.photos/seed/p3/40/40" alt="p3" width={20} height={20}/>
                </div>
                <span>Trusted by 35.000+ people</span>
            </div>

            <h1 className="font-headline font-bold text-5xl md:text-6xl lg:text-7xl text-white tracking-tighter leading-tight">
              Build better sites, faster.
            </h1>
            <p className="text-xl text-white my-4">click 1 2 3 4</p>
            <p className="max-w-2xl text-lg text-muted-foreground">
              An open source content management system that uses AI to automate various aspects of content creation, optimization, and distribution.
            </p>
            <div className="flex items-center gap-4">
              <Button size="lg" asChild className="bg-primary text-primary-foreground hover:bg-neutral-200">
                <Link href="/dashboard">
                  Get started for free
                </Link>
              </Button>
            </div>
            
            <Card className="mt-16 w-full max-w-4xl p-0.5 glass-container overflow-hidden">
                 <div className="flex justify-between items-center p-2 border-b border-border/50">
                    <div className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded-full bg-red-500"></div>
                        <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
                        <div className="w-3 h-3 rounded-full bg-green-500"></div>
                    </div>
                 </div>
                 <div className="p-4 grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className='flex flex-col gap-2'>
                        <p className='text-sm text-muted-foreground text-left'>Total traffic</p>
                        <p className='text-3xl font-bold text-left'>240.8K</p>
                         <div className="h-32">
                           <DashboardCharts />
                        </div>
                    </div>
                    <div className='flex flex-col gap-4 justify-center'>
                         <div className='flex items-center gap-3 p-3 rounded-lg bg-white/5 border border-white/10'>
                            <CreateContentIcon className='w-5 h-5 text-white' />
                            <span className='text-sm font-medium'>Create Content</span>
                        </div>
                        <div className='flex items-center gap-3 p-3 rounded-lg bg-white/5 border border-white/10'>
                            <OptimizeContentIcon className='w-5 h-5 text-white' />
                            <span className='text-sm font-medium'>Content Optimization</span>
                        </div>
                        <div className='flex items-center gap-3 p-3 rounded-lg bg-white/5 border border-white/10'>
                            <DistributeContentIcon className='w-5 h-5 text-white' />
                            <span className='text-sm font-medium'>Distribute</span>
                        </div>
                    </div>
                 </div>
            </Card>

            <div className="mt-16 flex items-center justify-between w-full max-w-5xl text-muted-foreground">
              <AmazonLogo className="w-24 h-auto" />
              <DellLogo className="w-24 h-auto" />
              <SapLogo className="w-20 h-auto" />
              <MicrosoftLogo className="w-28 h-auto" />
              <OracleLogo className="w-24 h-auto" />
            </div>
          </div>
        </section>

        <section className="w-full py-20 md:py-32">
            <div className="container mx-auto">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    {features.map((feature, index) => (
                        <Card key={index} className="glass-container p-6">
                            <CardHeader className="p-0">
                                <div className="flex items-center gap-4">
                                    <div className="p-3 bg-white/10 rounded-lg">
                                      {feature.icon}
                                    </div>
                                    <h3 className="font-headline text-2xl font-semibold text-white">{feature.title}</h3>
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
                 <h2 className="font-headline font-bold text-4xl md:text-5xl text-white tracking-tighter leading-tight">
                    Integrations and Extensibility
                </h2>
                <p className="max-w-2xl text-lg text-muted-foreground">
                    Integrate seamlessly with social media platforms for automatic posting and interaction analysis, and extend functionality through plugins and APIs for analytics and email newsletters.
                </p>

                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-6 w-full max-w-4xl mt-8">
                    {integrations.map((integration, index) => (
                        <div key={index} className="flex flex-col items-center justify-center gap-4 p-6 rounded-xl bg-white/5 border border-white/10 transition-all duration-300 hover:bg-white/10 hover:border-white/20">
                            {integration.icon}
                            <span className="text-sm font-medium text-white">{integration.name}</span>
                        </div>
                    ))}
                </div>

                <Button variant="outline" size="lg" className="mt-8 bg-transparent text-white border-white/20 hover:bg-white/10 hover:text-white">
                    Show all integrations
                    <ArrowRight className="ml-2"/>
                </Button>
            </div>
        </section>

         <section className="w-full py-20 md:py-32">
            <div className="container mx-auto text-center flex flex-col items-center gap-6">
                <p className="font-semibold text-white">Start exploring today</p>
                 <h2 className="font-headline font-bold text-4xl md:text-5xl text-white tracking-tighter leading-tight">
                    What will you discover?
                </h2>
                <Button size="lg" asChild className="bg-primary text-primary-foreground hover:bg-neutral-200 mt-4">
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
                <CodeHiveIcon className="size-7 text-white" />
                <span className="font-bold text-lg font-headline text-white">CodeHive</span>
            </Link>
            <p className="text-muted-foreground max-w-sm">
                Join us to shape the future of open-source software together.
            </p>
             <div className="flex items-center gap-4 mt-4">
                <Link href="#" className="text-muted-foreground hover:text-white"><BookOpen className="w-5 h-5"/></Link>
                <Link href="#" className="text-muted-foreground hover:text-white"><Scaling className="w-5 h-5"/></Link>
             </div>
          </div>
          <div className="flex flex-col gap-3">
            <h4 className="font-semibold text-white">Need consulting?</h4>
            <Button variant="link" className="p-0 justify-start text-muted-foreground hover:text-white h-auto"><BookOpen className="mr-2" /> Book a call</Button>
          </div>
          <div className="flex flex-col gap-3">
             <h4 className="font-semibold text-white">Launching a product?</h4>
            <Button variant="link" className="p-0 justify-start text-muted-foreground hover:text-white h-auto">Grow Chief</Button>
          </div>
          <div className="flex flex-col gap-3">
             <h4 className="font-semibold text-white">CodeHive Library</h4>
            <Button variant="link" className="p-0 justify-start text-muted-foreground hover:text-white h-auto">Go to CodeHive</Button>
          </div>
        </div>
        <div className="container mx-auto mt-12 pt-8 border-t border-white/10 flex justify-between items-center text-sm text-muted-foreground">
            <p>&copy; {new Date().getFullYear()} CodeHive. All rights reserved.</p>
            <div className="flex gap-4">
                <Link href="#" className="hover:text-white">Terms of service</Link>
                <Link href="#" className="hover:text-white">Privacy Policy</Link>
            </div>
        </div>
      </footer>
    </div>
  );
}
