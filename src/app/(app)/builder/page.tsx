
'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { Bot, Code, Figma, Loader2, Sparkles, Rocket, Eye, Terminal, ChevronRight } from 'lucide-react';
import Editor from '@monaco-editor/react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import LivePreview from '@/components/live-preview';
import { useAuth } from '@/hooks/use-auth';

export default function AIBuilderPage() {
  const [prompt, setPrompt] = useState('');
  const [generatedCode, setGeneratedCode] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  const { user } = useAuth();

  const handleGenerate = async () => {
    if (!prompt) {
      toast({
        title: 'Prompt is empty',
        description: 'Please enter a description for the app you want to build.',
        variant: 'destructive',
      });
      return;
    }
    if (!user) {
        toast({
            title: 'Not authenticated',
            description: 'Please log in to generate an app.',
            variant: 'destructive',
        });
        return;
    }

    setIsLoading(true);
    setGeneratedCode('');

    try {
      // AI functionality is temporarily disabled.
       toast({
        title: 'AI Feature Disabled',
        description: "This feature is currently unavailable.",
        variant: 'destructive',
      });
      // In a real scenario, you would call your AI service here.
      // const result = await generateApp({ prompt, userId: user.uid });
      // setGeneratedCode(result.code);
    } catch (error: any) {
      let description = 'Something went wrong. Please try again.';
      if (error.message.includes('Insufficient credits')) {
        description = "You don't have enough credits to generate an app.";
      }
      toast({
        title: 'Error Generating App',
        description,
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="h-full flex flex-col gap-8">
      <div className="flex justify-between items-start">
        <div>
          <h1 className="font-headline text-3xl md:text-4xl font-semibold flex items-center gap-3">
            <Bot className="size-8 text-accent" />
            <span>AI App Builder</span>
          </h1>
          <p className="text-muted-foreground mt-2">Generate a full-stack application from a single prompt. Costs 10 credits.</p>
        </div>
         <Button variant="outline" disabled>
          <Figma className="mr-2" />
          Import from Figma
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 flex-1">
        <Card className="flex flex-col">
          <CardHeader>
            <CardTitle>Describe Your App</CardTitle>
            <CardDescription>
              Enter a detailed prompt describing the application you want to build. The more detail, the better the result.
            </CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col flex-grow gap-4">
            <Textarea
              placeholder="e.g., A simple to-do list app with a clean interface. Users should be able to add, edit, and delete tasks..."
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              className="flex-grow text-base"
              rows={15}
            />
            <Button onClick={handleGenerate} disabled={isLoading || !user} size="lg">
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                  Generating...
                </>
              ) : (
                <>
                  <Sparkles className="mr-2 h-5 w-5" />
                  Generate App
                </>
              )}
            </Button>
          </CardContent>
        </Card>

        <div className="flex flex-col gap-4 h-full">
          <Card className="flex-grow flex flex-col">
            <CardContent className="flex-grow flex flex-col gap-4 pt-6">
              <Tabs defaultValue="code" className="flex-grow flex flex-col">
                <div className='flex justify-between items-center'>
                  <TabsList>
                    <TabsTrigger value="code"><Code className="mr-2" /> Code</TabsTrigger>
                    <TabsTrigger value="preview"><Eye className="mr-2" /> Live Preview</TabsTrigger>
                  </TabsList>
                  <Button variant="secondary" disabled={!generatedCode}>
                      <Rocket className="mr-2" />
                      Deploy to CodeHive
                  </Button>
                </div>
                <TabsContent value="code" className="flex-grow mt-4">
                  <div className="border rounded-lg bg-background/80 flex-grow h-full overflow-hidden">
                      {isLoading && (
                          <div className="flex items-center justify-center h-full text-muted-foreground">
                          <Loader2 className="mr-2 h-8 w-8 animate-spin" />
                          <span>Generating code...</span>
                          </div>
                      )}
                      {!isLoading && !generatedCode && (
                          <div className="flex flex-col items-center justify-center h-full text-muted-foreground text-center p-4">
                          <Code className="mr-2 h-10 w-10 mb-2" />
                          <span className="font-semibold">Your generated code will appear here.</span>
                          <p className="text-sm">Describe your app and click "Generate App" to start.</p>
                          </div>
                      )}
                      {generatedCode && (
                          <Editor
                              height="100%"
                              language="typescript"
                              theme="vs-dark"
                              value={generatedCode}
                              options={{
                                  readOnly: true,
                                  minimap: { enabled: false },
                                  scrollBeyondLastLine: false,
                                  fontSize: 14,
                              }}
                          />
                      )}
                  </div>
                </TabsContent>
                <TabsContent value="preview" className="flex-grow mt-4">
                  <div className="border rounded-lg bg-white flex-grow h-full overflow-hidden">
                      {isLoading && (
                          <div className="flex items-center justify-center h-full text-muted-foreground">
                              <Loader2 className="mr-2 h-8 w-8 animate-spin" />
                              <span>Generating preview...</span>
                          </div>
                      )}
                      {!isLoading && !generatedCode && (
                          <div className="flex flex-col items-center justify-center h-full text-muted-foreground text-center p-4 bg-background/80">
                          <Eye className="mr-2 h-10 w-10 mb-2" />
                          <span className="font-semibold">The live preview will appear here.</span>
                          </div>
                      )}
                      {generatedCode && <LivePreview code={generatedCode} />}
                  </div>
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
          <Card className="h-1/3">
            <CardHeader className="p-4 border-b border-border flex-row items-center justify-between">
                <CardTitle className='text-base flex items-center gap-2'><Terminal /> Terminal</CardTitle>
            </CardHeader>
             <CardContent className="p-4 font-mono text-xs text-muted-foreground">
                <div className='flex items-center gap-2'>
                    <ChevronRight className='text-green-400'/>
                    <span className='text-foreground'>Welcome to CodeHive AI Builder</span>
                </div>
                 <p className='mt-2'>Deployment logs and status will appear here.</p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
