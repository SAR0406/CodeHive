
'use client'

export interface Mentor {
  id: number;
  name: string;
  specialties: string[];
  reputation: number;
  cost: number;
}

export async function getMentors(): Promise<Mentor[]> {
    // MOCK DATA - Replace with Firestore call
    return [
        { id: 1, name: 'Jane Doe', specialties: ["React", "Next.js"], reputation: 4, cost: 500 },
        { id: 2, name: 'John Smith', specialties: ["AI", "Python", "Genkit"], reputation: 5, cost: 600 },
        { id: 3, name: 'Alex Ray', specialties: ["UI/UX", "Figma"], reputation: 5, cost: 450 },
        { id: 4, name: 'Sarah Chen', specialties: ["Database", "Firestore"], reputation: 4, cost: 550 },
    ];
}
