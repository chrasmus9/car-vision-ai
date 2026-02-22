
-- Create table for caching full analysis results
CREATE TABLE public.analysis_cache (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  finn_code TEXT NOT NULL UNIQUE,
  finn_url TEXT,
  car_data JSONB NOT NULL,
  analysis_data JSONB NOT NULL,
  vegvesen_data JSONB,
  similar_listings JSONB,
  price_stats JSONB,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.analysis_cache ENABLE ROW LEVEL SECURITY;

-- Public read/write (no auth in this app)
CREATE POLICY "Anyone can view cached analyses"
  ON public.analysis_cache FOR SELECT USING (true);

CREATE POLICY "Anyone can insert cached analyses"
  ON public.analysis_cache FOR INSERT WITH CHECK (true);

CREATE POLICY "Anyone can update cached analyses"
  ON public.analysis_cache FOR UPDATE USING (true) WITH CHECK (true);

-- Index for fast lookups
CREATE INDEX idx_analysis_cache_finn_code ON public.analysis_cache (finn_code);
CREATE INDEX idx_analysis_cache_created_at ON public.analysis_cache (created_at);
