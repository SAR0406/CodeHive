
import * as functions from "firebase-functions";
import * as admin from "firebase-admin";

admin.initializeApp();
const db = admin.firestore();

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

  const profileRef = db.collection("profiles").doc(uid);

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
          "insufficient_balance",
          "You do not have enough credits to complete this action."
        );
      }

      const newBalance = currentCredits - amount;

      // Update the user's profile with the new credit balance
      transaction.update(profileRef, { credits: newBalance });
      
      // 4. Log the Transaction in a new subcollection for the user
      const userTransactionsRef = profileRef.collection('transactions').doc();
      transaction.set(userTransactionsRef, {
          type: 'spend',
          amount: amount,
          description: description || 'Spent credits',
          created_at: admin.firestore.FieldValue.serverTimestamp(),
          balance_after: newBalance,
      });
    });

    return { success: true, message: "Credits deducted successfully." };
  } catch (error) {
    console.error("Error in spendCredits transaction for user:", uid, error);
    
    if (error instanceof functions.https.HttpsError) {
      throw error;
    }
    throw new functions.https.HttpsError(
      "internal",
      "An unexpected error occurred while processing the transaction."
    );
  }
});


/**
 * A transactional cloud function to transfer credits from one user to another for a task.
 */
export const creditTransfer = functions.https.onCall(async (data, context) => {
    if (!context.auth) {
        throw new functions.https.HttpsError("unauthenticated", "The function must be called while authenticated.");
    }

    const { taskId, assigneeId, creatorId, amount } = data;
    const currentUserId = context.auth.uid;

    if (currentUserId !== creatorId) {
         throw new functions.https.HttpsError("permission-denied", "Only the task creator can approve payment.");
    }
    if (!taskId || !assigneeId || !creatorId || typeof amount !== 'number' || amount <= 0) {
        throw new functions.https.HttpsError("invalid-argument", "Missing or invalid arguments for credit transfer.");
    }

    const assigneeProfileRef = db.collection('profiles').doc(assigneeId);
    const taskRef = db.collection('tasks').doc(taskId);

    try {
        await db.runTransaction(async (transaction) => {
            const assigneeDoc = await transaction.get(assigneeProfileRef);
            const taskDoc = await transaction.get(taskRef);

            if (!assigneeDoc.exists) {
                throw new functions.https.HttpsError("not-found", "Assignee profile not found.");
            }
             if (!taskDoc.exists || taskDoc.data()?.status !== 'COMPLETED') {
                throw new functions.https.HttpsError("failed-precondition", "Task is not ready for payment.");
            }

            // Add credits to the assignee
            const assigneeCredits = assigneeDoc.data()?.credits || 0;
            const newAssigneeBalance = assigneeCredits + amount;
            transaction.update(assigneeProfileRef, { credits: newAssigneeBalance, reputation: admin.firestore.FieldValue.increment(1) });
            
            // Log transaction for assignee
            const assigneeTransactionRef = assigneeProfileRef.collection('transactions').doc();
            transaction.set(assigneeTransactionRef, {
                type: 'earn',
                amount: amount,
                description: `Reward for task: ${taskDoc.data()?.title}`,
                created_at: admin.firestore.FieldValue.serverTimestamp(),
                balance_after: newAssigneeBalance,
                meta: { taskId: taskId }
            });

            // Update task status to PAID
            transaction.update(taskRef, { 
                status: 'PAID',
                updated_at: admin.firestore.FieldValue.serverTimestamp(),
            });
        });
        
        return { success: true, message: 'Credits transferred successfully.' };

    } catch (error) {
        console.error("Error in creditTransfer transaction:", error);
        if (error instanceof functions.https.HttpsError) {
          throw error;
        }
        throw new functions.https.HttpsError("internal", "An unexpected error occurred during credit transfer.");
    }
});
