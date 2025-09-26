
'use server';
/**
 * @fileOverview An AI flow to generate unit tests for a code snippet.
 *
 * - generateTests - A function that takes code and returns generated test code.
 * - GenerateTestsInput - The input type for the generateTests function.
 * - GenerateTestsOutput - The return type for the generateTests function.
 */

import { ai } from '@/ai/genkit';
import { z } from 'zod';

const GenerateTestsInputSchema = z.object({
  code: z.string().describe('The code snippet to generate tests for.'),
  language: z.string().describe('The programming language of the code snippet (e.g., javascript, typescript).'),
  framework: z.string().describe('The testing framework to use (e.g., jest, vitest, mocha).'),
});
export type GenerateTestsInput = z.infer<typeof GenerateTestsInputSchema>;

const GenerateTestsOutputSchema = z.object({
  explanation: z.string().describe('A brief explanation of the tests provided.'),
  testCode: z.string().describe('The generated test code.'),
});
export type GenerateTestsOutput = z.infer<typeof GenerateTestsOutputSchema>;


export async function generateTests(input: GenerateTestsInput): Promise<GenerateTestsOutput> {
  return generateTestsFlow(input);
}

const prompt = ai.definePrompt({
  name: 'generateTestsPrompt',
  input: { schema: GenerateTestsInputSchema },
  output: { schema: GenerateTestsOutputSchema },
  prompt: `You are an expert software developer with a focus on testing.
    Your task is to write a suite of unit tests for the given code snippet using the specified testing framework.

    1.  Provide a brief explanation of the tests you are creating.
    2.  Write the complete test code, including necessary imports and mocks.
    3.  Cover the main success paths and at least one edge case or error condition.

    Use markdown for formatting.

    Language: {{{language}}}
    Testing Framework: {{{framework}}}
    
    Code to Test:
    \'\'\'{{{language}}}
    {{{code}}}
    \'\'\'
  `,
});

const generateTestsFlow = ai.defineFlow(
  {
    name: 'generateTestsFlow',
    inputSchema: GenerateTestsInputSchema,
    outputSchema: GenerateTestsOutputSchema,
  },
  async (input) => {
    const { output } = await prompt(input);
    return output!;
  }
);
