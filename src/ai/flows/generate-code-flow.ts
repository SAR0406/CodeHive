
'use server';
/**
 * @fileOverview An AI flow to generate React component code from a prompt.
 *
 * - generateCode - A function that takes a text prompt and returns generated code.
 * - GenerateCodeInput - The input type for the generateCode function.
 * - GenerateCodeOutput - The return type for the generateCode function.
 */

import { ai } from '@/ai/genkit';
import { z } from 'zod';

const GenerateCodeInputSchema = z.object({
  prompt: z.string().describe('A detailed description of the UI component to build.'),
});
export type GenerateCodeInput = z.infer<typeof GenerateCodeInputSchema>;

const GenerateCodeOutputSchema = z.object({
  code: z.string().describe('The generated React component code including all necessary imports.'),
});
export type GenerateCodeOutput = z.infer<typeof GenerateCodeOutputSchema>;


export async function generateCode(input: GenerateCodeInput): Promise<GenerateCodeOutput> {
  return generateCodeFlow(input);
}

const prompt = ai.definePrompt({
  name: 'generateCodePrompt',
  input: { schema: GenerateCodeInputSchema },
  output: { schema: GenerateCodeOutputSchema },
  prompt: `You are an expert React/Next.js developer who creates clean, production-ready components.
    Your task is to generate the code for a single React component based on the user's prompt.

    GUIDELINES:
    - Use TypeScript.
    - Use Tailwind CSS for styling.
    - Use functional components with hooks.
    - Use shadcn/ui components where appropriate (e.g., <Button>, <Card>, <Input>). Assume they are available via '@components/ui/...'.
    - Use lucide-react for icons (e.g., <Check className="w-4 h-4" />).
    - The entire component should be in a single file. Do NOT break it down into multiple files.
    - The component should be self-contained and ready to be copy-pasted into a project. Include all necessary imports from 'react', 'lucide-react', and '@/components/ui/...'.
    - Do NOT include 'use client' or 'use server' directives.
    - Do NOT export the component as a default export. Use a named export.
    - Do NOT wrap the code in a markdown block.

    USER PROMPT:
    "{{{prompt}}}"
  `,
});

const generateCodeFlow = ai.defineFlow(
  {
    name: 'generateCodeFlow',
    inputSchema: GenerateCodeInputSchema,
    outputSchema: GenerateCodeOutputSchema,
  },
  async (input) => {
    const { output } = await prompt(input);
    return output!;
  }
);

    