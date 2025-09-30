
'use client'

import type { FirebaseApp } from "firebase/app";
import type { Firestore, Timestamp } from "firebase/firestore";
import { collection, query, onSnapshot, orderBy, where } from "firebase/firestore";
import { getFunctions, httpsCallable, type HttpsCallable } from "firebase/functions";

// Main Task interface
export interface Task {
  id: string;
  title: string;
  description: string;
  tags: string[];
  credits_reward: number;
  status: 'OPEN' | 'ASSIGNED' | 'COMPLETED' | 'PAID' | 'CANCELLED';
  created_by: string; // userId
  assigned_to?: string; // userId
  created_at: Timestamp;
  updated_at: Timestamp;
}

// --- Types for callable functions ---

interface CreateTaskData {
    title: string;
    description: string;
    credits_reward: number;
    tags: string[];
}

interface TaskActionData {
    taskId: string;
}

interface FunctionResult {
    success: boolean;
    message: string;
}

// --- Callable Function References ---

const getCallable = <RequestData, ResponseData>(functionName: string): HttpsCallable<RequestData, ResponseData> => {
  const functions = getFunctions();
  return httpsCallable<RequestData, ResponseData>(functions, functionName);
};

const createTaskFn = getCallable<CreateTaskData, FunctionResult>('createTask');
const acceptTaskFn = getCallable<TaskActionData, FunctionResult>('acceptTask');
const completeTaskFn = getCallable<TaskActionData, FunctionResult>('completeTask');
const approveTaskFn = getCallable<TaskActionData, FunctionResult>('approveTask');


// --- Write Operations (using httpsCallable) ---

export async function createTask(app: FirebaseApp, taskData: CreateTaskData): Promise<FunctionResult> {
    try {
        const result = await createTaskFn(taskData);
        return result.data;
    } catch (error: any) {
        console.error("Error calling createTask:", error);
        throw new Error(error.message || 'Failed to create task.');
    }
}

export async function acceptTask(app: FirebaseApp, taskId: string): Promise<FunctionResult> {
    try {
        const result = await acceptTaskFn({ taskId });
        return result.data;
    } catch (error: any) {
        console.error("Error calling acceptTask:", error);
        throw new Error(error.message || 'Failed to accept task.');
    }
}

export async function completeTask(app: FirebaseApp, taskId: string): Promise<FunctionResult> {
    try {
        const result = await completeTaskFn({ taskId });
        return result.data;
    } catch (error: any) {
        console.error("Error calling completeTask:", error);
        throw new Error(error.message || 'Failed to complete task.');
    }
}

export async function approveTask(app: FirebaseApp, taskId: string): Promise<FunctionResult> {
    try {
        const result = await approveTaskFn({ taskId });
        return result.data;
    } catch (error: any) {
        console.error("Error calling approveTask:", error);
        throw new Error(error.message || 'Failed to approve task.');
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

export function onTasksUpdateForUser(db: Firestore, userId: string, callback: (tasks: Task[]) => void): () => void {
    const tasksCollection = collection(db, 'tasks');
    const q = query(tasksCollection, where('created_by', '==', userId), orderBy('created_at', 'desc'));

    const unsubscribe = onSnapshot(q, (querySnapshot) => {
        const fetchedTasks = querySnapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data(),
        } as Task));
        callback(fetchedTasks);
    }, (error) => {
        console.error("Error fetching real-time user tasks:", error);
        callback([]);
    });

    return unsubscribe;
}
