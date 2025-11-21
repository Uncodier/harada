-- Harada Method App Database Schema
-- This script creates all necessary tables for the Harada Method goal tracking application

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Profiles table (synced with Supabase Auth)
CREATE TABLE IF NOT EXISTS profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT,
  full_name TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW())
);

-- Enable Row Level Security
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- Profiles policies (drop if exists to make idempotent)
DROP POLICY IF EXISTS "Users can view own profile" ON profiles;
CREATE POLICY "Users can view own profile" ON profiles
  FOR SELECT USING (auth.uid() = id);

DROP POLICY IF EXISTS "Users can insert own profile" ON profiles;
CREATE POLICY "Users can insert own profile" ON profiles
  FOR INSERT WITH CHECK (auth.uid() = id);

DROP POLICY IF EXISTS "Users can update own profile" ON profiles;
CREATE POLICY "Users can update own profile" ON profiles
  FOR UPDATE USING (auth.uid() = id);

-- Grids table (stores the main goal and metadata)
CREATE TABLE IF NOT EXISTS grids (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  main_goal TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW())
);

-- Enable Row Level Security
ALTER TABLE grids ENABLE ROW LEVEL SECURITY;

-- Grids policies (drop if exists to make idempotent)
DROP POLICY IF EXISTS "Users can view own grids" ON grids;
CREATE POLICY "Users can view own grids" ON grids
  FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can create own grids" ON grids;
CREATE POLICY "Users can create own grids" ON grids
  FOR INSERT WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update own grids" ON grids;
CREATE POLICY "Users can update own grids" ON grids
  FOR UPDATE USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can delete own grids" ON grids;
CREATE POLICY "Users can delete own grids" ON grids
  FOR DELETE USING (auth.uid() = user_id);

-- Pillars table (the 8 key areas surrounding the main goal)
CREATE TABLE IF NOT EXISTS pillars (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  grid_id UUID NOT NULL REFERENCES grids(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  position INTEGER NOT NULL CHECK (position >= 1 AND position <= 8),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
  UNIQUE(grid_id, position)
);

-- Enable Row Level Security
ALTER TABLE pillars ENABLE ROW LEVEL SECURITY;

-- Pillars policies (users can access pillars of their own grids)
DROP POLICY IF EXISTS "Users can view pillars of own grids" ON pillars;
CREATE POLICY "Users can view pillars of own grids" ON pillars
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM grids WHERE grids.id = pillars.grid_id AND grids.user_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS "Users can create pillars for own grids" ON pillars;
CREATE POLICY "Users can create pillars for own grids" ON pillars
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM grids WHERE grids.id = pillars.grid_id AND grids.user_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS "Users can update pillars of own grids" ON pillars;
CREATE POLICY "Users can update pillars of own grids" ON pillars
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM grids WHERE grids.id = pillars.grid_id AND grids.user_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS "Users can delete pillars of own grids" ON pillars;
CREATE POLICY "Users can delete pillars of own grids" ON pillars
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM grids WHERE grids.id = pillars.grid_id AND grids.user_id = auth.uid()
    )
  );

-- Tasks table (the 64 actionable items, 8 per pillar)
CREATE TABLE IF NOT EXISTS tasks (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  pillar_id UUID NOT NULL REFERENCES pillars(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  tracking_type TEXT NOT NULL CHECK (tracking_type IN ('boolean', 'numeric')),
  unit TEXT, -- e.g., 'km', 'kg', 'mins' (only for numeric tasks)
  position INTEGER NOT NULL CHECK (position >= 1 AND position <= 8),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
  UNIQUE(pillar_id, position)
);

-- Enable Row Level Security
ALTER TABLE tasks ENABLE ROW LEVEL SECURITY;

-- Tasks policies (users can access tasks of their own grids)
DROP POLICY IF EXISTS "Users can view tasks of own grids" ON tasks;
CREATE POLICY "Users can view tasks of own grids" ON tasks
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM pillars
      JOIN grids ON grids.id = pillars.grid_id
      WHERE pillars.id = tasks.pillar_id AND grids.user_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS "Users can create tasks for own grids" ON tasks;
CREATE POLICY "Users can create tasks for own grids" ON tasks
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM pillars
      JOIN grids ON grids.id = pillars.grid_id
      WHERE pillars.id = tasks.pillar_id AND grids.user_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS "Users can update tasks of own grids" ON tasks;
CREATE POLICY "Users can update tasks of own grids" ON tasks
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM pillars
      JOIN grids ON grids.id = pillars.grid_id
      WHERE pillars.id = tasks.pillar_id AND grids.user_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS "Users can delete tasks of own grids" ON tasks;
CREATE POLICY "Users can delete tasks of own grids" ON tasks
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM pillars
      JOIN grids ON grids.id = pillars.grid_id
      WHERE pillars.id = tasks.pillar_id AND grids.user_id = auth.uid()
    )
  );

-- Logs table (daily entries for task tracking)
CREATE TABLE IF NOT EXISTS logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  task_id UUID NOT NULL REFERENCES tasks(id) ON DELETE CASCADE,
  value NUMERIC NOT NULL, -- 1/0 for boolean, actual number for numeric
  notes TEXT,
  logged_at DATE NOT NULL DEFAULT CURRENT_DATE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
  UNIQUE(task_id, logged_at)
);

-- Enable Row Level Security
ALTER TABLE logs ENABLE ROW LEVEL SECURITY;

-- Logs policies (users can access logs of their own tasks)
DROP POLICY IF EXISTS "Users can view logs of own tasks" ON logs;
CREATE POLICY "Users can view logs of own tasks" ON logs
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM tasks
      JOIN pillars ON pillars.id = tasks.pillar_id
      JOIN grids ON grids.id = pillars.grid_id
      WHERE tasks.id = logs.task_id AND grids.user_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS "Users can create logs for own tasks" ON logs;
CREATE POLICY "Users can create logs for own tasks" ON logs
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM tasks
      JOIN pillars ON pillars.id = tasks.pillar_id
      JOIN grids ON grids.id = pillars.grid_id
      WHERE tasks.id = logs.task_id AND grids.user_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS "Users can update logs of own tasks" ON logs;
CREATE POLICY "Users can update logs of own tasks" ON logs
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM tasks
      JOIN pillars ON pillars.id = tasks.pillar_id
      JOIN grids ON grids.id = pillars.grid_id
      WHERE tasks.id = logs.task_id AND grids.user_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS "Users can delete logs of own tasks" ON logs;
CREATE POLICY "Users can delete logs of own tasks" ON logs
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM tasks
      JOIN pillars ON pillars.id = tasks.pillar_id
      JOIN grids ON grids.id = pillars.grid_id
      WHERE tasks.id = logs.task_id AND grids.user_id = auth.uid()
    )
  );

-- Indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_grids_user_id ON grids(user_id);
CREATE INDEX IF NOT EXISTS idx_pillars_grid_id ON pillars(grid_id);
CREATE INDEX IF NOT EXISTS idx_tasks_pillar_id ON tasks(pillar_id);
CREATE INDEX IF NOT EXISTS idx_logs_task_id ON logs(task_id);
CREATE INDEX IF NOT EXISTS idx_logs_logged_at ON logs(logged_at);

-- Function to automatically update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = TIMEZONE('utc', NOW());
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers for updated_at (drop if exists to make idempotent)
DROP TRIGGER IF EXISTS update_profiles_updated_at ON profiles;
CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_grids_updated_at ON grids;
CREATE TRIGGER update_grids_updated_at BEFORE UPDATE ON grids
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_pillars_updated_at ON pillars;
CREATE TRIGGER update_pillars_updated_at BEFORE UPDATE ON pillars
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_tasks_updated_at ON tasks;
CREATE TRIGGER update_tasks_updated_at BEFORE UPDATE ON tasks
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Function to automatically create profile when a new user signs up
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name)
  VALUES (
    NEW.id,
    NEW.email,
    NEW.raw_user_meta_data->>'full_name'
  )
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to create profile automatically when user is created in auth.users
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();

