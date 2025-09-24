
'use server';
/**
 * @fileOverview An AI flow to explain code snippets.
 *
 * - explainCode - A function that takes code and language and returns an explanation.
 * - ExplainCodeInput - The input type for the explainCode function.
 * - ExplainCodeOutput - The return type for the explainCode function.
 */

import { ai } from '@/ai/genkit';
import { z } from 'zod';

const ExplainCodeInputSchema = z.object({
  code: z.string().describe('The code snippet to explain.'),
  language: z.string().describe('The programming language of the code snippet.'),
});
export type ExplainCodeInput = z.infer<typeof ExplainCodeInputSchema>;

const ExplainCodeOutputSchema = z.object({
  explanation: z.string().describe('A clear, concise, and easy-to-understand explanation of the code.'),
});
export type ExplainCodeOutput = z.infer<typeof ExplainCodeOutputSchema>;


export async function explainCode(input: ExplainCodeInput): Promise<ExplainCodeOutput> {
  return explainCodeFlow(input);
}

const prompt = ai.definePrompt({
  name: 'explainCodePrompt',
  input: { schema: ExplainCodeInputSchema },
  output: { schema: ExplainCodeOutputSchema },
  prompt: `You are an expert programmer and a skilled technical writer.
    Explain the following {{{language}}} code snippet in a way that is easy for a beginner to understand.
    Focus on the code's purpose, how it works, and what the expected output or behavior is.
    Do not be overly verbose, but be thorough. Use markdown for formatting if needed.

    Code:
    \'\'\'{{{language}}}
    {{{code}}}
    \'\'\'
  `,
});

const explainCodeFlow = ai.defineFlow(
  {
    name: 'explainCodeFlow',
    inputSchema: ExplainCodeInputSchema,
    outputSchema: ExplainCodeOutputSchema,
  },
  async (input) => {
    const { output } = await prompt(input);
    return output!;
  }
);
