
import * as functions from "firebase-functions";
import * as admin from "firebase-admin";

admin.initializeApp();
const db = admin.firestore();

// Import seed data
const creditPacks = require('./seed/seed-credit-packs.json');
const learningModules = require('./seed/seed-learning-modules.json');
const mentors = require('./seed/seed-mentors.json');
const tasks = require('./seed/seed-tasks.json');
const templates = require('./seed/seed-templates.json');


/**
 * A callable function to seed the database with initial data.
 * This is idempotent and will not overwrite existing collections.
 */
export const seedDatabase = functions.https.onCall(async (data, context) => {
    // This UID should be of the first user/admin.
    // In a real app, you'd use custom claims to authorize this.
    const ADMIN_UID = 'REPLACE_WITH_YOUR_ADMIN_UID'; 

    if (context.auth?.uid !== ADMIN_UID) {
        throw new functions.https.HttpsError('permission-denied', 'You do not have permission to perform this action.');
    }
    
    // Check if seeding has already been done
    const seedMetaRef = db.collection('internal').doc('seedStatus');
    const seedMetaDoc = await seedMetaRef.get();
    if (seedMetaDoc.exists && seedMetaDoc.data()?.completed) {
         return { success: true, message: 'Database has already been seeded.' };
    }

    const batch = db.batch();

    const seedCollection = async (collectionName: string, seedData: any[]) => {
        const collectionRef = db.collection(collectionName);
        const snapshot = await collectionRef.limit(1).get();
        if (snapshot.empty) {
            console.log(`Seeding ${collectionName}...`);
            seedData.forEach((item, index) => {
                // For tasks, replace placeholder user with admin user
                if (collectionName === 'tasks') {
                    item.created_by = ADMIN_UID;
                }
                const docRef = collectionRef.doc(`${index + 1}`);
                batch.set(docRef, { ...item, created_at: admin.firestore.FieldValue.serverTimestamp() });
            });
        }
    };

    try {
        await seedCollection('credit_packs', creditPacks);
        await seedCollection('learning_modules', learningModules);
        await seedCollection('mentors', mentors);
        await seedCollection('tasks', tasks);
        await seedCollection('templates', templates);

        // Mark seeding as complete
        batch.set(seedMetaRef, { completed: true, seeded_at: admin.firestore.FieldValue.serverTimestamp() });

        await batch.commit();
        
        return { success: true, message: 'Database seeded successfully!' };
    } catch (error) {
        console.error("Error seeding database:", error);
        throw new functions.https.HttpsError('internal', 'An unexpected error occurred during database seeding.');
    }
});


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


/**
 * A callable function to securely update a user's profile.
 */
export const updateUserProfile = functions.https.onCall(async (data, context) => {
  if (!context.auth) {
    throw new functions.https.HttpsError(
      "unauthenticated",
      "The function must be called while authenticated."
    );
  }

  const uid = context.auth.uid;
  const { displayName, photoURL } = data;

  const profileRef = db.collection("profiles").doc(uid);
  const updateData: { [key: string]: any } = {};

  // Validate and build the update object
  if (typeof displayName === 'string' && displayName.length > 0) {
    updateData.display_name = displayName;
  }
  if (typeof photoURL === 'string' && photoURL.length > 0) {
    // A basic check for a URL format. In a real app, you might want more robust validation.
    if (photoURL.startsWith('http://') || photoURL.startsWith('https://')) {
        updateData.photo_url = photoURL;
    }
  }
  
  if (Object.keys(updateData).length === 0) {
    throw new functions.https.HttpsError(
        "invalid-argument",
        "No valid fields to update were provided."
    );
  }
  
  updateData.updated_at = admin.firestore.FieldValue.serverTimestamp();

  try {
    await profileRef.update(updateData);
    return { success: true, message: "Profile updated successfully." };
  } catch (error) {
    console.error("Error updating user profile for UID:", uid, error);
    throw new functions.https.HttpsError(
      "internal",
      "An unexpected error occurred while updating the profile."
    );
  }
});
