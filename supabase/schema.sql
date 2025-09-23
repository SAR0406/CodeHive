
--
-- Create a table for public profiles
--
create table profiles (
  id uuid references auth.users not null primary key,
  updated_at timestamp with time zone,
  display_name text,
  photo_url text,
  email text,
  balance integer not null default 100,
  escrow_balance integer not null default 0
);

alter table profiles
  enable row level security;

create policy "Public profiles are viewable by everyone." on profiles
  for select using (true);

create policy "Users can insert their own profile." on profiles
  for insert with check (auth.uid() = id);

create policy "Users can update own profile." on profiles
  for update using (auth.uid() = id);


--
-- Create a table for credit packs
--
create table credit_packs (
  id serial primary key,
  name text not null,
  credits integer not null,
  price numeric(10, 2) not null,
  description text
);

alter table credit_packs enable row level security;
create policy "Credit packs are viewable by everyone." on credit_packs for select using (true);

--
-- Create a table for learning modules
--
create table learning_modules (
  id serial primary key,
  title text not null,
  description text,
  cost integer not null
);

alter table learning_modules enable row level security;
create policy "Learning modules are viewable by everyone." on learning_modules for select using (true);

--
-- Create a table for mentors
--
create table mentors (
  id serial primary key,
  name text not null,
  specialties text[] not null,
  reputation integer not null,
  cost integer not null
);

alter table mentors enable row level security;
create policy "Mentors are viewable by everyone." on mentors for select using (true);

--
-- Create a table for templates
--
create table templates (
  id serial primary key,
  title text not null,
  description text,
  cost integer not null
);

alter table templates enable row level security;
create policy "Templates are viewable by everyone." on templates for select using (true);

--
-- Create a table for tasks in the marketplace
--
create table tasks (
  id uuid primary key default gen_random_uuid(),
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now(),
  title text not null,
  description text,
  tags text[] default array[]::text[],
  credits_reward integer not null,
  status text not null default 'OPEN',
  created_by uuid references profiles not null,
  assigned_to uuid references profiles
);

alter table tasks enable row level security;

create policy "Tasks are viewable by everyone." on tasks
  for select using (true);

create policy "Users can create tasks." on tasks
  for insert with check (auth.uid() = created_by);

create policy "Users can update their own tasks." on tasks
  for update using (auth.uid() = created_by or auth.uid() = assigned_to) with check (auth.uid() = created_by or auth.uid() = assigned_to);
  

--
-- Function to deduct credits
--
create or replace function deduct_balance(user_id uuid, deduct_amount integer)
returns void as $$
declare
  current_balance integer;
begin
  select balance into current_balance from profiles where id = user_id;
  if current_balance is null then
    raise exception 'User not found';
  end if;
  if current_balance < deduct_amount then
    raise exception 'Insufficient credits';
  end if;

  update profiles
  set balance = balance - deduct_amount
  where id = user_id;
end;
$$ language plpgsql volatile security definer;

--
-- Function to add credits
--
create or replace function add_balance(user_id uuid, add_amount integer)
returns void as $$
begin
  update profiles
  set balance = balance + add_amount
  where id = user_id;
end;
$$ language plpgsql volatile security definer;


--
-- Function to create a task and reserve credits in escrow
--
create or replace function create_task_and_reserve_credits(
  creator_id uuid,
  task_title text,
  task_description text,
  reward integer,
  task_tags text[]
)
returns void as $$
declare
  current_balance int;
begin
  -- 1. Check if the user has enough balance
  select balance into current_balance from public.profiles where id = creator_id;
  if current_balance < reward then
    raise exception 'Insufficient credits to create this task.';
  end if;

  -- 2. Move credits from balance to escrow
  update public.profiles
  set
    balance = balance - reward,
    escrow_balance = escrow_balance + reward
  where id = creator_id;

  -- 3. Create the task
  insert into public.tasks (created_by, title, description, credits_reward, tags)
  values (creator_id, task_title, task_description, reward, task_tags);
end;
$$ language plpgsql;


--
-- Function to approve a task and transfer credits from escrow to assignee
--
create or replace function approve_task_and_release_credits(
    task_id_input uuid,
    creator_id_input uuid
)
returns void as $$
declare
    task_record tasks;
    assignee_id_val uuid;
    reward_val int;
begin
    -- 1. Get task details and lock the row
    select * into task_record from public.tasks where id = task_id_input for update;

    -- 2. Validate the request
    if task_record is null then
        raise exception 'Task not found.';
    end if;

    if task_record.created_by <> creator_id_input then
        raise exception 'Only the task creator can approve the task.';
    end if;

    if task_record.status <> 'COMPLETED' then
        raise exception 'Task must be in COMPLETED state to be approved.';
    end if;
    
    if task_record.assigned_to is null then
        raise exception 'Task has no assignee.';
    end if;

    assignee_id_val := task_record.assigned_to;
    reward_val := task_record.credits_reward;

    -- 3. Move credits from creator's escrow to assignee's balance
    -- Deduct from creator's escrow
    update public.profiles
    set escrow_balance = escrow_balance - reward_val
    where id = creator_id_input;

    -- Add to assignee's balance
    update public.profiles
    set balance = balance + reward_val
    where id = assignee_id_val;

    -- 4. Update the task status to PAID
    update public.tasks
    set status = 'PAID', updated_at = now()
    where id = task_id_input;

end;
$$ language plpgsql;


-- SEED DATA

-- Credit Packs
INSERT INTO credit_packs (name, credits, price, description) VALUES
('Starter Pack', 500, 5.00, 'A little boost to get you going.'),
('Developer Pack', 2500, 20.00, 'Perfect for active developers.'),
('Agency Pack', 10000, 75.00, 'For teams and power users.');

-- Learning Modules
INSERT INTO learning_modules (title, description, cost) VALUES
('Advanced React Patterns', 'Deepen your understanding of React with advanced patterns.', 200),
('AI with Genkit', 'Learn how to build AI-powered features with Google''s Genkit.', 350),
('Supabase for Beginners', 'Get started with Supabase, the open-source Firebase alternative.', 150),
('UI/UX for Developers', 'Principles of design for developers who want to build beautiful apps.', 100);

-- Mentors
INSERT INTO mentors (name, specialties, reputation, cost) VALUES
('Jane Doe', '{"React", "Next.js", "UI/UX"}', 4950, 500),
('John Smith', '{"AI", "Genkit", "Python"}', 5200, 600),
('Alex Ray', '{"Supabase", "PostgreSQL", "DevOps"}', 4780, 450),
('Sarah Chen', '{"Frontend", "Vue", "Design Systems"}', 5100, 550);

-- Templates
INSERT INTO templates (title, description, cost) VALUES
('E-commerce Storefront', 'A modern, responsive e-commerce template with a built-in shopping cart.', 800),
('Minimalist Blog', 'A clean and professional blog template, perfect for writers and content creators.', 300),
('Creative Portfolio', 'A stylish portfolio template for designers, photographers, and other creatives.', 400),
('SaaS Landing Page', 'A high-converting landing page template for your next software-as-a-service product.', 500);

