
CREATE TABLE public.recent_analyses (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  finn_code TEXT NOT NULL,
  title TEXT NOT NULL,
  price TEXT,
  year TEXT,
  mileage TEXT,
  fuel TEXT,
  location TEXT,
  image_url TEXT,
  overall_risk TEXT DEFAULT 'low',
  finn_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Public read, no auth needed for this feature
ALTER TABLE public.recent_analyses ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view recent analyses"
ON public.recent_analyses FOR SELECT USING (true);

CREATE POLICY "Anyone can insert recent analyses"
ON public.recent_analyses FOR INSERT WITH CHECK (true);

-- Index for ordering by recency
CREATE INDEX idx_recent_analyses_created_at ON public.recent_analyses (created_at DESC);

-- Unique on finn_code so we upsert instead of duplicate
ALTER TABLE public.recent_analyses ADD CONSTRAINT unique_finn_code UNIQUE (finn_code);
