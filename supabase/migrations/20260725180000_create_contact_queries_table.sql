-- ====================================================================
-- CREATE CONTACT_QUERIES TABLE IF MISSING & GRANT PERMISSIONS
-- ====================================================================

CREATE TABLE IF NOT EXISTS public.contact_queries (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    email TEXT NOT NULL,
    phone TEXT,
    company TEXT,
    quantity TEXT,
    subject TEXT,
    message TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'unread' CHECK (status IN ('unread', 'read', 'archived')),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Add missing columns if table already exists without them
ALTER TABLE public.contact_queries ADD COLUMN IF NOT EXISTS company TEXT;
ALTER TABLE public.contact_queries ADD COLUMN IF NOT EXISTS quantity TEXT;
ALTER TABLE public.contact_queries ADD COLUMN IF NOT EXISTS subject TEXT;

-- Enable Row Level Security (RLS) and grant permissions
ALTER TABLE public.contact_queries ENABLE ROW LEVEL SECURITY;

-- Allow anonymous and authenticated users to insert contact queries
DROP POLICY IF EXISTS "Allow public insert to contact_queries" ON public.contact_queries;
CREATE POLICY "Allow public insert to contact_queries" 
ON public.contact_queries FOR INSERT 
TO public, anon, authenticated 
WITH CHECK (true);

-- Allow authenticated admins to read and update contact queries
DROP POLICY IF EXISTS "Allow admins full access to contact_queries" ON public.contact_queries;
CREATE POLICY "Allow admins full access to contact_queries" 
ON public.contact_queries FOR ALL 
TO authenticated 
USING (true);

-- Add to Realtime Publication for admin live notifications
DO $$
BEGIN
  IF to_regclass('public.contact_queries') IS NOT NULL
     AND NOT EXISTS (
       SELECT 1 FROM pg_publication_tables
       WHERE pubname = 'supabase_realtime'
         AND schemaname = 'public'
         AND tablename = 'contact_queries'
     ) THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.contact_queries;
  END IF;
END $$;
