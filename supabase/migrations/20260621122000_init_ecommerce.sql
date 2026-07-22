-- Migration: Initialize VÁN Honey e-commerce schema
-- Created at: 2026-06-21

-- Helper Function: Update updated_at timestamp automatically
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 1. PROFILES Table (Extends auth.users 1:1)
CREATE TABLE public.profiles (
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
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();

-- Trigger for updating profile timestamps
CREATE TRIGGER update_profiles_updated_at
    BEFORE UPDATE ON public.profiles
    FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();


-- 2. ADDRESSES Table
CREATE TABLE public.addresses (
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
CREATE TABLE public.products (
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

-- Trigger for updating product timestamps
CREATE TRIGGER update_products_updated_at
    BEFORE UPDATE ON public.products
    FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();


-- 4. PRODUCT_VARIANTS Table
CREATE TABLE public.product_variants (
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
CREATE TABLE public.product_images (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    product_id UUID NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
    image_url TEXT NOT NULL,
    display_order INTEGER NOT NULL DEFAULT 0,
    alt_text TEXT
);


-- 6. ORDERS Table (Keeps history, set null on user deletion)
CREATE TABLE public.orders (
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

-- Trigger for updating order timestamps
CREATE TRIGGER update_orders_updated_at
    BEFORE UPDATE ON public.orders
    FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();


-- 7. ORDER_ITEMS Table
CREATE TABLE public.order_items (
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
CREATE TABLE public.payments (
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


-- 9. WEBHOOK_EVENTS Table (Idempotency check)
CREATE TABLE public.webhook_events (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    gateway TEXT NOT NULL,
    event_type TEXT NOT NULL,
    event_id TEXT NOT NULL,
    payload JSONB NOT NULL,
    processed BOOLEAN NOT NULL DEFAULT FALSE,
    received_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE (gateway, event_id)
);


-- INDEXES FOR PERFORMANCE
CREATE INDEX idx_orders_user_id ON public.orders(user_id);
CREATE INDEX idx_orders_status ON public.orders(status);
CREATE INDEX idx_order_items_order_id ON public.order_items(order_id);
CREATE INDEX idx_payments_order_id ON public.payments(order_id);
CREATE INDEX idx_payments_gateway_payment_id ON public.payments(gateway_payment_id);
CREATE INDEX idx_webhook_events_gateway_event_id ON public.webhook_events(gateway, event_id);


-- ENABLE ROW LEVEL SECURITY
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.addresses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.product_variants ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.product_images ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.webhook_events ENABLE ROW LEVEL SECURITY;


-- ROW LEVEL SECURITY POLICIES

-- Profiles policies
CREATE POLICY "Allow users to view own profile" ON public.profiles
    FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Allow users to update own profile" ON public.profiles
    FOR UPDATE USING (auth.uid() = id);

-- Addresses policies
CREATE POLICY "Allow users to view own addresses" ON public.addresses
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Allow users to insert own addresses" ON public.addresses
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Allow users to update own addresses" ON public.addresses
    FOR UPDATE USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Allow users to delete own addresses" ON public.addresses
    FOR DELETE USING (auth.uid() = user_id);

-- Products policies (Publicly readable)
CREATE POLICY "Allow public read access to products" ON public.products
    FOR SELECT USING (TRUE);

-- Product Variants policies (Publicly readable)
CREATE POLICY "Allow public read access to product_variants" ON public.product_variants
    FOR SELECT USING (TRUE);

-- Product Images policies (Publicly readable)
CREATE POLICY "Allow public read access to product_images" ON public.product_images
    FOR SELECT USING (TRUE);

-- Orders policies (Read only for users)
CREATE POLICY "Allow users to view own orders" ON public.orders
    FOR SELECT USING (auth.uid() = user_id);

-- Order Items policies (Read only for users based on order ownership)
CREATE POLICY "Allow users to view own order items" ON public.order_items
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.orders
            WHERE public.orders.id = public.order_items.order_id
            AND public.orders.user_id = auth.uid()
        )
    );
