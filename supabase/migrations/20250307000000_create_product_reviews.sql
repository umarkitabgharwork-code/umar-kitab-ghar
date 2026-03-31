-- Product reviews table for the ecommerce review system.
-- Run this migration in your Supabase SQL editor or via supabase db push.

CREATE TABLE IF NOT EXISTS product_reviews (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  book_id uuid NOT NULL REFERENCES books(id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  reviewer_name text,
  rating int NOT NULL CHECK (rating >= 1 AND rating <= 5),
  comment text,
  verified_purchase boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(book_id, user_id)
);

CREATE INDEX IF NOT EXISTS idx_product_reviews_book_id ON product_reviews(book_id);
CREATE INDEX IF NOT EXISTS idx_product_reviews_user_id ON product_reviews(user_id);

ALTER TABLE product_reviews ENABLE ROW LEVEL SECURITY;

-- Allow anyone to read reviews
CREATE POLICY "Anyone can read product reviews"
  ON product_reviews FOR SELECT
  USING (true);

-- Authenticated users can insert their own review
CREATE POLICY "Users can insert own review"
  ON product_reviews FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- Users can update their own review
CREATE POLICY "Users can update own review"
  ON product_reviews FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);
