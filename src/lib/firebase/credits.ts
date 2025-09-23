
import { db } from './client-app';
import { doc, getDoc, updateDoc, increment, runTransaction, DocumentReference } from 'firebase/firestore';

export interface CreditData {
    balance: number;
    escrowBalance: number;
}

/**
 * Deducts a specified amount of credits from a user's account for an AI action.
 * Throws an error if the user does not have enough credits.
 * @param userId The ID of the user.
 * @param amount The amount of credits to deduct.
 */
export async function deductCredits(userId: string, amount: number) {
  if (amount <= 0) {
    throw new Error('Deduction amount must be positive.');
  }

  const creditRef = doc(db, 'credits', userId);

  try {
    await runTransaction(db, async (transaction) => {
      const creditDoc = await transaction.get(creditRef);

      if (!creditDoc.exists()) {
        throw new Error('User credit document not found.');
      }

      const currentBalance = creditDoc.data().balance;

      if (currentBalance < amount) {
        throw new Error('Insufficient credits.');
      }

      const newBalance = currentBalance - amount;
      transaction.update(creditRef, { balance: newBalance });
    });
  } catch (error: any) {
    console.error("Credit deduction failed: ", error.message);
    // Re-throw the error to be handled by the calling function
    throw error;
  }
}
