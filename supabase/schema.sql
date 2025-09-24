--
-- Tabela `profiles`
-- Armazena os perfis dos usuários, incluindo informações de autenticação e saldos de crédito.
--
CREATE TABLE
  profiles (
    id UUID NOT NULL PRIMARY KEY REFERENCES auth.users (id) ON DELETE CASCADE,
    email TEXT,
    display_name TEXT,
    photo_url TEXT,
    balance BIGINT NOT NULL DEFAULT 100,
    escrow_balance BIGINT NOT NULL DEFAULT 0,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
  );

--
-- Políticas de RLS para a tabela `profiles`
--
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- Os usuários podem ler seus próprios perfis.
CREATE POLICY "Users can read their own profile" ON profiles FOR
SELECT
  USING (auth.uid () = id);

-- Os usuários podem atualizar seus próprios perfis.
CREATE POLICY "Users can update their own profile" ON profiles FOR
UPDATE
  USING (auth.uid () = id) WITH CHECK (auth.uid () = id);

--
-- Gatilho para atualizar o campo `updated_at` na tabela `profiles`
--
CREATE TRIGGER handle_updated_at BEFORE
UPDATE ON profiles FOR EACH ROW
EXECUTE PROCEDURE moddatetime (updated_at);

--
-- Tabela `tasks`
-- Armazena tarefas do marketplace da comunidade.
--
CREATE TYPE task_status AS ENUM (
  'OPEN',
  'ASSIGNED',
  'COMPLETED',
  'CANCELLED',
  'PAID'
);

CREATE TABLE
  tasks (
    id UUID NOT NULL PRIMARY KEY DEFAULT gen_random_uuid (),
    title TEXT NOT NULL,
    description TEXT NOT NULL,
    tags TEXT[] NOT NULL DEFAULT ARRAY[]::TEXT[],
    credits_reward BIGINT NOT NULL,
    status task_status NOT NULL DEFAULT 'OPEN',
    created_by UUID NOT NULL REFERENCES auth.users (id),
    assigned_to UUID REFERENCES auth.users (id),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
  );

--
-- Políticas de RLS para a tabela `tasks`
--
ALTER TABLE tasks ENABLE ROW LEVEL SECURITY;

-- Todos os usuários autenticados podem ler todas as tarefas.
CREATE POLICY "Authenticated users can read all tasks" ON tasks FOR
SELECT
  USING (auth.role () = 'authenticated');

-- Os usuários podem criar novas tarefas.
CREATE POLICY "Users can create tasks" ON tasks FOR INSERT
WITH
  CHECK (auth.uid () = created_by);

-- Os usuários podem atualizar tarefas (principalmente o status).
CREATE POLICY "Users can update tasks" ON tasks FOR
UPDATE
  USING (
    (
      auth.uid () = created_by
      AND status <> 'ASSIGNED'
    )
    OR (
      auth.uid () = assigned_to
      AND status = 'ASSIGNED'
    )
  );

--
-- Gatilho para atualizar o campo `updated_at` na tabela `tasks`
--
CREATE TRIGGER handle_updated_at BEFORE
UPDATE ON tasks FOR EACH ROW
EXECUTE PROCEDURE moddatetime (updated_at);

--
-- Tabela `credit_packs`
-- Armazena os pacotes de crédito disponíveis para compra.
--
CREATE TABLE
  credit_packs (
    id SERIAL PRIMARY KEY,
    name TEXT NOT NULL,
    description TEXT,
    credits BIGINT NOT NULL,
    price INT NOT NULL -- Preço em centavos para evitar problemas com ponto flutuante
  );

--
-- Políticas de RLS para a tabela `credit_packs`
--
ALTER TABLE credit_packs ENABLE ROW LEVEL SECURITY;

-- Todos podem ler os pacotes de crédito.
CREATE POLICY "Allow public read access to credit packs" ON credit_packs FOR
SELECT
  USING (true);

--
-- Tabela `templates`
-- Armazena modelos de projetos disponíveis para fork.
--
CREATE TABLE
  templates (
    id SERIAL PRIMARY KEY,
    title TEXT NOT NULL,
    description TEXT NOT NULL,
    cost BIGINT NOT NULL
  );

--
-- Políticas de RLS para a tabela `templates`
--
ALTER TABLE templates ENABLE ROW LEVEL SECURITY;

-- Todos podem ler os modelos.
CREATE POLICY "Allow public read access to templates" ON templates FOR
SELECT
  USING (true);

--
-- Tabela `mentors`
-- Armazena perfis de mentores.
--
CREATE TABLE
  mentors (
    id SERIAL PRIMARY KEY,
    name TEXT NOT NULL,
    specialties TEXT[] NOT NULL,
    reputation INT NOT NULL,
    cost BIGINT NOT NULL
  );

--
-- Políticas de RLS para a tabela `mentors`
--
ALTER TABLE mentors ENABLE ROW LEVEL SECURITY;

-- Todos podem ler os perfis dos mentores.
CREATE POLICY "Allow public read access to mentors" ON mentors FOR
SELECT
  USING (true);

--
-- Tabela `learning_modules`
-- Armazena módulos de aprendizado premium.
--
CREATE TABLE
  learning_modules (
    id SERIAL PRIMARY KEY,
    title TEXT NOT NULL,
    description TEXT NOT NULL,
    cost BIGINT NOT NULL
  );

--
-- Políticas de RLS para a tabela `learning_modules`
--
ALTER TABLE learning_modules ENABLE ROW LEVEL SECURITY;

-- Todos podem ler os módulos de aprendizado.
CREATE POLICY "Allow public read access to learning modules" ON learning_modules FOR
SELECT
  USING (true);

--============================================================================
-- Funções RPC (Chamada de Procedimento Remoto)
--============================================================================
--
-- Função `add_balance`
-- Adiciona um valor especificado ao saldo de um usuário.
--
CREATE OR REPLACE FUNCTION add_balance (user_id UUID, add_amount BIGINT) RETURNS VOID AS $$
BEGIN
    UPDATE profiles
    SET balance = balance + add_amount
    WHERE id = user_id;
END;
$$ LANGUAGE plpgsql;

--
-- Função `deduct_balance`
-- Deduz um valor especificado do saldo de um usuário. Lança um erro se o saldo for insuficiente.
--
CREATE OR REPLACE FUNCTION deduct_balance (user_id UUID, deduct_amount BIGINT) RETURNS VOID AS $$
DECLARE
    current_balance BIGINT;
BEGIN
    -- Seleciona o saldo atual e bloqueia a linha para evitar condições de corrida
    SELECT balance INTO current_balance FROM profiles WHERE id = user_id FOR UPDATE;

    IF current_balance < deduct_amount THEN
        RAISE EXCEPTION 'Insufficient credits';
    END IF;

    UPDATE profiles
    SET balance = balance - deduct_amount
    WHERE id = user_id;
END;
$$ LANGUAGE plpgsql;

--
-- Função `create_task_and_reserve_credits`
-- Cria uma nova tarefa e move os créditos do saldo do criador para o saldo de custódia.
--
CREATE OR REPLACE FUNCTION create_task_and_reserve_credits (
  creator_id UUID,
  task_title TEXT,
  task_description TEXT,
  reward BIGINT,
  task_tags TEXT[]
) RETURNS VOID AS $$
DECLARE
  current_balance BIGINT;
BEGIN
  -- Verifica o saldo do criador e o bloqueia
  SELECT balance INTO current_balance FROM profiles WHERE id = creator_id FOR UPDATE;

  IF current_balance < reward THEN
    RAISE EXCEPTION 'Insufficient credits to create this task.';
  END IF;

  -- Deduz do saldo e adiciona à custódia
  UPDATE profiles
  SET
    balance = balance - reward,
    escrow_balance = escrow_balance + reward
  WHERE
    id = creator_id;

  -- Insere a nova tarefa
  INSERT INTO tasks (created_by, title, description, credits_reward, tags)
  VALUES (creator_id, task_title, task_description, reward, task_tags);
END;
$$ LANGUAGE plpgsql;

--
-- Função `approve_task_and_release_credits`
-- Aprova uma tarefa concluída, transfere créditos do criador para o cessionário e libera a custódia.
--
CREATE OR REPLACE FUNCTION approve_task_and_release_credits (
  task_id_input UUID,
  creator_id_input UUID
) RETURNS VOID AS $$
DECLARE
  task_record RECORD;
BEGIN
  -- Busca a tarefa e bloqueia a linha
  SELECT * INTO task_record FROM tasks WHERE id = task_id_input FOR UPDATE;

  -- Validação
  IF task_record IS NULL THEN
    RAISE EXCEPTION 'Task not found.';
  END IF;
  IF task_record.created_by <> creator_id_input THEN
    RAISE EXCEPTION 'Only the task creator can approve the task.';
  END IF;
  IF task_record.status <> 'COMPLETED' THEN
    RAISE EXCEPTION 'Task must be in COMPLETED state to be approved.';
  END IF;
  IF task_record.assigned_to IS NULL THEN
    RAISE EXCEPTION 'Task has no assignee.';
  END IF;

  -- Libera créditos da custódia do criador
  UPDATE profiles
  SET escrow_balance = escrow_balance - task_record.credits_reward
  WHERE id = task_record.created_by;

  -- Adiciona créditos ao saldo do cessionário
  UPDATE profiles
  SET balance = balance + task_record.credits_reward
  WHERE id = task_record.assigned_to;

  -- Atualiza o status da tarefa para PAGO
  UPDATE tasks
  SET status = 'PAID', updated_at = NOW()
  WHERE id = task_id_input;

END;
$$ LANGUAGE plpgsql;

--============================================================================
-- DADOS INICIAIS (SEED DATA)
--============================================================================
--
-- Insere dados iniciais na tabela `credit_packs`
--
INSERT INTO credit_packs (name, description, credits, price) VALUES
('Starter Pack', 'A small pack to get you started.', 1000, 10),
('Developer Pack', 'Perfect for active developers.', 5000, 45),
('Agency Pack', 'For teams and power users.', 15000, 120);

--
-- Insere dados iniciais na tabela `templates`
--
INSERT INTO templates (id, title, description, cost) VALUES
(1, 'E-commerce Storefront', 'A modern, responsive storefront for any online business.', 500),
(2, 'Minimalist Blog', 'A clean, content-focused blog template.', 250),
(3, 'Creative Portfolio', 'Showcase your work with this stylish portfolio.', 300),
(4, 'SaaS Landing Page', 'A high-converting landing page for your software product.', 400);

--
-- Insere dados iniciais na tabela `mentors`
--
INSERT INTO mentors (id, name, specialties, reputation, cost) VALUES
(1, 'Jane Doe', ARRAY['React', 'Next.js'], 490, 150),
(2, 'John Smith', ARRAY['Databases', 'Supabase', 'PostgreSQL'], 500, 200),
(3, 'Alex Ray', ARRAY['UI/UX Design', 'Figma'], 450, 120),
(4, 'Sarah Chen', ARRAY['AI', 'Python'], 480, 180);

--
-- Insere dados iniciais na tabela `learning_modules`
--
INSERT INTO learning_modules (title, description, cost) VALUES
('Advanced React Patterns', 'Deep dive into hooks, context, and performance.', 100),
('Mastering Supabase', 'From database design to real-time applications.', 150),
('UI Design Fundamentals', 'Learn the principles of creating beautiful interfaces.', 80),
('Intro to Server Actions', 'Understand and implement Next.js Server Actions.', 120);
