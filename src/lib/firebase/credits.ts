
'use client'
import { getFunctions, httpsCallable } from "firebase/functions";
import type { FirebaseApp } from "firebase/app";

/**
 * Deducts a specified amount of credits from a user's account by invoking a Firebase Cloud Function.
 *
 * @param {FirebaseApp} app - The initialized Firebase App instance.
 * @param {string} userId - The ID of the user whose credits are to be deducted.
 * @param {number} amount - The number of credits to deduct.
 * @param {string} [description] - An optional description for the transaction log.
 * @returns {Promise<void>} A promise that resolves when the function is successfully called.
 * @throws {Error} Throws a specific 'Insufficient credits' error or a generic error if the Cloud Function call fails.
 */
export async function deductCredits(app: FirebaseApp, userId: string, amount: number, description?: string): Promise<void> {
  const functions = getFunctions(app, 'us-central1'); // Specify region if not default
  
  // 'spendCredits' is the name of the Cloud Function you need to deploy.
  const callSpendCredits = httpsCallable(functions, 'spendCredits');

  try {
    const result = await callSpendCredits({ amount, description });
    
    const data = result.data as { success: boolean, error?: string };
    if (data.success === false) {
      throw new Error(data.error || 'Failed to deduct credits.');
    }
    console.log('Credits deducted successfully:', result.data);
  } catch (error: any) {
    console.error("Error calling spendCredits function:", error);

    // Check for the specific error code from the cloud function
    if (error.code === 'functions/failed-precondition' && error.details === 'insufficient_balance') {
        throw new Error('Insufficient credits');
    }
    
    // Re-throw a generic or specific error to be handled by the calling UI component
    throw new Error(error.message || 'An unexpected error occurred while processing credits.');
  }
}
