'use client';

import { useState, type PropsWithChildren } from 'react';
import { useRouter } from 'next/navigation';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Button } from './ui/button';
import { Label } from './ui/label';
import { Textarea } from './ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { generateStory } from '@/ai/flows/generate-story-flow';
import { Loader2, Sparkles } from 'lucide-react';

export function CreateContentDialog({ children }: PropsWithChildren) {
  const [prompt, setPrompt] = useState('');
  const [open, setOpen] = useState(false);
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
      setOpen(false);
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
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Create Content</DialogTitle>
          <DialogDescription>
            Enter a prompt and our AI will generate a unique story for you.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="prompt" className="text-right">
              Prompt
            </Label>
            <Textarea
              id="prompt"
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              className="col-span-3"
              placeholder="e.g., A story about a brave knight in a magical forest..."
            />
          </div>
        </div>
        <DialogFooter>
          <Button onClick={handleGenerate} disabled={isLoading}>
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Generating...
              </>
            ) : (
              <>
                <Sparkles className="mr-2 h-4 w-4" />
                Generate
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
