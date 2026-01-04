-- Create yield_records table for tracking actual vs predicted yields
CREATE TABLE public.yield_records (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  plant_type TEXT NOT NULL,
  zone TEXT,
  predicted_yield NUMERIC,
  actual_yield NUMERIC,
  predicted_harvest_date DATE,
  actual_harvest_date DATE,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.yield_records ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
CREATE POLICY "Users can view own yield records" ON public.yield_records
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own yield records" ON public.yield_records
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own yield records" ON public.yield_records
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own yield records" ON public.yield_records
  FOR DELETE USING (auth.uid() = user_id);

-- Create care_tasks table for plant care checklists
CREATE TABLE public.care_tasks (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  zone TEXT NOT NULL,
  task_type TEXT NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  frequency TEXT NOT NULL DEFAULT 'daily',
  is_completed BOOLEAN NOT NULL DEFAULT false,
  completed_at TIMESTAMP WITH TIME ZONE,
  due_date DATE NOT NULL DEFAULT CURRENT_DATE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.care_tasks ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
CREATE POLICY "Users can view own care tasks" ON public.care_tasks
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own care tasks" ON public.care_tasks
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own care tasks" ON public.care_tasks
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own care tasks" ON public.care_tasks
  FOR DELETE USING (auth.uid() = user_id);