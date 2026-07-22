-- Migration: Add Razorpay Support and Audit Logging
-- Created at: 2026-06-26

-- 1. Modify the check constraint on public.orders table
ALTER TABLE public.orders DROP CONSTRAINT IF EXISTS orders_status_check;

ALTER TABLE public.orders ADD CONSTRAINT orders_status_check CHECK (
    status = ANY (ARRAY[
        'pending'::text, 'paid'::text, 'failed'::text, 'shipped'::text, 'delivered'::text, 'cancelled'::text, 'refunded'::text,
        'PENDING'::text, 'PAYMENT_INITIATED'::text, 'PAYMENT_SUCCESS'::text, 'PAYMENT_FAILED'::text, 'REFUNDED'::text, 'CANCELLED'::text
    ])
);

-- 2. Create payment_logs table for audit trail
CREATE TABLE IF NOT EXISTS public.payment_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    payment_id UUID REFERENCES public.payments(id) ON DELETE SET NULL,
    order_id UUID REFERENCES public.orders(id) ON DELETE SET NULL,
    event_type TEXT NOT NULL, -- 'request', 'response', 'webhook', 'verification', 'error'
    payload JSONB NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 3. Configure RLS and policies for payments and payment_logs
ALTER TABLE public.payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payment_logs ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Allow users to view own payments" ON public.payments;
CREATE POLICY "Allow users to view own payments" ON public.payments
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.orders
            WHERE public.orders.id = public.payments.order_id
            AND public.orders.user_id = auth.uid()
        )
    );

DROP POLICY IF EXISTS "Allow users to view own payment logs" ON public.payment_logs;
CREATE POLICY "Allow users to view own payment logs" ON public.payment_logs
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.orders
            WHERE public.orders.id = public.payment_logs.order_id
            AND public.orders.user_id = auth.uid()
        )
    );

-- Index for payment_logs performance
CREATE INDEX IF NOT EXISTS idx_payment_logs_order_id ON public.payment_logs(order_id);
CREATE INDEX IF NOT EXISTS idx_payment_logs_payment_id ON public.payment_logs(payment_id);
