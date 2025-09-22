'use client';

import { useEffect, useState } from 'react';
import { getStory } from '@/ai/flows/generate-story-flow';
import type { GenerateStoryOutput } from '@/ai/flows/story-schema';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowLeft, ArrowRight, BookOpen, Loader2 } from 'lucide-react';
import { notFound } from 'next/navigation';
import Link from 'next/link';

export default function StoryPage({ params }: { params: { id: string } }) {
  const [story, setStory] = useState<GenerateStoryOutput | null>(null);
  const [currentPage, setCurrentPage] = useState(0);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function fetchStory() {
      setIsLoading(true);
      try {
        const fetchedStory = await getStory(params.id);
        if (!fetchedStory) {
          notFound();
        }
        setStory(fetchedStory);
      } catch (error) {
        console.error('Failed to fetch story:', error);
        notFound();
      } finally {
        setIsLoading(false);
      }
    }

    if (params.id) {
      fetchStory();
    }
  }, [params.id]);

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-full">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!story) {
    return notFound();
  }

  const handleNextPage = () => {
    if (currentPage < story.pages.length - 1) {
      setCurrentPage(currentPage + 1);
    }
  };

  const handlePreviousPage = () => {
    if (currentPage > 0) {
      setCurrentPage(currentPage - 1);
    }
  };

  const page = story.pages[currentPage];

  return (
    <div className="max-w-4xl mx-auto flex flex-col gap-8">
        <div>
            <Button variant="outline" asChild>
                <Link href="/dashboard"><ArrowLeft className="mr-2" /> Back to Dashboard</Link>
            </Button>
        </div>
      <Card className="shadow-2xl shadow-accent/10">
        <CardHeader className="text-center">
            <div className='flex justify-center mb-4'>
                <BookOpen className='size-10 text-accent' />
            </div>
          <CardTitle className="text-3xl font-headline">{story.title}</CardTitle>
          <CardDescription>
            Page {currentPage + 1} of {story.pages.length}
          </CardDescription>
        </CardHeader>
        <CardContent className="min-h-[300px]">
          <p className="text-lg leading-relaxed whitespace-pre-wrap font-serif">
            {page.content}
          </p>
        </CardContent>
        <CardFooter className="flex justify-between">
          <Button onClick={handlePreviousPage} disabled={currentPage === 0} variant="outline">
            <ArrowLeft className="mr-2" />
            Previous
          </Button>
          <Button onClick={handleNextPage} disabled={currentPage === story.pages.length - 1}>
            Next
            <ArrowRight className="ml-2" />
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}
