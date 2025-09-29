
import * as functions from "firebase-functions";
import * as admin from "firebase-admin";
import * as cors from "cors";

admin.initializeApp();
const db = admin.firestore();

const corsHandler = cors({ origin: true });

const getUidFromRequest = (req: functions.https.Request): string => {
    if (!req.headers.authorization || !req.headers.authorization.startsWith('Bearer ')) {
        throw new functions.https.HttpsError('unauthenticated', 'No token provided.');
    }
    const idToken = req.headers.authorization.split('Bearer ')[1];
    // This is a simplified way to get UID for the purpose of this example.
    // In a real-world onRequest function, you MUST verify the ID token.
    // For example: const decodedToken = await admin.auth().verifyIdToken(idToken); return decodedToken.uid;
    // Since we don't have async here, we'll assume the client sends the UID directly in a custom header for now
    // THIS IS NOT SECURE FOR PRODUCTION.
    const uid = req.headers['x-user-uid'] as string;
    if (!uid) {
         throw new functions.https.HttpsError('unauthenticated', 'User UID not provided in headers.');
    }
    return uid;
};


const handleError = (res: functions.Response, error: unknown, defaultMsg: string) => {
    console.error(defaultMsg, error);
    if (error instanceof functions.https.HttpsError) {
        res.status(error.httpErrorCode.status).send({ success: false, message: error.message });
    } else {
        res.status(500).send({ success: false, message: defaultMsg });
    }
};

export const seedDatabase = functions.https.onRequest((req, res) => {
    corsHandler(req, res, async () => {
        try {
            // In a real onRequest function, you would get the UID from a verified ID token.
            // For simplicity, we are checking a custom header. THIS IS NOT SECURE.
            const uid = req.headers['x-user-uid'] as string | undefined;
            const ADMIN_UID = functions.config().app?.admin_uid || 'REPLACE_WITH_YOUR_ADMIN_UID';

            if (!uid || uid !== ADMIN_UID) {
                throw new functions.https.HttpsError("permission-denied", "You are not authorized to perform this action.");
            }

            const seedMetaRef = db.collection("internal").doc("seedStatus");
            const seedMetaDoc = await seedMetaRef.get();
            if (seedMetaDoc.exists && seedMetaDoc.data()?.completed) {
                res.status(200).send({ success: true, message: "Database has already been seeded." });
                return;
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
                        batch.set(docRef, { ...item, created_at: admin.firestore.FieldValue.serverTimestamp() });
                    });
                }
            }

            batch.set(seedMetaRef, { completed: true, seeded_at: admin.firestore.FieldValue.serverTimestamp() });
            await batch.commit();

            res.status(200).send({ success: true, message: "Database seeded successfully." });

        } catch (e) {
            handleError(res, e, "Failed to seed database");
        }
    });
});

export const spendCredits = functions.https.onRequest((req, res) => {
    corsHandler(req, res, async () => {
        try {
            const uid = getUidFromRequest(req);
            const { amount, description } = req.body.data;

            if (typeof amount !== "number" || amount <= 0) {
                throw new functions.https.HttpsError("invalid-argument", "Amount must be a positive number.");
            }

            const profileRef = db.collection("profiles").doc(uid);
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
            res.status(200).send({ success: true, message: "Credits deducted successfully." });
        } catch (e) {
            handleError(res, e, "Error spending credits.");
        }
    });
});

export const createTask = functions.https.onRequest((req, res) => {
    corsHandler(req, res, async () => {
        try {
            const uid = getUidFromRequest(req);
            const { title, description, credits_reward, tags } = req.body.data;

            if (!title || !description || typeof credits_reward !== "number" || credits_reward <= 0) {
                throw new functions.https.HttpsError("invalid-argument", "Please provide a valid title, description, and credit reward.");
            }

            const profileRef = db.collection("profiles").doc(uid);
            const tasksRef = db.collection("tasks");

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
            res.status(200).send({ success: true, message: 'Task created and credits escrowed.' });
        } catch (e) {
            handleError(res, e, "Error creating task.");
        }
    });
});

export const acceptTask = functions.https.onRequest((req, res) => {
    corsHandler(req, res, async () => {
        try {
            const uid = getUidFromRequest(req);
            const { taskId } = req.body.data;

            if (!taskId) {
                throw new functions.https.HttpsError("invalid-argument", "Task ID is required.");
            }

            const taskRef = db.collection('tasks').doc(taskId);

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

            res.status(200).send({ success: true, message: 'Task assigned to you.' });
        } catch (e) {
            handleError(res, e, `Error accepting task.`);
        }
    });
});

export const completeTask = functions.https.onRequest((req, res) => {
    corsHandler(req, res, async () => {
        try {
            const uid = getUidFromRequest(req);
            const { taskId } = req.body.data;

            if (!taskId) {
                throw new functions.https.HttpsError("invalid-argument", "Task ID is required.");
            }

            const taskRef = db.collection('tasks').doc(taskId);
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

            res.status(200).send({ success: true, message: 'Task marked as complete.' });
        } catch (e) {
            handleError(res, e, `Error completing task.`);
        }
    });
});

export const approveTask = functions.https.onRequest((req, res) => {
    corsHandler(req, res, async () => {
        try {
            const creatorId = getUidFromRequest(req);
            const { taskId } = req.body.data;

            if (!taskId) {
                throw new functions.https.HttpsError("invalid-argument", "Missing a valid taskId.");
            }

            const taskRef = db.collection('tasks').doc(taskId);

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
                    const creatorProfileRef = db.collection('profiles').doc(creatorId);
                    const creatorDoc = await transaction.get(creatorProfileRef);
                    if (creatorDoc.exists()) {
                        const creatorBalance = creatorDoc.data()?.credits || 0;
                        const newCreatorBalance = creatorBalance + amount;
                        transaction.update(creatorProfileRef, { credits: newCreatorBalance });

                        const creatorTransactionRef = creatorProfileRef.collection('transactions').doc();
                        transaction.set(creatorTransactionRef, {
                            type: 'earn',
                            amount: amount,
                            description: `Refund for task: ${taskData.title} (assignee not found)`,
                            created_at: admin.firestore.FieldValue.serverTimestamp(),
                            balance_after: newCreatorBalance,
                        });
                    }
                    transaction.update(taskRef, { status: 'CANCELLED', updated_at: admin.firestore.FieldValue.serverTimestamp(), notes: 'Assignee profile not found.' });
                    throw new functions.https.HttpsError("not-found", "Assignee profile not found. Credits refunded.");
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

                transaction.update(taskRef, { status: 'PAID', updated_at: admin.firestore.FieldValue.serverTimestamp() });
            });

            res.status(200).send({ success: true, message: 'Credits transferred successfully.' });

        } catch (e) {
            handleError(res, e, "Error during credit transfer.");
        }
    });
});

export const updateUserProfile = functions.https.onRequest((req, res) => {
    corsHandler(req, res, async () => {
        try {
            const uid = getUidFromRequest(req);
            const { displayName, photoURL } = req.body.data;
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

            await profileRef.update(updateData);
            res.status(200).send({ success: true, message: "Profile updated successfully." });
        } catch (e) {
            handleError(res, e, "Error updating user profile.");
        }
    });
});

export const grantProAccess = functions.https.onRequest((req, res) => {
    corsHandler(req, res, async () => {
        try {
            const uid = getUidFromRequest(req);
            const profileRef = db.collection("profiles").doc(uid);
            const proCredits = 5000;

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

            res.status(200).send({ success: true, message: `Pro access granted. ${proCredits} credits added.` });
        } catch (e) {
            handleError(res, e, "Error granting Pro access.");
        }
    });
});
