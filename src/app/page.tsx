import { Button } from '@/components/ui/button';
import { CodeHiveIcon } from '@/components/icons';
import Link from 'next/link';

export default function LandingPage() {
  return (
    <div className="dark bg-background text-foreground min-h-screen flex flex-col overflow-x-hidden">
      <header className="absolute top-0 z-50 w-full">
        <div className="container flex h-20 max-w-screen-xl items-center justify-between mx-auto">
          <Link href="/" className="flex items-center gap-2">
            <CodeHiveIcon className="size-7 text-white" />
            <span className="font-bold text-lg font-headline text-white">CodeHive</span>
          </Link>
          <nav className="hidden md:flex items-center gap-8 text-sm font-medium">
            <Link href="/dashboard" className="text-muted-foreground hover:text-white transition-colors">
              Product
            </Link>
            <Link href="/marketplace" className="text-muted-foreground hover:text-white transition-colors">
              Teams
            </Link>
            <Link href="/learn" className="text-muted-foreground hover:text-white transition-colors">
              Resources
            </Link>
            <Link href="/builder" className="text-muted-foreground hover:text-white transition-colors">
              Community
            </Link>
          </nav>
          <div className="hidden md:flex items-center justify-end gap-4">
            <Button asChild variant="ghost" className="text-muted-foreground hover:text-white">
              <Link href="#">
                Log in
              </Link>
            </Button>
            <Button asChild className="bg-primary text-primary-foreground hover:bg-neutral-200">
              <Link href="/dashboard">
                Start for free
              </Link>
            </Button>
          </div>
        </div>
      </header>

      <main className="flex-1 flex flex-col justify-center">
        <section className="py-24 md:py-32">
          <div className="container flex flex-col items-center gap-8 text-center">
            <h1 className="font-headline font-extrabold text-6xl md:text-7xl lg:text-8xl text-white tracking-tighter">
              Build better <br /> sites, faster
            </h1>
            <p className="mt-4 text-lg text-muted-foreground max-w-xl">
              CodeHive is the design tool for websites. Design freely, publish fast, and scale with CMS, SEO, analytics, and more.
            </p>
            <div className="flex items-center gap-4 mt-6">
              <Button size="lg" asChild className="bg-primary text-primary-foreground hover:bg-neutral-200">
                <Link href="/dashboard">
                  Start for free
                </Link>
              </Button>
              <Button size="lg" asChild variant="secondary">
                <Link href="/builder">
                  Start with AI
                </Link>
              </Button>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
