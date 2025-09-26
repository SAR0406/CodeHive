
'use server';
/**
 * @fileOverview An AI flow to suggest fixes for code snippets.
 *
 * - fixCode - A function that takes code and errors and returns a suggested fix.
 * - FixCodeInput - The input type for the fixCode function.
 * - FixCodeOutput - The return type for the fixCode function.
 */

import { ai } from '@/ai/genkit';
import { z } from 'zod';

const FixCodeInputSchema = z.object({
  code: z.string().describe('The code snippet with errors.'),
  language: z.string().describe('The programming language of the code snippet.'),
  errors: z.string().describe('The error messages or logs associated with the code.'),
});
export type FixCodeInput = z.infer<typeof FixCodeInputSchema>;

const FixCodeOutputSchema = z.object({
  explanation: z.string().describe('A clear explanation of what was wrong and how the fix addresses it.'),
  fixedCode: z.string().describe('The corrected code snippet.'),
});
export type FixCodeOutput = z.infer<typeof FixCodeOutputSchema>;


export async function fixCode(input: FixCodeInput): Promise<FixCodeOutput> {
  return fixCodeFlow(input);
}

const prompt = ai.definePrompt({
  name: 'fixCodePrompt',
  input: { schema: FixCodeInputSchema },
  output: { schema: FixCodeOutputSchema },
  prompt: `You are an expert programmer who excels at debugging and fixing code.
    Your task is to analyze the provided code and error message, identify the problem, and provide a corrected version of the code.

    1.  First, explain what the error is and why it's happening.
    2.  Then, provide the fully corrected code snippet.

    Do not be overly verbose, but be thorough. Use markdown for formatting.

    Language: {{{language}}}
    
    Original Code:
    \'\'\'{{{language}}}
    {{{code}}}
    \'\'\'

    Error Message(s):
    \'\'\'
    {{{errors}}}
    \'\'\'
  `,
});

const fixCodeFlow = ai.defineFlow(
  {
    name: 'fixCodeFlow',
    inputSchema: FixCodeInputSchema,
    outputSchema: FixCodeOutputSchema,
  },
  async (input) => {
    const { output } = await prompt(input);
    return output!;
  }
);
