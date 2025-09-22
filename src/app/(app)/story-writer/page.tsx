'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { generateStory } from '@/ai/actions';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { Feather, Loader2, Sparkles } from 'lucide-react';

export default function StoryWriterPage() {
  const [prompt, setPrompt] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  const router = useRouter();

  const handleGenerate = async () => {
    if (!prompt) {
      toast({
        title: 'Prompt is empty',
        description: 'Please enter a prompt to generate a story.',
        variant: 'destructive',
      });
      return;
    }

    setIsLoading(true);
    try {
      const { storyId } = await generateStory({ prompt });
      toast({
        title: 'Story Generated!',
        description: 'Your story has been successfully created.',
      });
      router.push(`/story/${storyId}`);
    } catch (error) {
      console.error('Error generating story:', error);
      toast({
        title: 'Error Generating Story',
        description: 'Something went wrong. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col gap-8">
      <div>
        <h1 className="font-headline text-3xl md:text-4xl font-semibold flex items-center gap-3">
          <Feather className="size-8 text-accent" />
          <span>AI Story Writer</span>
        </h1>
        <p className="text-muted-foreground mt-2">
          Bring your ideas to life. Enter a prompt and let our AI write a story for you.
        </p>
      </div>

      <Card className="flex flex-col">
        <CardHeader>
          <CardTitle>Create a New Story</CardTitle>
          <CardDescription>
            Enter a prompt for the story you want to create. Be as descriptive as you like!
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col flex-grow gap-4">
          <Textarea
            placeholder="e.g., A brave knight who befriends a lonely dragon in a magical forest..."
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            className="flex-grow text-base"
            rows={10}
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
                Generate Story
              </>
            )}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
