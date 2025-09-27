import * as functions from "firebase-functions";
import * as admin from "firebase-admin";

admin.initializeApp();

/**
 * A transactional cloud function to deduct credits from a user's account.
 */
export const spendCredits = functions.https.onCall(async (data, context) => {
  // 1. Authentication Check
  if (!context.auth) {
    throw new functions.https.HttpsError(
      "unauthenticated",
      "The function must be called while authenticated."
    );
  }

  const { amount, description } = data;
  const uid = context.auth.uid;

  // 2. Input Validation
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
    // 3. Transactional Update
    await db.runTransaction(async (transaction) => {
      const profileDoc = await transaction.get(profileRef);

      if (!profileDoc.exists) {
        throw new functions.https.HttpsError("not-found", "User profile not found.");
      }

      const currentCredits = profileDoc.data()?.credits || 0;

      // Check for sufficient balance
      if (currentCredits < amount) {
        throw new functions.https.HttpsError(
          "failed-precondition",
          "insufficient_balance", // Specific error code for the client
          "You do not have enough credits to complete this action."
        );
      }

      const newBalance = currentCredits - amount;

      // Update the user's profile with the new credit balance
      transaction.update(profileRef, { credits: newBalance });
      
      // 4. Log the Transaction
      transaction.set(transactionRef, {
        user_id: uid,
        type: 'spend',
        amount: amount,
        description: description || 'Spent credits',
        created_at: admin.firestore.FieldValue.serverTimestamp(),
        balance_after: newBalance,
        meta: {}
      });
    });

    return { success: true, message: "Credits deducted successfully." };
  } catch (error) {
    console.error("Error in spendCredits transaction for user:", uid, error);
    
    // Re-throw specific HTTPS errors, otherwise throw a generic internal error
    if (error instanceof functions.https.HttpsError) {
      throw error;
    }
    throw new functions.https.HttpsError(
      "internal",
      "An unexpected error occurred while processing the transaction."
    );
  }
});
