'use server';

/**
 * @fileOverview Generates a basic application from a natural language prompt.
 *
 * - generateApp - A function that generates a basic application from a natural language prompt.
 * - GenerateAppInput - The input type for the generateApp function.
 * - GenerateAppOutput - The return type for the generateApp function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const GenerateAppInputSchema = z.object({
  prompt: z.string().describe('A natural language prompt describing the desired application.'),
});
export type GenerateAppInput = z.infer<typeof GenerateAppInputSchema>;

const GenerateAppOutputSchema = z.object({
  code: z.string().describe('The generated code for the application.'),
});
export type GenerateAppOutput = z.infer<typeof GenerateAppOutputSchema>;

export async function generateApp(input: GenerateAppInput): Promise<GenerateAppOutput> {
  return generateAppFlow(input);
}

const prompt = ai.definePrompt({
  name: 'generateAppPrompt',
  input: {schema: GenerateAppInputSchema},
  output: {schema: GenerateAppOutputSchema},
  prompt: `You are an expert software engineer. Generate the code for a basic application based on the following prompt: {{{prompt}}}. Return only the code. Do not include any explanations or comments outside of the code.
`,
});

const generateAppFlow = ai.defineFlow(
  {
    name: 'generateAppFlow',
    inputSchema: GenerateAppInputSchema,
    outputSchema: GenerateAppOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
