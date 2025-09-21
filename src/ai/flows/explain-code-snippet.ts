'use server';

/**
 * @fileOverview A code explanation AI agent.
 *
 * - explainCodeSnippet - A function that explains a code snippet in plain English.
 * - ExplainCodeSnippetInput - The input type for the explainCodeSnippet function.
 * - ExplainCodeSnippetOutput - The return type for the explainCodeSnippet function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const ExplainCodeSnippetInputSchema = z.object({
  codeSnippet: z
    .string()
    .describe('The code snippet to be explained.'),
  programmingLanguage: z
    .string()
    .describe('The programming language of the code snippet.'),
});
export type ExplainCodeSnippetInput = z.infer<typeof ExplainCodeSnippetInputSchema>;

const ExplainCodeSnippetOutputSchema = z.object({
  explanation: z
    .string()
    .describe('The explanation of the code snippet in plain English.'),
});
export type ExplainCodeSnippetOutput = z.infer<typeof ExplainCodeSnippetOutputSchema>;

export async function explainCodeSnippet(input: ExplainCodeSnippetInput): Promise<ExplainCodeSnippetOutput> {
  return explainCodeSnippetFlow(input);
}

const prompt = ai.definePrompt({
  name: 'explainCodeSnippetPrompt',
  input: {schema: ExplainCodeSnippetInputSchema},
  output: {schema: ExplainCodeSnippetOutputSchema},
  prompt: `You are an AI code assistant that explains code snippets in plain English.

  Explain the following code snippet in plain English, so that a developer can quickly understand it.

  Programming Language: {{{programmingLanguage}}}
  Code Snippet:
  \`\`\`{{{programmingLanguage}}}
  {{{codeSnippet}}}
  \`\`\`
  `,
});

const explainCodeSnippetFlow = ai.defineFlow(
  {
    name: 'explainCodeSnippetFlow',
    inputSchema: ExplainCodeSnippetInputSchema,
    outputSchema: ExplainCodeSnippetOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
