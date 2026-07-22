-- Migration: Update variants prices for van basket branding
-- Created at: 2026-06-26

UPDATE public.product_variants
SET price = 350.00
WHERE id = 'a1111111-1111-1111-1111-111111111111';

UPDATE public.product_variants
SET price = 699.00
WHERE id = 'b2222222-2222-2222-2222-222222222222';

UPDATE public.product_variants
SET is_active = FALSE
WHERE id = 'c3333333-3333-3333-3333-333333333333';
