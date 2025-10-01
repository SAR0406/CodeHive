'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/use-auth';
import { useToast } from '@/hooks/use-toast';
import { PlaceHolderImages } from '@/lib/placeholder-images';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Library, GitFork, Loader2 } from 'lucide-react';
import type { Template } from '@/lib/firebase/data/get-templates';
import { spendCredits } from '@/lib/firebase/credits';
import { useFirebase } from '@/lib/firebase/client-provider';
import { onTemplatesUpdate } from '@/lib/firebase/data/get-templates';


export default function TemplatesPage() {
  const { user, credits } = useAuth();
  const { app, db } = useFirebase();
  const { toast } = useToast();
  const [selectedTemplate, setSelectedTemplate] = useState<Template | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [templates, setTemplates] = useState<Template[]>([]);
  const [isLoadingTemplates, setIsLoadingTemplates] = useState(true);

  useEffect(() => {
    if (!db) return;
    setIsLoadingTemplates(true);
    const unsubscribe = onTemplatesUpdate(db, (fetchedTemplates) => {
      setTemplates(fetchedTemplates);
      setIsLoadingTemplates(false);
    });

    return () => unsubscribe();
  }, [db, toast]);


  const handleForkClick = (template: Template) => {
    if (!user) {
      toast({ title: 'Authentication Error', description: 'You must be logged in to fork a template.', variant: 'destructive' });
      return;
    }
    if (credits === null || credits.credits < template.cost) {
      toast({ title: 'Insufficient Credits', description: `You need ${template.cost} credits to fork this template.`, variant: 'destructive' });
      return;
    }
    setSelectedTemplate(template);
  };

  const handleConfirmFork = async () => {
    if (!selectedTemplate || !user || !app) return;

    setIsLoading(true);
    try {
      await spendCredits(app, selectedTemplate.cost, `Forked template: ${selectedTemplate.title}`);
      toast({
        title: 'Template Forked!',
        description: `You have successfully forked "${selectedTemplate.title}". ${selectedTemplate.cost} credits have been deducted.`,
      });
    } catch (error: any) {
      console.error('Error forking template:', error);
      toast({ title: 'Error', description: error.message || 'Could not fork the template. Please try again.', variant: 'destructive' });
    } finally {
      setIsLoading(false);
      setSelectedTemplate(null);
    }
  };
  
  const templatePlaceholders = PlaceHolderImages.filter(p => p.id.startsWith('template-'));

  return (
    <>
      <div className="flex flex-col gap-8">
        <div>
          <h1 className="font-headline text-3xl md:text-4xl font-semibold flex items-center gap-3">
            <Library className="size-8 text-accent" />
            <span>Templates Library</span>
          </h1>
          <p className="text-muted-foreground mt-2">Fork a template to get a head start on your next project.</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {isLoadingTemplates ? (
            Array.from({ length: 4 }).map((_, i) => (
                <Card key={i} className="overflow-hidden">
                    <Skeleton className="h-48 w-full" />
                    <CardHeader>
                        <Skeleton className="h-6 w-3/4" />
                        <Skeleton className="h-4 w-full mt-2" />
                    </CardHeader>
                    <CardFooter>
                        <Skeleton className="h-10 w-full" />
                    </CardFooter>
                </Card>
            ))
          ) : (
            templates.map((template, idx) => {
              const placeholder = templatePlaceholders[idx % templatePlaceholders.length];
              return (
                <Card key={template.id} className="group overflow-hidden flex flex-col justify-between transition-all duration-300 hover:shadow-xl hover:shadow-primary/10 hover:-translate-y-1">
                  {placeholder && (
                    <div className="aspect-video overflow-hidden">
                      <Image
                        src={placeholder.imageUrl}
                        alt={template.title}
                        width={600}
                        height={400}
                        data-ai-hint={placeholder.imageHint}
                        className="object-cover w-full h-full transition-transform duration-300 group-hover:scale-105"
                      />
                    </div>
                  )}
                  <div className="p-6 flex-grow">
                    <CardTitle>{template.title}</CardTitle>
                    <CardDescription className="mt-2">{template.description}</CardDescription>
                  </div>
                  <CardFooter className="p-4 bg-muted/50">
                    <Button className="w-full" onClick={() => handleForkClick(template)} disabled={!user}>
                      <GitFork className="mr-2" />
                      Fork Template ({template.cost} Credits)
                     </Button>
                  </CardFooter>
                </Card>
              );
            })
          )}
        </div>
      </div>

       <AlertDialog open={!!selectedTemplate} onOpenChange={(open) => !open && setSelectedTemplate(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirm Fork</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to fork the template "{selectedTemplate?.title}"? This will deduct <span className="font-bold text-primary">{selectedTemplate?.cost} credits</span> from your account.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isLoading}>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleConfirmFork} disabled={isLoading}>
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Confirming...
                </>
              ) : (
                'Confirm & Fork'
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
