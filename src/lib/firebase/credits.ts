
'use client'
import { getFunctions, httpsCallable, HttpsCallable } from "firebase/functions";
import type { FirebaseApp } from "firebase/app";
import { getAuth } from "firebase/auth";


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


/**
 * Deducts a specified amount of credits from a user's account by invoking a Firebase Cloud Function.
 *
 * @param {FirebaseApp} app - The initialized Firebase App instance.
 * @param {number} amount - The number of credits to deduct.
 * @param {string} [description] - An optional description for the transaction log.
 * @returns {Promise<void>} A promise that resolves when the function is successfully called.
 * @throws {Error} Throws a specific 'Insufficient credits' error or a generic error if the Cloud Function call fails.
 */
export async function spendCredits(app: FirebaseApp, amount: number, description?: string): Promise<{ success: boolean, message: string }> {
  return callFunction(app, 'spendCredits', { amount, description });
}

/**
 * Grants Pro Access to the currently authenticated user.
 * @param app The Firebase App instance.
 */
export async function grantProAccess(app: FirebaseApp): Promise<{ success: boolean; message: string }> {
    return callFunction(app, 'grantProAccess', {});
}

/**
 * Updates a user's profile information.
 * @param app The Firebase App instance.
 * @param profileData The data to update.
 */
export async function updateUserProfile(app: FirebaseApp, profileData: { displayName?: string, photoURL?: string }): Promise<{ success: boolean; message: string }> {
    return callFunction(app, 'updateUserProfile', profileData);
}

/**
 * Seeds the database (admin only).
 * @param app The Firebase App instance.
 */
export async function seedDatabase(app: FirebaseApp): Promise<{ success: boolean; message: string }> {
    return callFunction(app, 'seedDatabase', {});
}
