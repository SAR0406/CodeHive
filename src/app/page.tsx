import { Button } from '@/components/ui/button';
import { CodeHiveIcon } from '@/components/icons';
import Link from 'next/link';
import { Github, Code, FileText, Bot } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import Image from 'next/image';

export default function LandingPage() {
  return (
    <div className="dark bg-background text-foreground min-h-screen flex flex-col overflow-x-hidden">
      <div className="animated-gradient-bg" />

      <header className="sticky top-0 z-50 w-full bg-background/50 backdrop-blur-sm">
        <div className="container flex h-20 max-w-screen-2xl items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <CodeHiveIcon className="size-8 text-primary" />
            <span className="font-bold text-xl font-headline text-white">CodeHive</span>
          </Link>
          <nav className="hidden md:flex items-center gap-6 text-sm font-medium">
             <Link href="/dashboard" className="text-muted-foreground hover:text-white transition-colors">
              Dashboard
            </Link>
            <Link href="/marketplace" className="text-muted-foreground hover:text-white transition-colors">
              Marketplace
            </Link>
            <Link href="/learn" className="text-muted-foreground hover:text-white transition-colors">
              Learn
            </Link>
             <Link href="/builder" className="text-muted-foreground hover:text-white transition-colors">
              AI Builder
            </Link>
          </nav>
          <div className="hidden md:flex flex-1 items-center justify-end gap-4">
             <Button asChild variant="ghost">
              <Link href="#">
                <Github className="mr-2"/>
                Star on GitHub
              </Link>
            </Button>
            <Button asChild className="bg-primary text-primary-foreground hover:bg-primary/90 shadow-lg shadow-primary/20">
              <Link href="/dashboard">
                Get Started
              </Link>
            </Button>
          </div>
        </div>
      </header>

      <main className="flex-1 flex flex-col">
        <section className="py-24 md:py-32">
          <div className="container flex flex-col items-center gap-12 text-center">
             <h1 className="font-headline font-bold text-5xl md:text-6xl lg:text-7xl text-white leading-tight">
                Build and scale AI apps
              </h1>
              <p className="mt-4 text-lg text-muted-foreground max-w-2xl">
                CodeHive is an open-source, AI-native platform to build, deploy, and scale modern web applications. Go from idea to production in minutes, not months.
              </p>
              <Button size="lg" asChild className="mt-6 bg-primary text-primary-foreground hover:bg-primary/90 shadow-lg shadow-primary/20 scale-110">
                <Link href="/dashboard">
                  Start Building
                </Link>
              </Button>
          </div>
        </section>

        <section className="py-16 md:py-24">
            <div className="container">
                <div className="relative aspect-[2/1] w-full max-w-6xl mx-auto">
                    <Image 
                        src="https://images.unsplash.com/photo-1555066931-4365d14bab8c?q=80&w=2070&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D"
                        alt="CodeHive Dashboard Snippet"
                        fill
                        className="object-cover object-top rounded-xl border-2 border-border shadow-2xl shadow-black"
                        data-ai-hint="dark code editor"
                    />
                     <div className="absolute inset-0 bg-gradient-to-t from-background via-background/50 to-transparent"></div>
                </div>
            </div>
        </section>
        
        <section className="py-24 md:py-32">
          <div className="container text-center">
            <h2 className="font-headline font-bold text-4xl md:text-5xl text-white">Get to work quickly</h2>
            <p className="mt-4 text-lg text-muted-foreground max-w-2xl mx-auto">
              Go from opening your browser to building in minutes, not hours. Import your existing repos from Github, or select from a library of popular frameworks and language templates.
            </p>
            <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-8 text-left">
                <Card className="card-glow">
                    <CardHeader>
                        <div className="bg-primary/10 p-3 rounded-lg w-fit">
                            <Code className="h-6 w-6 text-primary" />
                        </div>
                    </CardHeader>
                    <CardContent>
                        <CardTitle className="font-headline text-xl">AI Builder</CardTitle>
                        <p className="text-muted-foreground mt-2">Generate boilerplate, write tests, and build entire applications using natural language prompts.</p>
                    </CardContent>
                </Card>
                 <Card className="card-glow">
                    <CardHeader>
                        <div className="bg-primary/10 p-3 rounded-lg w-fit">
                            <FileText className="h-6 w-6 text-primary" />
                        </div>
                    </CardHeader>
                    <CardContent>
                        <CardTitle className="font-headline text-xl">Templates Library</CardTitle>
                        <p className="text-muted-foreground mt-2">Start your project with a pre-built template from our library of popular frameworks and use-cases.</p>
                    </CardContent>
                </Card>
                 <Card className="card-glow">
                    <CardHeader>
                        <div className="bg-primary/10 p-3 rounded-lg w-fit">
                            <Bot className="h-6 w-6 text-primary" />
                        </div>
                    </CardHeader>
                    <CardContent>
                        <CardTitle className="font-headline text-xl">Collaboration Bot</CardTitle>
                        <p className="text-muted-foreground mt-2">Your in-repo AI assistant. Suggests fixes, writes tests, explains code, and more.</p>
                    </CardContent>
                </Card>
            </div>
          </div>
        </section>
      </main>

      <footer className="py-12 border-t border-white/10 mt-24">
        <div className="container text-center text-muted-foreground">
          <p>&copy; {new Date().getFullYear()} CodeHive. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}
