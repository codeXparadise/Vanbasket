-- ====================================================================
-- VAN BASKET: PRODUCTION DATABASE RESET SCRIPT (SAFE IF TABLES MISSING)
-- ====================================================================
-- Purpose: Reset database to fresh production-ready state after testing.
-- Removes: All test orders, order items, payments, contact queries,
--          webhook logs, password reset tokens, saved user addresses,
--          and non-admin test user accounts (profiles & auth.users).
-- Preserves: Super admin / Admin accounts (profiles with role='admin'),
--            Product catalog (products, product_variants, product_images),
--            Discount coupons, and essential system functions.
--
-- Instructions: Run this script in Supabase Dashboard -> SQL Editor
-- ====================================================================

BEGIN;

-- 1. Truncate test transactional tables with existence checks
DO $$
BEGIN
    IF to_regclass('public.order_items') IS NOT NULL THEN
        EXECUTE 'TRUNCATE TABLE public.order_items CASCADE';
    END IF;

    IF to_regclass('public.payments') IS NOT NULL THEN
        EXECUTE 'TRUNCATE TABLE public.payments CASCADE';
    END IF;

    IF to_regclass('public.orders') IS NOT NULL THEN
        EXECUTE 'TRUNCATE TABLE public.orders CASCADE';
    END IF;

    IF to_regclass('public.webhook_events') IS NOT NULL THEN
        EXECUTE 'TRUNCATE TABLE public.webhook_events CASCADE';
    END IF;

    IF to_regclass('public.contact_queries') IS NOT NULL THEN
        EXECUTE 'TRUNCATE TABLE public.contact_queries CASCADE';
    END IF;

    IF to_regclass('public.password_resets') IS NOT NULL THEN
        EXECUTE 'TRUNCATE TABLE public.password_resets CASCADE';
    END IF;

    IF to_regclass('public.addresses') IS NOT NULL THEN
        EXECUTE 'TRUNCATE TABLE public.addresses CASCADE';
    END IF;
END $$;

-- 2. Remove non-admin test profiles if profiles table exists
DO $$
BEGIN
    IF to_regclass('public.profiles') IS NOT NULL THEN
        DELETE FROM public.profiles
        WHERE role IS NULL OR role != 'admin';
    END IF;
END $$;

-- 3. Remove non-admin user entries from Supabase auth.users
DO $$
BEGIN
    IF to_regclass('public.profiles') IS NOT NULL THEN
        DELETE FROM auth.users
        WHERE id NOT IN (
            SELECT id FROM public.profiles WHERE role = 'admin'
        );
    END IF;
END $$;

-- 4. Reset stock quantities and standardize exact prices (250g = ₹349, 500g = ₹599)
DO $$
BEGIN
    IF to_regclass('public.product_variants') IS NOT NULL THEN
        UPDATE public.product_variants
        SET stock_qty = 100
        WHERE is_active = TRUE;

        UPDATE public.product_variants
        SET price = 349.00
        WHERE size_label = '250g';

        UPDATE public.product_variants
        SET price = 599.00
        WHERE size_label = '500g';
    END IF;
END $$;

-- 5. Verification & Summary Output
DO $$
DECLARE
    admin_count INT := 0;
    product_count INT := 0;
    order_count INT := 0;
    user_count INT := 0;
BEGIN
    IF to_regclass('public.profiles') IS NOT NULL THEN
        SELECT COUNT(*) INTO admin_count FROM public.profiles WHERE role = 'admin';
        SELECT COUNT(*) INTO user_count FROM public.profiles WHERE role != 'admin';
    END IF;

    IF to_regclass('public.products') IS NOT NULL THEN
        SELECT COUNT(*) INTO product_count FROM public.products;
    END IF;

    IF to_regclass('public.orders') IS NOT NULL THEN
        SELECT COUNT(*) INTO order_count FROM public.orders;
    END IF;

    RAISE NOTICE '==================================================';
    RAISE NOTICE 'VAN BASKET DATABASE PRODUCTION RESET COMPLETE!';
    RAISE NOTICE 'Retained Admin Profiles: %', admin_count;
    RAISE NOTICE 'Retained Product Catalog: %', product_count;
    RAISE NOTICE 'Test Orders Count: % (Wiped)', order_count;
    RAISE NOTICE 'Test Users Count: % (Wiped)', user_count;
    RAISE NOTICE '==================================================';
END $$;

COMMIT;
