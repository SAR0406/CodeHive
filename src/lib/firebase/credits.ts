
'use client'
import { getFunctions, httpsCallable, type HttpsCallable } from "firebase/functions";
import type { FirebaseApp } from "firebase/app";

// Helper to create a callable function reference
const getCallable = <RequestData, ResponseData>(functionName: string): HttpsCallable<RequestData, ResponseData> => {
  const functions = getFunctions(); // Uses the default app instance
  return httpsCallable<RequestData, ResponseData>(functions, functionName);
};

// Types for our functions
interface SpendCreditsData {
    amount: number;
    description?: string;
}

interface UserProfileData {
    displayName?: string;
    photoURL?: string;
}

interface FunctionResult {
    success: boolean;
    message: string;
}

// Re-usable callable functions
const spendCreditsFn = getCallable<SpendCreditsData, FunctionResult>('spendCredits');
const grantProAccessFn = getCallable<void, FunctionResult>('grantProAccess');
const updateUserProfileFn = getCallable<UserProfileData, FunctionResult>('updateUserProfile');
const seedDatabaseFn = getCallable<void, FunctionResult>('seedDatabase');


/**
 * Deducts a specified amount of credits from a user's account by invoking a Firebase Cloud Function.
 */
export async function spendCredits(app: FirebaseApp, amount: number, description?: string): Promise<FunctionResult> {
  try {
    const result = await spendCreditsFn({ amount, description });
    return result.data;
  } catch (error: any) {
    console.error("spendCredits callable error:", error);
    throw new Error(error.message || 'Failed to spend credits.');
  }
}

/**
 * Grants Pro Access to the currently authenticated user.
 */
export async function grantProAccess(app: FirebaseApp): Promise<FunctionResult> {
    try {
        const result = await grantProAccessFn();
        return result.data;
    } catch (error: any) {
        console.error("grantProAccess callable error:", error);
        throw new Error(error.message || 'Failed to grant pro access.');
    }
}

/**
 * Updates a user's profile information.
 */
export async function updateUserProfile(app: FirebaseApp, profileData: UserProfileData): Promise<FunctionResult> {
    try {
        const result = await updateUserProfileFn(profileData);
        return result.data;
    } catch (error: any) {
        console.error("updateUserProfile callable error:", error);
        throw new Error(error.message || 'Failed to update profile.');
    }
}

/**
 * Seeds the database (admin only).
 */
export async function seedDatabase(app: FirebaseApp): Promise<FunctionResult> {
    try {
        const result = await seedDatabaseFn();
        return result.data;
    } catch (error: any) {
        console.error("seedDatabase callable error:", error);
        throw new Error(error.message || 'Failed to seed database.');
    }
}
