
'use client'

import type { FirebaseApp } from "firebase/app";
import type { Firestore } from "firebase/firestore";
import { collection, onSnapshot, query, orderBy, where, addDoc, serverTimestamp, doc } from "firebase/firestore";
import { getFunctions, httpsCallable } from "firebase/functions";

export interface Task {
  id: string;
  "Task title": string;
  description: string;
  tags: string[];
  "Credit Reward": number;
  status: 'OPEN' | 'ASSIGNED' | 'COMPLETED' | 'PAID' | 'CANCELLED' | 'processing' | 'error';
  created_by: string; // userId
  assigned_to?: string; // userId
  created_at: { seconds: number, nanoseconds: number }; // Firestore Timestamp
  updated_at?: { seconds: number, nanoseconds: number }; // Firestore Timestamp
}

// --- Types for callable functions ---

interface CreateTaskData {
    uid: string;
    "Task title": string;
    description: string;
    "Credit Reward": number;
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

// --- Write Operations ---

/**
 * Creates a task request in Firestore, which is then processed by a Cloud Function trigger.
 * This provides a more robust and scalable way to handle task creation.
 */
export async function createTaskRequest(db: Firestore, taskData: CreateTaskData): Promise<string> {
    try {
        const requestRef = await addDoc(collection(db, 'task_requests'), {
            ...taskData,
            status: 'processing',
            created_at: serverTimestamp(),
        });
        return requestRef.id;
    } catch (error: any) {
        console.error("Error creating task request:", error);
        throw new Error(error.message || 'Failed to submit task request.');
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

export function onTasksUpdate(db: Firestore, callback: (tasks: Task[]) => void): () => void {
    const q = query(collection(db, 'task_requests'), orderBy('created_at', 'desc'));

    const unsubscribe = onSnapshot(q, (snapshot) => {
        const tasks = snapshot.docs.map(doc => {
            const data = doc.data();
            // This maps the data from task_requests to the Task interface the UI expects.
            return {
                id: doc.id,
                "Task title": data["Task title"] || data.task_title, // Handle both field names
                description: data.description,
                tags: data.tags || [],
                "Credit Reward": data["Credit Reward"] || data.credit_reward, // Handle both field names
                status: data.status || 'processing',
                created_by: data.uid, // The request creator
                created_at: data.created_at,
            } as Task;
        });
        callback(tasks);
    }, (error) => {
      console.error("Error fetching real-time tasks from task_requests:", error);
      callback([]); // Send empty array on error
    });

    return unsubscribe;
}

export function onTasksUpdateForUser(db: Firestore, userId: string, callback: (tasks: Task[]) => void): () => void {
    const q = query(collection(db, 'marketplace'), where('created_by', '==', userId), orderBy('created_at', 'desc'));

    const unsubscribe = onSnapshot(q, (snapshot) => {
        const tasks = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Task));
        callback(tasks);
    }, (error) => {
        console.error("Error fetching real-time user tasks:", error);
        callback([]);
    });

    return unsubscribe;
}

/**
 * Listens to a specific task request document to provide real-time feedback on its processing status.
 * @param db - Firestore instance.
 * @param requestId - The ID of the task request document to listen to.
 * @param callback - Function to call with the status and potential error message.
 * @returns An unsubscribe function.
 */
export function onTaskRequestUpdate(db: Firestore, requestId: string, callback: (status: { status: string; error?: string }) => void): () => void {
    const requestDocRef = doc(db, 'task_requests', requestId);

    const unsubscribe = onSnapshot(requestDocRef, (docSnap) => {
        if (docSnap.exists()) {
            const data = docSnap.data();
            callback({ status: data.status, error: data.error });
        }
    }, (error) => {
        console.error("Error listening to task request:", error);
        callback({ status: 'error', error: 'Failed to listen for task status.' });
    });

    return unsubscribe;
}
