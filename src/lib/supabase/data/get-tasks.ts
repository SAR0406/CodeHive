
'use client'

export interface Task {
  id: string;
  title: string;
  description: string;
  tags: string[];
  credits_reward: number;
  status: 'OPEN' | 'ASSIGNED' | 'COMPLETED' | 'CANCELLED' | 'PAID';
  created_by: string; // userId
  assigned_to?: string; // userId
  created_at: string;
  updated_at: string;
}

export async function getTasks(): Promise<Task[]> {
    // MOCK DATA - Replace with Firestore call
    return [
        { id: '1', title: 'Design a new logo', description: 'Create a modern and sleek logo for our new brand, CodeHive.', tags: ['design', 'ui', 'logo'], credits_reward: 500, status: 'OPEN', created_by: 'user1', created_at: new Date().toISOString(), updatedAt: new Date().toISOString() },
        { id: '2', title: 'Build a React Component', description: 'Develop a reusable data table component with sorting and filtering.', tags: ['react', 'frontend'], credits_reward: 1200, status: 'ASSIGNED', created_by: 'user2', assigned_to: 'user3', created_at: new Date().toISOString(), updatedAt: new Date().toISOString() },
        { id: '3', title: 'Write API Documentation', description: 'Document the new /api/hello endpoint with examples.', tags: ['docs'], credits_reward: 300, status: 'COMPLETED', created_by: 'user1', assigned_to: 'user4', created_at: new Date().toISOString(), updatedAt: new Date().toISOString() },
        { id: '4', title: 'Fix CSS Bug on Landing Page', description: 'The footer is not aligned correctly on mobile devices.', tags: ['css', 'bugfix'], credits_reward: 150, status: 'PAID', created_by: 'user3', assigned_to: 'user2', created_at: new Date().toISOString(), updatedAt: new Date().toISOString() },
    ];
}
