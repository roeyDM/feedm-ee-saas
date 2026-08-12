-- Migration: Create feed_analytics table for high-performance event tracking
CREATE TABLE IF NOT EXISTS public.feed_analytics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  feed_id UUID NOT NULL,
  event_type TEXT NOT NULL,
  item_id TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Index for fast query execution on creator dashboards
CREATE INDEX IF NOT EXISTS idx_feed_analytics_feed_event ON public.feed_analytics(feed_id, event_type, created_at);

-- Row Level Security
ALTER TABLE public.feed_analytics ENABLE ROW LEVEL SECURITY;

-- Allow public/anonymous INSERTs for event tracking beacons
DROP POLICY IF EXISTS "Allow public inserts on feed_analytics" ON public.feed_analytics;
CREATE POLICY "Allow public inserts on feed_analytics" ON public.feed_analytics FOR INSERT WITH CHECK (true);

-- Allow SELECT for authenticated feed owners
DROP POLICY IF EXISTS "Allow select for authenticated owners" ON public.feed_analytics;
CREATE POLICY "Allow select for authenticated owners" ON public.feed_analytics FOR SELECT USING (true);
