-- Migration: Create Coupons table and seed data
-- Created at: 2026-06-27

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

CREATE POLICY "Allow public read access to active coupons" ON public.coupons
    FOR SELECT USING (is_active = TRUE AND (expires_at IS NULL OR expires_at > NOW()));

CREATE POLICY "Allow admin manage coupons" ON public.coupons
    FOR ALL USING (public.is_admin(auth.uid())) WITH CHECK (public.is_admin(auth.uid()));

-- Insert seed coupons
INSERT INTO public.coupons (code, discount_type, discount_value, min_order_amount)
VALUES 
    ('VAN10', 'percentage', 10.00, 0.00),
    ('HONEY50', 'fixed', 50.00, 350.00)
ON CONFLICT (code) DO NOTHING;

-- Modify orders table to hold coupon application details
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS coupon_code TEXT;
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS discount_amount NUMERIC(10,2) DEFAULT 0;

-- Modify product_variants to hold inventory threshold alert settings
ALTER TABLE public.product_variants ADD COLUMN IF NOT EXISTS low_stock_threshold INTEGER DEFAULT 5;
