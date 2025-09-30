
'use server';
import * as functions from "firebase-functions";
import * as admin from "firebase-admin";

admin.initializeApp();
const rtdb = admin.database();

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
    
    const seedMetaRef = rtdb.ref("internal/seedStatus");
    const seedMetaDoc = await seedMetaRef.once("value");
    if (seedMetaDoc.exists() && seedMetaDoc.val()?.completed) {
      return { success: true, message: "Database has already been seeded." };
    }

    const updates: Record<string, any> = {};
    const collections: Record<string, any[]> = {
        credit_packs: require("./seed/seed-credit-packs.json"),
        learning_modules: require("./seed/seed-learning-modules.json"),
        mentors: require("./seed/seed-mentors.json"),
        marketplace: require("./seed/seed-marketplace.json"),
        templates: require("./seed/seed-templates.json"),
    };

    for (const [collectionName, data] of Object.entries(collections)) {
        const ref = rtdb.ref(collectionName);
        const snapshot = await ref.limitToFirst(1).once("value");
        if (!snapshot.exists()) {
            console.log(`Seeding ${collectionName}...`);
            data.forEach((item) => {
                const docRef = ref.push();
                const newItem = { ...item, id: docRef.key, created_at: admin.database.ServerValue.TIMESTAMP };
                 if (collectionName === 'marketplace') {
                    newItem.created_by = ADMIN_UID;
                }
                updates[`${collectionName}/${docRef.key}`] = newItem;
            });
        }
    }

    updates["internal/seedStatus"] = { completed: true, seeded_at: admin.database.ServerValue.TIMESTAMP };
    await rtdb.ref().update(updates);

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

    const profileRef = rtdb.ref(`profiles/${uid}`);
    try {
        await profileRef.transaction((profile) => {
            if (profile) {
                const currentCredits = profile.credits ?? 0;
                if (currentCredits < amount) {
                    // Not enough credits, abort transaction
                    return; 
                }
                const newBalance = currentCredits - amount;
                profile.credits = newBalance;

                // Record transaction
                const userTransactionsRef = rtdb.ref(`transactions/${uid}`).push();
                userTransactionsRef.set({
                    type: 'spend',
                    amount: amount,
                    description: description || 'Spent credits',
                    created_at: admin.database.ServerValue.TIMESTAMP,
                    balance_after: newBalance,
                });
                return profile;
            }
        });
        return { success: true, message: "Credits deducted successfully." };
    } catch (e) {
        handleError(e, "Error spending credits.");
        return { success: false, message: "Error spending credits" };
    }
});


export const grantProAccess = functions.https.onCall(async (data, context) => {
    const uid = assertAuth(context);
    const profileRef = rtdb.ref(`profiles/${uid}`);
    const proCredits = 5000;

    try {
      await profileRef.transaction((profile) => {
        if (profile) {
            const currentBalance = profile.credits || 0;
            const newBalance = currentBalance + proCredits;
            profile.credits = newBalance;

            const userTransactionsRef = rtdb.ref(`transactions/${uid}`).push();
            userTransactionsRef.set({
                type: 'earn',
                amount: proCredits,
                description: 'Upgraded to Pro Plan',
                created_at: admin.database.ServerValue.TIMESTAMP,
                balance_after: newBalance,
            });
            return profile;
        }
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

  const profileRef = rtdb.ref(`profiles/${uid}`);
  
  try {
    const profileSnap = await profileRef.once('value');
    if (!profileSnap.exists()) {
         throw new functions.https.HttpsError("not-found", "User profile not found.");
    }
    const currentCredits = profileSnap.val().credits ?? 0;
    if (currentCredits < credit_reward) {
        throw new functions.https.HttpsError("failed-precondition", "Insufficient credits to create this task.");
    }

    const newBalance = currentCredits - credit_reward;
    const newTaskRef = rtdb.ref('marketplace').push();
    const newTaskId = newTaskRef.key;

    const updates: Record<string, any> = {};
    // 1. Update profile credits
    updates[`/profiles/${uid}/credits`] = newBalance;
    // 2. Add transaction log
    const txRef = rtdb.ref(`transactions/${uid}`).push();
    updates[`/transactions/${uid}/${txRef.key}`] = {
        type: 'spend',
        amount: credit_reward,
        description: `Escrow for task: ${task_title}`,
        created_at: admin.database.ServerValue.TIMESTAMP,
        balance_after: newBalance,
        meta: { escrow: true, taskId: newTaskId }
    };
    // 3. Create task
    updates[`/marketplace/${newTaskId}`] = {
        id: newTaskId,
        task_title: task_title,
        description: description,
        credit_reward: credit_reward,
        tags: tags || [],
        created_by: uid,
        status: 'OPEN',
        created_at: admin.database.ServerValue.TIMESTAMP,
        updated_at: admin.database.ServerValue.TIMESTAMP,
    };
    
    await rtdb.ref().update(updates);

    return { success: true, message: 'Task created and credits escrowed.' };
  } catch (e) {
    handleError(e, "Error creating task.");
    return { success: false, message: "Error creating task" };
  }
});


export const acceptTask = functions.https.onCall(async (data, context) => {
  const uid = assertAuth(context);
  const { taskId } = data;

  if (!taskId) {
      throw new functions.https.HttpsError("invalid-argument", "Task ID is required.");
  }

  const taskRef = rtdb.ref(`marketplace/${taskId}`);

  try {
    const result = await taskRef.transaction(task => {
        if (task) {
             if (!task) {
                throw new functions.https.HttpsError("not-found", "Task not found.");
            }
            if (task.status !== 'OPEN') {
                throw new functions.https.HttpsError("failed-precondition", "This task is not open for assignment.");
            }
            if (task.created_by === uid) {
                throw new functions.https.HttpsError("failed-precondition", "You cannot accept your own task.");
            }
            task.assigned_to = uid;
            task.status = 'ASSIGNED';
            task.updated_at = admin.database.ServerValue.TIMESTAMP;
            return task;
        }
        return task;
    });

    if (!result.committed) {
         throw new functions.https.HttpsError("aborted", "Could not accept task, it may have been modified.");
    }
    
    return { success: true, message: 'Task assigned to you.' };
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

  const taskRef = rtdb.ref(`marketplace/${taskId}`);

  try {
    const taskDoc = await taskRef.once("value");

    if (!taskDoc.exists()) {
        throw new functions.https.HttpsError("not-found", "Task not found.");
    }

    const taskData = taskDoc.val();
    if (taskData.assigned_to !== uid) {
        throw new functions.https.HttpsError("permission-denied", "You are not the assignee for this task.");
    }
    if (taskData.status !== 'ASSIGNED') {
        throw new functions.https.HttpsError("failed-precondition", "This task is not in an 'ASSIGNED' state.");
    }

    await taskRef.update({
        status: 'COMPLETED',
        updated_at: admin.database.ServerValue.TIMESTAMP,
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

    const taskRef = rtdb.ref(`marketplace/${taskId}`);

    try {
       const taskSnap = await taskRef.once('value');
       const taskData = taskSnap.val();

        if (!taskData) {
            throw new functions.https.HttpsError("not-found", "Task not found.");
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
        const assigneeProfileRef = rtdb.ref(`profiles/${assigneeId}`);
        const assigneeSnap = await assigneeProfileRef.once('value');

        const updates: Record<string, any> = {};

        if (!assigneeSnap.exists()) {
            // Refund the creator
            const creatorProfileRef = rtdb.ref(`profiles/${creatorId}`);
            const creatorSnap = await creatorProfileRef.once('value');
            if (creatorSnap.exists()) {
                const creatorBalance = creatorSnap.val().credits || 0;
                const newCreatorBalance = creatorBalance + amount;
                
                updates[`/profiles/${creatorId}/credits`] = newCreatorBalance;
                
                const creatorTxRef = rtdb.ref(`transactions/${creatorId}`).push();
                updates[`/transactions/${creatorId}/${creatorTxRef.key}`] = {
                    type: 'earn',
                    amount: amount,
                    description: `Refund for task: ${taskData.task_title} (assignee not found)`,
                    created_at: admin.database.ServerValue.TIMESTAMP,
                    balance_after: newCreatorBalance,
                };
            }
            updates[`/marketplace/${taskId}/status`] = 'CANCELLED';
            updates[`/marketplace/${taskId}/notes`] = 'Assignee profile not found.';
            updates[`/marketplace/${taskId}/updated_at`] = admin.database.ServerValue.TIMESTAMP;

            await rtdb.ref().update(updates);
            throw new functions.https.HttpsError("not-found", "Assignee profile not found. Credits refunded.");
        }
        
        const assigneeCredits = assigneeSnap.val().credits || 0;
        const newAssigneeBalance = assigneeCredits + amount;
        
        updates[`/profiles/${assigneeId}/credits`] = newAssigneeBalance;
        updates[`/profiles/${assigneeId}/reputation`] = admin.database.ServerValue.increment(1);

        const assigneeTxRef = rtdb.ref(`transactions/${assigneeId}`).push();
        updates[`/transactions/${assigneeId}/${assigneeTxRef.key}`] = {
            type: 'earn',
            amount: amount,
            description: `Reward for task: ${taskData.task_title}`,
            created_at: admin.database.ServerValue.TIMESTAMP,
            balance_after: newAssigneeBalance,
            meta: { taskId: taskId }
        };
        
        updates[`/marketplace/${taskId}/status`] = 'PAID';
        updates[`/marketplace/${taskId}/updated_at`] = admin.database.ServerValue.TIMESTAMP;
        
        await rtdb.ref().update(updates);

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
    const profileRef = rtdb.ref(`profiles/${uid}`);
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
        updateData.updated_at = admin.database.ServerValue.TIMESTAMP;

        await profileRef.update(updateData);
        return { success: true, message: "Profile updated successfully." };
    } catch (e) {
        handleError(e, "Error updating user profile.");
        return { success: false, message: "Error updating user profile." };
    }
});
