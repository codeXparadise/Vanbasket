DROP POLICY IF EXISTS "Allow admin insert products" ON public.products;
DROP POLICY IF EXISTS "Allow admin update products" ON public.products;
DROP POLICY IF EXISTS "Allow admin delete products" ON public.products;

DROP POLICY IF EXISTS "Allow admin insert variants" ON public.product_variants;
DROP POLICY IF EXISTS "Allow admin update variants" ON public.product_variants;
DROP POLICY IF EXISTS "Allow admin delete variants" ON public.product_variants;

DROP POLICY IF EXISTS "Allow admin insert images" ON public.product_images;
DROP POLICY IF EXISTS "Allow admin update images" ON public.product_images;
DROP POLICY IF EXISTS "Allow admin delete images" ON public.product_images;
