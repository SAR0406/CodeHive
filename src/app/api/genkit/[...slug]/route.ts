'use server';
import { genkitNextHandler } from '@genkit-ai/next/server';
import '@/ai/flows/suggest-code-fixes';
import '@/ai/flows/explain-code-snippet';
import '@/ai/flows/generate-tests-from-code';
import '@/ai/flows/generate-app-from-prompt';
import '@/ai/flows/generate-story-flow';

const handler = genkitNextHandler();

export { handler as GET, handler as POST };
