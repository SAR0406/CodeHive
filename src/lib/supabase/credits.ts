
'use server'

import { createClient } from "./server";

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

  const supabase = createClient();

  const { error } = await supabase.rpc('deduct_balance', {
    user_id: userId,
    deduct_amount: amount,
  });

  if (error) {
    console.error("Credit deduction RPC failed: ", error.message);
    // The RPC function will throw an error if balance is insufficient
    throw new Error(error.message);
  }
}

/**
 * Adds a specified amount of credits to a user's account.
 * @param userId The ID of the user.
 * @param amount The amount of credits to add.
 */
export async function addCredits(userId: string, amount: number) {
  if (amount <= 0) {
    throw new Error('Credit amount must be positive.');
  }

  const supabase = createClient();
  const { error } = await supabase.rpc('add_balance', {
      user_id: userId,
      add_amount: amount,
  });

  if (error) {
      console.error("Credit addition RPC failed: ", error.message);
      throw new Error(error.message);
  }
}
