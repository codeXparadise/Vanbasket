-- ====================================================================
-- VAN BASKET: ADD HOMEPAGE PRODUCTS & VARIANTS FOR DIRECT CHECKOUT
-- ====================================================================
-- Ensures all products listed on the storefront homepage have active
-- records in products & product_variants with validated pricing and UUIDs
-- for Razorpay payment order creation and inventory tracking.
-- ====================================================================

BEGIN;

-- 1. Honey 1kg Variant
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
    'c3333333-3333-3333-3333-333333333333',
    'd4444444-4444-4444-8444-444444444444',
    '1kg',
    1099.00,
    100,
    'VAN-HONEY-1000G',
    TRUE,
    5
)
ON CONFLICT (id) DO UPDATE SET
    size_label = EXCLUDED.size_label,
    price = EXCLUDED.price,
    stock_qty = EXCLUDED.stock_qty,
    is_active = TRUE;

-- 2. Pure Wild Jamun Pulp
INSERT INTO public.products (
    id,
    name,
    slug,
    description,
    base_price,
    currency,
    is_active
) VALUES (
    'd5555555-5555-5555-8555-555555555555',
    'Pure Wild Jamun Pulp',
    'jamun-pulp',
    '100% natural, thick, seedless Jamun pulp harvested from seasonal forest Jamun trees of Chhattisgarh.',
    499.00,
    'INR',
    TRUE
)
ON CONFLICT (id) DO UPDATE SET
    name = EXCLUDED.name,
    slug = EXCLUDED.slug,
    description = EXCLUDED.description,
    base_price = EXCLUDED.base_price,
    is_active = TRUE;

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
    'e1111111-1111-1111-1111-111111111111',
    'd5555555-5555-5555-8555-555555555555',
    '1 kg',
    499.00,
    100,
    'VAN-JAMUN-1KG',
    TRUE,
    5
)
ON CONFLICT (id) DO UPDATE SET
    size_label = EXCLUDED.size_label,
    price = EXCLUDED.price,
    stock_qty = EXCLUDED.stock_qty,
    is_active = TRUE;

-- 3. Van Basket Forest Gift Hamper
INSERT INTO public.products (
    id,
    name,
    slug,
    description,
    base_price,
    currency,
    is_active
) VALUES (
    'd6666666-6666-6666-8666-666666666666',
    'Van Basket Forest Gift Hamper',
    'gift-hampers',
    'Artisanal luxury festive hamper containing raw forest honey, organic wooden dipper, and signature gift packaging.',
    799.00,
    'INR',
    TRUE
)
ON CONFLICT (id) DO UPDATE SET
    name = EXCLUDED.name,
    slug = EXCLUDED.slug,
    description = EXCLUDED.description,
    base_price = EXCLUDED.base_price,
    is_active = TRUE;

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
    'f1111111-1111-1111-1111-111111111111',
    'd6666666-6666-6666-8666-666666666666',
    'Assorted',
    799.00,
    100,
    'VAN-GIFT-HAMPER',
    TRUE,
    5
)
ON CONFLICT (id) DO UPDATE SET
    size_label = EXCLUDED.size_label,
    price = EXCLUDED.price,
    stock_qty = EXCLUDED.stock_qty,
    is_active = TRUE;

COMMIT;
