
'use client'
import { getFunctions, httpsCallable, HttpsCallable } from "firebase/functions";
import type { FirebaseApp } from "firebase/app";

/**
 * Helper to get a callable function instance, reducing boilerplate.
 */
const getCallable = <T, U>(app: FirebaseApp, name: string): HttpsCallable<T, U> => {
    const functions = getFunctions(app, 'us-central1');
    return httpsCallable<T, U>(functions, name);
};


/**
 * Deducts a specified amount of credits from a user's account by invoking a Firebase Cloud Function.
 *
 * @param {FirebaseApp} app - The initialized Firebase App instance.
 * @param {number} amount - The number of credits to deduct.
 * @param {string} [description] - An optional description for the transaction log.
 * @returns {Promise<void>} A promise that resolves when the function is successfully called.
 * @throws {Error} Throws a specific 'Insufficient credits' error or a generic error if the Cloud Function call fails.
 */
export async function spendCredits(app: FirebaseApp, amount: number, description?: string): Promise<void> {
  const callSpendCredits = getCallable<{ amount: number, description?: string }, { success: boolean, error?: string }>(app, 'spendCredits');

  try {
    const result = await callSpendCredits({ amount, description });
    
    const data = result.data;
    if (data.success === false) {
      throw new Error(data.error || 'Failed to deduct credits.');
    }
  } catch (error: any) {
    console.error("Error calling spendCredits function:", error);
    // Re-throw a more user-friendly error message
    throw new Error(error.message || 'An unexpected error occurred while processing credits.');
  }
}

/**
 * Grants Pro Access to the currently authenticated user.
 * @param app The Firebase App instance.
 */
export async function grantProAccess(app: FirebaseApp): Promise<{ success: boolean; message: string }> {
    const callGrantPro = getCallable<void, { success: boolean, message: string }>(app, 'grantProAccess');
    try {
        const result = await callGrantPro();
        return result.data;
    } catch (error: any) {
        console.error("Error granting pro access:", error);
        throw new Error(error.message || 'Could not grant Pro access.');
    }
}

/**
 * Updates a user's profile information.
 * @param app The Firebase App instance.
 * @param profileData The data to update.
 */
export async function updateUserProfile(app: FirebaseApp, profileData: { displayName?: string, photoURL?: string }): Promise<{ success: boolean; message: string }> {
    const callUpdate = getCallable<any, { success: boolean, message: string }>(app, 'updateUserProfile');
    try {
        const result = await callUpdate(profileData);
        return result.data;
    } catch (error: any) {
        console.error("Error updating profile:", error);
        throw new Error(error.message || 'Could not update profile.');
    }
}

/**
 * Seeds the database (admin only).
 * @param app The Firebase App instance.
 */
export async function seedDatabase(app: FirebaseApp): Promise<{ success: boolean; message: string }> {
    const callSeed = getCallable<void, { success: boolean, message: string }>(app, 'seedDatabase');
    try {
        const result = await callSeed();
        return result.data;
    } catch (error: any) {
        console.error("Error seeding database:", error);
        throw new Error(error.message || 'Could not seed database.');
    }
}