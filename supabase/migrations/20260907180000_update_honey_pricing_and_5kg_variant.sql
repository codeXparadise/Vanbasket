-- ====================================================================
-- VAN BASKET: UPDATE HONEY PRICING & ADD 5KG SERVING SIZE VARIANT
-- ====================================================================
-- 1. Honey 250g updated to ₹229.00 (with Free Shipping)
-- 2. Honey 500g updated to ₹429.00 (with Free Shipping)
-- 3. Honey 5kg new variant added at ₹2599.00 (with Free Shipping)
-- ====================================================================

BEGIN;

-- 1. Update 250g Honey variant price to 229.00
UPDATE public.product_variants
SET price = 229.00, is_active = TRUE
WHERE id = 'a1111111-1111-1111-1111-111111111111'
   OR (product_id = 'd4444444-4444-4444-8444-444444444444' AND (size_label = '250g' OR size_label = '250 Gram'));

-- Also update products base_price to 229.00
UPDATE public.products
SET base_price = 229.00
WHERE id = 'd4444444-4444-4444-8444-444444444444';

-- 2. Update 500g Honey variant price to 429.00
UPDATE public.product_variants
SET price = 429.00, is_active = TRUE
WHERE id = 'b2222222-2222-2222-2222-222222222222'
   OR (product_id = 'd4444444-4444-4444-8444-444444444444' AND (size_label = '500g' OR size_label = '500 Gram'));

-- 3. Insert or update 5kg Honey variant at 2599.00
INSERT INTO public.product_variants (
    id,
    product_id,
    size_label,
    price,
    stock_qty,
    sku,
    is_active,
    low_stock_threshold
) VALUES (
    'c5555555-5555-5555-5555-555555555555',
    'd4444444-4444-4444-8444-444444444444',
    '5kg',
    2599.00,
    100,
    'VAN-HONEY-5KG',
    TRUE,
    5
)
ON CONFLICT (id) DO UPDATE SET
    size_label = EXCLUDED.size_label,
    price = EXCLUDED.price,
    stock_qty = EXCLUDED.stock_qty,
    sku = EXCLUDED.sku,
    is_active = TRUE;

COMMIT;
