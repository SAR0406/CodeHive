
'use client'
import { getFunctions, httpsCallable } from "firebase/functions";
import { getFirebaseApp } from "@/firebase/config";

// It's recommended to create a dedicated file for Firebase Functions interactions.

/**
 * Deducts a specified amount of credits from a user's account.
 * 
 * IMPORTANT: This function invokes a Firebase Cloud Function. You MUST deploy
 * the corresponding Cloud Function for this to work. The function should be named
 * 'deductCredits' and handle the logic of securely decrementing the user's
 * credit balance in Firestore.
 * 
 * @param {string} userId - The ID of the user whose credits are to be deducted.
 * @param {number} amount - The number of credits to deduct.
 * @param {string} [description] - An optional description for the transaction log.
 * @returns {Promise<void>} A promise that resolves when the function is successfully called.
 * @throws {Error} Throws an error if the Cloud Function call fails.
 */
export async function deductCredits(userId: string, amount: number, description?: string): Promise<void> {
  const app = getFirebaseApp();
  const functions = getFunctions(app);
  
  // 'deductCredits' is the name of the Cloud Function you need to deploy.
  const callDeductCredits = httpsCallable(functions, 'deductCredits');

  try {
    const result = await callDeductCredits({ amount, description });
    // You can check result.data for any custom return values from your function
    if ((result.data as any).success === false) {
      throw new Error((result.data as any).error || 'Failed to deduct credits.');
    }
    console.log('Credits deducted successfully:', result.data);
  } catch (error) {
    console.error("Error calling deductCredits function:", error);
    if (error instanceof Error && error.message.includes('insufficient_balance')) {
        throw new Error('Insufficient credits');
    }
    // Re-throw the error to be handled by the calling UI component
    throw error;
  }
}

// To make this fully work, you need to deploy a Cloud Function.
// Here is an example of what that function might look like (in TypeScript):
/*
import * as functions from "firebase-functions";
import * as admin from "firebase-admin";

admin.initializeApp();

export const deductCredits = functions.https.onCall(async (data, context) => {
  // Check if the user is authenticated.
  if (!context.auth) {
    throw new functions.https.HttpsError(
      "unauthenticated",
      "The function must be called while authenticated."
    );
  }

  const { amount, description } = data;
  const uid = context.auth.uid;

  if (typeof amount !== "number" || amount <= 0) {
    throw new functions.https.HttpsError(
      "invalid-argument",
      "The 'amount' must be a positive number."
    );
  }

  const db = admin.firestore();
  const profileRef = db.collection("profiles").doc(uid);
  const transactionRef = db.collection("transactions").doc();

  try {
    await db.runTransaction(async (transaction) => {
      const profileDoc = await transaction.get(profileRef);

      if (!profileDoc.exists) {
        throw new functions.https.HttpsError("not-found", "User profile not found.");
      }

      const currentCredits = profileDoc.data()?.credits || 0;

      if (currentCredits < amount) {
        // Not enough credits
        throw new functions.https.HttpsError(
          "failed-precondition",
          "insufficient_balance"
        );
      }

      const newBalance = currentCredits - amount;

      transaction.update(profileRef, { credits: newBalance });
      
      transaction.set(transactionRef, {
        user_id: uid,
        type: 'spend',
        amount: amount,
        description: description || 'Spent credits',
        created_at: admin.firestore.FieldValue.serverTimestamp(),
        meta: {}
      });
    });

    return { success: true, message: "Credits deducted successfully." };
  } catch (error) {
    console.error("Error in deductCredits transaction:", error);
    if (error instanceof functions.https.HttpsError) {
      throw error;
    }
    throw new functions.https.HttpsError(
      "internal",
      "An unexpected error occurred while processing the transaction."
    );
  }
});
*/
