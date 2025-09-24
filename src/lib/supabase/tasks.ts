
'use server';

import { createClient } from './server';
import { revalidatePath } from 'next/cache';

interface CreateTaskInput {
    title: string;
    description: string;
    creditsReward: number;
    userId: string;
    tags: string[];
}

/**
 * Creates a new task and reserves the credits from the creator's account.
 */
export async function createTask(input: CreateTaskInput) {
    const { userId, title, description, creditsReward, tags } = input;

    if (creditsReward <= 0) {
        throw new Error('Credit reward must be positive.');
    }
    const supabase = createClient();
    
    // First, insert the task to get its ID
    const { data: taskData, error: insertError } = await supabase
        .from('tasks')
        .insert({
            created_by: userId,
            title,
            description,
            credits_reward: creditsReward,
            tags,
            status: 'OPEN'
        })
        .select('id')
        .single();

    if (insertError || !taskData) {
        console.error('Error creating task entry:', insertError);
        throw new Error(insertError?.message || 'Could not create the task. Please try again.');
    }

    // Now, reserve the credits using the new task's ID
    const { error: rpcError } = await supabase.rpc('reserve_credits', {
        payer: userId,
        amount: creditsReward,
        t_id: taskData.id
    });


    if (rpcError) {
        console.error("Reserve credits RPC failed:", rpcError);
        // Clean up the created task if the credit reservation fails
        await supabase.from('tasks').delete().eq('id', taskData.id);
        throw new Error(rpcError.message.includes('insufficient_balance') ? 'Insufficient credits to post this task.' : 'Could not reserve credits for the task.');
    }

    revalidatePath('/marketplace');
    return taskData;
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

    // Update the corresponding escrow record with the payee_id
    const { error: escrowUpdateError } = await supabase.from('escrows').update({ payee_id: userId }).eq('task_id', taskId);
    if (escrowUpdateError) {
        console.error("Failed to update escrow with payee:", escrowUpdateError);
        // Rollback task assignment if escrow update fails? For now, we'll just log it.
        // A more robust system would handle this rollback.
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

    const { data: task, error: fetchError } = await supabase.from('tasks').select('created_by, status').eq('id', taskId).single();

    if (fetchError || !task) { throw new Error('Task not found.'); }
    if (task.created_by !== creatorId) { throw new Error('Only the task creator can approve completion.'); }
    if (task.status !== 'COMPLETED') { throw new Error('Task must be in "COMPLETED" state to be approved.'); }
    
    // Find the corresponding escrow
    const { data: escrow, error: escrowError } = await supabase.from('escrows').select('id').eq('task_id', taskId).single();
    if(escrowError || !escrow) {
        throw new Error('Could not find the escrow for this task.');
    }

    // Use an RPC function to handle the transaction securely
    const { error: rpcError } = await supabase.rpc('release_escrow', {
        eid: escrow.id,
    });

    if (rpcError) {
        console.error("Approve task transaction failed:", rpcError);
        throw new Error(rpcError.message);
    }
    
    // Update task status to 'PAID'
    await supabase.from('tasks').update({ status: 'PAID', updated_at: new Date().toISOString() }).eq('id', taskId);

    revalidatePath('/marketplace');
}
