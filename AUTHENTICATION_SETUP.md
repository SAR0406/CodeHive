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
-- 1. Enable UUID generation
create extension if not exists "uuid-ossp";

-- 2. PROFILES TABLE (replaces 'users' table)
-- New users get default 100 credits
create table if not exists public.profiles (
  id uuid primary key,          -- set to auth.uid()
  email text unique,
  display_name text,
  photo_url text,
  credits int not null default 100,
  reputation int not null default 0,
  created_at timestamptz default now()
);
comment on table public.profiles is 'Stores public user data. `id` is a reference to auth.users(id).';


-- 3. TRANSACTIONS TABLE (for audit trail)
create table if not exists public.transactions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  type text not null check (type in ('earn','spend','reserve','release','refund','purchase')),
  amount int not null,
  description text,
  meta jsonb default '{}'::jsonb,
  created_at timestamptz default now()
);
comment on table public.transactions is 'Logs all credit-related activities for auditing.';


-- 4. TASKS TABLE (Marketplace Tasks)
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
comment on table public.tasks is 'Stores tasks for the community marketplace.';


-- 5. ESCROWS TABLE (for task marketplace)
create table if not exists public.escrows (
  id uuid primary key default gen_random_uuid(),
  task_id uuid not null references public.tasks(id) on delete cascade,
  payer_id uuid references public.profiles(id),
  payee_id uuid references public.profiles(id),
  amount int not null,
  status text not null check (status in ('reserved','released','refunded')) default 'reserved',
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);
comment on table public.escrows is 'Manages credits held in escrow for tasks.';


-- 6. Static Data Tables
create table if not exists credit_packs (
  id serial primary key,
  name text not null,
  credits integer not null,
  price integer not null, -- in USD cents
  description text
);

create table if not exists templates (
  id serial primary key,
  title text not null,
  description text,
  cost integer not null
);

create table if not exists mentors (
  id serial primary key,
  name text not null,
  specialties text[] not null,
  reputation integer not null,
  cost integer not null -- credits per session
);

create table if not exists learning_modules (
  id serial primary key,
  title text not null,
  description text,
  cost integer not null
);


-- 7. SEED DATA for static tables
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
('Jane Doe', '{"React", "Next.js"}', 4, 500),
('John Smith', '{"AI", "Python", "Genkit"}', 5, 600),
('Alex Ray', '{"UI/UX", "Figma"}', 5, 450),
('Sarah Chen', '{"Database", "Supabase"}', 4, 550)
on conflict (id) do nothing;

insert into learning_modules (title, description, cost) values
('Advanced React Patterns', 'Deep dive into modern React techniques.', 50),
('Building with AI', 'Learn how to integrate generative AI.', 75),
('UI/UX Design Fundamentals', 'Master the basics of user-centric design.', 40),
('Supabase for Beginners', 'Get started with Supabase from scratch.', 30)
on conflict (id) do nothing;


-- 8. TRIGGERS for automatic timestamp updates
create or replace function public.trigger_update_timestamp()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create trigger trg_escrows_update
before update on public.escrows
for each row execute function public.trigger_update_timestamp();

create trigger trg_tasks_update
before update on public.tasks
for each row execute function public.trigger_update_timestamp();


-- 9. ROW LEVEL SECURITY (RLS)
alter table public.profiles enable row level security;
alter table public.transactions enable row level security;
alter table public.escrows enable row level security;
alter table public.tasks enable row level security;
alter table public.credit_packs enable row level security;
alter table public.templates enable row level security;
alter table public.mentors enable row level security;
alter table public.learning_modules enable row level security;

-- Allow public read access to non-sensitive data
create policy "Allow public read access" on public.credit_packs for select using (true);
create policy "Allow public read access" on public.templates for select using (true);
create policy "Allow public read access" on public.mentors for select using (true);
create policy "Allow public read access" on public.learning_modules for select using (true);
create policy "Allow public read access" on public.tasks for select using (true);

-- Profiles policies
create policy "Allow users to read their own profile" on public.profiles for select using (auth.uid() = id);
create policy "Allow users to create their own profile" on public.profiles for insert with check (auth.uid() = id);
create policy "Allow users to update their own profile" on public.profiles for update using (auth.uid() = id) with check (auth.uid() = id);

-- Tasks policies
create policy "Allow authenticated users to create tasks" on public.tasks for insert with check (auth.role() = 'authenticated');
create policy "Allow users to update assigned or created tasks" on public.tasks for update using (auth.uid() = created_by or auth.uid() = assigned_to);

-- Transactions and Escrows (more restrictive, server-side access only)
create policy "Allow owners to view their transactions" on public.transactions for select using (auth.uid() = user_id);
create policy "Allow involved parties to view escrows" on public.escrows for select using (auth.uid() = payer_id or auth.uid() = payee_id);
create policy "Disallow all client inserts on transactions" on public.transactions for insert with check (false);
create policy "Disallow all client updates on transactions" on public.transactions for update using (false);
create policy "Disallow all client inserts on escrows" on public.escrows for insert with check (false);
create policy "Disallow all client updates on escrows" on public.escrows for update using (false);


-- 10. DATABASE FUNCTIONS (RPC) for atomic operations
-- These should be SECURITY DEFINER to run with elevated privileges.

-- SPEND CREDITS
create or replace function public.spend_credits(uid uuid, amt int, descr text)
returns table(new_balance int) as $$
begin
  -- try to deduct only if enough balance
  update public.profiles
    set credits = credits - amt
    where id = uid and credits >= amt
    returning credits into new_balance;

  if NOT FOUND then
    raise exception 'insufficient_balance';
  end if;

  insert into public.transactions (user_id, type, amount, description)
    values (uid, 'spend', amt, descr);

  return;
end;
$$ language plpgsql security definer;

-- EARN CREDITS
create or replace function public.earn_credits(uid uuid, amt int, descr text)
returns table(new_balance int) as $$
begin
  update public.profiles
    set credits = credits + amt
    where id = uid
    returning credits into new_balance;

  insert into public.transactions (user_id, type, amount, description)
    values (uid, 'earn', amt, descr);

  return;
end;
$$ language plpgsql security definer;

-- RESERVE CREDITS
create or replace function public.reserve_credits(payer uuid, amount int, t_id uuid, payee uuid default null)
returns uuid as $$
declare
  escrow_id uuid;
begin
  -- Check for sufficient balance and deduct credits
  if not exists (select 1 from public.profiles where id = payer and credits >= amount) then
      raise exception 'insufficient_balance';
  end if;

  update public.profiles
    set credits = credits - amount
    where id = payer;

  -- Create the escrow record
  insert into public.escrows (task_id, payer_id, payee_id, amount, status)
    values (t_id, payer, payee, amount, 'reserved')
    returning id into escrow_id;

  -- Log the transaction
  insert into public.transactions (user_id, type, amount, description, meta)
    values (payer, 'reserve', amount, 'Reserved for task', jsonb_build_object('escrow_id', escrow_id, 'task_id', t_id));

  return escrow_id;
end;
$$ language plpgsql security definer;

-- RELEASE ESCROW
create or replace function public.release_escrow(eid uuid)
returns void as $$
declare
  rec record;
begin
  select * into rec from public.escrows where id = eid for update;

  if not found then
    raise exception 'escrow_not_found';
  end if;

  if rec.payee_id is null then
    raise exception 'payee_not_assigned';
  end if;
  
  if rec.status <> 'reserved' then
    raise exception 'invalid_escrow_state';
  end if;

  -- add credits to payee
  update public.profiles set credits = credits + rec.amount where id = rec.payee_id;

  -- mark escrow released
  update public.escrows set status = 'released' where id = eid;

  -- log the release transaction for the payee
  insert into public.transactions (user_id, type, amount, description, meta)
    values (rec.payee_id, 'release', rec.amount, 'Released from escrow', jsonb_build_object('escrow_id', eid, 'task_id', rec.task_id));
end;
$$ language plpgsql security definer;
```

---

## Step 3: Test Your Application

After completing the OAuth and database setup, your application should be fully functional. Run your app and test the following:
*   Sign in with both Google and GitHub.
*   Navigate through the app to see if data from the database (e.g., on the Marketplace and Learn pages) is loading.
*   Try performing actions that cost credits, like forking a template or creating a task.

If you follow these steps, your database will be perfectly configured, and the application will work as designed.
