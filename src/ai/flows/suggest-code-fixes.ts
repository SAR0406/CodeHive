'use server';

/**
 * @fileOverview AI collaboration bot suggests code fixes based on errors and warnings.
 *
 * - suggestCodeFixes - A function that suggests code fixes.
 * - SuggestCodeFixesInput - The input type for the suggestCodeFixes function.
 * - SuggestCodeFixesOutput - The return type for the suggestCodeFixes function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const SuggestCodeFixesInputSchema = z.object({
  code: z.string().describe('The code to analyze.'),
  errors: z.string().describe('The errors and warnings in the code.'),
});
export type SuggestCodeFixesInput = z.infer<typeof SuggestCodeFixesInputSchema>;

const SuggestCodeFixesOutputSchema = z.object({
  fixes: z.string().describe('The suggested code fixes.'),
});
export type SuggestCodeFixesOutput = z.infer<typeof SuggestCodeFixesOutputSchema>;

export async function suggestCodeFixes(input: SuggestCodeFixesInput): Promise<SuggestCodeFixesOutput> {
  return suggestCodeFixesFlow(input);
}

const prompt = ai.definePrompt({
  name: 'suggestCodeFixesPrompt',
  input: {schema: SuggestCodeFixesInputSchema},
  output: {schema: SuggestCodeFixesOutputSchema},
  prompt: `You are an AI collaboration bot that suggests code fixes based on errors and warnings in the code.\n\nAnalyze the following code and suggest fixes for the given errors and warnings.\n\nCode:\n{{code}}\n\nErrors and Warnings:\n{{errors}}\n\nSuggested Fixes:`,
});

const suggestCodeFixesFlow = ai.defineFlow(
  {
    name: 'suggestCodeFixesFlow',
    inputSchema: SuggestCodeFixesInputSchema,
    outputSchema: SuggestCodeFixesOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
