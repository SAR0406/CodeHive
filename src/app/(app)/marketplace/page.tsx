
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
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { LayoutTemplate, Star, Handshake, Loader2, PlusCircle, CheckCircle, AlertTriangle, Send } from 'lucide-react';
import type { Task } from '@/lib/firebase/data/get-tasks';
import { createTaskRequest, onTaskRequestUpdate, acceptTask, completeTask, onTasksUpdate } from '@/lib/firebase/data/get-tasks';
import { useFirebase } from '@/lib/firebase/client-provider';
import { verifyTask } from '@/ai/flows/verify-task-flow';

type ActionType = 'accept' | 'complete';
type DialogType = 'create' | 'complete' | 'confirmAction';

export default function MarketplacePage() {
  const { user } = useAuth();
  const { db, app } = useFirebase();
  const { toast } = useToast();
  
  const [tasks, setTasks] = useState<Task[]>([]);
  const [isLoadingTasks, setIsLoadingTasks] = useState(true);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [actionType, setActionType] = useState<ActionType | null>(null);

  const [isActionLoading, setIsActionLoading] = useState(false);
  const [isDialogOpen, setIsDialogOpen] = useState<DialogType | null>(null);
  
  const [taskSubmission, setTaskSubmission] = useState('');


  useEffect(() => {
    if (!db) return;
    
    setIsLoadingTasks(true);
    const unsubscribe = onTasksUpdate(db, (fetchedTasks) => {
        setTasks(fetchedTasks);
        setIsLoadingTasks(false);
    });

    return () => unsubscribe();
  }, [db]);

  const handleTaskActionClick = (task: Task, action: ActionType) => {
    if (!user) {
      toast({ title: 'Authentication Error', description: 'You must be logged in.', variant: 'destructive' });
      return;
    }
    setSelectedTask(task);
    if (action === 'complete') {
        setIsDialogOpen('complete');
    } else {
        setActionType(action);
        setIsDialogOpen('confirmAction');
    }
  };
  
  const handleConfirmAccept = async () => {
    if (!selectedTask || !user || !app) return;

    setIsActionLoading(true);
    
    try {
      const result = await acceptTask(app, selectedTask.id);
      toast({ title: 'Success!', description: result.message });
    } catch (error: any) {
      console.error(`Error performing action: accept`, error);
      toast({ title: 'Action Failed', description: error.message || 'Could not complete the action. Please try again.', variant: 'destructive' });
    } finally {
      setIsActionLoading(false);
      setIsDialogOpen(null);
      setSelectedTask(null);
    }
  };

  const handleConfirmComplete = async () => {
    if (!selectedTask || !user || !app || !taskSubmission) {
      toast({ title: 'Submission is empty', description: 'Please provide proof of your work.', variant: 'destructive' });
      return;
    }

    setIsActionLoading(true);

    try {
      const result = await completeTask(app, selectedTask.id, taskSubmission);
      toast({ title: 'Task Submitted for Verification!', description: result.message });
    } catch (error: any) {
      console.error(`Error completing task:`, error);
      toast({ title: 'Submission Failed', description: error.message || 'Could not submit your work. Please try again.', variant: 'destructive' });
    } finally {
      setIsActionLoading(false);
      setIsDialogOpen(null);
      setSelectedTask(null);
      setTaskSubmission('');
    }
  }


  const handleCreateTask = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!user || !db) {
        toast({ title: 'Not Authenticated', description: 'Please log in to create a task.', variant: 'destructive' });
        return;
    };

    const formData = new FormData(e.currentTarget);
    const task_title = formData.get('task_title') as string;
    const description = formData.get('description') as string;
    const creditRewardStr = formData.get('credit_reward') as string;
    const tagsStr = formData.get('tags') as string;

    if (!task_title || !description || !creditRewardStr) {
      toast({ title: 'Missing Fields', description: 'Please fill out all required fields.', variant: 'destructive' });
      return;
    }

    const credit_reward = parseInt(creditRewardStr, 10);
    const tags = tagsStr ? tagsStr.split(',').map(tag => tag.trim().toLowerCase()).filter(Boolean) : [];

    if (isNaN(credit_reward) || credit_reward <= 0) {
      toast({ title: 'Invalid Reward', description: 'Credit reward must be a positive number.', variant: 'destructive' });
      return;
    }

    setIsActionLoading(true);

    try {
        const requestId = await createTaskRequest(db, { 
            uid: user.uid, 
            "Task title": task_title, 
            description, 
            "Credit Reward": credit_reward, 
            tags 
        });
        
        toast({
            title: "Task Submitted!",
            description: "Your task is being processed and will appear shortly."
        });
        setIsDialogOpen(null);

        // Listen for the outcome of the backend function
        const unsubscribe = onTaskRequestUpdate(db, requestId, (update) => {
            if (update.status === 'error') {
                toast({
                    title: 'Error Creating Task',
                    description: update.error || 'An unexpected error occurred.',
                    variant: 'destructive',
                });
                unsubscribe(); // Stop listening
            }
        });

    } catch (error: any) {
        toast({ title: 'Error Submitting Task', description: error.message || 'An unexpected error occurred.', variant: 'destructive' });
    } finally {
        setIsActionLoading(false);
    }
  }

  const getBadgeForStatus = (status: Task['status']) => {
    switch (status) {
        case 'OPEN':
            return <Badge variant="default" className="capitalize bg-green-500/80 hover:bg-green-500/90">{status.toLowerCase()}</Badge>;
        case 'ASSIGNED':
             return <Badge variant="secondary" className="capitalize bg-blue-500/80 hover:bg-blue-500/90 text-white">{status.toLowerCase()}</Badge>;
        case 'PENDING_APPROVAL':
            return <Badge variant="secondary" className="capitalize animate-pulse"><Loader2 className="mr-1 h-3 w-3 animate-spin" /> Verifying...</Badge>;
        case 'PAID':
            return <Badge variant="outline" className="capitalize border-green-500 text-green-500"><CheckCircle className="mr-1 h-3 w-3" /> {status.toLowerCase()}</Badge>;
        case 'CANCELLED':
        case 'REJECTED':
             return <Badge variant="destructive" className="capitalize"><AlertTriangle className="mr-1 h-3 w-3" /> {status.toLowerCase()}</Badge>;
        default:
            return <Badge variant="secondary" className="capitalize">{status || 'Unknown'}</Badge>;
    }
  }

  const getActionForTask = (task: Task) => {
    if (!user) return { label: 'Log in to Participate', action: 'accept' as ActionType, icon: Handshake, disabled: true, variant: 'secondary' as const };
    
    switch (task.status) {
      case 'OPEN':
        return { label: 'Accept Task', action: 'accept' as ActionType, icon: Handshake, disabled: task.created_by === user.uid, variant: 'default' as const };
      case 'ASSIGNED':
        if (task.assigned_to === user.uid) {
          return { label: 'Submit Work', action: 'complete' as ActionType, icon: Send, disabled: false, variant: 'default' as const };
        }
        return { label: 'Assigned', action: 'accept' as ActionType, icon: Handshake, disabled: true, variant: 'secondary' as const };
      case 'PENDING_APPROVAL':
        return { label: 'Verifying...', action: 'complete' as ActionType, icon: Loader2, disabled: true, variant: 'secondary' as const, className: 'animate-spin' };
      case 'PAID':
        return { label: 'Completed & Paid', action: 'accept' as ActionType, icon: Star, disabled: true, variant: 'outline' as const };
      case 'CANCELLED':
      case 'REJECTED':
        return { label: task.status, action: 'accept' as ActionType, icon: AlertTriangle, disabled: true, variant: 'destructive' as const };
      default:
        return { label: 'Unavailable', action: 'accept' as ActionType, icon: Handshake, disabled: true, variant: 'secondary' as const };
    }
  };

  const closeDialogs = () => {
    setIsDialogOpen(null);
    setSelectedTask(null);
    setActionType(null);
  }

  return (
    <>
      <div className="flex flex-col gap-8">
        <div className="flex justify-between items-start">
            <div>
                <h1 className="font-headline text-3xl md:text-4xl font-semibold flex items-center gap-3">
                    <LayoutTemplate className="size-8 text-accent" />
                    <span>Marketplace</span>
                </h1>
                <p className="text-muted-foreground mt-2">Find tasks, contribute to projects, and earn credits.</p>
            </div>
            <Button onClick={() => setIsDialogOpen('create')} disabled={!user}>
                <PlusCircle className="mr-2" /> Create New Task
            </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {isLoadingTasks ? (
             Array.from({ length: 6 }).map((_, i) => (
                <Card key={i}>
                    <CardHeader>
                        <Skeleton className="h-5 w-3/4" />
                        <Skeleton className="h-4 w-1/4" />
                    </CardHeader>
                    <CardContent>
                        <Skeleton className="h-10 w-full" />
                    </CardContent>
                    <CardFooter className='flex justify-between'>
                        <Skeleton className="h-8 w-24" />
                        <Skeleton className="h-10 w-32" />
                    </CardFooter>
                </Card>
             ))
          ) : (
            tasks.map((task) => {
              const { label, action, icon: Icon, disabled, variant, className } = getActionForTask(task);
              return (
                <Card key={task.id} className="flex flex-col justify-between transition-all duration-300 hover:shadow-xl hover:shadow-primary/10 hover:-translate-y-1">
                  <div>
                    <CardHeader>
                      <div className="flex justify-between items-start">
                        <CardTitle className="leading-tight">{task["Task title"]}</CardTitle>
                        {getBadgeForStatus(task.status)}
                      </div>
                      <CardDescription className="line-clamp-2">{task.description}</CardDescription>
                    </CardHeader>
                    <CardContent className="flex flex-wrap gap-2">
                      {task.tags && task.tags.map((tag: string) => (
                        <Badge key={tag} variant="outline">{tag}</Badge>
                      ))}
                    </CardContent>
                  </div>
                  <CardFooter className="flex justify-between items-center bg-muted/50 p-4 rounded-b-lg">
                    <div className="font-bold text-lg text-primary flex items-center gap-2">
                      <Star className="w-5 h-5 text-yellow-400 fill-current" />
                      {task["Credit Reward"].toLocaleString()}
                    </div>
                    <Button onClick={() => handleTaskActionClick(task, action)} disabled={disabled} variant={variant}>
                      <Icon className={`mr-2 ${className || ''}`} />
                      {label}
                    </Button>
                  </CardFooter>
                </Card>
              );
            })
          )}
        </div>
         { !isLoadingTasks && tasks.length === 0 && (
            <div className="text-center py-16 text-muted-foreground">
                <LayoutTemplate className="mx-auto h-12 w-12" />
                <h3 className="mt-4 text-lg font-semibold">No tasks in the marketplace yet.</h3>
                <p className="mt-2 text-sm">Be the first to create one!</p>
            </div>
        )}
      </div>

       <AlertDialog open={isDialogOpen === 'confirmAction'} onOpenChange={(open) => !open && closeDialogs()}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Accept Task</AlertDialogTitle>
            <AlertDialogDescription>Are you sure you want to accept the task "{selectedTask?.['Task title']}"?</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isActionLoading}>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleConfirmAccept} disabled={isActionLoading}>
              {isActionLoading ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Confirming...</> : 'Confirm'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

       <Dialog open={isDialogOpen === 'complete'} onOpenChange={(open) => !open && closeDialogs()}>
            <DialogContent>
                 <DialogHeader>
                    <DialogTitle>Submit Work for: {selectedTask?.['Task title']}</DialogTitle>
                    <DialogDescription>
                        Provide your completed work below. This will be verified by our AI supervisor.
                    </DialogDescription>
                </DialogHeader>
                <div className="py-4">
                    <Label htmlFor="submission">Proof of Work</Label>
                    <Textarea 
                        id="submission"
                        value={taskSubmission}
                        onChange={(e) => setTaskSubmission(e.target.value)}
                        placeholder="e.g., paste a link to your GitHub repo, a code snippet, or a description of what you did."
                        rows={8}
                    />
                </div>
                <DialogFooter>
                    <Button variant="outline" onClick={closeDialogs} disabled={isActionLoading}>Cancel</Button>
                    <Button onClick={handleConfirmComplete} disabled={isActionLoading}>
                        {isActionLoading ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Submitting...</> : "Submit for AI Verification"}
                    </Button>
                </DialogFooter>
            </DialogContent>
       </Dialog>

       <Dialog open={isDialogOpen === 'create'} onOpenChange={(open) => !open && setIsDialogOpen(null)}>
            <DialogContent className="sm:max-w-[525px]">
                <form onSubmit={handleCreateTask}>
                    <DialogHeader>
                        <DialogTitle>Create New Task</DialogTitle>
                        <DialogDescription>
                            Post a job to the marketplace. Credits will only be deducted when the AI supervisor approves the completed work.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="grid gap-4 py-6">
                        <div className="space-y-2">
                            <Label htmlFor="task_title">Task Title</Label>
                            <Input id="task_title" name="task_title" placeholder="e.g., Design a new logo" required />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="description">Description</Label>
                            <Textarea id="description" name="description" placeholder="Provide a detailed description of the task..." required />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="tags">Tags (comma-separated)</Label>
                            <Input id="tags" name="tags" placeholder="e.g., react, ui, design" />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="credit_reward">Credit Reward</Label>
                            <Input id="credit_reward" name="credit_reward" type="number" placeholder="e.g., 500" required />
                        </div>
                    </div>
                    <DialogFooter>
                        <Button type="button" variant="outline" onClick={() => setIsDialogOpen(null)}>Cancel</Button>
                        <Button type="submit" disabled={isActionLoading}>
                            {isActionLoading ? (
                                <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Submitting...</>
                            ) : 'Submit Task'}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
      </>
  );
}
