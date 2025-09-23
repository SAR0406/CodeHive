
'use server';

import { db } from './client-app';
import { doc, runTransaction, serverTimestamp, collection, addDoc, updateDoc } from 'firebase/firestore';
import type { CreditData } from './credits';

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

    const creditRef = doc(db, 'credits', userId);

    await runTransaction(db, async (transaction) => {
        const creditDoc = await transaction.get(creditRef);
        if (!creditDoc.exists()) {
            throw new Error('User credit data not found.');
        }

        const creditsData = creditDoc.data() as CreditData;
        if (creditsData.balance < creditsReward) {
            throw new Error('Insufficient credits to post this task.');
        }

        // Reserve credits by moving them from balance to escrow
        const newBalance = creditsData.balance - creditsReward;
        const newEscrowBalance = creditsData.escrowBalance + creditsReward;
        transaction.update(creditRef, { balance: newBalance, escrowBalance: newEscrowBalance });

        // Create the new task document
        const tasksCol = collection(db, 'tasks');
        transaction.set(doc(tasksCol), {
            title,
            description,
            creditsReward,
            createdBy: userId,
            status: 'OPEN',
            tags: ['new'], // default tag
            createdAt: serverTimestamp(),
            updatedAt: serverTimestamp(),
        });
    });
}

/**
 * Assigns a task to a user.
 */
export async function acceptTask(taskId: string, userId: string) {
    const taskRef = doc(db, 'tasks', taskId);

    await runTransaction(db, async (transaction) => {
        const taskDoc = await transaction.get(taskRef);
        if (!taskDoc.exists()) {
            throw new Error('Task not found.');
        }

        const taskData = taskDoc.data();
        if (taskData.status !== 'OPEN') {
            throw new Error('Task is not available to be accepted.');
        }
        if (taskData.createdBy === userId) {
            throw new Error('You cannot accept your own task.');
        }

        transaction.update(taskRef, {
            assignedTo: userId,
            status: 'ASSIGNED',
            updatedAt: serverTimestamp(),
        });
    });
}

/**
 * Marks a task as complete by the assignee.
 */
export async function completeTask(taskId: string, userId:string) {
    const taskRef = doc(db, 'tasks', taskId);
    
    await runTransaction(db, async (transaction) => {
        const taskDoc = await transaction.get(taskRef);
        if (!taskDoc.exists()) { throw new Error('Task not found.'); }

        const taskData = taskDoc.data();
        if (taskData.assignedTo !== userId) { throw new Error('You are not assigned to this task.'); }
        if (taskData.status !== 'ASSIGNED') { throw new Error('Task must be in "ASSIGNED" state to be completed.'); }

        transaction.update(taskRef, {
            status: 'COMPLETED',
            updatedAt: serverTimestamp()
        });
    });
}


/**
 * Approves a completed task and releases the credits to the assignee.
 */
export async function approveTask(taskId: string, creatorId: string) {
    const taskRef = doc(db, 'tasks', taskId);

    await runTransaction(db, async (transaction) => {
        const taskDoc = await transaction.get(taskRef);
        if (!taskDoc.exists()) {
            throw new Error('Task not found.');
        }

        const taskData = taskDoc.data();
        if (taskData.createdBy !== creatorId) {
            throw new Error('Only the task creator can approve completion.');
        }
        if (taskData.status !== 'COMPLETED') {
            throw new Error('Task must be marked as "COMPLETED" by the assignee before approval.');
        }
        if (!taskData.assignedTo) {
            throw new Error('Task has no assignee to release credits to.');
        }

        const creatorCreditRef = doc(db, 'credits', creatorId);
        const assigneeCreditRef = doc(db, 'credits', taskData.assignedTo);

        // Get creator's credit doc
        const creatorCreditDoc = await transaction.get(creatorCreditRef);
        if (!creatorCreditDoc.exists()) { throw new Error('Creator credit data not found.'); }
        
        // Get assignee's credit doc, it must exist
        const assigneeCreditDoc = await transaction.get(assigneeCreditRef);
        if (!assigneeCreditDoc.exists()) { throw new Error('Assignee credit data not found.'); }

        const creatorCredits = creatorCreditDoc.data() as CreditData;
        const reward = taskData.creditsReward;

        if (creatorCredits.escrowBalance < reward) {
            // This is an integrity issue, should not happen in normal operation
            throw new Error('Insufficient credits in escrow. Please contact support.');
        }

        // Release credits from creator's escrow and add to assignee's balance
        transaction.update(creatorCreditRef, { escrowBalance: creatorCredits.escrowBalance - reward });
        transaction.update(assigneeCreditRef, { balance: increment(reward) });
        
        // Mark task as paid
        transaction.update(taskRef, { status: 'PAID', updatedAt: serverTimestamp() });

        // Create transaction record for auditing
        const transactionsCol = collection(db, 'transactions');
        transaction.set(doc(transactionsCol), {
            fromUserId: creatorId,
            toUserId: taskData.assignedTo,
            taskId,
            amount: reward,
            type: 'RELEASE',
            createdAt: serverTimestamp(),
        });
    });
}
