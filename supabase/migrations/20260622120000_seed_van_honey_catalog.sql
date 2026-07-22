-- Seed the catalog entries referenced by the storefront UI.

INSERT INTO public.products (
    id,
    name,
    slug,
    description,
    base_price,
    currency,
    is_active
)
VALUES (
    'd4444444-4444-4444-8444-444444444444',
    'Raw Wildflower Honey',
    'raw-wildflower-honey',
    'Raw, unfiltered, single-origin wildflower honey in UV-protective amber glass.',
    26.00,
    'USD',
    TRUE
)
ON CONFLICT (slug) DO UPDATE SET
    name = EXCLUDED.name,
    description = EXCLUDED.description,
    base_price = EXCLUDED.base_price,
    currency = EXCLUDED.currency,
    is_active = EXCLUDED.is_active;

INSERT INTO public.product_variants (
    id,
    product_id,
    size_label,
    price,
    stock_qty,
    sku,
    is_active
)
VALUES
    (
        'a1111111-1111-1111-1111-111111111111',
        'd4444444-4444-4444-8444-444444444444',
        '250g Individual Jar',
        26.00,
        100,
        'VAN-HONEY-250G',
        TRUE
    ),
    (
        'b2222222-2222-2222-2222-222222222222',
        'd4444444-4444-4444-8444-444444444444',
        '500g Signature Jar',
        44.00,
        100,
        'VAN-HONEY-500G',
        TRUE
    ),
    (
        'c3333333-3333-3333-3333-333333333333',
        'd4444444-4444-4444-8444-444444444444',
        '1000g Heirloom Jar',
        78.00,
        100,
        'VAN-HONEY-1000G',
        TRUE
    )
ON CONFLICT (id) DO UPDATE SET
    size_label = EXCLUDED.size_label,
    price = EXCLUDED.price,
    stock_qty = GREATEST(public.product_variants.stock_qty, EXCLUDED.stock_qty),
    sku = EXCLUDED.sku,
    is_active = EXCLUDED.is_active;

INSERT INTO public.product_images (
    product_id,
    image_url,
    display_order,
    alt_text
)
VALUES
    (
        'd4444444-4444-4444-8444-444444444444',
        '/assets/product-jar-1.png',
        1,
        'Raw Wildflower Honey signature jar'
    ),
    (
        'd4444444-4444-4444-8444-444444444444',
        '/assets/product-jar-2.png',
        2,
        'Raw Wildflower Honey individual jar'
    )
ON CONFLICT DO NOTHING;
