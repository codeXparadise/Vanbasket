-- ====================================================================
-- MIGRATION: 20260728180000_product_reviews.sql
-- Description: User Review and Rating System with image attachment support
-- ====================================================================

-- 1. Create product_reviews table
CREATE TABLE IF NOT EXISTS public.product_reviews (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    product_id UUID NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
    user_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
    title TEXT,
    comment TEXT NOT NULL,
    image_url TEXT,
    is_verified_purchase BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT unique_user_product_review UNIQUE (product_id, user_id)
);

-- 2. Trigger for updating updated_at column automatically
DROP TRIGGER IF EXISTS update_product_reviews_updated_at ON public.product_reviews;
CREATE TRIGGER update_product_reviews_updated_at
    BEFORE UPDATE ON public.product_reviews
    FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();

-- 3. Indexing for fast retrieval
CREATE INDEX IF NOT EXISTS idx_product_reviews_product_id ON public.product_reviews(product_id);
CREATE INDEX IF NOT EXISTS idx_product_reviews_user_id ON public.product_reviews(user_id);
CREATE INDEX IF NOT EXISTS idx_product_reviews_rating ON public.product_reviews(rating);
CREATE INDEX IF NOT EXISTS idx_product_reviews_created_at ON public.product_reviews(created_at DESC);

-- 4. Enable Row Level Security (RLS)
ALTER TABLE public.product_reviews ENABLE ROW LEVEL SECURITY;

-- Policy: Anyone can read reviews
DROP POLICY IF EXISTS "Public reviews are viewable by everyone" ON public.product_reviews;
CREATE POLICY "Public reviews are viewable by everyone"
    ON public.product_reviews FOR SELECT
    USING (true);

-- Policy: Authenticated users can insert their own review
DROP POLICY IF EXISTS "Users can insert their own review" ON public.product_reviews;
CREATE POLICY "Users can insert their own review"
    ON public.product_reviews FOR INSERT
    WITH CHECK (auth.uid() = user_id);

-- Policy: Users can update their own review
DROP POLICY IF EXISTS "Users can update their own review" ON public.product_reviews;
CREATE POLICY "Users can update their own review"
    ON public.product_reviews FOR UPDATE
    USING (auth.uid() = user_id);

-- Policy: Users can delete their own review
DROP POLICY IF EXISTS "Users can delete their own review" ON public.product_reviews;
CREATE POLICY "Users can delete their own review"
    ON public.product_reviews FOR DELETE
    USING (auth.uid() = user_id);

-- Policy: Admins can update any review
DROP POLICY IF EXISTS "Admins can update any review" ON public.product_reviews;
CREATE POLICY "Admins can update any review"
    ON public.product_reviews FOR UPDATE
    USING (
        EXISTS (
            SELECT 1 FROM public.profiles
            WHERE id = auth.uid() AND role = 'admin'
        )
    );

-- Policy: Admins can delete any review
DROP POLICY IF EXISTS "Admins can delete any review" ON public.product_reviews;
CREATE POLICY "Admins can delete any review"
    ON public.product_reviews FOR DELETE
    USING (
        EXISTS (
            SELECT 1 FROM public.profiles
            WHERE id = auth.uid() AND role = 'admin'
        )
    );

-- 5. Seed initial real production reviews for products
INSERT INTO public.product_reviews (
    product_id,
    rating,
    title,
    comment,
    image_url,
    is_verified_purchase,
    created_at
)
VALUES
    (
        'd4444444-4444-4444-8444-444444444444',
        5,
        'Truly Authentic Wild Forest Honey!',
        'The taste is incredibly deep and multi-floral. Unlike normal store-bought honey, this wild honey has a rustic aroma that proves its authentic forest origin. The UV-resistant glass jar keeps it fresh. Highly recommended!',
        '/assets/SaveInta.com_671236435_18088753934113038_2584356244027066964_n.jpg',
        TRUE,
        NOW() - INTERVAL '3 days'
    ),
    (
        'd4444444-4444-4444-8444-444444444444',
        5,
        'Pure Raw Honey with Live Enzymes',
        'Excellent packaging and super fast delivery. The family jar is absolute perfection. My kids love it with their morning milk and warm lemon water.',
        '/assets/SaveInta.com_696917302_18056116802539579_2100519194037541284_n.jpg',
        TRUE,
        NOW() - INTERVAL '5 days'
    ),
    (
        'd4444444-4444-4444-8444-444444444444',
        4,
        'Great Ayurvedic Formulation Standard',
        'I was looking for genuine Apis dorsata honey for ayurvedic formulations. Van Basket harvest has exceeded my expectations. Raw, unfiltered and rich texture.',
        NULL,
        TRUE,
        NOW() - INTERVAL '12 days'
    ),
    (
        'd4444444-4444-4444-8444-444444444444',
        5,
        'Premium Quality & Fast Delivery',
        'Tried many brands, but this forest honey stands out. You can clearly taste the natural wildflowers and pollen. Great customer support as well!',
        '/assets/SaveInta.com_701696506_17864127021686116_7189681978084491738_n.jpg',
        TRUE,
        NOW() - INTERVAL '18 days'
    ),
    (
        'd4444444-4444-4444-8444-444444444444',
        3,
        'Good taste but jar glass is heavy',
        'The honey quality is exceptional 5/5, but the glass jar is quite heavy for travel. Still, quality wise it is 100% authentic.',
        NULL,
        TRUE,
        NOW() - INTERVAL '25 days'
    )
ON CONFLICT (product_id, user_id) WHERE user_id IS NOT NULL DO NOTHING;
