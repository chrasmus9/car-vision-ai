
-- Remove public INSERT and UPDATE policies on analysis_cache
DROP POLICY IF EXISTS "Anyone can insert cached analyses" ON public.analysis_cache;
DROP POLICY IF EXISTS "Anyone can update cached analyses" ON public.analysis_cache;
