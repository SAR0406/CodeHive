# Supabase Setup Guide

This guide provides the necessary steps to fully configure your CodeHive application's Supabase backend. This involves setting up authentication providers and running the initial database schema script.

## Prerequisites

1.  You have a Supabase project created.
2.  You have set your `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY` in your Vercel project's environment variables.

---

## Step 1: Configure OAuth Providers

You will need to get a **Client ID** and **Client Secret** from both Google and GitHub. For both providers, you must use the following **Authorization callback URL**:

```
https://dfssppowxobvnpxcjfqm.supabase.co/auth/v1/callback
```

### A. Configuring GitHub OAuth

1.  **Go to GitHub and Create an OAuth App:**
    *   Navigate to **Settings** > **Developer settings** > **OAuth Apps**.
    *   Click **"New OAuth App"**.
    *   **Application name:** `CodeHive` (or your preferred name).
    *   **Homepage URL:** Your application's URL (e.g., `http://localhost:9002` for local development or your production URL).
    *   **Authorization callback URL:** Paste the Supabase callback URL provided above.

2.  **Get Your GitHub Credentials:**
    *   After creating the app, copy the **Client ID**.
    *   Click **"Generate a new client secret"** to get your **Client Secret**.

3.  **Add Credentials to Supabase:**
    *   In your Supabase project dashboard, go to **Authentication** > **Providers**.
    *   Find **GitHub**, enable it, and paste in the Client ID and Client Secret.
    *   Click **Save**.

### B. Configuring Google OAuth

1.  **Go to Google Cloud Console:**
    *   Navigate to the [Google Cloud Console](https://console.cloud.google.com/).
    *   Go to **APIs & Services** > **Credentials**.
    *   Click **"+ CREATE CREDENTIALS"** > **"OAuth client ID"**.
    *   **Application type:** Select **"Web application"**.
    *   Under **"Authorized redirect URIs"**, click **"+ ADD URI"** and paste your Supabase callback URL from above.
    *   Click **Create**.

2.  **Get Your Google Credentials:**
    *   A dialog will appear showing your **Client ID** and **Client Secret**. Copy both.

3.  **Add Credentials to Supabase:**
    *   In your Supabase project dashboard, go to **Authentication** > **Providers**.
    *   Find **Google**, enable it, and paste in the Client ID and Client Secret.
    *   Click **Save**.

---

## Step 2: Database Schema Setup

This is a critical step. The following SQL script will create all the necessary tables, relationships, security policies, and database functions for the entire application to work.

**Instructions:**
1.  Copy the entire SQL code block below.
2.  In your Supabase dashboard, navigate to the **SQL Editor**.
3.  Click **"+ New query"**.
4.  Paste the entire script into the editor.
5.  Click the **RUN** button.

```sql
-- Enable UUID generation
create extension if not exists "uuid-ossp";

--
-- PROFILES TABLE
--
-- This table stores public user data.
--
create table if not exists profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text not null,
  display_name text,
  photo_url text,
  balance integer not null default 100,
  escrow_balance integer not null default 0
);

--
-- CREDIT PACKS TABLE
--
-- This table stores the available credit packs for purchase.
--
create table if not exists credit_packs (
  id serial primary key,
  name text not null,
  credits integer not null,
  price integer not null, -- in USD cents
  description text
);

--
-- TEMPLATES TABLE
--
-- This table stores project templates that users can fork.
--
create table if not exists templates (
  id serial primary key,
  title text not null,
  description text,
  cost integer not null
);

--
-- MENTORS TABLE
--
-- This table stores mentor information.
--
create table if not exists mentors (
  id serial primary key,
  name text not null,
  specialties text[] not null,
  reputation integer not null,
  cost integer not null -- credits per session
);

--
-- LEARNING MODULES TABLE
--
-- This table stores available learning modules.
--
create table if not exists learning_modules (
  id serial primary key,
  title text not null,
  description text,
  cost integer not null
);

--
-- TASKS TABLE
--
-- This table stores marketplace tasks.
--
create table if not exists tasks (
  id uuid primary key default uuid_generate_v4(),
  created_at timestamp with time zone default now() not null,
  updated_at timestamp with time zone default now() not null,
  title text not null,
  description text,
  tags text[] default '{}'::text[],
  credits_reward integer not null,
  status text default 'OPEN'::text not null, -- OPEN, ASSIGNED, COMPLETED, PAID, CANCELLED
  created_by uuid references public.profiles(id) not null,
  assigned_to uuid references public.profiles(id)
);


--
-- SEED DATA
--
-- Insert initial data for the application to be functional.
--
insert into credit_packs (name, credits, price, description) values
('Starter Pack', 500, 5, 'A small boost to get you going.'),
('Developer Pack', 2500, 20, 'Perfect for active developers.'),
('Agency Pack', 10000, 75, 'For teams and power users.')
on conflict (id) do nothing;

insert into templates (title, description, cost) values
('E-commerce Storefront', 'A modern, responsive e-commerce template.', 250),
('Minimalist Blog', 'A clean and professional blog template.', 100),
('Creative Portfolio', 'A portfolio template for creative professionals.', 150),
('SaaS Landing Page', 'A landing page template for a SaaS product.', 200)
on conflict (id) do nothing;

insert into mentors (name, specialties, reputation, cost) values
('Jane Doe', '{"React", "Next.js"}', 4.9, 500),
('John Smith', '{"AI", "Python", "Genkit"}', 4.8, 600),
('Alex Ray', '{"UI/UX", "Figma"}', 4.9, 450),
('Sarah Chen', '{"Database", "Supabase"}', 4.7, 550)
on conflict (id) do nothing;

insert into learning_modules (title, description, cost) values
('Advanced React Patterns', 'Deep dive into modern React techniques.', 50),
('Building with AI', 'Learn how to integrate generative AI.', 75),
('UI/UX Design Fundamentals', 'Master the basics of user-centric design.', 40),
('Supabase for Beginners', 'Get started with Supabase from scratch.', 30)
on conflict (id) do nothing;

--
-- ROW LEVEL SECURITY (RLS)
--
-- Enable RLS for all tables.
--
alter table profiles enable row level security;
alter table credit_packs enable row level security;
alter table templates enable row level security;
alter table mentors enable row level security;
alter table learning_modules enable row level security;
alter table tasks enable row level security;

--
-- RLS POLICIES
--
-- Allow public read access to non-sensitive data.
create policy "Allow public read access to credit packs" on public.credit_packs for select using (true);
create policy "Allow public read access to templates" on public.templates for select using (true);
create policy "Allow public read access to mentors" on public.mentors for select using (true);
create policy "Allow public read access to learning modules" on public.learning_modules for select using (true);
create policy "Allow public read access to tasks" on public.tasks for select using (true);
create policy "Allow public read access to profiles" on public.profiles for select using (true);

-- Allow users to view their own profile data.
create policy "Allow users to view their own profile" on public.profiles for select using (auth.uid() = id);

-- Allow users to update their own profile.
create policy "Allow users to update their own profile" on public.profiles for update using (auth.uid() = id) with check (auth.uid() = id);

-- Allow authenticated users to create tasks.
create policy "Allow authenticated users to create tasks" on public.tasks for insert with check (auth.role() = 'authenticated');

-- Allow users to update tasks they created or are assigned to.
create policy "Allow users to update assigned or created tasks" on public.tasks for update using (
  auth.uid() = created_by or auth.uid() = assigned_to
);


--
-- DATABASE FUNCTIONS (RPC)
--
-- These functions provide secure, server-side logic.
--

-- Function to add credits to a user's balance
create or replace function add_balance(user_id uuid, add_amount int)
returns void as $$
begin
  update public.profiles
  set balance = balance + add_amount
  where id = user_id;
end;
$$ language plpgsql security definer;

-- Function to deduct credits from a user's balance
create or replace function deduct_balance(user_id uuid, deduct_amount int)
returns void as $$
declare
  current_bal int;
begin
  select balance into current_bal from public.profiles where id = user_id;
  if current_bal < deduct_amount then
    raise exception 'Insufficient credits';
  end if;
  update public.profiles
  set balance = balance - deduct_amount
  where id = user_id;
end;
$$ language plpgsql security definer;

-- Function to create a task and reserve credits in escrow
create or replace function create_task_and_reserve_credits(
    creator_id uuid,
    task_title text,
    task_description text,
    reward integer,
    task_tags text[]
)
returns void as $$
declare
  current_bal int;
begin
    -- Check if user has enough balance
    select balance into current_bal from public.profiles where id = creator_id;
    if current_bal < reward then
        raise exception 'Insufficient credits to create this task.';
    end if;

    -- Move credits from balance to escrow
    update public.profiles
    set
        balance = balance - reward,
        escrow_balance = escrow_balance + reward
    where id = creator_id;

    -- Create the task
    insert into public.tasks(created_by, title, description, credits_reward, tags)
    values(creator_id, task_title, task_description, reward, task_tags);
end;
$$ language plpgsql security definer;

-- Function to approve a task and release credits from escrow
create or replace function approve_task_and_release_credits(
    task_id_input uuid,
    creator_id_input uuid
)
returns void as $$
declare
    task_record public.tasks;
begin
    -- Verify the user is the creator and the task is 'COMPLETED'
    select * into task_record from public.tasks where id = task_id_input and created_by = creator_id_input and status = 'COMPLETED';

    if task_record is null then
        raise exception 'Task cannot be approved. It is either not found, not completed, or you are not the creator.';
    end if;

    -- Move credits from creator's escrow to assignee's balance
    update public.profiles
    set escrow_balance = escrow_balance - task_record.credits_reward
    where id = task_record.created_by;

    update public.profiles
    set balance = balance + task_record.credits_reward
    where id = task_record.assigned_to;

    -- Update task status to 'PAID'
    update public.tasks
    set status = 'PAID', updated_at = now()
    where id = task_id_input;
end;
$$ language plpgsql security definer;
```

---

## Step 3: Test Your Application

After completing the OAuth and database setup, your application should be fully functional. Run your app and test the following:
*   Sign in with both Google and GitHub.
*   Navigate through the app to see if data from the database (e.g., on the Marketplace and Learn pages) is loading.
*   Try performing actions that cost credits, like forking a template.

If you follow these steps, your database will be perfectly configured, and the application will work as designed.
