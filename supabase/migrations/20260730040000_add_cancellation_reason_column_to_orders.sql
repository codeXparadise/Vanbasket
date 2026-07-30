-- ====================================================================
-- MIGRATION: 20260730040000_add_cancellation_reason_column_to_orders.sql
-- Description: Add cancellation_reason column to public.orders table
-- ====================================================================

ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS cancellation_reason TEXT;
