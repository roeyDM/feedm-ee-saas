ALTER TABLE profiles ADD COLUMN IF NOT EXISTS appearance JSONB DEFAULT '{}'::jsonb;
NOTIFY pgrst, 'reload schema';
