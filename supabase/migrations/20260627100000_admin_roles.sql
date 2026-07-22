-- Migration: Support Admin Roles and bypass policies (Recursion Free)
-- Created at: 2026-06-27

-- 1. Add role column to profiles table
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS role TEXT DEFAULT 'user';

-- 2. Update handle_new_user() to assign standard 'user' role by default (No hardcoded credentials)
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

-- 3. Create the SECURITY DEFINER function to check admin status
CREATE OR REPLACE FUNCTION public.is_admin(user_id UUID)
RETURNS BOOLEAN AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1 FROM public.profiles
        WHERE id = user_id AND role = 'admin'
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 4. Profiles policies for admins
CREATE POLICY "Allow admin select profiles" ON public.profiles
    FOR SELECT USING (public.is_admin(auth.uid()));

CREATE POLICY "Allow admin update profiles" ON public.profiles
    FOR UPDATE USING (public.is_admin(auth.uid()));

-- 5. Orders policies for admins
CREATE POLICY "Allow admin select orders" ON public.orders
    FOR SELECT USING (public.is_admin(auth.uid()));

CREATE POLICY "Allow admin update orders" ON public.orders
    FOR UPDATE USING (public.is_admin(auth.uid()));

-- 6. Order items policies for admins
CREATE POLICY "Allow admin select order items" ON public.order_items
    FOR SELECT USING (public.is_admin(auth.uid()));

-- 7. Products policies for admins
CREATE POLICY "Allow admin insert products" ON public.products
    FOR INSERT WITH CHECK (public.is_admin(auth.uid()));

CREATE POLICY "Allow admin update products" ON public.products
    FOR UPDATE USING (public.is_admin(auth.uid()));

CREATE POLICY "Allow admin delete products" ON public.products
    FOR DELETE USING (public.is_admin(auth.uid()));

-- 8. Product Variants policies for admins
CREATE POLICY "Allow admin insert variants" ON public.product_variants
    FOR INSERT WITH CHECK (public.is_admin(auth.uid()));

CREATE POLICY "Allow admin update variants" ON public.product_variants
    FOR UPDATE USING (public.is_admin(auth.uid()));

CREATE POLICY "Allow admin delete variants" ON public.product_variants
    FOR DELETE USING (public.is_admin(auth.uid()));

-- 9. Product Images policies for admins
CREATE POLICY "Allow admin insert images" ON public.product_images
    FOR INSERT WITH CHECK (public.is_admin(auth.uid()));

CREATE POLICY "Allow admin update images" ON public.product_images
    FOR UPDATE USING (public.is_admin(auth.uid()));

CREATE POLICY "Allow admin delete images" ON public.product_images
    FOR DELETE USING (public.is_admin(auth.uid()));

-- 10. Payments policies for admins
CREATE POLICY "Allow admin select payments" ON public.payments
    FOR SELECT USING (public.is_admin(auth.uid()));
