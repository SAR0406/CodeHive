
'use client'

import type { FirebaseApp } from "firebase/app";
import type { Firestore } from "firebase/firestore";
import { collection, query, orderBy, doc, addDoc, updateDoc, serverTimestamp, Timestamp } from "firebase/firestore";
import { deductCredits } from "../credits";
import { getFunctions, httpsCallable } from "firebase/functions";

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

export async function createTask(app: FirebaseApp, userId: string, taskData: CreateTaskData) {
    // 1. Deduct credits from the creator first (held in escrow)
    await deductCredits(app, userId, taskData.credits_reward, `Created task: ${taskData.title}`);

    // 2. If deduction is successful, create the task document
    const db = app.firestore();
    const tasksCollection = collection(db, 'tasks');
    await addDoc(tasksCollection, {
        ...taskData,
        created_by: userId,
        status: 'OPEN',
        created_at: serverTimestamp(),
        updated_at: serverTimestamp(),
    });
}

export async function acceptTask(app: FirebaseApp, db: Firestore, taskId: string, userId: string) {
    const taskRef = doc(db, 'tasks', taskId);
    await updateDoc(taskRef, {
        assigned_to: userId,
        status: 'ASSIGNED',
        updated_at: serverTimestamp(),
    });
}

export async function completeTask(db: Firestore, taskId: string) {
    const taskRef = doc(db, 'tasks', taskId);
    await updateDoc(taskRef, {
        status: 'COMPLETED',
        updated_at: serverTimestamp(),
    });
}

export async function approveTask(app: FirebaseApp, taskId: string, assigneeId: string, creatorId: string, amount: number) {
    // Call the cloud function to handle the credit transfer
    const functions = getFunctions(app, 'us-central1');
    const creditTransfer = httpsCallable(functions, 'creditTransfer');
    
    await creditTransfer({
        taskId: taskId,
        assigneeId: assigneeId,
        creatorId: creatorId,
        amount: amount,
    });

    // The cloud function will update the task status to 'PAID'
}
