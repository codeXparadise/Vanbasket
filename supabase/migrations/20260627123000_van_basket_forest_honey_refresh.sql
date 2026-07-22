-- Refresh Van Basket catalogue for the production redesign.

UPDATE public.products
SET
  name = 'Van Basket Wild Forest Honey',
  description = 'Premium Apis dorsata wild forest honey sourced from natural tree hives in the dense forests of Chhattisgarh. Multi-floral, additive-free, ethically harvested with local tribal communities, and hygienically packed.',
  short_description = 'Wild Forest Honey from Chhattisgarh tree hives.'
WHERE slug = 'raw-wildflower-honey';

UPDATE public.product_variants
SET
  size_label = '250g',
  price = 350.00,
  is_active = TRUE
WHERE id = 'a1111111-1111-1111-1111-111111111111';

UPDATE public.product_variants
SET
  size_label = '500g',
  price = 699.00,
  is_active = TRUE
WHERE id = 'b2222222-2222-2222-2222-222222222222';

UPDATE public.product_variants
SET is_active = FALSE
WHERE id = 'c3333333-3333-3333-3333-333333333333';
