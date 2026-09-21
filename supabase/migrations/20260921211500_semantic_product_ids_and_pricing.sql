-- ====================================================================
-- VAN BASKET: PRODUCTION-READY SEMANTIC PRODUCT IDS & PRICING UPDATE
-- ====================================================================
-- 1. Updates Honey Pricing:
--    - Honey 250g: ₹280.00 (Daily Jar)
--    - Honey 500g: ₹480.00 (Family Jar)
--    - Honey 1kg:  ₹1,099.00 (Pantry Reserve)
--    - Honey 5kg:  ₹2,599.00 (Bulk Catering / Large Family)
-- 2. Establishes Human-Readable Semantic Identifiers for all Variants:
--    - van-honey-250g
--    - van-honey-500g
--    - van-honey-1kg
--    - van-honey-5kg
--    - van-jamun-pulp-1kg
--    - van-gift-hamper-luxury
-- ====================================================================

BEGIN;

-- Add semantic_id column to product_variants if it does not already exist
ALTER TABLE public.product_variants 
ADD COLUMN IF NOT EXISTS semantic_id TEXT;

-- Create unique index on semantic_id for fast lookup
CREATE UNIQUE INDEX IF NOT EXISTS idx_product_variants_semantic_id 
ON public.product_variants(semantic_id);

-- 1. Honey 250g
UPDATE public.product_variants
SET 
    price = 280.00,
    semantic_id = 'van-honey-250g',
    sku = COALESCE(sku, 'VAN-HONEY-250G'),
    is_active = TRUE
WHERE id = 'a1111111-1111-1111-1111-111111111111'
   OR (product_id = 'd4444444-4444-4444-8444-444444444444' AND (size_label = '250g' OR size_label = '250 Gram'));

-- Also set base_price on products
UPDATE public.products
SET base_price = 280.00
WHERE id = 'd4444444-4444-4444-8444-444444444444';

-- 2. Honey 500g
UPDATE public.product_variants
SET 
    price = 480.00,
    semantic_id = 'van-honey-500g',
    sku = COALESCE(sku, 'VAN-HONEY-500G'),
    is_active = TRUE
WHERE id = 'b2222222-2222-2222-2222-222222222222'
   OR (product_id = 'd4444444-4444-4444-8444-444444444444' AND (size_label = '500g' OR size_label = '500 Gram'));

-- 3. Honey 1kg
INSERT INTO public.product_variants (
    id,
    product_id,
    size_label,
    price,
    stock_qty,
    sku,
    semantic_id,
    is_active,
    low_stock_threshold
) VALUES (
    'c3333333-3333-3333-3333-333333333333',
    'd4444444-4444-4444-8444-444444444444',
    '1kg',
    1099.00,
    100,
    'VAN-HONEY-1000G',
    'van-honey-1kg',
    TRUE,
    5
)
ON CONFLICT (id) DO UPDATE SET
    size_label = EXCLUDED.size_label,
    price = EXCLUDED.price,
    stock_qty = EXCLUDED.stock_qty,
    sku = EXCLUDED.sku,
    semantic_id = EXCLUDED.semantic_id,
    is_active = TRUE;

-- 4. Honey 5kg
INSERT INTO public.product_variants (
    id,
    product_id,
    size_label,
    price,
    stock_qty,
    sku,
    semantic_id,
    is_active,
    low_stock_threshold
) VALUES (
    'c5555555-5555-5555-5555-555555555555',
    'd4444444-4444-4444-8444-444444444444',
    '5kg',
    2599.00,
    100,
    'VAN-HONEY-5KG',
    'van-honey-5kg',
    TRUE,
    5
)
ON CONFLICT (id) DO UPDATE SET
    size_label = EXCLUDED.size_label,
    price = EXCLUDED.price,
    stock_qty = EXCLUDED.stock_qty,
    sku = EXCLUDED.sku,
    semantic_id = EXCLUDED.semantic_id,
    is_active = TRUE;

-- 5. Jamun Pulp 1kg
INSERT INTO public.product_variants (
    id,
    product_id,
    size_label,
    price,
    stock_qty,
    sku,
    semantic_id,
    is_active,
    low_stock_threshold
) VALUES (
    'e1111111-1111-1111-1111-111111111111',
    'd5555555-5555-5555-8555-555555555555',
    '1 kg',
    499.00,
    100,
    'VAN-JAMUN-1KG',
    'van-jamun-pulp-1kg',
    TRUE,
    5
)
ON CONFLICT (id) DO UPDATE SET
    size_label = EXCLUDED.size_label,
    price = EXCLUDED.price,
    stock_qty = EXCLUDED.stock_qty,
    sku = EXCLUDED.sku,
    semantic_id = EXCLUDED.semantic_id,
    is_active = TRUE;

-- 6. Gift Hamper Luxury
INSERT INTO public.product_variants (
    id,
    product_id,
    size_label,
    price,
    stock_qty,
    sku,
    semantic_id,
    is_active,
    low_stock_threshold
) VALUES (
    'f1111111-1111-1111-1111-111111111111',
    'd6666666-6666-6666-8666-666666666666',
    'Assorted',
    799.00,
    100,
    'VAN-GIFT-HAMPER',
    'van-gift-hamper-luxury',
    TRUE,
    5
)
ON CONFLICT (id) DO UPDATE SET
    size_label = EXCLUDED.size_label,
    price = EXCLUDED.price,
    stock_qty = EXCLUDED.stock_qty,
    sku = EXCLUDED.sku,
    semantic_id = EXCLUDED.semantic_id,
    is_active = TRUE;

COMMIT;
