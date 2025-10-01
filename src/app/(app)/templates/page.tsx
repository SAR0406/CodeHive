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
  const [isLoadingTemplates, setIsLoadingTemplates = useState(true);

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
      
        
          
            
              
              
              
              Fork a template to get a head start on your next project.
            
          
        
          {isLoadingTemplates ? (
            Array.from({ length: 4 }).map((_, i) => (
                
                    
                    
                        
                        
                    
                    
                        
                    
                
            ))
          ) : (
            templates.map((template, idx) => {
              const placeholder = templatePlaceholders[idx % templatePlaceholders.length];
              return (
                
                  {placeholder && (
                    
                      
                         template.title}
                        width={600}
                        height={400}
                        data-ai-hint={placeholder.imageHint}
                        className="object-cover w-full h-full transition-transform duration-300 group-hover:scale-105"
                      />
                    
                  )}
                  
                    
                       template.title}
                      {template.description}
                    
                  
                  
                    
                      
                       ({template.cost} Credits)
                     
                  
                
              );
            })
          )}
        
      

       
          
            
              
                Confirm Fork
                Are you sure you want to fork the template "{selectedTemplate?.title}"? This will deduct 
                Credits from your account.
              
            
            
              Cancel
              
                
                  
                  Confirming...
                
                 
                  Confirm & Fork
                
              
            
          
        
    
  );
}
