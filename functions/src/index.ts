
import * as functions from "firebase-functions";
import * as admin from "firebase-admin";

// Initialize Firebase Admin SDK first. This is critical.
admin.initializeApp();
const db = admin.firestore();

/**
 * A callable function to seed the database with initial data.
 * This is idempotent and will not overwrite existing collections.
 */
export const seedDatabase = functions.https.onCall(async (data, context) => {
    // Moved require statements inside the function to ensure they run after initialization.
    const creditPacks = require('./seed/seed-credit-packs.json');
    const learningModules = require('./seed/seed-learning-modules.json');
    const mentors = require('./seed/seed-mentors.json');
    const tasks = require('./seed/seed-tasks.json');
    const templates = require('./seed/seed-templates.json');

    // This UID should be of the first user/admin.
    const ADMIN_UID = 'REPLACE_WITH_YOUR_ADMIN_UID'; 

    if (context.auth?.uid !== ADMIN_UID) {
        throw new functions.https.HttpsError('permission-denied', 'You do not have permission to perform this action.');
    }
    
    const seedMetaRef = db.collection('internal').doc('seedStatus');
    
    try {
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
                seedData.forEach((item) => {
                    const docRef = collectionRef.doc(); 
                    if (collectionName === 'tasks') {
                        item.created_by = ADMIN_UID;
                    }
                    batch.set(docRef, { ...item, created_at: admin.firestore.FieldValue.serverTimestamp() });
                });
            }
        };

        await seedCollection('credit_packs', creditPacks);
        await seedCollection('learning_modules', learningModules);
        await seedCollection('mentors', mentors);
        await seedCollection('tasks', tasks);
        await seedCollection('templates', templates);

        batch.set(seedMetaRef, { completed: true, seeded_at: admin.firestore.FieldValue.serverTimestamp() });

        await batch.commit();
        
        return { success: true, message: 'Database seeded successfully!' };
    } catch (error) {
        console.error("Error seeding database:", error);
        if (error instanceof functions.https.HttpsError) {
          throw error;
        }
        throw new functions.https.HttpsError('internal', 'An unexpected error occurred during database seeding.', error);
    }
});


/**
 * A transactional cloud function to deduct credits from a user's account.
 */
export const spendCredits = functions.https.onCall(async (data, context) => {
  if (!context.auth) {
    throw new functions.https.HttpsError("unauthenticated", "The function must be called while authenticated.");
  }

  const { amount, description } = data;
  const uid = context.auth.uid;

  if (typeof amount !== "number" || amount <= 0) {
    throw new functions.https.HttpsError("invalid-argument", "The 'amount' must be a positive number.");
  }

  const profileRef = db.collection("profiles").doc(uid);

  try {
    await db.runTransaction(async (transaction) => {
      const profileDoc = await transaction.get(profileRef);

      if (!profileDoc.exists) {
        throw new functions.https.HttpsError("not-found", "User profile not found.");
      }

      const currentCredits = profileDoc.data()?.credits || 0;

      if (currentCredits < amount) {
        throw new functions.https.HttpsError("failed-precondition", "Insufficient credits.", { details: "insufficient_balance" });
      }

      const newBalance = currentCredits - amount;
      transaction.update(profileRef, { credits: newBalance });
      
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
    throw new functions.https.HttpsError("internal", "An unexpected error occurred while processing the transaction.", error);
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
             if (!taskDoc.exists() || taskDoc.data()?.status !== 'COMPLETED') {
                throw new functions.https.HttpsError("failed-precondition", "Task is not ready for payment.");
            }
            if (taskDoc.data()?.status === 'PAID') {
                throw new functions.https.HttpsError("failed-precondition", "This task has already been paid out.");
            }

            const assigneeCredits = assigneeDoc.data()?.credits || 0;
            const newAssigneeBalance = assigneeCredits + amount;
            transaction.update(assigneeProfileRef, { credits: newAssigneeBalance, reputation: admin.firestore.FieldValue.increment(1) });
            
            const assigneeTransactionRef = assigneeProfileRef.collection('transactions').doc();
            transaction.set(assigneeTransactionRef, {
                type: 'earn',
                amount: amount,
                description: `Reward for task: ${taskDoc.data()?.title}`,
                created_at: admin.firestore.FieldValue.serverTimestamp(),
                balance_after: newAssigneeBalance,
                meta: { taskId: taskId }
            });

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
        throw new functions.https.HttpsError("internal", "An unexpected error occurred during credit transfer.", error);
    }
});


/**
 * A callable function to securely update a user's profile.
 */
export const updateUserProfile = functions.https.onCall(async (data, context) => {
  if (!context.auth) {
    throw new functions.https.HttpsError("unauthenticated", "The function must be called while authenticated.");
  }

  const uid = context.auth.uid;
  const { displayName, photoURL } = data;

  const profileRef = db.collection("profiles").doc(uid);
  const updateData: { [key: string]: any } = {};

  if (typeof displayName === 'string' && displayName.length > 0) {
    updateData.display_name = displayName;
  }
  if (typeof photoURL === 'string' && photoURL.length > 0) {
    if (photoURL.startsWith('http://') || photoURL.startsWith('https://')) {
        updateData.photo_url = photoURL;
    }
  }
  
  if (Object.keys(updateData).length === 0) {
    throw new functions.https.HttpsError("invalid-argument", "No valid fields to update were provided.");
  }
  
  updateData.updated_at = admin.firestore.FieldValue.serverTimestamp();

  try {
    await profileRef.update(updateData);
    return { success: true, message: "Profile updated successfully." };
  } catch (error) {
    console.error("Error updating user profile for UID:", uid, error);
     if (error instanceof functions.https.HttpsError) {
      throw error;
    }
    throw new functions.https.HttpsError("internal", "An unexpected error occurred while updating the profile.", error);
  }
});


/**
 * A callable function to grant a user Pro Plan access.
 */
export const grantProAccess = functions.https.onCall(async (data, context) => {
  if (!context.auth) {
    throw new functions.https.HttpsError("unauthenticated", "The function must be called while authenticated.");
  }

  const uid = context.auth.uid;
  const profileRef = db.collection("profiles").doc(uid);
  const proCredits = 5000;

  try {
    await db.runTransaction(async (transaction) => {
        const profileDoc = await transaction.get(profileRef);
        if (!profileDoc.exists) {
             throw new functions.https.HttpsError("not-found", "User profile not found.");
        }

        const currentBalance = profileDoc.data()?.credits || 0;
        const newBalance = currentBalance + proCredits;
        
        transaction.update(profileRef, { credits: newBalance });

        const userTransactionsRef = profileRef.collection('transactions').doc();
        transaction.set(userTransactionsRef, {
            type: 'earn',
            amount: proCredits,
            description: 'Upgraded to Pro Plan',
            created_at: admin.firestore.FieldValue.serverTimestamp(),
            balance_after: newBalance,
        });
    });

    return { success: true, message: `Pro access granted. ${proCredits} credits added.` };
  } catch (error) {
    console.error("Error granting Pro access for UID:", uid, error);
    if (error instanceof functions.https.HttpsError) {
      throw error;
    }
    throw new functions.https.HttpsError("internal", "An unexpected error occurred while upgrading your plan.", error);
  }
});


/**
 * A callable function to create a new task in the marketplace.
 * It deducts credits from the creator and holds them in escrow.
 */
export const createTask = functions.https.onCall(async (data, context) => {
    if (!context.auth) {
      throw new functions.https.HttpsError("unauthenticated", "You must be logged in to create a task.");
    }

    const { title, description, credits_reward, tags } = data;
    const uid = context.auth.uid;

    if (!title || !description || typeof credits_reward !== 'number' || credits_reward <= 0) {
      throw new functions.https.HttpsError("invalid-argument", "Please provide a valid title, description, and credit reward.");
    }

    const profileRef = db.collection("profiles").doc(uid);
    const tasksRef = db.collection("tasks");

    try {
      await db.runTransaction(async (transaction) => {
        const profileDoc = await transaction.get(profileRef);
        if (!profileDoc.exists()) {
          throw new functions.https.HttpsError("not-found", "User profile not found.");
        }

        const currentCredits = profileDoc.data()?.credits || 0;
        if (currentCredits < credits_reward) {
          throw new functions.https.HttpsError("failed-precondition", "Insufficient credits to create this task.");
        }

        const newBalance = currentCredits - credits_reward;
        transaction.update(profileRef, { credits: newBalance });

        const userTransactionsRef = profileRef.collection('transactions').doc();
        transaction.set(userTransactionsRef, {
          type: 'spend',
          amount: credits_reward,
          description: `Escrow for task: ${title}`,
          created_at: admin.firestore.FieldValue.serverTimestamp(),
          balance_after: newBalance,
          meta: { escrow: true }
        });

        const newTaskRef = tasksRef.doc();
        transaction.set(newTaskRef, {
          title,
          description,
          credits_reward,
          tags: tags || [],
          created_by: uid,
          status: 'OPEN',
          created_at: admin.firestore.FieldValue.serverTimestamp(),
          updated_at: admin.firestore.FieldValue.serverTimestamp(),
        });
      });
      return { success: true };
    } catch (error) {
      console.error("Error in createTask transaction:", error);
      if (error instanceof functions.https.HttpsError) {
        throw error;
      }
      throw new functions.https.HttpsError("internal", "An unexpected error occurred while creating the task.", error);
    }
});


/**
 * A callable function for a user to accept an open task.
 */
export const acceptTask = functions.https.onCall(async (data, context) => {
    if (!context.auth) {
        throw new functions.https.HttpsError("unauthenticated", "You must be logged in to accept a task.");
    }

    const { taskId } = data;
    const uid = context.auth.uid;

    if (!taskId) {
        throw new functions.https.HttpsError("invalid-argument", "Task ID is required.");
    }

    const taskRef = db.collection('tasks').doc(taskId);
    
    try {
        await db.runTransaction(async (transaction) => {
            const taskDoc = await transaction.get(taskRef);

            if (!taskDoc.exists) {
                throw new functions.https.HttpsError("not-found", "Task not found.");
            }
            const taskData = taskDoc.data()!;

            if (taskData.status !== 'OPEN') {
                throw new functions.https.HttpsError("failed-precondition", "This task is not open for assignment.");
            }
            if (taskData.created_by === uid) {
                throw new functions.https.HttpsError("failed-precondition", "You cannot accept your own task.");
            }

            transaction.update(taskRef, {
                assigned_to: uid,
                status: 'ASSIGNED',
                updated_at: admin.firestore.FieldValue.serverTimestamp(),
            });
        });

        return { success: true };
    } catch (error) {
        console.error(`Error accepting task ${taskId} for user ${uid}:`, error);
        if (error instanceof functions.https.HttpsError) {
          throw error;
        }
        throw new functions.https.HttpsError("internal", "An unexpected error occurred while accepting the task.", error);
    }
});


/**
 * A callable function for an assignee to mark a task as complete.
 */
export const completeTask = functions.https.onCall(async (data, context) => {
    if (!context.auth) {
        throw new functions.https.HttpsError("unauthenticated", "You must be logged in.");
    }
    const { taskId } = data;
    const uid = context.auth.uid;

    if (!taskId) {
        throw new functions.https.HttpsError("invalid-argument", "Task ID is required.");
    }

    const taskRef = db.collection('tasks').doc(taskId);
    
    try {
        const taskDoc = await taskRef.get();

        if (!taskDoc.exists) {
            throw new functions.https.HttpsError("not-found", "Task not found.");
        }

        const taskData = taskDoc.data()!;

        if (taskData.assigned_to !== uid) {
            throw new functions.https.HttpsError("permission-denied", "You are not the assignee for this task.");
        }

        if (taskData.status !== 'ASSIGNED') {
            throw new functions.a("failed-precondition", "This task is not in an 'ASSIGNED' state.");
        }

        await taskRef.update({
            status: 'COMPLETED',
            updated_at: admin.firestore.FieldValue.serverTimestamp(),
        });

        return { success: true };
    } catch (error) {
        console.error(`Error completing task ${taskId} for user ${uid}:`, error);
        if (error instanceof functions.https.HttpsError) {
          throw error;
        }
        throw new functions.https.HttpsError("internal", "An unexpected error occurred while completing the task.", error);
    }
});

    

    