-- ============================================================
-- FeedM.ee Supabase Database & Storage Setup Script
-- Paste and execute this script inside your Supabase SQL Editor.
-- ============================================================

-- 1. Create Profiles Database Table
CREATE TABLE IF NOT EXISTS public.profiles (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  username TEXT UNIQUE NOT NULL,
  name TEXT,
  bio TEXT,
  avatar_url TEXT,
  custom_hex_color TEXT DEFAULT '#bad1cb',
  social_links JSONB DEFAULT '[]'::jsonb,
  custom_links JSONB DEFAULT '[]'::jsonb,
  reels JSONB DEFAULT '[]'::jsonb,
  lead_form JSONB DEFAULT '{}'::jsonb,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- 2. Create Index on Username for Fast Dynamic Route Queries
CREATE INDEX IF NOT EXISTS profiles_username_idx ON public.profiles(username);

-- 3. Enable Row Level Security (RLS)
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- 4. RLS Policies: Allow Anyone to Read & Upsert Profiles
DROP POLICY IF EXISTS "Allow public read access" ON public.profiles;
CREATE POLICY "Allow public read access"
  ON public.profiles
  FOR SELECT
  USING (true);

DROP POLICY IF EXISTS "Allow public insert and update" ON public.profiles;
CREATE POLICY "Allow public insert and update"
  ON public.profiles
  FOR ALL
  USING (true)
  WITH CHECK (true);

-- 5. Initialize Public Storage Bucket for Creator Videos & Assets
INSERT INTO storage.buckets (id, name, public)
VALUES ('creator-videos', 'creator-videos', true)
ON CONFLICT (id) DO NOTHING;

-- 6. Storage Policies: Allow Public View & Uploads to creator-videos Bucket
DROP POLICY IF EXISTS "Allow public read on creator-videos" ON storage.objects;
CREATE POLICY "Allow public read on creator-videos"
  ON storage.objects
  FOR SELECT
  USING (bucket_id = 'creator-videos');

DROP POLICY IF EXISTS "Allow public upload to creator-videos" ON storage.objects;
CREATE POLICY "Allow public upload to creator-videos"
  ON storage.objects
  FOR INSERT
  WITH CHECK (bucket_id = 'creator-videos');
