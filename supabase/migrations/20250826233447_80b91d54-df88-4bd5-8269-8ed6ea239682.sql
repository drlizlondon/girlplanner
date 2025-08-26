-- Phase 1: Critical Data Protection Fixes

-- 1. Add user_id column to tasks table
ALTER TABLE public.tasks ADD COLUMN user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE;

-- 2. Add user_id column to ideas table  
ALTER TABLE public.ideas ADD COLUMN user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE;

-- 3. Add user_id column to task_files table
ALTER TABLE public.task_files ADD COLUMN user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE;

-- 4. Enable RLS on task_files table (currently missing)
ALTER TABLE public.task_files ENABLE ROW LEVEL SECURITY;

-- 5. Update profiles RLS policy to be user-specific instead of public
DROP POLICY IF EXISTS "Users can view their own profile" ON public.profiles;
CREATE POLICY "Users can view their own profile" 
ON public.profiles 
FOR SELECT 
USING (auth.uid() = id);

-- 6. Create secure RLS policies for tasks table
DROP POLICY IF EXISTS "Enable all operations for all users" ON public.tasks;
CREATE POLICY "Users can view their own tasks" 
ON public.tasks 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own tasks" 
ON public.tasks 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own tasks" 
ON public.tasks 
FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own tasks" 
ON public.tasks 
FOR DELETE 
USING (auth.uid() = user_id);

-- 7. Create secure RLS policies for ideas table
DROP POLICY IF EXISTS "Allow all operations for authenticated users" ON public.ideas;
CREATE POLICY "Users can view their own ideas" 
ON public.ideas 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own ideas" 
ON public.ideas 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own ideas" 
ON public.ideas 
FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own ideas" 
ON public.ideas 
FOR DELETE 
USING (auth.uid() = user_id);

-- 8. Create secure RLS policies for task_files table
CREATE POLICY "Users can view their own task files" 
ON public.task_files 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own task files" 
ON public.task_files 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own task files" 
ON public.task_files 
FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own task files" 
ON public.task_files 
FOR DELETE 
USING (auth.uid() = user_id);

-- 9. Fix the handle_new_user function security
DROP FUNCTION IF EXISTS public.handle_new_user();
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, user_name)
  VALUES (new.id, new.email)
  ON CONFLICT (id) DO NOTHING;
  RETURN new;
END;
$$;