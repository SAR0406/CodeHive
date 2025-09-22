/**
 * @fileOverview Schemas and types for the story generation AI agent.
 *
 * - GenerateStoryInput - The input type for the generateStory function.
 * - GenerateStoryOutput - The return type for the generateStory function.
 */

import {z} from 'genkit';

export const GenerateStoryInputSchema = z.object({
  prompt: z.string().describe('The prompt for the story to be generated.'),
});
export type GenerateStoryInput = z.infer<typeof GenerateStoryInputSchema>;

export const StoryPageSchema = z.object({
  pageNumber: z.number().describe('The page number.'),
  content: z.string().describe('The content of the page.'),
});

export const GenerateStoryOutputSchema = z.object({
  title: z.string().describe('The title of the story.'),
  pages: z.array(StoryPageSchema).describe('The pages of the story.'),
});
export type GenerateStoryOutput = z.infer<typeof GenerateStoryOutputSchema>;
