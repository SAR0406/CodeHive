
'use client'

export interface LearningModule {
  id: number;
  title: string;
  description: string;
  cost: number;
}

export async function getModules(): Promise<LearningModule[]> {
    // MOCK DATA - Replace with Firestore call
     return [
        {id: 1, title: 'Advanced React Patterns', description: 'Deep dive into modern React techniques.', cost: 50},
        {id: 2, title: 'Building with AI', description: 'Learn how to integrate generative AI.', cost: 75},
        {id: 3, title: 'UI/UX Design Fundamentals', description: 'Master the basics of user-centric design.', cost: 40},
        {id: 4, title: 'Firebase for Beginners', description: 'Get started with Firebase from scratch.', cost: 30},
    ];
}
