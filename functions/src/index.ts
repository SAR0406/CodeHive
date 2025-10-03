
'use server';
import * as functions from "firebase-functions";
import * as admin from "firebase-admin";
import { verifyTask } from "./ai-verify";

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
    const txRef = db.collection('transactions').doc(uid).collection('history').doc();

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
            
            transaction.set(txRef, {
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
    const txRef = db.collection('transactions').doc(uid).collection('history').doc();
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

            transaction.set(txRef, {
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
 * Tasks / Marketplace (SMART AI-SUPERVISED FLOW)
 * ------------------------
 */
export const processTaskRequest = functions.firestore.document('task_requests/{requestId}')
    .onCreate(async (snap, context) => {
        const requestData = snap.data();
        const { uid, "Task title": taskTitle, description, "Credit Reward": creditReward, tags } = requestData;

        if (!uid || !taskTitle || typeof creditReward !== 'number' || creditReward <= 0) {
            console.error("Invalid task request data:", requestData);
            return snap.ref.update({ status: 'error', error: 'Invalid task data provided.' });
        }

        const marketplaceRef = db.collection('marketplace').doc();

        try {
            await marketplaceRef.set({
                id: marketplaceRef.id,
                "Task title": taskTitle,
                description,
                "Credit Reward": creditReward,
                tags: tags || [],
                created_by: uid,
                status: 'OPEN',
                created_at: admin.firestore.FieldValue.serverTimestamp(),
                updated_at: admin.firestore.FieldValue.serverTimestamp(),
            });
            
            return snap.ref.delete();

        } catch (error: any) {
            console.error("Error processing task request:", error);
            return snap.ref.update({ status: 'error', error: error.message });
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
        
        return { success: true, message: 'Task assigned successfully!' };
    } catch (e) {
        handleError(e, "Error accepting task.");
        return { success: false, message: "Error accepting task" };
    }
});


export const completeTask = functions.https.onCall(async (data, context) => {
  const uid = assertAuth(context);
  const { taskId, submission } = data;

  if (!taskId || !submission) {
      throw new functions.https.HttpsError("invalid-argument", "Task ID and submission are required.");
  }

  const taskRef = db.collection('marketplace').doc(taskId);

  try {
    const taskDoc = await taskRef.get();
    if (!taskDoc.exists) {
        throw new functions.https.HttpsError("not-found", "Task not found.");
    }
    const taskData = taskDoc.data()!;
    if (taskData?.assigned_to !== uid) {
        throw new functions.https.HttpsError("permission-denied", "You are not the assignee for this task.");
    }
    if (taskData?.status !== 'ASSIGNED') {
        throw new functions.https.HttpsError("failed-precondition", "This task is not in an 'ASSIGNED' state.");
    }
    
    // Mark as pending while AI verifies
    await taskRef.update({
        status: 'PENDING_APPROVAL',
        submission: submission,
        updated_at: admin.firestore.FieldValue.serverTimestamp(),
    });

    // AI Verification
    const verificationResult = await verifyTask({
        taskTitle: taskData["Task title"],
        taskDescription: taskData.description,
        taskSubmission: submission,
    });

    await taskRef.update({
        verification_notes: verificationResult.verificationNotes,
        fraud_risk: verificationResult.fraudRisk
    });

    if (verificationResult.verificationStatus === 'APPROVED') {
        // Automatically trigger approval and payment
        const approveFn = functions.https.onCall(approveTask);
        await approveFn({ taskId }, { auth: context.auth });
        return { success: true, message: 'AI approved your work! Payment is being processed.' };

    } else {
        // If rejected by AI, update status
        await taskRef.update({ status: 'REJECTED' });
        throw new functions.https.HttpsError("permission-denied", `AI rejected submission: ${verificationResult.verificationNotes}`);
    }
  } catch (e) {
    handleError(e, "Error completing task.");
    return { success: false, message: (e as Error).message || "Error completing task" };
  }
});

// This function is now only called internally by completeTask, but kept separate for clarity.
export const approveTask = functions.https.onCall(async (data, context) => {
    const { taskId } = data;
    if (!taskId) {
        throw new functions.https.HttpsError("invalid-argument", "Missing a valid taskId.");
    }

    // Auth is implicitly passed when called from another function
    const authUid = context.auth?.uid;

    const taskRef = db.collection('marketplace').doc(taskId);

    try {
        return await db.runTransaction(async (transaction) => {
            const taskDoc = await transaction.get(taskRef);
            if (!taskDoc.exists) {
              throw new functions.https.HttpsError("not-found", "Task not found.");
            }
            const taskData = taskDoc.data()!;

            if (taskData.status === 'PAID') {
                return { success: true, message: 'This task has already been paid out.' };
            }

            const creatorId = taskData.created_by;
            const assigneeId = taskData.assigned_to;
            const amount = taskData["Credit Reward"];
            
            if (!assigneeId) {
                 throw new functions.https.HttpsError("failed-precondition", "Task has no assignee to pay.");
            }
            
            const creatorProfileRef = db.collection('profiles').doc(creatorId);
            const assigneeProfileRef = db.collection('profiles').doc(assigneeId);
            
            const [creatorDoc, assigneeDoc] = await Promise.all([
                transaction.get(creatorProfileRef),
                transaction.get(assigneeProfileRef)
            ]);

            if (!creatorDoc.exists()) {
                throw new functions.https.HttpsError("failed-precondition", "Task creator's profile not found.");
            }
            const creatorCredits = creatorDoc.data()?.credits ?? 0;
            if (creatorCredits < amount) {
                transaction.update(taskRef, { status: 'CANCELLED', notes: 'Task cancelled due to insufficient funds from creator.' });
                throw new functions.https.HttpsError("failed-precondition", "The task creator does not have enough credits to fund this task.");
            }
            
            if (!assigneeDoc.exists()) {
                // Refund creator if assignee doesn't exist
                transaction.update(creatorProfileRef, { credits: admin.firestore.FieldValue.increment(amount) });
                transaction.update(taskRef, { status: 'CANCELLED', notes: 'Assignee profile not found. Credits refunded to creator.'});
                return { success: false, message: "Assignee not found, creator refunded." };
            }
            
            // Perform payment
            transaction.update(creatorProfileRef, { credits: admin.firestore.FieldValue.increment(-amount) });
            transaction.update(assigneeProfileRef, { 
                credits: admin.firestore.FieldValue.increment(amount),
                reputation: admin.firestore.FieldValue.increment(1),
            });

            // Create transaction records
            const creatorTxRef = db.collection('transactions').doc(creatorId).collection('history').doc();
            transaction.set(creatorTxRef, { type: 'spend', amount, description: `Payment for task: ${taskData["Task title"]}`});
            
            const assigneeTxRef = db.collection('transactions').doc(assigneeId).collection('history').doc();
            transaction.set(assigneeTxRef, { type: 'earn', amount, description: `Reward for task: ${taskData["Task title"]}`});
            
            // Update task status
            transaction.update(taskRef, {
                status: 'PAID',
                updated_at: admin.firestore.FieldValue.serverTimestamp()
            });

            return { success: true, message: 'Credits transferred successfully.' };
        });

    } catch (e) {
        handleError(e, "Error during credit transfer.");
        // Ensure to return a compatible structure on error
        return { success: false, message: (e as functions.https.HttpsError).message || "Error during credit transfer." };
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
