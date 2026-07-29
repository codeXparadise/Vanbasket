-- ====================================================================
-- MIGRATION: 20260730030000_create_cancelled_orders_table.sql
-- Description: Dedicated table for storing customer cancelled order records,
--              exact cancellation reasons, timestamps, and refund audit details.
-- ====================================================================

-- 1. Create cancelled_orders table
CREATE TABLE IF NOT EXISTS public.cancelled_orders (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    order_id UUID NOT NULL REFERENCES public.orders(id) ON DELETE CASCADE,
    order_number TEXT NOT NULL,
    user_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    customer_name TEXT,
    customer_email TEXT,
    customer_phone TEXT,
    cancel_reason TEXT NOT NULL DEFAULT 'Cancelled by customer',
    total_amount NUMERIC(10, 2) NOT NULL DEFAULT 0.00,
    payment_gateway TEXT DEFAULT 'razorpay',
    refund_id TEXT,
    refund_status TEXT DEFAULT 'processed',
    cancelled_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 2. Indexing for fast retrieval and search
CREATE INDEX IF NOT EXISTS idx_cancelled_orders_order_id ON public.cancelled_orders(order_id);
CREATE INDEX IF NOT EXISTS idx_cancelled_orders_user_id ON public.cancelled_orders(user_id);
CREATE INDEX IF NOT EXISTS idx_cancelled_orders_cancelled_at ON public.cancelled_orders(cancelled_at DESC);

-- 3. Enable Row Level Security (RLS)
ALTER TABLE public.cancelled_orders ENABLE ROW LEVEL SECURITY;

-- Policy: Admins can view all cancelled order records
DROP POLICY IF EXISTS "Admins can view cancelled orders" ON public.cancelled_orders;
CREATE POLICY "Admins can view cancelled orders"
    ON public.cancelled_orders FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM public.profiles
            WHERE id = auth.uid() AND role = 'admin'
        )
    );

-- Policy: Authenticated users can view their own cancelled order records
DROP POLICY IF EXISTS "Users can view their own cancelled orders" ON public.cancelled_orders;
CREATE POLICY "Users can view their own cancelled orders"
    ON public.cancelled_orders FOR SELECT
    USING (auth.uid() = user_id);

-- Policy: Service role & authenticated users can insert cancellation records
DROP POLICY IF EXISTS "Anyone authenticated can insert cancelled orders" ON public.cancelled_orders;
CREATE POLICY "Anyone authenticated can insert cancelled orders"
    ON public.cancelled_orders FOR INSERT
    WITH CHECK (true);
