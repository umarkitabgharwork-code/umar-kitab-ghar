-- Moderation columns for public.reviews (run in Supabase SQL editor if migration not applied)
ALTER TABLE reviews ADD COLUMN IF NOT EXISTS is_approved boolean;
ALTER TABLE reviews ADD COLUMN IF NOT EXISTS is_deleted boolean;
ALTER TABLE reviews ADD COLUMN IF NOT EXISTS user_name text;
ALTER TABLE reviews ADD COLUMN IF NOT EXISTS phone text;

UPDATE reviews SET is_approved = COALESCE(is_approved, true) WHERE is_approved IS NULL;
UPDATE reviews SET is_deleted = COALESCE(is_deleted, false) WHERE is_deleted IS NULL;

ALTER TABLE reviews ALTER COLUMN is_approved SET NOT NULL;
ALTER TABLE reviews ALTER COLUMN is_deleted SET NOT NULL;
ALTER TABLE reviews ALTER COLUMN is_approved SET DEFAULT false;
ALTER TABLE reviews ALTER COLUMN is_deleted SET DEFAULT false;
