"use client";

import React, { useEffect, useMemo, useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { AlertCircle, Mail, ShoppingBag, ShieldCheck } from "lucide-react";
import { useCart } from "@/context/CartContext";
import { createClient } from "@/utils/supabase/client";
import { LottiePlayer } from "@/components/LottiePlayer";

interface ProductRecord {
  id: string;
  name: string;
  description: string | null;
  product_variants: Array<{
    id: string;
    size_label: string;
    price: number;
    stock_qty: number;
    low_stock_threshold?: number;
    is_active: boolean;
  }>;
  product_images: Array<{
    image_url: string;
    display_order: number;
  }>;
}

interface Variant {
  id: string;
  size: string;
  name: string;
  price: number;
  description: string;
  image: string;
  stock_qty: number;
  low_stock_threshold: number;
  isBulk?: boolean;
  canOrder?: boolean;
}

const defaultDescription =
  "Apis dorsata raw honey gathered from wild hives in Chhattisgarh forests. Unfiltered, pure, and naturally multi-floral with deep therapeutic qualities.";

const fallbackVariants: Variant[] = [
  {
    id: "a1111111-1111-1111-1111-111111111111",
    size: "250g",
    name: "Daily Forest Jar",
    price: 350,
    description: "Compact premium jar for daily wellness, tea, warm water, and gifting.",
    image: "/assets/product-jar-1.png",
    stock_qty: 99,
    low_stock_threshold: 6,
    canOrder: true,
  },
  {
    id: "b2222222-2222-2222-2222-222222222222",
    size: "500g",
    name: "Family Reserve Jar",
    price: 699,
    description: "Signature family jar with a deeper reserve of wild forest sweetness.",
    image: "/assets/product-jar-2.png",
    stock_qty: 99,
    low_stock_threshold: 6,
    canOrder: true,
  },
];

export const ProductDetail = () => {
  const router = useRouter();
  const [supabase] = useState(() => createClient());
  const { addToCartBatch, setIsCartOpen, isAuthenticated } = useCart();
  const [productTitle, setProductTitle] = useState("Wild Forest Honey");
  const [productDescription, setProductDescription] = useState(defaultDescription);
  const galleryImages = useMemo(() => [
    "/assets/product-1.jpg",
    "/assets/product-2.jpg",
    "/assets/product-3.jpg",
    "/assets/product-4.jpg",
    "/assets/product-5.jpg",
  ], []);
  const [variants, setVariants] = useState<Variant[]>(fallbackVariants);
  const [selectedVariant, setSelectedVariant] = useState<Variant>(fallbackVariants[1]);
  const [isAdding, setIsAdding] = useState(false);
  const [isAdded, setIsAdded] = useState(false);
  const [showSuccessOverlay, setShowSuccessOverlay] = useState(false);
  const [slide, setSlide] = useState(0);

  const productImages = useMemo(() => {
    return galleryImages;
  }, [galleryImages]);

  useEffect(() => {
    const timer = window.setInterval(() => {
      setSlide((current) => (current + 1) % productImages.length);
    }, 3000);

    return () => window.clearInterval(timer);
  }, [productImages.length]);

  useEffect(() => {
    const fetchProductDetails = async () => {
      const { data: prod, error } = await supabase
        .from("products")
        .select("id, name, description, product_variants(*), product_images(*)")
        .eq("slug", "raw-wildflower-honey")
        .maybeSingle();

      if (error || !prod) {
        // Fallback variants using product-1.jpg
        const mappedFallbacks = fallbackVariants.map((v) => ({
          ...v,
          image: "/assets/product-1.jpg"
        }));
        setVariants(mappedFallbacks);
        setSelectedVariant(mappedFallbacks[1]);
        return;
      }

      const product = prod as ProductRecord;
      const dbVariants: Variant[] = (product.product_variants || [])
        .filter((variant) => variant.is_active)
        .sort((a, b) => a.size_label.localeCompare(b.size_label, undefined, { numeric: true }))
        .map((variant, index) => ({
          id: variant.id,
          size: variant.size_label,
          name: `${product.name} ${variant.size_label}`,
          price: Number(variant.price),
          description: product.description || fallbackVariants[index]?.description || defaultDescription,
          image: "/assets/product-1.jpg",
          stock_qty: variant.stock_qty,
          low_stock_threshold: variant.low_stock_threshold || 6,
          canOrder: true,
        }));

      if (dbVariants.length === 0) return;

      setProductTitle(product.name || "Wild Forest Honey");
      setProductDescription(product.description || defaultDescription);
      setVariants(dbVariants);
      setSelectedVariant(dbVariants[0]);
      setSlide(0);
    };

    fetchProductDetails();
  }, [supabase]);

  const bulkVariant: Variant = {
    id: "bulk-order",
    size: "Bulk",
    name: "Wholesale Reserve",
    price: 0,
    description: "Custom packaging, wedding favors, corporate gifting, and larger harvests.",
    image: galleryImages[0] || "/assets/product-jar-1.png",
    stock_qty: 999,
    low_stock_threshold: 0,
    isBulk: true,
    canOrder: true,
  };

  const visibleVariants = [...variants, bulkVariant];
  const isLowStock = !selectedVariant.isBulk && selectedVariant.stock_qty <= selectedVariant.low_stock_threshold;
  const isSoldOut = !selectedVariant.isBulk && selectedVariant.stock_qty === 0;
  const canOrderSelectedVariant = !selectedVariant.isBulk && selectedVariant.canOrder !== false;

  const handleAddToCartOnly = () => {
    if (selectedVariant.isBulk || isSoldOut || !canOrderSelectedVariant) return;

    setIsAdding(true);
    addToCartBatch(
      {
        id: selectedVariant.id,
        name: productTitle,
        variant: selectedVariant.size,
        price: selectedVariant.price,
        image: selectedVariant.image,
      },
      1
    );

    setIsAdding(false);
    setIsCartOpen(true);
    setIsAdded(true);
    setShowSuccessOverlay(true);

    window.setTimeout(() => {
      setIsAdded(false);
      setShowSuccessOverlay(false);
    }, 2000);
  };

  const handleBuyNow = () => {
    if (selectedVariant.isBulk || isSoldOut || !canOrderSelectedVariant) return;

    addToCartBatch(
      {
        id: selectedVariant.id,
        name: productTitle,
        variant: selectedVariant.size,
        price: selectedVariant.price,
        image: selectedVariant.image,
      },
      1
    );

    if (!isAuthenticated) {
      router.push(`/login?redirect=${encodeURIComponent("/checkout")}`);
      return;
    }

    router.push("/checkout");
  };

  return (
    <section id="shop" className="relative bg-[#faf8f5] py-20 text-brand-espresso">
      {showSuccessOverlay && (
        <div className="fixed inset-0 bg-brand-espresso/30 backdrop-blur-md z-50 flex items-center justify-center">
          <div className="bg-white rounded-[32px] p-8 shadow-2xl flex flex-col items-center max-w-sm text-center border border-brand-cream-dark/60 animate-fade-in-up">
            <div className="h-32 w-32">
              <LottiePlayer
                src="/lottie/Add to cart (1).lottie"
                label="Added to Cart Successfully"
                loop={false}
                className="w-full h-full"
              />
            </div>
            <h3 className="font-serif text-xl font-bold mt-4 text-brand-espresso">Added to Basket</h3>
            <p className="text-xs text-brand-espresso-muted mt-2 font-light leading-relaxed">
              Your wild forest honey reserve is successfully added to your cart.
            </p>
          </div>
        </div>
      )}

      <div className="mx-auto max-w-7xl px-6 md:px-12">
        <div className="block lg:hidden text-center mb-8 space-y-2">
          <span className="text-[9px] font-bold uppercase tracking-[0.25em] text-brand-honey">Artisanal Selection</span>
          <h2 className="font-serif text-3xl font-black text-brand-espresso whitespace-nowrap overflow-hidden text-ellipsis">
            {productTitle}
          </h2>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-16 lg:items-center">
          <div className="lg:col-span-6 flex justify-center relative">
            <div className="relative aspect-[3/4] w-full max-w-[480px] bg-white border border-brand-cream-dark/40 rounded-[2rem] overflow-hidden p-6 shadow-sm">
              <div className="absolute right-5 top-5 bg-brand-cream-warm/40 text-[9px] uppercase font-bold tracking-widest text-brand-honey px-3 py-1 rounded-full border border-brand-honey/10 z-10">
                Pure Honey
              </div>

              {productImages.map((src, index) => (
                <Image
                  key={`${src}-${index}`}
                  src={src}
                  alt={`${selectedVariant.name} product view ${index + 1}`}
                  fill
                  sizes="(min-width: 1024px) 40vw, 85vw"
                  className={`object-contain p-8 drop-shadow-[0_15px_30px_rgba(36,27,21,0.08)] transition-all duration-700 ${
                    slide === index ? "scale-100 opacity-100" : "scale-95 opacity-0 pointer-events-none"
                  }`}
                />
              ))}

              <div className="absolute bottom-5 left-1/2 -translate-x-1/2 flex gap-2">
                {productImages.map((_, index) => (
                  <button
                    key={index}
                    onClick={() => setSlide(index)}
                    className={`h-1 rounded-full transition-all ${slide === index ? "w-5 bg-brand-honey" : "w-1 bg-brand-espresso/25"}`}
                    aria-label={`Show product view ${index + 1}`}
                  />
                ))}
              </div>
            </div>
          </div>

          <div className="lg:col-span-6 space-y-6">
            <div className="hidden lg:block space-y-2">
              <span className="text-[10px] font-bold uppercase tracking-[0.25em] text-brand-honey block">Artisanal Selection</span>
              <h2 className="font-serif text-4xl font-bold leading-tight">{productTitle}</h2>
            </div>

            <p className="text-xs text-brand-espresso-muted leading-relaxed font-light">{productDescription}</p>

            <div className="space-y-2">
              <label className="text-[9px] uppercase tracking-widest text-brand-espresso-muted font-bold block">Select Size</label>
              <div className="grid grid-cols-3 gap-2">
                {visibleVariants.map((variant) => {
                  const active = selectedVariant.id === variant.id;
                  return (
                    <button
                      key={variant.id}
                      onClick={() => {
                        setSelectedVariant(variant);
                        setSlide(0);
                      }}
                      className={`press-pop py-2.5 text-center border rounded-xl flex flex-col justify-center items-center transition-all duration-300 ${
                        active
                          ? "border-brand-espresso bg-brand-espresso text-brand-cream-light"
                          : "border-brand-cream-dark/60 bg-white hover:border-brand-honey text-brand-espresso"
                      }`}
                    >
                      <span className="text-xs font-bold">{variant.size}</span>
                      <span className={`text-[8px] uppercase font-semibold ${active ? "text-brand-honey" : "text-brand-espresso-muted"}`}>
                        {variant.isBulk ? "Reserve" : `Rs. ${variant.price}`}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="border-t border-brand-cream-dark/40 pt-4 space-y-4">
              <div className="flex gap-3 items-start">
                <ShieldCheck className="w-4 h-4 text-brand-honey flex-shrink-0 mt-0.5" />
                <div>
                  <h4 className="font-serif text-xs font-bold">{selectedVariant.name} allocation</h4>
                  <p className="text-[10px] text-brand-espresso-muted font-light leading-relaxed mt-0.5">
                    {selectedVariant.description}
                  </p>
                </div>
              </div>

              {isLowStock && (
                <div className="inline-flex items-center gap-1.5 bg-brand-terracotta/10 text-brand-terracotta text-[8px] font-bold uppercase tracking-wider px-3 py-1 rounded-full">
                  <AlertCircle className="w-3 h-3" />
                  Limited stock remaining from the current forest harvest
                </div>
              )}

              {!selectedVariant.isBulk && !canOrderSelectedVariant && (
                <div className="inline-flex items-center gap-1.5 bg-brand-cream-warm/70 text-brand-espresso text-[8px] font-bold uppercase tracking-wider px-3 py-1 rounded-full">
                  Storefront preview only until a live admin-managed variant is available.
                </div>
              )}

              <div className="flex flex-row gap-2 pt-2 items-center w-full">
                {selectedVariant.isBulk ? (
                  <button
                    onClick={() => router.push("/contact-us?inquiry=bulk")}
                    className="press-pop flex h-12 flex-1 items-center justify-center rounded-full bg-brand-espresso text-[10px] font-bold uppercase tracking-wider text-brand-cream-light hover:bg-brand-honey hover:text-brand-espresso transition-all duration-300 px-3 text-center"
                  >
                    <Mail className="mr-1.5 h-3.5 w-3.5" />
                    Wholesale Details
                  </button>
                ) : (
                  <>
                    <button
                      onClick={handleBuyNow}
                      disabled={!canOrderSelectedVariant}
                      className="press-pop flex h-12 flex-1 items-center justify-center rounded-full bg-brand-honey text-[10px] font-bold uppercase tracking-wider text-brand-espresso hover:bg-brand-espresso hover:text-brand-cream-light transition-all duration-300 px-4 text-center disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Buy Now - Rs. {selectedVariant.price}
                    </button>

                    <button
                      onClick={handleAddToCartOnly}
                      disabled={isAdding || isAdded || isSoldOut || !canOrderSelectedVariant}
                      className="press-pop flex h-12 w-12 items-center justify-center rounded-full border border-brand-espresso text-brand-espresso bg-white hover:bg-brand-espresso hover:text-brand-cream-light transition-all duration-300 flex-shrink-0 disabled:opacity-50 disabled:cursor-not-allowed"
                      aria-label="Add to cart basket"
                    >
                      <ShoppingBag className="h-4 w-4" />
                    </button>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
