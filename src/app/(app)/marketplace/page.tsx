'use client';

import { useState } from 'react';
import { useAuth } from '@/hooks/use-auth';
import { useToast } from '@/hooks/use-toast';
import { db } from '@/lib/firebase/client-app';
import { doc, updateDoc, increment } from 'firebase/firestore';

import { Badge } from '@/components/ui/badge';
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
import { LayoutTemplate, Star, Handshake, Loader2 } from 'lucide-react';

const tasks = [
  {
    title: 'Build a landing page for a new SaaS',
    description:
      'Looking for a developer to create a responsive, modern landing page for a new project management tool. Figma designs will be provided.',
    tags: ['Landing Page', 'React', 'Tailwind CSS'],
    credits: 500,
    type: 'Bounty',
  },
  {
    title: 'Fix a bug in an e-commerce checkout flow',
    description:
      'Our checkout page has a bug where the shipping cost is not updating correctly. Need someone to investigate and fix it. The backend is Node.js and the frontend is Vue.',
    tags: ['Bug Fix', 'E-commerce', 'Vue.js'],
    credits: 150,
    type: 'Task',
  },
  {
    title: 'UI Tweaks for a mobile app dashboard',
    description:
      'Need some minor UI adjustments on our mobile dashboard screen. This includes changing colors, font sizes, and alignment. The app is built with React Native.',
    tags: ['UI/UX', 'React Native'],
    credits: 75,
    type: 'Task',
  },
  {
    title: 'Refactor a Python script for performance',
    description:
      'We have a data processing script in Python that is running slow. We need an experienced Python developer to refactor it for better performance.',
    tags: ['Refactor', 'Python', 'Performance'],
    credits: 300,
    type: 'Bounty',
  },
  {
    title: 'Create a set of custom icons',
    description:
      'We need a set of 10 custom icons for our web application. The style should be modern and minimalist. Please provide a portfolio.',
    tags: ['Design', 'Icons'],
    credits: 100,
    type: 'Task',
  },
  {
    title: 'Write documentation for a new API',
    description:
      'Looking for a technical writer to create comprehensive documentation for our new REST API. Experience with Swagger or OpenAPI is a plus.',
    tags: ['Documentation', 'API'],
    credits: 200,
    type: 'Task',
  },
];

type Task = (typeof tasks)[0];

export default function MarketplacePage() {
  const { user, credits } = useAuth();
  const { toast } = useToast();
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleClaimClick = (task: Task) => {
    if (!user) {
      toast({ title: 'Authentication Error', description: 'You must be logged in to claim a task.', variant: 'destructive' });
      return;
    }
    if (credits === null || credits < task.credits) {
      toast({ title: 'Insufficient Credits', description: `You need ${task.credits} credits to claim this task.`, variant: 'destructive' });
      return;
    }
    setSelectedTask(task);
  };

  const handleConfirmClaim = async () => {
    if (!selectedTask || !user) return;

    setIsLoading(true);
    try {
      const creditRef = doc(db, 'credits', user.uid);
      await updateDoc(creditRef, {
        balance: increment(-selectedTask.credits),
      });
      toast({
        title: 'Task Claimed!',
        description: `You have successfully claimed "${selectedTask.title}". ${selectedTask.credits} credits have been deducted.`,
      });
    } catch (error) {
      console.error('Error claiming task:', error);
      toast({ title: 'Error', description: 'Could not claim the task. Please try again.', variant: 'destructive' });
    } finally {
      setIsLoading(false);
      setSelectedTask(null);
    }
  };

  return (
    <>
      <div className="flex flex-col gap-8">
        <div>
          <h1 className="font-headline text-3xl md:text-4xl font-semibold flex items-center gap-3">
            <LayoutTemplate className="size-8 text-accent" />
            <span>Community Marketplace</span>
          </h1>
          <p className="text-muted-foreground mt-2">Find tasks, contribute to projects, and earn credits.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {tasks.map((task, index) => (
            <Card key={index} className="flex flex-col transition-all duration-300 hover:shadow-xl hover:shadow-accent/10 hover:-translate-y-1">
              <CardHeader>
                <div className="flex justify-between items-start">
                  <CardTitle className="text-lg">{task.title}</CardTitle>
                  <Badge variant={task.type === 'Bounty' ? 'default' : 'secondary'}>{task.type}</Badge>
                </div>
                <CardDescription className="line-clamp-3 pt-2">{task.description}</CardDescription>
              </CardHeader>
              <CardContent className="flex-grow">
                <div className="flex flex-wrap gap-2">
                  {task.tags.map((tag) => (
                    <Badge key={tag} variant="outline">{tag}</Badge>
                  ))}
                </div>
              </CardContent>
              <CardFooter className="flex justify-between items-center">
                <div className="flex items-center gap-2 font-bold text-lg text-amber-400">
                  <Star className="w-5 h-5 fill-current" />
                  <span>{task.credits}</span>
                </div>
                <Button onClick={() => handleClaimClick(task)}>
                  <Handshake className="mr-2 h-4 w-4" />
                  Claim Task
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      </div>

      <AlertDialog open={!!selectedTask} onOpenChange={(open) => !open && setSelectedTask(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirm Your Action</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to claim the task "{selectedTask?.title}"? This will deduct{' '}
              <span className="font-bold text-amber-400">{selectedTask?.credits} credits</span> from your account. This
              action is irreversible.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isLoading}>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleConfirmClaim} disabled={isLoading}>
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Confirming...
                </>
              ) : (
                'Confirm & Spend Credits'
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
