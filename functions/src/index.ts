
'use server';
import * as functions from "firebase-functions";
import * as admin from "firebase-admin";

admin.initializeApp();
const db = admin.firestore();

/**
 * ------------------------
 * Helpers
 * ------------------------
 */
const assertAuth = (context: functions.https.CallableContext) => {
  if (!context.auth) {
    throw new functions.https.HttpsError(
      "unauthenticated",
      "You must be logged in to perform this action."
    );
  }
  return context.auth.uid;
}

const handleError = (error: unknown, defaultMsg: string) => {
  console.error(defaultMsg, error);
  if (error instanceof functions.https.HttpsError) throw error;
  throw new functions.https.HttpsError("internal", defaultMsg, error);
}

/**
 * ------------------------
 * Seed Database (Admin Only)
 * ------------------------
 */
export const seedDatabase = functions.https.onCall(async (_data, context) => {
  try {
    const uid = assertAuth(context);
    const ADMIN_UID = functions.config().app?.admin_uid || 'REPLACE_WITH_YOUR_ADMIN_UID';

    if (uid !== ADMIN_UID) {
        throw new functions.https.HttpsError("permission-denied", "You are not authorized to perform this action.");
    }
    
    const seedMetaDoc = await db.collection("internal").doc("seedStatus").get();
    if (seedMetaDoc.exists && seedMetaDoc.data()?.completed) {
      return { success: true, message: "Database has already been seeded." };
    }

    const batch = db.batch();
    const collections: Record<string, any[]> = {
        credit_packs: require("./seed/seed-credit-packs.json"),
        learning_modules: require("./seed/seed-learning-modules.json"),
        mentors: require("./seed/seed-mentors.json"),
        marketplace: require("./seed/seed-marketplace.json"),
        templates: require("./seed/seed-templates.json"),
    };

    for (const [collectionName, data] of Object.entries(collections)) {
        const collectionRef = db.collection(collectionName);
        const snapshot = await collectionRef.limit(1).get();
        if (snapshot.empty) {
            console.log(`Seeding ${collectionName}...`);
            data.forEach((item) => {
                const docRef = collectionRef.doc();
                const newItem = { ...item, id: docRef.id, created_at: admin.firestore.FieldValue.serverTimestamp() };
                if (collectionName === 'marketplace') {
                    newItem.created_by = ADMIN_UID;
                }
                batch.set(docRef, newItem);
            });
        }
    }

    batch.set(db.collection("internal").doc("seedStatus"), { completed: true, seeded_at: admin.firestore.FieldValue.serverTimestamp() });
    await batch.commit();

    return { success: true, message: "Database seeded successfully." };

  } catch (e) {
    handleError(e, "Failed to seed database");
    return { success: false, message: "Failed to seed database" };
  }
});

/**
 * ------------------------
 * Credits
 * ------------------------
 */
export const spendCredits = functions.https.onCall(async (data, context) => {
    const uid = assertAuth(context);
    const { amount, description } = data;

    if (typeof amount !== "number" || amount <= 0) {
        throw new functions.https.HttpsError("invalid-argument", "Amount must be a positive number.");
    }

    const profileRef = db.collection('profiles').doc(uid);
    try {
        await db.runTransaction(async (transaction) => {
            const profileDoc = await transaction.get(profileRef);
            if (!profileDoc.exists) {
                throw new functions.https.HttpsError("not-found", "User profile not found.");
            }
            const currentCredits = profileDoc.data()?.credits ?? 0;
            if (currentCredits < amount) {
                throw new functions.https.HttpsError("failed-precondition", "Insufficient credits.");
            }
            const newBalance = currentCredits - amount;
            transaction.update(profileRef, { credits: newBalance });

            const userTransactionsRef = db.collection('transactions').doc(uid).collection('history').doc();
            transaction.set(userTransactionsRef, {
                type: 'spend',
                amount: amount,
                description: description || 'Spent credits',
                created_at: admin.firestore.FieldValue.serverTimestamp(),
                balance_after: newBalance,
            });
        });

        return { success: true, message: "Credits deducted successfully." };
    } catch (e) {
        handleError(e, "Error spending credits.");
        return { success: false, message: "Error spending credits" };
    }
});


export const grantProAccess = functions.https.onCall(async (data, context) => {
    const uid = assertAuth(context);
    const profileRef = db.collection('profiles').doc(uid);
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

            const userTransactionsRef = db.collection('transactions').doc(uid).collection('history').doc();
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
      handleError(e, "Error granting Pro access.");
      return { success: false, message: "Error granting Pro access" };
    }
});

/**
 * ------------------------
 * Tasks / Marketplace
 * ------------------------
 */
export const createTask = functions.https.onCall(async (data, context) => {
  const uid = assertAuth(context);
  const { task_title, description, credit_reward, tags } = data;

  if (!task_title || !description || typeof credit_reward !== "number" || credit_reward <= 0) {
    throw new functions.https.HttpsError("invalid-argument", "Please provide a valid title, description, and credit reward.");
  }

  const creatorProfileRef = db.collection('profiles').doc(uid);
  const marketplaceRef = db.collection('marketplace').doc();

  try {
    await db.runTransaction(async (transaction) => {
        const creatorDoc = await transaction.get(creatorProfileRef);
        if (!creatorDoc.exists) {
            throw new functions.https.HttpsError("not-found", "User profile not found.");
        }
        
        const currentCredits = creatorDoc.data()?.credits ?? 0;
        if (currentCredits < credit_reward) {
            throw new functions.https.HttpsError("failed-precondition", "Insufficient credits to post this task.");
        }

        // Deduct credits from creator
        const newBalance = currentCredits - credit_reward;
        transaction.update(creatorProfileRef, { credits: newBalance });

        // Create transaction record
        const txRef = db.collection('transactions').doc(uid).collection('history').doc();
        transaction.set(txRef, {
            type: 'spend',
            amount: credit_reward,
            description: `Held for task: ${task_title}`,
            created_at: admin.firestore.FieldValue.serverTimestamp(),
            balance_after: newBalance,
            meta: { escrow: true, taskId: marketplaceRef.id }
        });

        // Create task
        transaction.set(marketplaceRef, {
            id: marketplaceRef.id,
            task_title,
            description,
            credit_reward,
            tags: tags || [],
            created_by: uid,
            status: 'OPEN',
            created_at: admin.firestore.FieldValue.serverTimestamp(),
            updated_at: admin.firestore.FieldValue.serverTimestamp(),
        });
    });

    return { success: true, message: 'Task created and credits reserved.' };
  } catch (e) {
    handleError(e, "Error creating task.");
    return { success: false, message: "Error creating task" };
  }
});


export const acceptTask = functions.https.onCall(async (data, context) => {
  const assigneeId = assertAuth(context);
  const { taskId } = data;

  if (!taskId) {
      throw new functions.https.HttpsError("invalid-argument", "Task ID is required.");
  }

  const taskRef = db.collection('marketplace').doc(taskId);

  try {
    await db.runTransaction(async (transaction) => {
        const taskDoc = await transaction.get(taskRef);
        if (!taskDoc.exists) {
            throw new functions.https.HttpsError("not-found", "Task not found.");
        }
        const taskData = taskDoc.data();
        if (taskData?.status !== 'OPEN') {
            throw new functions.https.HttpsError("failed-precondition", "This task is not open for assignment.");
        }
        if (taskData?.created_by === assigneeId) {
            throw new functions.https.HttpsError("failed-precondition", "You cannot accept your own task.");
        }
        
        transaction.update(taskRef, {
            assigned_to: assigneeId,
            status: 'ASSIGNED',
            updated_at: admin.firestore.FieldValue.serverTimestamp()
        });
    });
    
    return { success: true, message: 'Task assigned successfully.' };
  } catch (e) {
    handleError(e, "Error accepting task.");
    return { success: false, message: "Error accepting task" };
  }
});

export const completeTask = functions.https.onCall(async (data, context) => {
  const uid = assertAuth(context);
  const { taskId } = data;

  if (!taskId) {
      throw new functions.https.HttpsError("invalid-argument", "Task ID is required.");
  }

  const taskRef = db.collection('marketplace').doc(taskId);

  try {
    const taskDoc = await taskRef.get();
    if (!taskDoc.exists) {
        throw new functions.https.HttpsError("not-found", "Task not found.");
    }
    const taskData = taskDoc.data();
    if (taskData?.assigned_to !== uid) {
        throw new functions.https.HttpsError("permission-denied", "You are not the assignee for this task.");
    }
    if (taskData?.status !== 'ASSIGNED') {
        throw new functions.https.HttpsError("failed-precondition", "This task is not in an 'ASSIGNED' state.");
    }
    await taskRef.update({
        status: 'COMPLETED',
        updated_at: admin.firestore.FieldValue.serverTimestamp(),
    });

    return { success: true, message: 'Task marked as complete.' };
  } catch (e) {
    handleError(e, "Error completing task.");
    return { success: false, message: "Error completing task" };
  }
});

export const approveTask = functions.https.onCall(async (data, context) => {
    const creatorId = assertAuth(context);
    const { taskId } = data;

    if (!taskId) {
        throw new functions.https.HttpsError("invalid-argument", "Missing a valid taskId.");
    }

    const taskRef = db.collection('marketplace').doc(taskId);

    try {
        await db.runTransaction(async (transaction) => {
            const taskDoc = await transaction.get(taskRef);
            if (!taskDoc.exists) {
              throw new functions.https.HttpsError("not-found", "Task not found.");
            }
            const taskData = taskDoc.data();

            if (!taskData) {
                throw new functions.https.HttpsError("not-found", "Task data not found.");
            }
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
            const amount = taskData.credit_reward;
            const assigneeProfileRef = db.collection('profiles').doc(assigneeId);
            const assigneeDoc = await transaction.get(assigneeProfileRef);

            if (!assigneeDoc.exists) {
                // If assignee doesn't exist, refund the creator
                const creatorProfileRef = db.collection('profiles').doc(creatorId);
                transaction.update(creatorProfileRef, { credits: admin.firestore.FieldValue.increment(amount) });
                transaction.update(taskRef, { 
                    status: 'CANCELLED',
                    notes: 'Assignee profile not found. Credits refunded to creator.',
                    updated_at: admin.firestore.FieldValue.serverTimestamp()
                });
                
                const creatorTxRef = db.collection('transactions').doc(creatorId).collection('history').doc();
                transaction.set(creatorTxRef, {
                    type: 'earn',
                    amount: amount,
                    description: `Refund for task: ${taskData.task_title}`,
                    created_at: admin.firestore.FieldValue.serverTimestamp(),
                     meta: {
                        refund: true,
                        taskId: taskId,
                        notes: `Refund for task: ${taskData.task_title} (assignee not found)`
                    }
                });
                return;
            }
            
            // Pay assignee
            transaction.update(assigneeProfileRef, { 
                credits: admin.firestore.FieldValue.increment(amount),
                reputation: admin.firestore.FieldValue.increment(1),
            });

            // Create transaction record for assignee
            const assigneeTxRef = db.collection('transactions').doc(assigneeId).collection('history').doc();
            transaction.set(assigneeTxRef, {
                type: 'earn',
                amount: amount,
                description: `Reward for task: ${taskData.task_title}`,
                created_at: admin.firestore.FieldValue.serverTimestamp(),
                meta: { taskId: taskId }
            });
            
            // Update task status
            transaction.update(taskRef, {
                status: 'PAID',
                updated_at: admin.firestore.FieldValue.serverTimestamp()
            });
        });

        return { success: true, message: 'Credits transferred successfully.' };

    } catch (e) {
        handleError(e, "Error during credit transfer.");
        return { success: false, message: "Error during credit transfer." };
    }
});


/**
 * ------------------------
 * Profile
 * ------------------------
 */
export const updateUserProfile = functions.https.onCall(async (data, context) => {
    const uid = assertAuth(context);
    const { displayName, photoURL } = data;
    const profileRef = db.collection('profiles').doc(uid);
    const updateData: { [key: string]: any } = {};

    try {
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

        await profileRef.update(updateData);
        return { success: true, message: "Profile updated successfully." };
    } catch (e) {
        handleError(e, "Error updating user profile.");
        return { success: false, message: "Error updating user profile." };
    }
});
