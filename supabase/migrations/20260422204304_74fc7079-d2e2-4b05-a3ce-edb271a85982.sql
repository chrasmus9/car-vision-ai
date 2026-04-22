DROP POLICY IF EXISTS "Anyone can view cached analyses" ON public.analysis_cache;

CREATE POLICY "Public or owner can view cached analyses"
ON public.analysis_cache
FOR SELECT
USING (user_id IS NULL OR auth.uid() = user_id);