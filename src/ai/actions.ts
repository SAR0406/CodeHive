
'use server';

/**
 * @fileOverview This file contains all the AI-related server actions for the application.
 * It uses Genkit to interact with Google's AI models to perform tasks like
 * code explanation, story generation, and more.
 * It also integrates with a credit system to deduct credits for each AI action.
 */

import { ai } from '@/ai/genkit';
import { z } from 'zod';
import { deductCredits } from '@/lib/firebase/credits';

const AI_ACTION_COST = 10;

// Schemas for AI Actions
const ExplainCodeSnippetInputSchema = z.object({
  codeSnippet: z.string(),
  programmingLanguage: z.string(),
  userId: z.string(),
});
export type ExplainCodeSnippetInput = z.infer<typeof ExplainCodeSnippetInputSchema>;

const ExplainCodeSnippetOutputSchema = z.object({
  explanation: z.string(),
});
export type ExplainCodeSnippetOutput = z.infer<typeof ExplainCodeSnippetOutputSchema>;

const SuggestCodeFixesInputSchema = z.object({
  code: z.string(),
  errors: z.string(),
  userId: z.string(),
});
export type SuggestCodeFixesInput = z.infer<typeof SuggestCodeFixesInputSchema>;

const SuggestCodeFixesOutputSchema = z.object({
  fixes: z.string(),
});
export type SuggestCodeFixesOutput = z.infer<typeof SuggestCodeFixesOutputSchema>;

const GenerateTestsFromCodeInputSchema = z.object({
  code: z.string(),
  language: z.string(),
  userId: z.string(),
});
export type GenerateTestsFromCodeInput = z.infer<typeof GenerateTestsFromCodeInputSchema>;

const GenerateTestsFromCodeOutputSchema = z.object({
  tests: z.string(),
});
export type GenerateTestsFromCodeOutput = z.infer<typeof GenerateTestsFromCodeOutputSchema>;


const GenerateAppInputSchema = z.object({
  prompt: z.string(),
  userId: z.string(),
});
export type GenerateAppInput = z.infer<typeof GenerateAppInputSchema>;

const GenerateAppOutputSchema = z.object({
  code: z.string(),
});
export type GenerateAppOutput = z.infer<typeof GenerateAppOutputSchema>;

// AI Actions

export async function explainCodeSnippet(input: ExplainCodeSnippetInput): Promise<ExplainCodeSnippetOutput> {
  await deductCredits(input.userId, AI_ACTION_COST);

  const { output } = await ai.generate({
    prompt: `You are an AI code assistant that explains code snippets in plain English. Explain the following code snippet in plain English, so that a developer can quickly understand it.

Programming Language: ${input.programmingLanguage}
Code Snippet:
\`\`\`${input.programmingLanguage}
${input.codeSnippet}
\`\`\`
`,
    output: {
      schema: ExplainCodeSnippetOutputSchema,
    },
  });
  return output!;
}

export async function suggestCodeFixes(input: SuggestCodeFixesInput): Promise<SuggestCodeFixesOutput> {
  await deductCredits(input.userId, AI_ACTION_COST);

  const { output } = await ai.generate({
    prompt: `You are an AI collaboration bot that suggests code fixes based on errors and warnings in the code.

Analyze the following code and suggest fixes for the given errors and warnings.

Code:
${input.code}

Errors and Warnings:
${input.errors}

Suggested Fixes:`,
    output: {
      schema: SuggestCodeFixesOutputSchema,
    },
  });
  return output!;
}

export async function generateTestsFromCode(input: GenerateTestsFromCodeInput): Promise<GenerateTestsFromCodeOutput> {
  await deductCredits(input.userId, AI_ACTION_COST);

  const { output } = await ai.generate({
    prompt: `You are an AI test generator expert. You will generate unit tests for the given code.

Code (${input.language}):
${input.code}

Tests:
`,
    output: {
      schema: GenerateTestsFromCodeOutputSchema,
    },
  });
  return output!;
}


export async function generateApp(input: GenerateAppInput): Promise<GenerateAppOutput> {
  await deductCredits(input.userId, AI_ACTION_COST);

  const { output } = await ai.generate({
    prompt: `You are an expert software engineer. Generate the code for a basic application based on the following prompt: ${input.prompt}. Return only the code. Do not include any explanations or comments outside of the code.`,
    output: {
      schema: GenerateAppOutputSchema,
    },
  });
  return output!;
}
