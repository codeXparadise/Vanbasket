-- MASTER MIGRATION FILE FOR FRESH VAN BASKET DATABASE SETUP
-- Execute this entire file in Supabase Dashboard -> SQL Editor

-- ====================================================================
-- SECTION 1: INITIAL E-COMMERCE SCHEMA (20260621122000_init_ecommerce.sql)
-- ====================================================================

-- Helper Function: Update updated_at timestamp automatically
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 1. PROFILES Table (Extends auth.users 1:1)
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    full_name TEXT,
    email TEXT UNIQUE,
    phone TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Trigger Function: Auto-create profile row on user signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.profiles (id, full_name, email, phone)
    VALUES (
        NEW.id,
        COALESCE(NEW.raw_user_meta_data->>'full_name', ''),
        NEW.email,
        NEW.phone
    );
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger for auth.users
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();

-- Trigger for updating profile timestamps
DROP TRIGGER IF EXISTS update_profiles_updated_at ON public.profiles;
CREATE TRIGGER update_profiles_updated_at
    BEFORE UPDATE ON public.profiles
    FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();

-- 2. ADDRESSES Table
CREATE TABLE IF NOT EXISTS public.addresses (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    label TEXT,
    line1 TEXT NOT NULL,
    line2 TEXT,
    city TEXT NOT NULL,
    state TEXT NOT NULL,
    postal_code TEXT NOT NULL,
    country TEXT NOT NULL DEFAULT 'IN',
    phone TEXT NOT NULL,
    is_default BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 3. PRODUCTS Table
CREATE TABLE IF NOT EXISTS public.products (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    slug TEXT UNIQUE NOT NULL,
    description TEXT,
    base_price NUMERIC(10,2) NOT NULL CHECK (base_price >= 0),
    currency TEXT NOT NULL DEFAULT 'INR',
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

DROP TRIGGER IF EXISTS update_products_updated_at ON public.products;
CREATE TRIGGER update_products_updated_at
    BEFORE UPDATE ON public.products
    FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();

-- 4. PRODUCT_VARIANTS Table
CREATE TABLE IF NOT EXISTS public.product_variants (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    product_id UUID NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
    size_label TEXT NOT NULL,
    price NUMERIC(10,2) NOT NULL CHECK (price >= 0),
    stock_qty INTEGER NOT NULL DEFAULT 0 CHECK (stock_qty >= 0),
    sku TEXT UNIQUE NOT NULL,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE (product_id, size_label)
);

-- 5. PRODUCT_IMAGES Table
CREATE TABLE IF NOT EXISTS public.product_images (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    product_id UUID NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
    image_url TEXT NOT NULL,
    display_order INTEGER NOT NULL DEFAULT 0,
    alt_text TEXT
);

-- 6. ORDERS Table
CREATE TABLE IF NOT EXISTS public.orders (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    order_number TEXT UNIQUE NOT NULL,
    status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'paid', 'failed', 'shipped', 'delivered', 'cancelled', 'refunded')),
    subtotal NUMERIC(10,2) NOT NULL,
    shipping_fee NUMERIC(10,2) NOT NULL DEFAULT 0,
    total_amount NUMERIC(10,2) NOT NULL CHECK (total_amount >= 0),
    currency TEXT NOT NULL DEFAULT 'INR',
    shipping_address_id UUID REFERENCES public.addresses(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

DROP TRIGGER IF EXISTS update_orders_updated_at ON public.orders;
CREATE TRIGGER update_orders_updated_at
    BEFORE UPDATE ON public.orders
    FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();

-- 7. ORDER_ITEMS Table
CREATE TABLE IF NOT EXISTS public.order_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    order_id UUID NOT NULL REFERENCES public.orders(id) ON DELETE CASCADE,
    variant_id UUID REFERENCES public.product_variants(id) ON DELETE SET NULL,
    product_name_snapshot TEXT NOT NULL,
    variant_label_snapshot TEXT NOT NULL,
    unit_price NUMERIC(10,2) NOT NULL,
    quantity INTEGER NOT NULL CHECK (quantity > 0),
    line_total NUMERIC(10,2) NOT NULL
);

-- 8. PAYMENTS Table
CREATE TABLE IF NOT EXISTS public.payments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    order_id UUID NOT NULL REFERENCES public.orders(id) ON DELETE CASCADE,
    gateway TEXT NOT NULL CHECK (gateway IN ('razorpay', 'stripe')),
    gateway_order_id TEXT,
    gateway_payment_id TEXT,
    status TEXT NOT NULL DEFAULT 'created' CHECK (status IN ('created', 'authorized', 'captured', 'failed', 'refunded')),
    amount NUMERIC(10,2) NOT NULL,
    currency TEXT NOT NULL,
    method TEXT,
    raw_webhook_payload JSONB,
    verified_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE (gateway, gateway_payment_id)
);

-- 9. WEBHOOK_EVENTS Table
CREATE TABLE IF NOT EXISTS public.webhook_events (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    gateway TEXT NOT NULL,
    event_type TEXT NOT NULL,
    event_id TEXT NOT NULL,
    payload JSONB NOT NULL,
    processed BOOLEAN NOT NULL DEFAULT FALSE,
    received_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE (gateway, event_id)
);

-- INDEXES
CREATE INDEX IF NOT EXISTS idx_orders_user_id ON public.orders(user_id);
CREATE INDEX IF NOT EXISTS idx_orders_status ON public.orders(status);
CREATE INDEX IF NOT EXISTS idx_order_items_order_id ON public.order_items(order_id);
CREATE INDEX IF NOT EXISTS idx_payments_order_id ON public.payments(order_id);
CREATE INDEX IF NOT EXISTS idx_payments_gateway_payment_id ON public.payments(gateway_payment_id);
CREATE INDEX IF NOT EXISTS idx_webhook_events_gateway_event_id ON public.webhook_events(gateway, event_id);

-- ENABLE RLS
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.addresses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.product_variants ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.product_images ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.webhook_events ENABLE ROW LEVEL SECURITY;

-- BASE POLICIES
DROP POLICY IF EXISTS "Allow users to view own profile" ON public.profiles;
CREATE POLICY "Allow users to view own profile" ON public.profiles FOR SELECT USING (auth.uid() = id);

DROP POLICY IF EXISTS "Allow users to update own profile" ON public.profiles;
CREATE POLICY "Allow users to update own profile" ON public.profiles FOR UPDATE USING (auth.uid() = id);

DROP POLICY IF EXISTS "Allow users to view own addresses" ON public.addresses;
CREATE POLICY "Allow users to view own addresses" ON public.addresses FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Allow users to insert own addresses" ON public.addresses;
CREATE POLICY "Allow users to insert own addresses" ON public.addresses FOR INSERT WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Allow users to update own addresses" ON public.addresses;
CREATE POLICY "Allow users to update own addresses" ON public.addresses FOR UPDATE USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Allow users to delete own addresses" ON public.addresses;
CREATE POLICY "Allow users to delete own addresses" ON public.addresses FOR DELETE USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Allow public read access to products" ON public.products;
CREATE POLICY "Allow public read access to products" ON public.products FOR SELECT USING (TRUE);

DROP POLICY IF EXISTS "Allow public read access to product_variants" ON public.product_variants;
CREATE POLICY "Allow public read access to product_variants" ON public.product_variants FOR SELECT USING (TRUE);

DROP POLICY IF EXISTS "Allow public read access to product_images" ON public.product_images;
CREATE POLICY "Allow public read access to product_images" ON public.product_images FOR SELECT USING (TRUE);

DROP POLICY IF EXISTS "Allow users to view own orders" ON public.orders;
CREATE POLICY "Allow users to view own orders" ON public.orders FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Allow users to view own order items" ON public.order_items;
CREATE POLICY "Allow users to view own order items" ON public.order_items FOR SELECT USING (
    EXISTS (
        SELECT 1 FROM public.orders
        WHERE public.orders.id = public.order_items.order_id
        AND public.orders.user_id = auth.uid()
    )
);

-- ====================================================================
-- SECTION 2: SEED HONEY CATALOG DATA (20260622120000_seed_van_honey_catalog.sql)
-- ====================================================================

INSERT INTO public.products (
    id, name, slug, description, base_price, currency, is_active
) VALUES (
    'd4444444-4444-4444-8444-444444444444',
    'Raw Wildflower Honey',
    'raw-wildflower-honey',
    'Raw, unfiltered, single-origin wildflower honey in UV-protective amber glass.',
    26.00, 'USD', TRUE
) ON CONFLICT (slug) DO UPDATE SET
    name = EXCLUDED.name, description = EXCLUDED.description, base_price = EXCLUDED.base_price, currency = EXCLUDED.currency, is_active = EXCLUDED.is_active;

INSERT INTO public.product_variants (
    id, product_id, size_label, price, stock_qty, sku, is_active
) VALUES
    ('a1111111-1111-1111-1111-111111111111', 'd4444444-4444-4444-8444-444444444444', '250g Individual Jar', 26.00, 100, 'VAN-HONEY-250G', TRUE),
    ('b2222222-2222-2222-2222-222222222222', 'd4444444-4444-4444-8444-444444444444', '500g Signature Jar', 44.00, 100, 'VAN-HONEY-500G', TRUE),
    ('c3333333-3333-3333-3333-333333333333', 'd4444444-4444-4444-8444-444444444444', '1000g Heirloom Jar', 78.00, 100, 'VAN-HONEY-1000G', TRUE)
ON CONFLICT (id) DO UPDATE SET
    size_label = EXCLUDED.size_label, price = EXCLUDED.price, stock_qty = GREATEST(public.product_variants.stock_qty, EXCLUDED.stock_qty), sku = EXCLUDED.sku, is_active = EXCLUDED.is_active;

INSERT INTO public.product_images (
    product_id, image_url, display_order, alt_text
) VALUES
    ('d4444444-4444-4444-8444-444444444444', '/assets/product-jar-1.png', 1, 'Raw Wildflower Honey signature jar'),
    ('d4444444-4444-4444-8444-444444444444', '/assets/product-jar-2.png', 2, 'Raw Wildflower Honey individual jar')
ON CONFLICT DO NOTHING;

-- ====================================================================
-- SECTION 3: ADMIN ROLES & POLICIES (20260627100000_admin_roles.sql)
-- ====================================================================

ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS role TEXT DEFAULT 'user';

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.profiles (id, full_name, email, phone, role)
    VALUES (
        NEW.id,
        COALESCE(NEW.raw_user_meta_data->>'full_name', ''),
        NEW.email,
        NEW.phone,
        'user'
    );
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION public.is_admin(user_id UUID)
RETURNS BOOLEAN AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1 FROM public.profiles
        WHERE id = user_id AND role = 'admin'
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP POLICY IF EXISTS "Allow admin select profiles" ON public.profiles;
CREATE POLICY "Allow admin select profiles" ON public.profiles FOR SELECT USING (public.is_admin(auth.uid()));

DROP POLICY IF EXISTS "Allow admin update profiles" ON public.profiles;
CREATE POLICY "Allow admin update profiles" ON public.profiles FOR UPDATE USING (public.is_admin(auth.uid()));

DROP POLICY IF EXISTS "Allow admin select orders" ON public.orders;
CREATE POLICY "Allow admin select orders" ON public.orders FOR SELECT USING (public.is_admin(auth.uid()));

DROP POLICY IF EXISTS "Allow admin update orders" ON public.orders;
CREATE POLICY "Allow admin update orders" ON public.orders FOR UPDATE USING (public.is_admin(auth.uid()));

DROP POLICY IF EXISTS "Allow admin select order items" ON public.order_items;
CREATE POLICY "Allow admin select order items" ON public.order_items FOR SELECT USING (public.is_admin(auth.uid()));

DROP POLICY IF EXISTS "Allow admin insert products" ON public.products;
CREATE POLICY "Allow admin insert products" ON public.products FOR INSERT WITH CHECK (public.is_admin(auth.uid()));

DROP POLICY IF EXISTS "Allow admin update products" ON public.products;
CREATE POLICY "Allow admin update products" ON public.products FOR UPDATE USING (public.is_admin(auth.uid()));

DROP POLICY IF EXISTS "Allow admin delete products" ON public.products;
CREATE POLICY "Allow admin delete products" ON public.products FOR DELETE USING (public.is_admin(auth.uid()));

DROP POLICY IF EXISTS "Allow admin insert variants" ON public.product_variants;
CREATE POLICY "Allow admin insert variants" ON public.product_variants FOR INSERT WITH CHECK (public.is_admin(auth.uid()));

DROP POLICY IF EXISTS "Allow admin update variants" ON public.product_variants;
CREATE POLICY "Allow admin update variants" ON public.product_variants FOR UPDATE USING (public.is_admin(auth.uid()));

DROP POLICY IF EXISTS "Allow admin delete variants" ON public.product_variants;
CREATE POLICY "Allow admin delete variants" ON public.product_variants FOR DELETE USING (public.is_admin(auth.uid()));

DROP POLICY IF EXISTS "Allow admin insert images" ON public.product_images;
CREATE POLICY "Allow admin insert images" ON public.product_images FOR INSERT WITH CHECK (public.is_admin(auth.uid()));

DROP POLICY IF EXISTS "Allow admin update images" ON public.product_images;
CREATE POLICY "Allow admin update images" ON public.product_images FOR UPDATE USING (public.is_admin(auth.uid()));

DROP POLICY IF EXISTS "Allow admin delete images" ON public.product_images;
CREATE POLICY "Allow admin delete images" ON public.product_images FOR DELETE USING (public.is_admin(auth.uid()));

DROP POLICY IF EXISTS "Allow admin select payments" ON public.payments;
CREATE POLICY "Allow admin select payments" ON public.payments FOR SELECT USING (public.is_admin(auth.uid()));

-- ====================================================================
-- SECTION 4: COUPONS TABLE (20260627110000_coupons.sql)
-- ====================================================================

CREATE TABLE IF NOT EXISTS public.coupons (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    code TEXT UNIQUE NOT NULL,
    discount_type TEXT NOT NULL CHECK (discount_type IN ('percentage', 'fixed')),
    discount_value NUMERIC(10,2) NOT NULL CHECK (discount_value >= 0),
    min_order_amount NUMERIC(10,2) DEFAULT 0 CHECK (min_order_amount >= 0),
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    expires_at TIMESTAMPTZ
);

ALTER TABLE public.coupons ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Allow public read access to active coupons" ON public.coupons;
CREATE POLICY "Allow public read access to active coupons" ON public.coupons FOR SELECT USING (is_active = TRUE AND (expires_at IS NULL OR expires_at > NOW()));

DROP POLICY IF EXISTS "Allow admin manage coupons" ON public.coupons;
CREATE POLICY "Allow admin manage coupons" ON public.coupons FOR ALL USING (public.is_admin(auth.uid())) WITH CHECK (public.is_admin(auth.uid()));

INSERT INTO public.coupons (code, discount_type, discount_value, min_order_amount)
VALUES ('VAN10', 'percentage', 10.00, 0.00), ('HONEY50', 'fixed', 50.00, 350.00)
ON CONFLICT (code) DO NOTHING;

ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS coupon_code TEXT;
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS discount_amount NUMERIC(10,2) DEFAULT 0;
ALTER TABLE public.product_variants ADD COLUMN IF NOT EXISTS low_stock_threshold INTEGER DEFAULT 5;

-- ====================================================================
-- SECTION 5: FOREST HONEY REFRESH (20260627123000_van_basket_forest_honey_refresh.sql)
-- ====================================================================

UPDATE public.products
SET
  name = 'Van Basket Wild Forest Honey',
  description = 'Premium Apis dorsata wild forest honey sourced from natural tree hives in the dense forests of Chhattisgarh. Multi-floral, additive-free, ethically harvested with local tribal communities, and hygienically packed.'
WHERE slug = 'raw-wildflower-honey';

UPDATE public.product_variants
SET size_label = '250g', price = 350.00, is_active = TRUE
WHERE id = 'a1111111-1111-1111-1111-111111111111';

UPDATE public.product_variants
SET size_label = '500g', price = 599.00, is_active = TRUE
WHERE id = 'b2222222-2222-2222-2222-222222222222';

UPDATE public.product_variants
SET is_active = FALSE
WHERE id = 'c3333333-3333-3333-3333-333333333333';

-- ====================================================================
-- SECTION 6: ADDRESS READ POLICY (20260718090000_admin_role_backfill.sql)
-- ====================================================================

DROP POLICY IF EXISTS "Allow admin select addresses" ON public.addresses;
CREATE POLICY "Allow admin select addresses" ON public.addresses FOR SELECT USING (public.is_admin(auth.uid()));
