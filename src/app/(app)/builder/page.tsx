'use client';

import { useState } from 'react';
import { generateApp } from '@/ai/flows/generate-app-from-prompt';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { Bot, Code, Figma, Loader2, Sparkles } from 'lucide-react';

export default function AIBuilderPage() {
  const [prompt, setPrompt] = useState('');
  const [generatedCode, setGeneratedCode] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const handleGenerate = async () => {
    if (!prompt) {
      toast({
        title: 'Prompt is empty',
        description: 'Please enter a description for the app you want to build.',
        variant: 'destructive',
      });
      return;
    }

    setIsLoading(true);
    setGeneratedCode('');

    try {
      const result = await generateApp({ prompt });
      setGeneratedCode(result.code);
    } catch (error) {
      console.error('Error generating app:', error);
      toast({
        title: 'Error Generating App',
        description: 'Something went wrong. Please try again.',
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
          <h1 className="font-headline text-3xl md:text-4xl font-semibold flex items-center gap-2">
            <Bot className="size-8" />
            <span>AI Builder</span>
          </h1>
          <p className="text-muted-foreground mt-2">Generate an application from a natural language prompt.</p>
        </div>
         <Button variant="outline" disabled>
          <Figma className="mr-2" />
          Import from Figma
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 flex-1">
        <Card className="flex flex-col">
          <CardHeader>
            <CardTitle className="font-headline">Describe Your App</CardTitle>
            <CardDescription>
              Enter a detailed prompt describing the application you want to build. Include features, UI elements, and overall purpose.
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
            <Button onClick={handleGenerate} disabled={isLoading} size="lg">
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

        <Card className="flex flex-col">
          <CardHeader>
            <CardTitle className="font-headline">Live Preview & Code</CardTitle>
            <CardDescription>The generated code and a preview of your application will appear here.</CardDescription>
          </CardHeader>
          <CardContent className="flex-grow flex flex-col gap-4">
            <div className="border rounded-lg bg-muted/40 flex-grow p-4 overflow-auto">
              {isLoading && (
                <div className="flex items-center justify-center h-full text-muted-foreground">
                  <Loader2 className="mr-2 h-8 w-8 animate-spin" />
                  <span>Generating...</span>
                </div>
              )}
              {!isLoading && !generatedCode && (
                <div className="flex items-center justify-center h-full text-muted-foreground">
                  <Code className="mr-2 h-8 w-8" />
                  <span>Code will appear here</span>
                </div>
              )}
              {generatedCode && (
                <pre className="text-sm">
                  <code>{generatedCode}</code>
                </pre>
              )}
            </div>
            <Button variant="secondary" disabled={!generatedCode}>
              Deploy to CodeHive
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
