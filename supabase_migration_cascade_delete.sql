-- ==============================================================================
-- FeedM SaaS: Foreign Key Cascade Deletion Migration Script
-- Run this script in your Supabase SQL Editor to guarantee zero orphaned records
-- when users are deleted from auth.users.
-- ==============================================================================

-- 1. Profiles Table Foreign Key (referencing auth.users)
ALTER TABLE public.profiles
  DROP CONSTRAINT IF EXISTS profiles_id_fkey,
  ADD CONSTRAINT profiles_id_fkey
    FOREIGN KEY (id)
    REFERENCES auth.users(id)
    ON DELETE CASCADE;

-- 2. Pages Table Foreign Key (referencing auth.users)
ALTER TABLE public.pages
  DROP CONSTRAINT IF EXISTS pages_user_id_fkey,
  ADD CONSTRAINT pages_user_id_fkey
    FOREIGN KEY (user_id)
    REFERENCES auth.users(id)
    ON DELETE CASCADE;

-- 3. Reels Table Foreign Key (referencing auth.users)
ALTER TABLE public.reels
  DROP CONSTRAINT IF EXISTS reels_user_id_fkey,
  ADD CONSTRAINT reels_user_id_fkey
    FOREIGN KEY (user_id)
    REFERENCES auth.users(id)
    ON DELETE CASCADE;

-- 4. Leads Table Foreign Key (referencing auth.users)
ALTER TABLE public.leads
  DROP CONSTRAINT IF EXISTS leads_user_id_fkey,
  ADD CONSTRAINT leads_user_id_fkey
    FOREIGN KEY (user_id)
    REFERENCES auth.users(id)
    ON DELETE CASCADE;

-- 5. Subscriptions Table Foreign Key (referencing auth.users)
ALTER TABLE public.subscriptions
  DROP CONSTRAINT IF EXISTS subscriptions_user_id_fkey,
  ADD CONSTRAINT subscriptions_user_id_fkey
    FOREIGN KEY (user_id)
    REFERENCES auth.users(id)
    ON DELETE CASCADE;
