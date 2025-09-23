
'use client';

import { useState, useEffect } from 'react';
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
import type { Task } from '@/lib/firebase/firestore-data/get-tasks';
import { getTasks } from '@/lib/firebase/firestore-data/get-tasks';

export default function MarketplacePage() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [isLoadingTasks, setIsLoadingTasks] = useState(true);

  useEffect(() => {
    async function fetchTasks() {
      try {
        const fetchedTasks = await getTasks();
        setTasks(fetchedTasks);
      } catch (error) {
        toast({ title: 'Error', description: 'Could not load marketplace tasks.', variant: 'destructive' });
      } finally {
        setIsLoadingTasks(false);
      }
    }
    fetchTasks();
  }, [toast]);


  const handleCompleteClick = (task: Task) => {
    if (!user) {
      toast({ title: 'Authentication Error', description: 'You must be logged in to complete a task.', variant: 'destructive' });
      return;
    }
    setSelectedTask(task);
  };

  const handleConfirmCompletion = async () => {
    if (!selectedTask || !user) return;

    setIsLoading(true);
    try {
      const creditRef = doc(db, 'credits', user.uid);
      await updateDoc(creditRef, {
        balance: increment(selectedTask.credits),
      });
      toast({
        title: 'Task Completed!',
        description: `You have successfully completed "${selectedTask.title}". ${selectedTask.credits} credits have been added to your account.`,
      });
    } catch (error) {
      console.error('Error completing task:', error);
      toast({ title: 'Error', description: 'Could not complete the task. Please try again.', variant: 'destructive' });
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
          {isLoadingTasks ? (
             Array.from({ length: 6 }).map((_, i) => (
                <Card key={i}><CardContent className="p-6 h-64 flex items-center justify-center"><Loader2 className="animate-spin text-muted-foreground" /></CardContent></Card>
             ))
          ) : (
            tasks.map((task, index) => (
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
                  <Button onClick={() => handleCompleteClick(task)}>
                    <Handshake className="mr-2 h-4 w-4" />
                    Complete Task
                  </Button>
                </CardFooter>
              </Card>
            ))
          )}
        </div>
      </div>

      <AlertDialog open={!!selectedTask} onOpenChange={(open) => !open && setSelectedTask(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirm Task Completion</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to mark the task "{selectedTask?.title}" as complete? This will add{' '}
              <span className="font-bold text-amber-400">{selectedTask?.credits} credits</span> to your account.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isLoading}>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleConfirmCompletion} disabled={isLoading}>
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Confirming...
                </>
              ) : (
                'Confirm & Earn Credits'
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
