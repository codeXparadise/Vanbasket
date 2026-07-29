-- ====================================================================
-- MIGRATION: 20260730020000_remove_admin_logs.sql
-- Description: Completely remove public.admin_logs table from database
-- ====================================================================

DROP TABLE IF EXISTS public.admin_logs CASCADE;
