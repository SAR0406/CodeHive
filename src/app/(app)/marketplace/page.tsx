
'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/use-auth';
import { useToast } from '@/hooks/use-toast';
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
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { LayoutTemplate, Star, Handshake, Loader2, PlusCircle, CheckCircle } from 'lucide-react';
import type { Task } from '@/lib/supabase/data/get-tasks';
import { getTasks } from '@/lib/supabase/data/get-tasks';
import { acceptTask, approveTask, completeTask, createTask } from '@/lib/supabase/tasks';

type ActionType = 'accept' | 'complete' | 'approve';

export default function MarketplacePage() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [selectedTask, setSelectedTask] = useState<{ task: Task; action: ActionType } | null>(null);
  const [isActionLoading, setIsActionLoading] = useState(false);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [isLoadingTasks, setIsLoadingTasks] = useState(true);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isCreateLoading, setIsCreateLoading] = useState(false);

  async function fetchTasks() {
    setIsLoadingTasks(true);
    try {
      const fetchedTasks = await getTasks();
      setTasks(fetchedTasks);
    } catch (error) {
      toast({ title: 'Error', description: 'Could not load marketplace tasks.', variant: 'destructive' });
    } finally {
      setIsLoadingTasks(false);
    }
  }

  useEffect(() => {
    fetchTasks();
  }, [toast]);

  const handleTaskAction = (task: Task, action: ActionType) => {
    if (!user) {
      toast({ title: 'Authentication Error', description: 'You must be logged in.', variant: 'destructive' });
      return;
    }
    setSelectedTask({ task, action });
  };

  const handleConfirmAction = async () => {
    if (!selectedTask || !user) return;

    setIsActionLoading(true);
    const { task, action } = selectedTask;

    try {
      let resultMessage = '';
      if (action === 'accept') {
        await acceptTask(task.id, user.id);
        resultMessage = 'Task has been assigned to you.';
      } else if (action === 'complete') {
        await completeTask(task.id, user.id);
        resultMessage = 'Task marked as complete. Waiting for creator approval.';
      } else if (action === 'approve') {
        await approveTask(task.id, user.id);
        resultMessage = `Task approved! ${task.credits_reward} credits have been transferred.`;
      }
      
      toast({ title: 'Success!', description: resultMessage });
      await fetchTasks(); // Re-fetch tasks to update the UI
    } catch (error: any) {
      console.error(`Error performing action: ${action}`, error);
      toast({ title: 'Error', description: error.message || 'Could not complete the action. Please try again.', variant: 'destructive' });
    } finally {
      setIsActionLoading(false);
      setSelectedTask(null);
    }
  };
  
  const handleCreateTask = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!user) return;
    
    const formData = new FormData(e.currentTarget);
    const title = formData.get('title') as string;
    const description = formData.get('description') as string;
    const creditsReward = parseInt(formData.get('creditsReward') as string, 10);

    if (!title || !description || !creditsReward) {
      toast({ title: 'Missing Fields', description: 'Please fill out all fields.', variant: 'destructive' });
      return;
    }

    setIsCreateLoading(true);
    try {
        await createTask({ title, description, creditsReward, userId: user.id });
        toast({ title: 'Task Created!', description: 'Your task has been posted to the marketplace.' });
        setIsCreateDialogOpen(false);
        await fetchTasks();
    } catch (error: any) {
        toast({ title: 'Error Creating Task', description: error.message || 'Something went wrong.', variant: 'destructive' });
    } finally {
        setIsCreateLoading(false);
    }
  }

  const getActionForTask = (task: Task): { label: string; action: ActionType; icon: React.ElementType; disabled: boolean; variant: "default" | "secondary" | "outline" } => {
    if (!user) return { label: 'Log in to Participate', action: 'accept', icon: Handshake, disabled: true, variant: 'secondary' };

    switch (task.status) {
      case 'OPEN':
        return { label: 'Accept Task', action: 'accept', icon: Handshake, disabled: task.created_by === user.id, variant: 'default' };
      case 'ASSIGNED':
        if (task.assigned_to === user.id) {
          return { label: 'Mark as Complete', action: 'complete', icon: CheckCircle, disabled: false, variant: 'default' };
        }
        return { label: 'Assigned', action: 'accept', icon: Handshake, disabled: true, variant: 'secondary' };
      case 'COMPLETED':
        if (task.created_by === user.id) {
          return { label: 'Approve & Release Credits', action: 'approve', icon: Star, disabled: false, variant: 'default' };
        }
        return { label: 'Pending Approval', action: 'complete', icon: CheckCircle, disabled: true, variant: 'secondary' };
      case 'CANCELLED':
        return { label: 'Cancelled', action: 'accept', icon: Handshake, disabled: true, variant: 'destructive'};
      case 'PAID':
        return { label: 'Completed & Paid', action: 'accept', icon: Star, disabled: true, variant: 'outline' };
      default:
        return { label: 'No Action', action: 'accept', icon: Handshake, disabled: true, variant: 'secondary' };
    }
  };

  const getDialogText = () => {
    if (!selectedTask) return { title: '', description: '' };
    const { task, action } = selectedTask;
    switch (action) {
      case 'accept':
        return { title: 'Accept Task', description: `Are you sure you want to accept the task "${task.title}"?` };
      case 'complete':
        return { title: 'Mark as Complete', description: `Are you ready to mark "${task.title}" as complete? This will notify the creator for approval.` };
      case 'approve':
        return { title: 'Approve & Release Credits', description: `Are you sure you want to approve this work? This will transfer ${task.credits_reward} credits to the assignee.` };
      default:
        return { title: 'Confirm Action', description: 'Are you sure you want to proceed?' };
    }
  };

  return (
    <>
      <div className="flex flex-col gap-8">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="font-headline text-3xl md:text-4xl font-semibold flex items-center gap-3">
              <LayoutTemplate className="size-8 text-accent" />
              <span>Community Marketplace</span>
            </h1>
            <p className="text-muted-foreground mt-2">Find tasks, contribute to projects, and earn credits.</p>
          </div>
           <Button onClick={() => setIsCreateDialogOpen(true)}>
             <PlusCircle className="mr-2"/>
             Create New Task
           </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {isLoadingTasks ? (
             Array.from({ length: 6 }).map((_, i) => (
                <Card key={i}><CardContent className="p-6 h-64 flex items-center justify-center"><Loader2 className="animate-spin text-muted-foreground" /></CardContent></Card>
             ))
          ) : (
            tasks.map((task) => {
              const { label, action, icon: Icon, disabled, variant } = getActionForTask(task);
              return (
                <Card key={task.id} className="flex flex-col transition-all duration-300 hover:shadow-xl hover:shadow-accent/10 hover:-translate-y-1">
                  <CardHeader>
                    <div className="flex justify-between items-start">
                      <CardTitle className="text-lg">{task.title}</CardTitle>
                      <Badge variant={task.status === 'OPEN' ? 'default' : 'secondary'}>{task.status}</Badge>
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
                      <span>{task.credits_reward}</span>
                    </div>
                    <Button onClick={() => handleTaskAction(task, action)} disabled={disabled} variant={variant}>
                      <Icon className="mr-2 h-4 w-4" />
                      {label}
                    </Button>
                  </CardFooter>
                </Card>
              );
            })
          )}
        </div>
      </div>

      <AlertDialog open={!!selectedTask} onOpenChange={(open) => !open && setSelectedTask(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{getDialogText().title}</AlertDialogTitle>
            <AlertDialogDescription>{getDialogText().description}</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isActionLoading}>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleConfirmAction} disabled={isActionLoading}>
              {isActionLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Confirming...
                </>
              ) : (
                'Confirm'
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
        <DialogContent>
          <form onSubmit={handleCreateTask}>
            <DialogHeader>
              <DialogTitle>Create a New Task</DialogTitle>
              <DialogDescription>Post a job to the marketplace. Credits will be held in escrow until you approve the work.</DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="title">Task Title</Label>
                <Input id="title" name="title" placeholder="e.g., Design a new logo" required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea id="description" name="description" placeholder="Provide a detailed description of the task..." required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="creditsReward">Credit Reward</Label>
                <Input id="creditsReward" name="creditsReward" type="number" placeholder="e.g., 500" required min="1" />
              </div>
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setIsCreateDialogOpen(false)} disabled={isCreateLoading}>Cancel</Button>
              <Button type="submit" disabled={isCreateLoading}>
                {isCreateLoading ? <><Loader2 className="mr-2" /> Posting...</> : 'Post Task & Reserve Credits'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </>
  );
}
