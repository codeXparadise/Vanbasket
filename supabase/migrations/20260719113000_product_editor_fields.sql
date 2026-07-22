ALTER TABLE public.products
  ADD COLUMN IF NOT EXISTS compare_at_price NUMERIC(10,2) DEFAULT 0 CHECK (compare_at_price >= 0),
  ADD COLUMN IF NOT EXISTS seo_title TEXT,
  ADD COLUMN IF NOT EXISTS seo_description TEXT,
  ADD COLUMN IF NOT EXISTS seo_keywords TEXT[] DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS seo_tags TEXT[] DEFAULT '{}';
