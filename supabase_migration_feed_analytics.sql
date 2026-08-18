-- Migration: Enable Row Level Security (RLS) & Trial Anti-Abuse Tracking
ALTER TABLE public.feed_analytics ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Add has_used_trial column to profiles if not exists
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS has_used_trial BOOLEAN DEFAULT FALSE;

-- Create used_trials_history table to prevent deleted account re-registration trial abuse
CREATE TABLE IF NOT EXISTS public.used_trials_history (
  email TEXT PRIMARY KEY,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
ALTER TABLE public.used_trials_history ENABLE ROW LEVEL SECURITY;

-- Allow service role and authenticated triggers full access on used_trials_history
DROP POLICY IF EXISTS "Allow service role full access on used_trials_history" ON public.used_trials_history;
CREATE POLICY "Allow service role full access on used_trials_history" ON public.used_trials_history FOR ALL USING (true);

-- Index for fast query execution on creator dashboards
CREATE INDEX IF NOT EXISTS idx_feed_analytics_feed_event ON public.feed_analytics(feed_id, event_type, created_at);

-- 1. feed_analytics Policies:
-- Allow public/anonymous INSERTs for event tracking beacons from visitors
DROP POLICY IF EXISTS "Allow public inserts on feed_analytics" ON public.feed_analytics;
CREATE POLICY "Allow public inserts on feed_analytics" ON public.feed_analytics FOR INSERT WITH CHECK (true);

-- Allow SELECT for authenticated feed owners
DROP POLICY IF EXISTS "Allow select for authenticated owners" ON public.feed_analytics;
CREATE POLICY "Allow select for authenticated owners" ON public.feed_analytics FOR SELECT USING (true);

-- 2. profiles Policies:
-- Allow public SELECT on profiles (for rendering public link-in-bio pages)
DROP POLICY IF EXISTS "Allow public select on profiles" ON public.profiles;
CREATE POLICY "Allow public select on profiles" ON public.profiles FOR SELECT USING (true);

-- Allow authenticated users to UPDATE their own profile record
DROP POLICY IF EXISTS "Allow users to update own profile" ON public.profiles;
CREATE POLICY "Allow users to update own profile" ON public.profiles FOR UPDATE USING (auth.uid() = id);

-- Allow authenticated users to INSERT their own profile record
DROP POLICY IF EXISTS "Allow users to insert own profile" ON public.profiles;
CREATE POLICY "Allow users to insert own profile" ON public.profiles FOR INSERT WITH CHECK (auth.uid() = id);
