
'use client'

import type { FirebaseApp } from "firebase/app";
import type { Firestore, Timestamp } from "firebase/firestore";
import { collection, query, onSnapshot, orderBy, where } from "firebase/firestore";
import { getFunctions, httpsCallable, HttpsCallable, Functions } from "firebase/functions";
import { getAuth } from "firebase/auth";

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

// --- Client-side function calling ---

// This is a simplified fetcher for onRequest functions.
// In a real app, you would want a more robust setup.
const callFunction = async (app: FirebaseApp, name: string, data: any) => {
    const auth = getAuth(app);
    const user = auth.currentUser;

    if (!user) {
        throw new Error("User not authenticated.");
    }
    
    // For onRequest functions, we must handle auth manually.
    // The most secure way is to send the user's ID token in the Authorization header.
    const idToken = await user.getIdToken();
    const functions = getFunctions(app, 'us-central1');
    const endpoint = `https://us-central1-${functions.app.options.projectId}.cloudfunctions.net/${name}`;

    const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${idToken}`,
            // We pass the UID separately here as a temporary measure since verifying tokens in the CF is complex for this example
            'x-user-uid': user.uid,
        },
        body: JSON.stringify({ data }), // onRequest functions expect a {data: ...} wrapper
    });

    if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || `Function ${name} failed with status ${response.status}`);
    }

    return response.json();
}


// --- Write Operations ---

export async function createTask(app: FirebaseApp, taskData: CreateTaskData): Promise<{ success: boolean; message: string }> {
    return callFunction(app, 'createTask', taskData);
}

export async function acceptTask(app: FirebaseApp, taskId: string): Promise<{ success: boolean; message: string }> {
    return callFunction(app, 'acceptTask', { taskId });
}

export async function completeTask(app: FirebaseApp, taskId: string): Promise<{ success: boolean; message: string }> {
    return callFunction(app, 'completeTask', { taskId });
}

export async function approveTask(app: FirebaseApp, taskId: string): Promise<{ success: boolean; message: string }> {
    return callFunction(app, 'approveTask', { taskId });
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
