
'use client'

import type { FirebaseApp } from "firebase/app";
import type { Firestore, Timestamp } from "firebase/firestore";
import { collection, query, onSnapshot, orderBy } from "firebase/firestore";
import { getFunctions, httpsCallable, HttpsCallable, Functions } from "firebase/functions";

// Main Task interface
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

// Interfaces for function arguments
interface CreateTaskData {
    title: string;
    description: string;
    credits_reward: number;
    tags: string[];
}

interface TaskActionData {
    taskId: string;
}

// Singleton for Firebase Functions instance
let functionsInstance: Functions | null = null;
const getFunctionsInstance = (app: FirebaseApp) => {
    if (!functionsInstance) {
        functionsInstance = getFunctions(app, 'us-central1');
    }
    return functionsInstance;
}

// Helper to get a callable function instance, reducing boilerplate
const getCallable = <T, U>(app: FirebaseApp, name: string): HttpsCallable<T, U> => {
    const functions = getFunctionsInstance(app);
    return httpsCallable<T, U>(functions, name);
};


// --- Write Operations ---

export async function createTask(app: FirebaseApp, taskData: CreateTaskData): Promise<{ success: boolean; message: string }> {
    const callCreateTask = getCallable<CreateTaskData, { success: boolean; message: string }>(app, 'createTask');
    try {
        const result = await callCreateTask(taskData);
        if (result.data.success === false) {
            throw new Error('Server indicated failure.');
        }
        return result.data;
    } catch (error: any) {
        console.error("Error creating task:", error);
        throw new Error(error.message || "An unexpected error occurred while creating the task.");
    }
}

export async function acceptTask(app: FirebaseApp, taskId: string): Promise<{ success: boolean; message: string }> {
    const callAcceptTask = getCallable<TaskActionData, { success: boolean; message: string }>(app, 'acceptTask');
     try {
        const result = await callAcceptTask({ taskId });
        if (result.data.success === false) {
            throw new Error('Server indicated failure.');
        }
        return result.data;
    } catch (error: any) {
        console.error("Error accepting task:", error);
        throw new Error(error.message || "An unexpected error occurred while accepting the task.");
    }
}

export async function completeTask(app: FirebaseApp, taskId: string): Promise<{ success: boolean; message: string }> {
    const callCompleteTask = getCallable<TaskActionData, { success: boolean; message: string }>(app, 'completeTask');
    try {
        const result = await callCompleteTask({ taskId });
        if (result.data.success === false) {
            throw new Error('Server indicated failure.');
        }
        return result.data;
    } catch (error: any) {
        console.error("Error completing task:", error);
        throw new Error(error.message || "An unexpected error occurred while completing the task.");
    }
}

export async function approveTask(app: FirebaseApp, taskId: string): Promise<{ success: boolean; message: string }> {
    const callApproveTask = getCallable<TaskActionData, { success: boolean; message: string }>(app, 'approveTask');
    try {
        const result = await callApproveTask({ taskId });
        if (result.data.success === false) {
            throw new Error('Server indicated failure.');
        }
        return result.data;
    } catch (error: any) {
        console.error("Error approving task:", error);
        throw new Error(error.message || "An unexpected error occurred while approving the task.");
    }
}


// --- Real-time Read Operations ---

export function onTasksUpdate(db: Firestore, callback: (tasks: Task[]) => void): () => void {
    const tasksCollection = collection(db, 'tasks');
    const q = query(tasksCollection, orderBy('created_at', 'desc'));

    const unsubscribe = onSnapshot(q, (querySnapshot) => {
      const fetchedTasks = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
      } as Task));
      callback(fetchedTasks);
    }, (error) => {
      console.error("Error fetching real-time tasks:", error);
      callback([]); // Send empty array on error
    });

    return unsubscribe;
}

    