

'use client';

import { useState } from 'react';
import { useAuth } from '@/hooks/use-auth';
import { useToast } from '@/hooks/use-toast';
import { db } from '@/lib/firebase/client-app';
import { doc, updateDoc, increment } from 'firebase/firestore';

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

const templates = [
  {
    id: 'template-1',
    title: 'Modern E-commerce Storefront',
    description: 'A sleek and performant e-commerce template with a focus on user experience. Includes product pages, cart, and checkout.',
    cost: 250,
  },
  {
    id: 'template-2',
    title: 'Professional Blog',
    description: 'A clean, content-focused blog template with markdown support, categories, and a responsive design.',
    cost: 100,
  },
  {
    id: 'template-3',
    title: 'Creative Portfolio',
    description: 'A visually-driven portfolio template perfect for designers, photographers, and artists to showcase their work.',
    cost: 150,
  },
  {
    id: 'template-4',
    title: 'SaaS Landing Page',
    description: 'A high-converting landing page template for your next software-as-a-service product. Includes feature sections and pricing table.',
    cost: 200,
  },
];

type Template = (typeof templates)[0];

export default function TemplatesPage() {
  const { user, credits } = useAuth();
  const { toast } = useToast();
  const [selectedTemplate, setSelectedTemplate] = useState<Template | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleForkClick = (template: Template) => {
    if (!user) {
      toast({ title: 'Authentication Error', description: 'You must be logged in to fork a template.', variant: 'destructive' });
      return;
    }
    if (credits === null || credits < template.cost) {
      toast({ title: 'Insufficient Credits', description: `You need ${template.cost} credits to fork this template.`, variant: 'destructive' });
      return;
    }
    setSelectedTemplate(template);
  };

  const handleConfirmFork = async () => {
    if (!selectedTemplate || !user) return;

    setIsLoading(true);
    try {
      const creditRef = doc(db, 'credits', user.uid);
      await updateDoc(creditRef, {
        balance: increment(-selectedTemplate.cost),
      });
      toast({
        title: 'Template Forked!',
        description: `You have successfully forked "${selectedTemplate.title}". ${selectedTemplate.cost} credits have been deducted.`,
      });
    } catch (error) {
      console.error('Error forking template:', error);
      toast({ title: 'Error', description: 'Could not fork the template. Please try again.', variant: 'destructive' });
    } finally {
      setIsLoading(false);
      setSelectedTemplate(null);
    }
  };

  return (
    <>
      <div className="flex flex-col gap-8">
        <div>
          <h1 className="font-headline text-3xl md:text-4xl font-semibold flex items-center gap-3">
            <Library className="size-8 text-accent" />
            <span>Template Library</span>
          </h1>
          <p className="text-muted-foreground mt-2">Fork a template to get a head start on your next project.</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {templates.map((template) => {
            const placeholder = PlaceHolderImages.find((p) => p.id === template.id);
            return (
              <Card key={template.id} className="overflow-hidden group transition-all duration-300 hover:shadow-xl hover:shadow-accent/10 hover:-translate-y-1">
                {placeholder && (
                  <div className="aspect-video bg-muted overflow-hidden">
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
                <CardHeader>
                  <CardTitle className="text-xl">{template.title}</CardTitle>
                  <CardDescription>{template.description}</CardDescription>
                </CardHeader>
                <CardFooter>
                  <Button className="w-full" onClick={() => handleForkClick(template)}>
                    <GitFork className="mr-2 h-4 w-4" />
                    Fork Template ({template.cost} Credits)
                  </Button>
                </CardFooter>
              </Card>
            );
          })}
        </div>
      </div>

      <AlertDialog open={!!selectedTemplate} onOpenChange={(open) => !open && setSelectedTemplate(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirm Fork</AlertDialogTitle>
            <AlertDialogDescription>
              {`Are you sure you want to fork the template "${selectedTemplate?.title}"? This will deduct `}
              <span className="font-bold text-amber-400">{selectedTemplate?.cost} credits</span> from your account.
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
