'use server';

/**
 * @fileOverview Generates unit tests from existing code.
 *
 * - generateTestsFromCode - A function that handles the generation of unit tests.
 * - GenerateTestsFromCodeInput - The input type for the generateTestsFromCode function.
 * - GenerateTestsFromCodeOutput - The return type for the generateTestsFromCode function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const GenerateTestsFromCodeInputSchema = z.object({
  code: z.string().describe('The code for which to generate unit tests.'),
  language: z.string().describe('The programming language of the code.'),
});
export type GenerateTestsFromCodeInput = z.infer<typeof GenerateTestsFromCodeInputSchema>;

const GenerateTestsFromCodeOutputSchema = z.object({
  tests: z.string().describe('The generated unit tests.'),
});
export type GenerateTestsFromCodeOutput = z.infer<typeof GenerateTestsFromCodeOutputSchema>;

export async function generateTestsFromCode(input: GenerateTestsFromCodeInput): Promise<GenerateTestsFromCodeOutput> {
  return generateTestsFromCodeFlow(input);
}

const prompt = ai.definePrompt({
  name: 'generateTestsFromCodePrompt',
  input: {schema: GenerateTestsFromCodeInputSchema},
  output: {schema: GenerateTestsFromCodeOutputSchema},
  prompt: `You are an AI test generator expert. You will generate unit tests for the given code.

Code:
\`\`\`{{language}}
{{{code}}}
\`\`\`

Tests:
`,
});

const generateTestsFromCodeFlow = ai.defineFlow(
  {
    name: 'generateTestsFromCodeFlow',
    inputSchema: GenerateTestsFromCodeInputSchema,
    outputSchema: GenerateTestsFromCodeOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
