'use client'

import type { FirebaseApp } from "firebase/app";
import type { Firestore } from "firebase/firestore";
import { collection, query, where, doc, updateDoc, serverTimestamp, Timestamp, onSnapshot, orderBy } from "firebase/firestore";
import { getFunctions, httpsCallable, HttpsCallable } from "firebase/functions";

export interface Task {
  id: string;
  title: string;
  description: string;
  tags: string[];
  credits_reward: number;
  status: 'OPEN' | 'ASSIGNED' | 'COMPLETED' | 'CANCELLED' | 'PAID';
  created_by: string; // userId
  assigned_to?: string; // userId
  created_at: Timestamp;
  updated_at: Timestamp;
}


// --- Write Operations ---

interface CreateTaskData {
    title: string;
    description: string;
    credits_reward: number;
    tags: string[];
}

// Helper to get a callable function instance, reducing boilerplate
const getCallable = <T, U>(app: FirebaseApp, name: string): HttpsCallable<T, U> => {
    const functions = getFunctions(app, 'us-central1');
    return httpsCallable<T, U>(functions, name);
};


export async function createTask(app: FirebaseApp, taskData: CreateTaskData) {
    const callCreateTask = getCallable<CreateTaskData, { success: boolean }>(app, 'createTask');
    try {
        const result = await callCreateTask(taskData);
        if (!result.data.success) {
            throw new Error('Failed to create task on the server.');
        }
    } catch (error: any) {
        console.error("Error creating task:", error);
        // Re-throw a more user-friendly error message
        throw new Error(error.message || "An unexpected error occurred while creating the task.");
    }
}

export async function acceptTask(app: FirebaseApp, taskId: string) {
    const callAcceptTask = getCallable<{ taskId: string }, { success: boolean }>(app, 'acceptTask');
     try {
        const result = await callAcceptTask({ taskId });
         if (!result.data.success) {
            throw new Error('Failed to accept task on the server.');
        }
    } catch (error: any) {
        console.error("Error accepting task:", error);
        throw new Error(error.message || "An unexpected error occurred while accepting the task.");
    }
}

export async function completeTask(app: FirebaseApp, taskId: string) {
    const callCompleteTask = getCallable<{ taskId: string }, { success: boolean }>(app, 'completeTask');
    try {
        const result = await callCompleteTask({ taskId });
         if (!result.data.success) {
            throw new Error('Failed to complete task on the server.');
        }
    } catch (error: any) {
        console.error("Error completing task:", error);
        throw new Error(error.message || "An unexpected error occurred while completing the task.");
    }
}

export async function approveTask(app: FirebaseApp, taskId: string, assigneeId: string, creatorId: string, amount: number) {
    const callCreditTransfer = getCallable<any, any>(app, 'creditTransfer');
    try {
        const result = await callCreditTransfer({
            taskId,
            assigneeId,
            creatorId,
            amount,
        });
        if (!result.data.success) {
            throw new Error('Failed to approve task on the server.');
        }
    } catch (error: any) {
        console.error("Error approving task:", error);
        throw new Error(error.message || "An unexpected error occurred while approving the task.");
    }
}

// --- Read Operations ---
export function onTasksUpdate(db: Firestore, callback: (tasks: Task[]) => void): () => void {
    const tasksCollection = collection(db, 'tasks');
    const q = query(tasksCollection, orderBy('created_at', 'desc'));

    const unsubscribe = onSnapshot(q, (querySnapshot) => {
      if (querySnapshot.empty) {
        callback([]);
      } else {
        const fetchedTasks = querySnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
        } as Task));
        callback(fetchedTasks);
      }
    }, (error) => {
      console.error("Error fetching tasks:", error);
      callback([]);
    });

    return unsubscribe;
}


export function onTasksUpdateForUser(db: Firestore, userId: string, callback: (tasks: Task[]) => void): () => void {
    const tasksCollection = collection(db, 'tasks');
    const q = query(tasksCollection, where('created_by', '==', userId));

    const unsubscribe = onSnapshot(q, (querySnapshot) => {
        const userTasks = querySnapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data(),
        } as Task));
        callback(userTasks);
    }, (error) => {
        console.error("Error fetching user tasks:", error);
        callback([]);
    });

    return unsubscribe;
}
