'use server';
/**
 * @fileOverview A story generation AI agent.
 *
 * - generateStory - A function that handles the story generation process.
 * - getStory - A function that retrieves a generated story.
 */

import {ai} from '@/ai/genkit';
import { GenerateStoryInputSchema, GenerateStoryOutputSchema, type GenerateStoryInput, type GenerateStoryOutput } from './story-schema';


// In-memory store for generated stories
const storyStore: Record<string, GenerateStoryOutput> = {};

function generateId() {
  return Math.random().toString(36).substring(2, 9);
}

export async function generateStory(input: GenerateStoryInput): Promise<{storyId: string}> {
  const result = await generateStoryFlow(input);
  const storyId = generateId();
  storyStore[storyId] = result;
  return { storyId };
}

export async function getStory(storyId: string): Promise<GenerateStoryOutput | null> {
    return storyStore[storyId] || null;
}


const prompt = ai.definePrompt({
  name: 'generateStoryPrompt',
  input: {schema: GenerateStoryInputSchema},
  output: {schema: GenerateStoryOutputSchema},
  prompt: `You are an expert storyteller. Generate a short, multi-page story based on the user's prompt.

The story should have a clear title and be broken down into several pages.

Prompt: {{{prompt}}}
`,
});

const generateStoryFlow = ai.defineFlow(
  {
    name: 'generateStoryFlow',
    inputSchema: GenerateStoryInputSchema,
    outputSchema: GenerateStoryOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
