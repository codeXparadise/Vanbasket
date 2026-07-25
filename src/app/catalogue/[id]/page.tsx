"use client";

import { useEffect, useMemo, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { ArrowLeft, Check, Minus, Plus, ShieldCheck, Truck, ChevronLeft, ChevronRight } from "lucide-react";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { useCart } from "@/context/CartContext";
import { createClient } from "@/utils/supabase/client";

interface ProductImageRow {
  image_url: string;
  display_order: number;
}

interface VariantRow {
  id: string;
  size_label: string;
  price: number;
  stock_qty: number;
  is_active: boolean;
}

interface ProductRow {
  name: string;
  description: string | null;
  product_variants: VariantRow[];
  product_images: ProductImageRow[];
}

const UUID_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

const fallback = {
  name: "Raw Wildflower Honey",
  description:
    "Raw, unfiltered Apis dorsata honey gathered from wild tree hives in the forests of Chhattisgarh. No added sugar, syrup, preservatives or additives.",
  image: "/assets/product-1.jpg",
};

const defaultGallery = [
  "/assets/product-1.jpg",
  "/assets/product-2.jpg",
  "/assets/product-3.jpg",
  "/assets/product-4.jpg",
  "/assets/product-5.jpg",
];

export default function ProductPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const { addToCartBatch, setIsCartOpen, isAuthenticated } = useCart();
  const [supabase] = useState(() => createClient());
  const [product, setProduct] = useState(fallback);
  const [variants, setVariants] = useState<VariantRow[]>([]);
  const [selectedVariantId, setSelectedVariantId] = useState(params?.id || "");
  const [quantity, setQuantity] = useState(1);
  const [added, setAdded] = useState(false);

  // Gallery slider states
  const [galleryImages, setGalleryImages] = useState<string[]>(defaultGallery);
  const [currentImgIndex, setCurrentImgIndex] = useState(0);

  useEffect(() => {
    if (params?.id) {
      setSelectedVariantId(params.id);
    }
  }, [params?.id]);

  useEffect(() => {
    const load = async () => {
      const { data: products, error } = await supabase
        .from("products")
        .select("name,description,product_variants(*),product_images(*)")
        .eq("is_active", true);

      if (error || !products) return;

      const productData =
        (products as ProductRow[]).find((candidate) =>
          candidate.product_variants?.some((variant) => variant.id === params?.id)
        ) || (products as ProductRow[])[0];

      if (!productData) return;

      const activeVariants = (productData.product_variants || [])
        .filter((variant) => variant.is_active)
        .sort((a, b) => a.size_label.localeCompare(b.size_label, undefined, { numeric: true }));

      setProduct({
        name: productData.name || fallback.name,
        description: productData.description || fallback.description,
        image: "/assets/product-1.jpg",
      });
      setVariants(activeVariants);

      setGalleryImages(defaultGallery);

      if (!activeVariants.some((variant) => variant.id === params?.id) && activeVariants[0]) {
        setSelectedVariantId(activeVariants[0].id);
      }
    };

    load();
  }, [params?.id, supabase]);

  const selectedVariant = useMemo(
    () => variants.find((variant) => variant.id === selectedVariantId) || variants[0] || null,
    [selectedVariantId, variants]
  );

  const canOrder = Boolean(selectedVariant && UUID_PATTERN.test(selectedVariant.id));
  const isSoldOut = selectedVariant ? selectedVariant.stock_qty <= 0 : false;
  const displayImage = galleryImages[currentImgIndex] || fallback.image;

  const reserve = () => {
    if (!selectedVariant || !canOrder || isSoldOut) return;

    addToCartBatch(
      {
        id: selectedVariant.id,
        name: product.name,
        variant: selectedVariant.size_label,
        price: Number(selectedVariant.price),
        image: galleryImages[0] || displayImage,
      },
      quantity
    );

    setIsCartOpen(true);
    setAdded(true);
    window.setTimeout(() => setAdded(false), 1800);
  };

  const buyNow = () => {
    if (!selectedVariant || !canOrder || isSoldOut) return;

    addToCartBatch(
      {
        id: selectedVariant.id,
        name: product.name,
        variant: selectedVariant.size_label,
        price: Number(selectedVariant.price),
        image: galleryImages[0] || displayImage,
      },
      quantity
    );

    if (!isAuthenticated) {
      router.push(`/login?redirect=${encodeURIComponent("/checkout")}`);
      return;
    }

    router.push("/checkout");
  };

  const nextSlide = () => {
    setCurrentImgIndex((prev) => (prev + 1) % galleryImages.length);
  };

  const prevSlide = () => {
    setCurrentImgIndex((prev) => (prev - 1 + galleryImages.length) % galleryImages.length);
  };

  return (
    <div className="min-h-screen bg-brand-cream-light text-brand-espresso font-sans">
      <Navbar />
      <main className="max-w-7xl mx-auto px-6 md:px-12 pt-24 pb-24">
        <Link href="/catalogue" className="inline-flex items-center gap-2 eyebrow text-brand-espresso/55 hover:text-brand-honey">
          <ArrowLeft className="w-3.5 h-3.5" /> Back to catalogue
        </Link>

        <div className="grid lg:grid-cols-2 gap-12 lg:gap-24 mt-10 items-start">
          {/* Slideable Gallery Section */}
          <div className="space-y-4">
            <div className="relative aspect-[3/4] bg-white border border-brand-cream-dark/50 overflow-hidden rounded-[2.5rem] flex items-center justify-center group shadow-sm">
              <Image
                src={displayImage}
                alt={product.name}
                fill
                priority
                sizes="(min-width: 1024px) 50vw, 100vw"
                className="object-contain p-6 transition duration-300"
              />

              {/* Slider Controls */}
              {galleryImages.length > 1 && (
                <>
                  <button
                    onClick={prevSlide}
                    className="absolute left-4 top-1/2 -translate-y-1/2 p-2.5 rounded-full bg-white/80 border border-brand-cream-dark/40 text-brand-espresso opacity-0 group-hover:opacity-100 hover:bg-white hover:scale-105 transition-all duration-300"
                    aria-label="Previous slide"
                  >
                    <ChevronLeft className="w-4 h-4 stroke-[2.5]" />
                  </button>
                  <button
                    onClick={nextSlide}
                    className="absolute right-4 top-1/2 -translate-y-1/2 p-2.5 rounded-full bg-white/80 border border-brand-cream-dark/40 text-brand-espresso opacity-0 group-hover:opacity-100 hover:bg-white hover:scale-105 transition-all duration-300"
                    aria-label="Next slide"
                  >
                    <ChevronRight className="w-4 h-4 stroke-[2.5]" />
                  </button>
                </>
              )}
            </div>

            {/* Thumbnail Navigation Row */}
            {galleryImages.length > 1 && (
              <div className="flex gap-3 justify-center items-center overflow-x-auto py-2">
                {galleryImages.map((img, idx) => (
                  <button
                    key={idx}
                    onClick={() => setCurrentImgIndex(idx)}
                    className={`relative w-16 aspect-square rounded-xl bg-white border overflow-hidden p-1.5 transition ${
                      currentImgIndex === idx
                        ? "border-brand-honey ring-2 ring-brand-honey/20 scale-105"
                        : "border-brand-cream-dark/50 opacity-70 hover:opacity-100 hover:scale-102"
                    }`}
                  >
                    <Image
                      src={img}
                      alt={`${product.name} preview thumbnail ${idx + 1}`}
                      fill
                      sizes="64px"
                      className="object-contain p-1"
                    />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Details & Checkouts section */}
          <div className="pt-2">
            <p className="eyebrow">Wild forest reserve</p>
            <h1 className="font-serif text-4xl md:text-5xl font-black leading-tight mt-3">{product.name}</h1>

            <div className="flex items-center gap-3 mt-5">
              <span className="font-serif text-2xl font-bold">
                Rs. {selectedVariant ? Number(selectedVariant.price).toFixed(2) : "350.00"}
              </span>
              <span className="text-xs text-brand-forest">Inclusive of all taxes</span>
            </div>

            <p className="mt-7 text-sm leading-relaxed text-brand-espresso-muted max-w-xl font-light">{product.description}</p>

            <div className="mt-9 border-y border-brand-cream-dark/60 py-6">
              <p className="text-[10px] font-bold uppercase tracking-widest mb-3">Choose your jar</p>
              <div className="flex flex-wrap gap-3">
                {variants.map((variant) => (
                  <button
                    key={variant.id}
                    onClick={() => setSelectedVariantId(variant.id)}
                    className={`px-6 py-3 border text-xs font-bold transition rounded-xl ${
                      selectedVariant?.id === variant.id
                        ? "bg-brand-espresso text-brand-cream-light border-brand-espresso"
                        : "border-brand-cream-dark hover:border-brand-espresso"
                    }`}
                  >
                    {variant.size_label}
                    <span className="block mt-1 font-normal opacity-70">Rs. {Number(variant.price).toFixed(2)}</span>
                  </button>
                ))}
                {variants.length === 0 && (
                  // Fallback variants if database products list returns empty
                  <>
                    <button
                      onClick={() => setSelectedVariantId("a1111111-1111-1111-1111-111111111111")}
                      className={`px-6 py-3 border text-xs font-bold transition rounded-xl ${
                        selectedVariantId === "a1111111-1111-1111-1111-111111111111" || !selectedVariantId
                          ? "bg-brand-espresso text-brand-cream-light border-brand-espresso"
                          : "border-brand-cream-dark hover:border-brand-espresso"
                      }`}
                    >
                      250g
                      <span className="block mt-1 font-normal opacity-70">Rs. 350.00</span>
                    </button>
                    <button
                      onClick={() => setSelectedVariantId("b2222222-2222-2222-2222-222222222222")}
                      className={`px-6 py-3 border text-xs font-bold transition rounded-xl ${
                        selectedVariantId === "b2222222-2222-2222-2222-222222222222"
                          ? "bg-brand-espresso text-brand-cream-light border-brand-espresso"
                          : "border-brand-cream-dark hover:border-brand-espresso"
                      }`}
                    >
                      500g
                      <span className="block mt-1 font-normal opacity-70">Rs. 699.00</span>
                    </button>
                  </>
                )}
              </div>
            </div>

            <div className="flex gap-3 mt-7">
              <div className="flex items-center border border-brand-cream-dark bg-white rounded-xl overflow-hidden">
                <button className="p-3" onClick={() => setQuantity(Math.max(1, quantity - 1))} aria-label="Decrease quantity">
                  <Minus className="w-4 h-4" />
                </button>
                <span className="w-8 text-center text-sm">{quantity}</span>
                <button className="p-3" onClick={() => setQuantity(Math.min(99, quantity + 1))} aria-label="Increase quantity">
                  <Plus className="w-4 h-4" />
                </button>
              </div>

              <button
                onClick={reserve}
                disabled={isSoldOut}
                className="flex-1 h-12 bg-brand-honey text-brand-espresso font-bold uppercase tracking-widest text-[10px] hover:bg-brand-espresso hover:text-brand-cream-light transition disabled:opacity-50 rounded-xl"
              >
                {isSoldOut ? "Sold out" : added ? <><Check className="inline w-4 h-4 mr-2" /> Added to selection</> : "Add to selection"}
              </button>

              <button
                onClick={buyNow}
                disabled={isSoldOut}
                className="px-6 h-12 bg-brand-espresso text-brand-cream-light font-bold uppercase tracking-widest text-[10px] hover:bg-brand-honey hover:text-brand-espresso transition disabled:opacity-50 rounded-xl"
              >
                Buy now
              </button>
            </div>

            <div className="grid grid-cols-2 gap-4 mt-8 text-[10px] uppercase tracking-widest font-bold">
              <div className="flex gap-2 items-center">
                <Truck className="w-4 h-4 text-brand-honey" /> Pan-India delivery
              </div>
              <div className="flex gap-2 items-center">
                <ShieldCheck className="w-4 h-4 text-brand-honey" /> Secure checkout
              </div>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
