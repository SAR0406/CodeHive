
'use server';

import { createClient } from './server';
import { revalidatePath } from 'next/cache';

interface CreateTaskInput {
    title: string;
    description: string;
    creditsReward: number;
    userId: string;
}

/**
 * Creates a new task and reserves the credits from the creator's account.
 */
export async function createTask(input: CreateTaskInput) {
    const { userId, title, description, creditsReward } = input;

    if (creditsReward <= 0) {
        throw new Error('Credit reward must be positive.');
    }
    const supabase = createClient();
    
    // Use an RPC function to handle the transaction securely
    const { error } = await supabase.rpc('create_task_and_reserve_credits', {
        creator_id: userId,
        task_title: title,
        task_description: description,
        reward: creditsReward,
        task_tags: ['new']
    });

    if (error) {
        console.error("Create task transaction failed:", error);
        throw new Error(error.message);
    }
    revalidatePath('/marketplace');
}

/**
 * Assigns a task to a user.
 */
export async function acceptTask(taskId: string, userId: string) {
    const supabase = createClient();
    const { data: task, error: fetchError } = await supabase.from('tasks').select('created_by, status').eq('id', taskId).single();

    if (fetchError || !task) {
        throw new Error('Task not found.');
    }
    if (task.status !== 'OPEN') {
        throw new Error('Task is not available to be accepted.');
    }
    if (task.created_by === userId) {
        throw new Error('You cannot accept your own task.');
    }

    const { error: updateError } = await supabase.from('tasks').update({
        assigned_to: userId,
        status: 'ASSIGNED',
        updated_at: new Date().toISOString()
    }).eq('id', taskId);

    if (updateError) {
        console.error("Failed to accept task:", updateError);
        throw new Error('Could not accept the task. Please try again.');
    }
    revalidatePath('/marketplace');
}

/**
 * Marks a task as complete by the assignee.
 */
export async function completeTask(taskId: string, userId:string) {
    const supabase = createClient();
    const { data: task, error: fetchError } = await supabase.from('tasks').select('assigned_to, status').eq('id', taskId).single();
    
    if (fetchError || !task) { throw new Error('Task not found.'); }
    if (task.assigned_to !== userId) { throw new Error('You are not assigned to this task.'); }
    if (task.status !== 'ASSIGNED') { throw new Error('Task must be in "ASSIGNED" state to be completed.'); }

    const { error: updateError } = await supabase.from('tasks').update({
        status: 'COMPLETED',
        updated_at: new Date().toISOString()
    }).eq('id', taskId);
    
    if (updateError) {
        console.error("Failed to complete task:", updateError);
        throw new Error('Could not complete the task. Please try again.');
    }
    revalidatePath('/marketplace');
}


/**
 * Approves a completed task and releases the credits to the assignee.
 */
export async function approveTask(taskId: string, creatorId: string) {
    const supabase = createClient();

    // Use an RPC function to handle the transaction securely
    const { error } = await supabase.rpc('approve_task_and_release_credits', {
        task_id_input: taskId,
        creator_id_input: creatorId
    });

    if (error) {
        console.error("Approve task transaction failed:", error);
        throw new Error(error.message);
    }

    revalidatePath('/marketplace');
}
