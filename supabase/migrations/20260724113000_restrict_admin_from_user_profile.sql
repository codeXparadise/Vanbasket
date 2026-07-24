-- ====================================================================
-- VAN BASKET: PREVENT ADMIN ACCOUNTS FROM USER SIGNUP / PROFILES
-- ====================================================================
-- Purpose: Enforce database level triggers preventing admin emails from
-- being registered or used as regular customer accounts.
-- ====================================================================

BEGIN;

-- 1. Database Trigger Function to prevent Admin Email User Signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
DECLARE
    existing_admin_count INT;
BEGIN
    -- Check if an admin profile already exists with this email
    SELECT COUNT(*) INTO existing_admin_count
    FROM public.profiles
    WHERE email = LOWER(NEW.email) AND role = 'admin';

    IF existing_admin_count > 0 THEN
        RAISE EXCEPTION 'This email address (%) is already assigned as an Administrator. Administrator credentials cannot be registered or used for regular customer accounts.', NEW.email;
    END IF;

    INSERT INTO public.profiles (id, full_name, email, phone, role)
    VALUES (
        NEW.id,
        COALESCE(NEW.raw_user_meta_data->>'full_name', ''),
        NEW.email,
        NEW.phone,
        'user'
    )
    ON CONFLICT (id) DO UPDATE SET
        full_name = EXCLUDED.full_name,
        phone = COALESCE(EXCLUDED.phone, public.profiles.phone);

    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Re-attach trigger for auth.users
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();

COMMIT;
