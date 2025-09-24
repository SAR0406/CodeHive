
import { genkit } from '@genkit-ai/ai';
import { googleAI } from '@genkit-ai/googleai';
import { configureGenkit } from '@genkit-ai/core';

configureGenkit({
  plugins: [
    googleAI({
      // apiKey: process.env.GOOGLE_GENAI_API_KEY, // Optional, auto-detects from GOOGLE_GENAI_API_KEY
    }),
  ],
  logLevel: 'debug',
  enableTracingAndMetrics: true,
});

export { genkit as ai };
