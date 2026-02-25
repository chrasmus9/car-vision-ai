
-- Remove public INSERT/UPDATE policies on recent_analyses (data poisoning risk)
DROP POLICY IF EXISTS "Anyone can insert recent analyses" ON public.recent_analyses;
DROP POLICY IF EXISTS "Anyone can update recent analyses" ON public.recent_analyses;
