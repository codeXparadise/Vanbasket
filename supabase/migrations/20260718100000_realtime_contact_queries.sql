-- Enable realtime delivery for the admin's new-query notification channel.
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
