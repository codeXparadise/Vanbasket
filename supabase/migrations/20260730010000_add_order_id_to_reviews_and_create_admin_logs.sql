-- ====================================================================
-- MIGRATION: 20260730010000_add_order_id_to_reviews_and_create_admin_logs.sql
-- Description: 
--  1. Add order_id Foreign Key to product_reviews referencing orders(id)
--  2. Create admin_logs table to track admin activities and system events
-- ====================================================================

-- 1. Add order_id column to product_reviews table for order-review relationship
ALTER TABLE public.product_reviews
ADD COLUMN IF NOT EXISTS order_id UUID REFERENCES public.orders(id) ON DELETE SET NULL;

-- Create index for fast foreign key lookups and PostgREST joins
CREATE INDEX IF NOT EXISTS idx_product_reviews_order_id ON public.product_reviews(order_id);

-- 2. Create admin_logs table for comprehensive activity and audit logging
CREATE TABLE IF NOT EXISTS public.admin_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    admin_email TEXT NOT NULL,
    action_type TEXT NOT NULL, -- e.g., ORDER_STATUS_UPDATE, USER_ORDER_CANCELLED, REFUND_PROCESSED, PRODUCT_MUTATION, COUPON_MUTATION, ADMIN_AUTH
    target_resource TEXT, -- e.g., 'Order VAN-982341', 'Product Jamun Pulp'
    details TEXT NOT NULL,
    ip_address TEXT,
    metadata JSONB DEFAULT '{}'::jsonb
);

-- Indexing for fast retrieval and time-series searching
CREATE INDEX IF NOT EXISTS idx_admin_logs_created_at ON public.admin_logs(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_admin_logs_admin_email ON public.admin_logs(admin_email);
CREATE INDEX IF NOT EXISTS idx_admin_logs_action_type ON public.admin_logs(action_type);

-- Enable RLS for admin_logs
ALTER TABLE public.admin_logs ENABLE ROW LEVEL SECURITY;

-- Allow admins to view logs
DROP POLICY IF EXISTS "Admins can view admin logs" ON public.admin_logs;
CREATE POLICY "Admins can view admin logs"
    ON public.admin_logs FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM public.profiles
            WHERE id = auth.uid() AND role = 'admin'
        )
    );

-- Allow authenticated users / server service role to insert logs
DROP POLICY IF EXISTS "Anyone authenticated can insert logs" ON public.admin_logs;
CREATE POLICY "Anyone authenticated can insert logs"
    ON public.admin_logs FOR INSERT
    WITH CHECK (true);
