
import * as functions from "firebase-functions";
import * as admin from "firebase-admin";

admin.initializeApp();
const db = admin.firestore();

/**
 * ------------------------
 * Helpers
 * ------------------------
 */
function assertAuth(context: functions.https.CallableContext): string {
  if (!context.auth) {
    throw new functions.https.HttpsError(
      "unauthenticated",
      "You must be logged in to perform this action."
    );
  }
  return context.auth.uid;
}

function handleError(error: unknown, defaultMsg: string): never {
  console.error(defaultMsg, error);
  if (error instanceof functions.https.HttpsError) {
    throw error;
  }
  throw new functions.https.HttpsError("internal", defaultMsg);
}

/**
 * ------------------------
 * Seed Database (Admin Only)
 * ------------------------
 */
export const seedDatabase = functions.https.onCall(async (_data, context) => {
  // To set this, run: firebase functions:config:set app.admin_uid="YOUR_UID_HERE"
  const ADMIN_UID = functions.config().app?.admin_uid || 'REPLACE_WITH_YOUR_ADMIN_UID';

  if (context.auth?.uid !== ADMIN_UID) {
    throw new functions.https.HttpsError("permission-denied", "You are not authorized to perform this action.");
  }

  const seedMetaRef = db.collection("internal").doc("seedStatus");
  try {
    const seedMetaDoc = await seedMetaRef.get();
    if (seedMetaDoc.exists && seedMetaDoc.data()?.completed) {
      return { success: true, message: "Database has already been seeded." };
    }

    const batch = db.batch();
    const collections: Record<string, any[]> = {
      credit_packs: require("./seed/seed-credit-packs.json"),
      learning_modules: require("./seed/seed-learning-modules.json"),
      mentors: require("./seed/seed-mentors.json"),
      tasks: require("./seed/seed-tasks.json"),
      templates: require("./seed/seed-templates.json"),
    };

    for (const [collectionName, data] of Object.entries(collections)) {
      const ref = db.collection(collectionName);
      const snapshot = await ref.limit(1).get();
      if (snapshot.empty) {
        console.log(`Seeding ${collectionName}...`);
        data.forEach((item) => {
          const docRef = ref.doc();
           if (collectionName === 'tasks') {
                item.created_by = ADMIN_UID;
            }
          batch.set(docRef, {
            ...item,
            created_at: admin.firestore.FieldValue.serverTimestamp(),
          });
        });
      }
    }

    batch.set(seedMetaRef, {
      completed: true,
      seeded_at: admin.firestore.FieldValue.serverTimestamp(),
    });
    await batch.commit();

    return { success: true, message: "Database seeded successfully." };
  } catch (e) {
    return handleError(e, "Failed to seed database");
  }
});


/**
 * ------------------------
 * Spend Credits
 * ------------------------
 */
export const spendCredits = functions.https.onCall(async (data, context) => {
  const uid = assertAuth(context);
  const { amount, description } = data;

  if (typeof amount !== "number" || amount <= 0) {
    throw new functions.https.HttpsError("invalid-argument", "Amount must be a positive number.");
  }

  const profileRef = db.collection("profiles").doc(uid);

  try {
    await db.runTransaction(async (txn) => {
      const doc = await txn.get(profileRef);
      if (!doc.exists()) {
        throw new functions.https.HttpsError("not-found", "User profile not found.");
      }

      const currentCredits = doc.data()?.credits ?? 0;
      if (currentCredits < amount) {
        throw new functions.https.HttpsError("failed-precondition", "Insufficient credits.");
      }

      const newBalance = currentCredits - amount;
      txn.update(profileRef, { credits: newBalance });
      
      const userTransactionsRef = profileRef.collection('transactions').doc();
      txn.set(userTransactionsRef, {
          type: 'spend',
          amount: amount,
          description: description || 'Spent credits',
          created_at: admin.firestore.FieldValue.serverTimestamp(),
          balance_after: newBalance,
      });
    });
    return { success: true, message: "Credits deducted successfully." };
  } catch (e) {
    return handleError(e, "Error spending credits.");
  }
});


/**
 * ------------------------
 * Create Task
 * ------------------------
 */
export const createTask = functions.https.onCall(async (data, context) => {
  const uid = assertAuth(context);
  const { title, description, credits_reward, tags } = data;

  if (!title || !description || typeof credits_reward !== "number" || credits_reward <= 0) {
    throw new functions.https.HttpsError("invalid-argument", "Please provide a valid title, description, and credit reward.");
  }

  const profileRef = db.collection("profiles").doc(uid);
  const tasksRef = db.collection("tasks");

  try {
    await db.runTransaction(async (txn) => {
      const profileDoc = await txn.get(profileRef);
      if (!profileDoc.exists()) {
        throw new functions.https.HttpsError("not-found", "User profile not found.");
      }

      const currentCredits = profileDoc.data()?.credits ?? 0;
      if (currentCredits < credits_reward) {
        throw new functions.https.HttpsError("failed-precondition", "Insufficient credits to create this task.");
      }

      const newBalance = currentCredits - credits_reward;
      txn.update(profileRef, { credits: newBalance });

      const userTransactionsRef = profileRef.collection('transactions').doc();
      txn.set(userTransactionsRef, {
        type: 'spend',
        amount: credits_reward,
        description: `Escrow for task: ${title}`,
        created_at: admin.firestore.FieldValue.serverTimestamp(),
        balance_after: newBalance,
        meta: { escrow: true }
      });

      const newTaskRef = tasksRef.doc();
      txn.set(newTaskRef, {
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
    return { success: true, message: 'Task created and credits escrowed.' };
  } catch (e) {
    return handleError(e, "Error creating task.");
  }
});

/**
 * ------------------------
 * Accept Task
 * ------------------------
 */
export const acceptTask = functions.https.onCall(async (data, context) => {
    const uid = assertAuth(context);
    const { taskId } = data;

    if (!taskId) {
        throw new functions.https.HttpsError("invalid-argument", "Task ID is required.");
    }

    const taskRef = db.collection('tasks').doc(taskId);
    
    try {
        await db.runTransaction(async (transaction) => {
            const taskDoc = await transaction.get(taskRef);

            if (!taskDoc.exists()) {
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

        return { success: true, message: 'Task assigned to you.' };
    } catch (e) {
        return handleError(e, `Error accepting task ${taskId}.`);
    }
});


/**
 * ------------------------
 * Complete Task
 * ------------------------
 */
export const completeTask = functions.https.onCall(async (data, context) => {
    const uid = assertAuth(context);
    const { taskId } = data;

    if (!taskId) {
        throw new functions.https.HttpsError("invalid-argument", "Task ID is required.");
    }

    const taskRef = db.collection('tasks').doc(taskId);
    
    try {
        const taskDoc = await taskRef.get();

        if (!taskDoc.exists()) {
            throw new functions.https.HttpsError("not-found", "Task not found.");
        }

        const taskData = taskDoc.data()!;

        if (taskData.assigned_to !== uid) {
            throw new functions.https.HttpsError("permission-denied", "You are not the assignee for this task.");
        }

        if (taskData.status !== 'ASSIGNED') {
            throw new functions.https.HttpsError("failed-precondition", "This task is not in an 'ASSIGNED' state.");
        }

        await taskRef.update({
            status: 'COMPLETED',
            updated_at: admin.firestore.FieldValue.serverTimestamp(),
        });

        return { success: true, message: 'Task marked as complete.' };
    } catch (e) {
        return handleError(e, `Error completing task ${taskId}.`);
    }
});

/**
 * ------------------------
 * Credit Transfer (Approve Task)
 * ------------------------
 */
export const approveTask = functions.https.onCall(async (data, context) => {
    const creatorId = assertAuth(context);
    const { taskId } = data;
    
    if (!taskId) {
        throw new functions.https.HttpsError("invalid-argument", "Missing a valid taskId.");
    }

    const taskRef = db.collection('tasks').doc(taskId);

    try {
        await db.runTransaction(async (transaction) => {
            const taskDoc = await transaction.get(taskRef);

            if (!taskDoc.exists()) {
                throw new functions.https.HttpsError("not-found", "Task not found.");
            }
            const taskData = taskDoc.data()!;
            
            if (taskData.created_by !== creatorId) {
                throw new functions.https.HttpsError("permission-denied", "Only the task creator can approve payment.");
            }
            if (taskData.status === 'PAID') {
                throw new functions.https.HttpsError("failed-precondition", "This task has already been paid out.");
            }
            if (taskData.status !== 'COMPLETED') {
                throw new functions.https.HttpsError("failed-precondition", "Task is not completed yet.");
            }
            if (!taskData.assigned_to) {
                throw new functions.https.HttpsError("failed-precondition", "Task has no assignee to pay.");
            }
            
            const assigneeId = taskData.assigned_to;
            const amount = taskData.credits_reward;
            
            const assigneeProfileRef = db.collection('profiles').doc(assigneeId);
            const assigneeDoc = await transaction.get(assigneeProfileRef);

            if (!assigneeDoc.exists()) {
                throw new functions.https.HttpsError("not-found", "Assignee profile not found.");
            }
            
            const assigneeCredits = assigneeDoc.data()?.credits || 0;
            const newAssigneeBalance = assigneeCredits + amount;
            transaction.update(assigneeProfileRef, { credits: newAssigneeBalance, reputation: admin.firestore.FieldValue.increment(1) });
            
            const assigneeTransactionRef = assigneeProfileRef.collection('transactions').doc();
            transaction.set(assigneeTransactionRef, {
                type: 'earn',
                amount: amount,
                description: `Reward for task: ${taskData.title}`,
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

    } catch (e) {
        return handleError(e, "Error during credit transfer.");
    }
});


/**
 * ------------------------
 * Update User Profile
 * ------------------------
 */
export const updateUserProfile = functions.https.onCall(async (data, context) => {
  const uid = assertAuth(context);
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
  } catch (e) {
    return handleError(e, "Error updating user profile.");
  }
});


/**
 * ------------------------
 * Grant Pro Access
 * ------------------------
 */
export const grantProAccess = functions.https.onCall(async (data, context) => {
  const uid = assertAuth(context);
  const profileRef = db.collection("profiles").doc(uid);
  const proCredits = 5000;

  try {
    await db.runTransaction(async (transaction) => {
        const profileDoc = await transaction.get(profileRef);
        if (!profileDoc.exists()) {
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
  } catch (e) {
    return handleError(e, "Error granting Pro access.");
  }
});

    

    