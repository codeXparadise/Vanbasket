ALTER TABLE public.product_images
  ADD COLUMN IF NOT EXISTS media_type TEXT NOT NULL DEFAULT 'image';

UPDATE public.product_images
SET media_type = CASE
  WHEN image_url ~* '\\.(mp4|webm|ogg|mov)(\\?.*)?$' THEN 'video'
  ELSE 'image'
END;

ALTER TABLE public.product_images
  DROP CONSTRAINT IF EXISTS product_images_media_type_check;

ALTER TABLE public.product_images
  ADD CONSTRAINT product_images_media_type_check CHECK (media_type IN ('image', 'video'));
