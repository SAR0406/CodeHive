'use server';

// DO NOT statically import genkitNextHandler, it causes build issues.
import '@/ai/flows/suggest-code-fixes';
import '@/ai/flows/explain-code-snippet';
import '@/ai/flows/generate-tests-from-code';
import '@/ai/flows/generate-app-from-prompt';
import '@/ai/flows/generate-story-flow';

async function handler(req: Request) {
  // Dynamically import the handler only when the function is invoked.
  const { genkitNextHandler } = await import('@genkit-ai/next/server');
  return genkitNextHandler(req);
}

export { handler as GET, handler as POST };
