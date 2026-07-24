-- ====================================================================
-- VAN BASKET: PRODUCTION DATABASE RESET SCRIPT (02_reset_database.sql)
-- ====================================================================
-- Purpose: Reset database to fresh production-ready state.
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

-- 1. Truncate test transactional tables with CASCADE safety
TRUNCATE TABLE public.order_items CASCADE;
TRUNCATE TABLE public.payments CASCADE;
TRUNCATE TABLE public.orders CASCADE;
TRUNCATE TABLE public.webhook_events CASCADE;
TRUNCATE TABLE public.contact_queries CASCADE;
TRUNCATE TABLE public.password_resets CASCADE;
TRUNCATE TABLE public.addresses CASCADE;

-- Ensure constraint updates for COD support
ALTER TABLE public.orders DROP CONSTRAINT IF EXISTS orders_status_check;
ALTER TABLE public.orders ADD CONSTRAINT orders_status_check CHECK (status IN ('pending', 'pending_cod', 'paid', 'failed', 'shipped', 'delivered', 'cancelled', 'refunded'));

ALTER TABLE public.payments DROP CONSTRAINT IF EXISTS payments_gateway_check;
ALTER TABLE public.payments ADD CONSTRAINT payments_gateway_check CHECK (gateway IN ('razorpay', 'stripe', 'cod', 'cash_on_delivery'));
ALTER TABLE public.payments DROP CONSTRAINT IF EXISTS payments_status_check;
ALTER TABLE public.payments ADD CONSTRAINT payments_status_check CHECK (status IN ('created', 'authorized', 'captured', 'failed', 'refunded', 'pending_cod'));

-- 2. Remove non-admin test profiles
-- (Only accounts with role = 'admin' will be retained)
DELETE FROM public.profiles
WHERE role IS NULL OR role != 'admin';

-- 3. Remove non-admin user entries from Supabase auth.users
-- (Keeps auth users whose IDs correspond to retained admin profiles)
DELETE FROM auth.users
WHERE id NOT IN (
    SELECT id FROM public.profiles WHERE role = 'admin'
);

-- 4. Reset stock quantities and standardize exact prices (250g = ₹349, 500g = ₹599)
UPDATE public.product_variants
SET stock_qty = 100
WHERE is_active = TRUE;

UPDATE public.product_variants
SET price = 349.00
WHERE size_label = '250g';

UPDATE public.product_variants
SET price = 599.00
WHERE size_label = '500g';

-- 5. Verification & Summary Output
DO $$
DECLARE
    admin_count INT;
    product_count INT;
    order_count INT;
    user_count INT;
BEGIN
    SELECT COUNT(*) INTO admin_count FROM public.profiles WHERE role = 'admin';
    SELECT COUNT(*) INTO product_count FROM public.products;
    SELECT COUNT(*) INTO order_count FROM public.orders;
    SELECT COUNT(*) INTO user_count FROM public.profiles WHERE role != 'admin';

    RAISE NOTICE '==================================================';
    RAISE NOTICE 'VAN BASKET DATABASE PRODUCTION RESET COMPLETE!';
    RAISE NOTICE 'Retained Admin Profiles: %', admin_count;
    RAISE NOTICE 'Retained Product Catalog: %', product_count;
    RAISE NOTICE 'Test Orders Count: % (Wiped)', order_count;
    RAISE NOTICE 'Test Users Count: % (Wiped)', user_count;
    RAISE NOTICE '==================================================';
END $$;

COMMIT;
