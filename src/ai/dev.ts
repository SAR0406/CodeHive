import { config } from 'dotenv';
config();

import '@/ai/flows/suggest-code-fixes.ts';
import '@/ai/flows/explain-code-snippet.ts';
import '@/ai/flows/generate-tests-from-code.ts';
import '@/ai/flows/generate-app-from-prompt.ts';