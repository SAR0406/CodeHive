'use client';

import { useState } from 'react';
import { generateApp } from '@/ai/flows/generate-app-from-prompt';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { Bot, Code, Figma, Loader2, Sparkles, Rocket } from 'lucide-react';
import Editor from '@monaco-editor/react';

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
          <h1 className="font-headline text-3xl md:text-4xl font-semibold flex items-center gap-3">
            <Bot className="size-8 text-accent" />
            <span>AI App Builder</span>
          </h1>
          <p className="text-muted-foreground mt-2">Generate a full-stack application from a single prompt.</p>
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
            <CardTitle>Generated Code</CardTitle>
            <CardDescription>The code for your application will appear here. You can then deploy it.</CardDescription>
          </CardHeader>
          <CardContent className="flex-grow flex flex-col gap-4">
            <div className="border rounded-lg bg-background/80 flex-grow overflow-hidden">
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
            <Button variant="secondary" disabled={!generatedCode}>
              <Rocket className="mr-2" />
              Deploy to CodeHive
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
