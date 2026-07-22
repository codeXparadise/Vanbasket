-- Keep RLS policies setup without hardcoding sensitive emails in SQL migrations.
-- (Admin roles can be assigned dynamically via backend or Supabase dashboard)

-- The orders view joins shipping addresses. Without this admin read policy,
-- the order detail can appear empty even when the order itself is visible.
DROP POLICY IF EXISTS "Allow admin select addresses" ON public.addresses;
CREATE POLICY "Allow admin select addresses" ON public.addresses
    FOR SELECT USING (public.is_admin(auth.uid()));
