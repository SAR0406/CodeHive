
'use client'

import type { FirebaseApp } from "firebase/app";
import type { Database } from "firebase/database";
import { ref, onValue, query, orderByChild, equalTo } from "firebase/database";
import { getFunctions, httpsCallable } from "firebase/functions";

export interface Task {
  id: string;
  task_title: string;
  description: string;
  tags: string[];
  credit_reward: number;
  status: 'OPEN' | 'ASSIGNED' | 'COMPLETED' | 'PAID' | 'CANCELLED';
  created_by: string; // userId
  assigned_to?: string; // userId
  created_at: number; // timestamp
  updated_at: number; // timestamp
}

// --- Types for callable functions ---

interface CreateTaskData {
    task_title: string;
    description: string;
    credit_reward: number;
    tags: string[];
}

interface TaskActionData {
    taskId: string;
}

interface FunctionResult {
    success: boolean;
    message: string;
}

// --- Callable Function Setup ---

const getCallable = <RequestData, ResponseData>(app: FirebaseApp, functionName: string) => {
  const functions = getFunctions(app);
  return httpsCallable<RequestData, ResponseData>(functions, functionName);
};

// --- Write Operations (using httpsCallable) ---

export async function createTask(app: FirebaseApp, taskData: CreateTaskData): Promise<FunctionResult> {
    const createTaskFn = getCallable<CreateTaskData, FunctionResult>(app, 'createTask');
    try {
        const result = await createTaskFn(taskData);
        return result.data as FunctionResult;
    } catch (error: any) {
        console.error("Error calling createTask:", error);
        throw new Error(error.message || 'Failed to create task.');
    }
}

export async function acceptTask(app: FirebaseApp, taskId: string): Promise<FunctionResult> {
    const acceptTaskFn = getCallable<TaskActionData, FunctionResult>(app, 'acceptTask');
    try {
        const result = await acceptTaskFn({ taskId });
        return result.data as FunctionResult;
    } catch (error: any) {
        console.error("Error calling acceptTask:", error);
        throw new Error(error.message || 'Failed to accept task.');
    }
}

export async function completeTask(app: FirebaseApp, taskId: string): Promise<FunctionResult> {
    const completeTaskFn = getCallable<TaskActionData, FunctionResult>(app, 'completeTask');
    try {
        const result = await completeTaskFn({ taskId });
        return result.data as FunctionResult;
    } catch (error: any) {
        console.error("Error calling completeTask:", error);
        throw new Error(error.message || 'Failed to complete task.');
    }
}

export async function approveTask(app: FirebaseApp, taskId: string): Promise<FunctionResult> {
    const approveTaskFn = getCallable<TaskActionData, FunctionResult>(app, 'approveTask');
    try {
        const result = await approveTaskFn({ taskId });
        return result.data as FunctionResult;
    } catch (error: any) {
        console.error("Error calling approveTask:", error);
        throw new Error(error.message || 'Failed to approve task.');
    }
}


// --- Real-time Read Operations ---

const snapshotToarray = (snapshot: any) => {
    const data = snapshot.val();
    if (!data) return [];
    return Object.keys(data).map(key => ({ id: key, ...data[key] })).reverse();
}

export function onTasksUpdate(db: Database, callback: (tasks: Task[]) => void): () => void {
    const tasksRef = query(ref(db, 'marketplace'), orderByChild('created_at'));

    const unsubscribe = onValue(tasksRef, (snapshot) => {
        callback(snapshotToarray(snapshot));
    }, (error) => {
      console.error("Error fetching real-time tasks:", error);
      callback([]); // Send empty array on error
    });

    return unsubscribe;
}

export function onTasksUpdateForUser(db: Database, userId: string, callback: (tasks: Task[]) => void): () => void {
    const tasksRef = query(ref(db, 'marketplace'), orderByChild('created_by'), equalTo(userId));

    const unsubscribe = onValue(tasksRef, (snapshot) => {
        callback(snapshotToarray(snapshot));
    }, (error) => {
        console.error("Error fetching real-time user tasks:", error);
        callback([]);
    });

    return unsubscribe;
}
