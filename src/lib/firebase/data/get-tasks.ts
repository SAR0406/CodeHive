
'use client'

import type { FirebaseApp } from "firebase/app";
import type { Firestore, Timestamp } from "firebase/firestore";
import { collection, query, onSnapshot, orderBy, where } from "firebase/firestore";
import { getFunctions } from "firebase/functions";
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

// This is a simplified fetcher for onRequest functions.
const callFunction = async (app: FirebaseApp, name: string, data: any) => {
    const auth = getAuth(app);
    const user = auth.currentUser;

    if (!user) {
        throw new Error("User not authenticated.");
    }
    
    const idToken = await user.getIdToken();
    const functions = getFunctions(app, 'us-central1');
    const endpoint = `https://us-central1-${functions.app.options.projectId}.cloudfunctions.net/${name}`;

    const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${idToken}`,
        },
        body: JSON.stringify(data), // Send data directly
    });

    const responseData = await response.json();
    if (!response.ok) {
        throw new Error(responseData.message || `Function ${name} failed with status ${response.status}`);
    }

    return responseData;
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
