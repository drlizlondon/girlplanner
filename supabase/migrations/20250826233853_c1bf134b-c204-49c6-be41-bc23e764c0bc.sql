-- Fix remaining RLS issue on task_types table
ALTER TABLE public.task_types ENABLE ROW LEVEL SECURITY;

-- Create RLS policy for task_types (should be publicly readable)
CREATE POLICY "Allow public read access to task types" 
ON public.task_types 
FOR SELECT 
USING (true);