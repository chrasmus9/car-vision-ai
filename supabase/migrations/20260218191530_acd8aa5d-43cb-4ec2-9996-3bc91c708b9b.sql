
-- Drop the restrictive policies and recreate as permissive
DROP POLICY IF EXISTS "Anyone can insert recent analyses" ON public.recent_analyses;
DROP POLICY IF EXISTS "Anyone can view recent analyses" ON public.recent_analyses;

-- Recreate as permissive
CREATE POLICY "Anyone can view recent analyses"
ON public.recent_analyses
FOR SELECT
USING (true);

CREATE POLICY "Anyone can insert recent analyses"
ON public.recent_analyses
FOR INSERT
WITH CHECK (true);

-- Add UPDATE policy needed for upsert (merge-duplicates)
CREATE POLICY "Anyone can update recent analyses"
ON public.recent_analyses
FOR UPDATE
USING (true)
WITH CHECK (true);
