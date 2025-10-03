
'use server';
/**
 * @fileOverview This file is intended to run in a Node.js environment for Firebase Functions.
 * It is a copy of the client-side Genkit flow for verifying tasks, adapted for server-side execution.
 */

import { genkit, configureGenkit } from 'genkit';
import { googleAI } from '@genkit-ai/google-ai';
import { z } from 'zod';

// Initialize Genkit for the server environment
configureGenkit({
  plugins: [
    googleAI(),
  ],
  logLevel: "debug",
  enableTracingAndMetrics: true,
});

const VerifyTaskInputSchema = z.object({
  taskTitle: z.string().describe('The original title of the task that was assigned.'),
  taskDescription: z.string().describe('The original, detailed description of what was required for the task.'),
  taskSubmission: z.string().describe('The work or proof of completion submitted by the person who completed the task. This could be a text description, a code snippet, a link, etc.'),
});
export type VerifyTaskInput = z.infer<typeof VerifyTaskInputSchema>;

const VerifyTaskOutputSchema = z.object({
    verificationStatus: z.enum(['APPROVED', 'REJECTED']).describe('The AI\'s judgment on whether the submission meets the task requirements. \'APPROVED\' if it does, \'REJECTED\' if it does not.'),
    verificationNotes: z.string().describe('A concise, one or two-sentence explanation for the decision. e.g., "The submission directly addresses the core requirements of the task." or "The submitted link is broken and does not show the required work."'),
    fraudRisk: z.enum(['LOW', 'MEDIUM', 'HIGH']).describe('The AI\'s assessment of the likelihood that the submission is fraudulent, spam, or irrelevant.'),
});
export type VerifyTaskOutput = z.infer<typeof VerifyTaskOutputSchema>;


const verifyTaskFlow = genkit.defineFlow(
  {
    name: 'verifyTaskFlow',
    inputSchema: VerifyTaskInputSchema,
    outputSchema: VerifyTaskOutputSchema,
  },
  async (input) => {
    
    const prompt = `You are an expert project manager and quality assurance specialist for a software development marketplace. Your job is to verify if the work submitted by a user correctly completes the assigned task.

    Analyze the original task requirements and the user's submission.

    - If the submission accurately and completely fulfills the requirements of the task description, set 'verificationStatus' to 'APPROVED'.
    - If the submission is incomplete, irrelevant, spam, or fails to meet the core requirements, set 'verificationStatus' to 'REJECTED'.

    - Based on the content of the submission, assess the fraud risk. If it looks like spam, an unrelated link, or gibberish, set 'fraudRisk' to 'HIGH'. If it's a plausible attempt but incomplete, set it to 'MEDIUM'. If it seems like a genuine and complete effort, set it to 'LOW'.

    - Provide a very brief, one or two-sentence explanation for your decision in 'verificationNotes'.

    TASK TITLE: ${input.taskTitle}
    TASK DESCRIPTION: ${input.taskDescription}

    SUBMISSION TO VERIFY:
    '''
    ${input.taskSubmission}
    '''
  `;
    
    const llmResponse = await genkit.generate({
      prompt: prompt,
      model: googleAI('gemini-1.5-flash-latest'),
      output: {
        schema: VerifyTaskOutputSchema,
      },
    });

    return llmResponse.output()!;
  }
);


export async function verifyTask(input: VerifyTaskInput): Promise<VerifyTaskOutput> {
  return await verifyTaskFlow.run(input);
}
