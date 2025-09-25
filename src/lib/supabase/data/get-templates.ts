
'use client'
import { createClient } from '@/lib/supabase/client';

export interface Template {
  id: number;
  title: string;
  description: string;
  cost: number;
}

export async function getTemplates(): Promise<Template[]> {
    // MOCK DATA - Replace with Firestore call
    return [
        {id: 1, title: 'E-commerce Storefront', description: 'A modern, responsive e-commerce template.', cost: 250},
        {id: 2, title: 'Minimalist Blog', description: 'A clean and professional blog template.', cost: 100},
        {id: 3, title: 'Creative Portfolio', description: 'A portfolio template for creative professionals.', cost: 150},
        {id: 4, title: 'SaaS Landing Page', description: 'A landing page template for a SaaS product.', cost: 200},
    ];
}
