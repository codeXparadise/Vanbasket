-- ====================================================================
-- VAN BASKET: EXACT PRICING MIGRATION (250g = ₹349, 500g = ₹599)
-- ====================================================================
-- Purpose: Standardize all product variant prices across Supabase DB
-- to resolve pricing discrepancies for Razorpay team compliance review.
-- ====================================================================

BEGIN;

-- Update 250g Jar variant price to ₹349.00
UPDATE public.product_variants
SET price = 349.00
WHERE size_label = '250g';

-- Update 500g Jar variant price to ₹599.00
UPDATE public.product_variants
SET price = 599.00
WHERE size_label = '500g';

COMMIT;
