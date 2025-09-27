
import { genkit } from '@genkit-ai/ai';
import { googleAI } from '@genkit-ai/googleai';

export const ai = genkit({
  plugins: [
    googleAI({
      // apiKey: process.env.GOOGLE_GENAI_API_KEY, // Optional, auto-detects from GOOGLE_GENAI_API_KEY
    }),
  ],
});
