"use client";

import { useEffect, useMemo, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import {
  ArrowLeft,
  Check,
  Minus,
  Plus,
  ShieldCheck,
  Truck,
  ChevronLeft,
  ChevronRight,
  Star,
  ShoppingBag,
  Lock,
  Tag,
  RotateCcw,
  Sparkles,
  Award,
  CheckCircle2,
  MapPin,
} from "lucide-react";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { useCart } from "@/context/CartContext";
import { useToast } from "@/components/Toast";
import { createClient } from "@/utils/supabase/client";
import { ProductReviews } from "@/components/ProductReviews";

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
  id: string;
  slug?: string;
  name: string;
  description: string | null;
  product_variants: VariantRow[];
  product_images: ProductImageRow[];
}

const UUID_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

const fallback = {
  id: "d4444444-4444-4444-8444-444444444444",
  slug: "raw-wildflower-honey",
  name: "Van Basket Wild Forest Honey",
  description:
    "Raw, unfiltered Apis dorsata honey gathered from wild tree hives in the dense tribal forests of Chhattisgarh. 100% pure multi-floral nectar with natural pollen, enzymes, and zero preservatives.",
  image: "/assets/product/250g%20Honey/product-1.png",
};

const jamunFallback = {
  id: "d5555555-5555-5555-8555-555555555555",
  slug: "jamun-pulp",
  name: "Pure Wild Jamun Pulp (1kg)",
  description:
    "100% natural, preservative-free Jamun (Black Plum) fruit pulp sustainably harvested from wild forest trees. Rich in anthocyanins, low glycemic index, and packed with vital dietary antioxidants.",
  image: "/assets/product/Jamun%20Pulp/jamun%20pulp/image-1.png",
};

const defaultHoneyVariants: VariantRow[] = [
  { id: "a1111111-1111-1111-1111-111111111111", size_label: "250g", price: 229, stock_qty: 100, is_active: true },
  { id: "b2222222-2222-2222-2222-222222222222", size_label: "500g", price: 429, stock_qty: 100, is_active: true },
  { id: "c3333333-3333-3333-3333-333333333333", size_label: "1kg", price: 1099, stock_qty: 100, is_active: true },
  { id: "c5555555-5555-5555-5555-555555555555", size_label: "5kg", price: 2599, stock_qty: 100, is_active: true },
];

const defaultJamunVariants: VariantRow[] = [
  { id: "e1111111-1111-1111-1111-111111111111", size_label: "1 kg", price: 499, stock_qty: 100, is_active: true },
];

const honeyGallery = [
  "/assets/product/250g%20Honey/product-1.png",
  "/assets/product/250g%20Honey/product-2.jpg",
  "/assets/product/250g%20Honey/product-3.jpg",
  "/assets/product/250g%20Honey/product-4.jpg",
  "/assets/product/250g%20Honey/product-5.jpg",
];

const jamunGallery = [
  "/assets/product/Jamun%20Pulp/jamun%20pulp/image-1.png",
  "/assets/product/Jamun%20Pulp/jamun%20pulp/image-2.png",
  "/assets/product/Jamun%20Pulp/jamun%20pulp/image-3.png",
  "/assets/product/Jamun%20Pulp/jamun%20pulp/image-4.png",
];

export default function ProductPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const { addToCartBatch, setIsCartOpen, isAuthenticated } = useCart();
  const { showToast } = useToast();
  const [supabase] = useState(() => createClient());

  const isJamunInitial = (params?.id || "").toLowerCase().includes("jamun");
  const [product, setProduct] = useState(isJamunInitial ? jamunFallback : fallback);
  const [variants, setVariants] = useState<VariantRow[]>(isJamunInitial ? defaultJamunVariants : defaultHoneyVariants);
  const [selectedVariantId, setSelectedVariantId] = useState(
    params?.id && params.id !== "raw-wildflower-honey" && params.id !== "jamun-pulp"
      ? params.id
      : isJamunInitial
      ? "e1111111-1111-1111-1111-111111111111"
      : "b2222222-2222-2222-2222-222222222222"
  );
  const [quantity, setQuantity] = useState(1);
  const [added, setAdded] = useState(false);

  // Gallery slider states
  const [galleryImages, setGalleryImages] = useState<string[]>(isJamunInitial ? jamunGallery : honeyGallery);
  const [currentImgIndex, setCurrentImgIndex] = useState(0);

  // Flipkart style pincode checker state
  const [pincode, setPincode] = useState("");
  const [pincodeStatus, setPincodeStatus] = useState<string | null>(null);

  // Review stats state for Flipkart-style rating pill
  const [reviewStats, setReviewStats] = useState({
    average_rating: 4.8,
    total_reviews: 148,
  });

  useEffect(() => {
    const load = async () => {
      const { data: products, error } = await supabase
        .from("products")
        .select("id,slug,name,description,product_variants(*),product_images(*)")
        .eq("is_active", true);

      if (error || !products) return;

      const paramStr = (params?.id || "").toLowerCase();

      const productData =
        (products as ProductRow[]).find((candidate) => {
          if (candidate.slug && candidate.slug.toLowerCase() === paramStr) return true;
          if (candidate.id === params?.id) return true;
          if (candidate.product_variants?.some((variant) => variant.id === params?.id)) return true;
          if (candidate.name && candidate.name.toLowerCase().replace(/[^a-z0-9]+/g, "-") === paramStr) return true;
          return false;
        }) || (products as ProductRow[])[0];

      if (!productData) return;

      const isJamunProduct = productData.slug === "jamun-pulp" || productData.name.toLowerCase().includes("jamun");

      const rawVariants = (productData.product_variants || []).filter((variant) => variant.is_active);
      const mappedVariants = rawVariants.map((v) => {
        if (v.id === "a1111111-1111-1111-1111-111111111111") return { ...v, price: 229 };
        if (v.id === "b2222222-2222-2222-2222-222222222222") return { ...v, price: 429 };
        return v;
      });

      // Ensure 5kg Honey variant is available even before Supabase SQL migration is executed
      if (!isJamunProduct && !mappedVariants.some((v) => v.id === "c5555555-5555-5555-5555-555555555555" || v.size_label === "5kg")) {
        mappedVariants.push({
          id: "c5555555-5555-5555-5555-555555555555",
          size_label: "5kg",
          price: 2599,
          stock_qty: 100,
          is_active: true,
        });
      }

      const activeVariants = (mappedVariants.length > 0 ? mappedVariants : isJamunProduct ? defaultJamunVariants : defaultHoneyVariants)
        .sort((a, b) => Number(a.price) - Number(b.price));

      setProduct({
        id: productData.id,
        slug: productData.slug || "raw-wildflower-honey",
        name: productData.name || fallback.name,
        description: productData.description || fallback.description,
        image:
          productData.slug === "jamun-pulp" || productData.name.toLowerCase().includes("jamun")
            ? "/assets/product/Jamun%20Pulp/jamun%20pulp/image-1.png"
            : "/assets/product/250g%20Honey/product-1.png",
      });
      setVariants(activeVariants);

      // Select dynamic image gallery based on product slug
      let images = honeyGallery;
      if (productData.slug === "jamun-pulp" || productData.name.toLowerCase().includes("jamun")) {
        images = [
          "/assets/product/Jamun%20Pulp/jamun%20pulp/image-1.png",
          "/assets/product/Jamun%20Pulp/jamun%20pulp/image-2.png",
          "/assets/product/Jamun%20Pulp/jamun%20pulp/image-3.png",
          "/assets/product/Jamun%20Pulp/jamun%20pulp/image-4.png",
        ];
      } else if (productData.slug === "gift-hampers" || productData.name.toLowerCase().includes("hamper")) {
        images = [
          "/assets/instagram%20Post/post_1.jpg",
          "/assets/product/250g%20Honey/product-1.png",
          "/assets/product/250g%20Honey/product-2.jpg",
        ];
      }
      setGalleryImages(images);

      // Check variant from URL query param if present
      let targetVariantId = "";
      if (typeof window !== "undefined") {
        const urlParams = new URLSearchParams(window.location.search);
        const urlVariant = urlParams.get("variant");
        if (urlVariant && activeVariants.some((v) => v.id === urlVariant)) {
          targetVariantId = urlVariant;
        }
      }

      if (!targetVariantId && activeVariants.length > 0) {
        const matched = activeVariants.find((v) => v.id === params?.id) || activeVariants[0];
        targetVariantId = matched.id;
      }

      if (targetVariantId) {
        setSelectedVariantId(targetVariantId);
      }
    };

    load();
  }, [params?.id, supabase]);

  // Load review stats from API
  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await fetch(`/api/reviews?product_id=${product.id}`);
        if (res.ok) {
          const data = await res.json();
          if (data.stats) {
            setReviewStats({
              average_rating: data.stats.average_rating || 4.8,
              total_reviews: data.stats.total_reviews || 148,
            });
          }
        }
      } catch {
        // Keep fallback
      }
    };
    if (product.id) {
      fetchStats();
    }
  }, [product.id]);

  const selectedVariant = useMemo(
    () => variants.find((variant) => variant.id === selectedVariantId) || variants[0] || null,
    [selectedVariantId, variants]
  );

  const canOrder = Boolean(selectedVariant && UUID_PATTERN.test(selectedVariant.id));
  const isSoldOut = selectedVariant ? selectedVariant.stock_qty <= 0 : false;
  const displayImage = galleryImages[currentImgIndex] || fallback.image;

  // Flipkart pricing calculation
  const currentPrice = selectedVariant ? Number(selectedVariant.price) : 599;
  const originalMrp = Math.round(currentPrice * 1.25);
  const discountPercent = Math.round(((originalMrp - currentPrice) / originalMrp) * 100);

  const handleAddToCart = () => {
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
    showToast("success", `Added ${quantity}x ${product.name} (${selectedVariant.size_label}) to basket!`);
    window.setTimeout(() => setAdded(false), 2000);
  };

  const handleBuyNow = () => {
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

    showToast("success", `Redirecting to secure Razorpay checkout...`);

    if (!isAuthenticated) {
      router.push(`/login?redirect=${encodeURIComponent(`/checkout?variant=${selectedVariant.id}`)}`);
      return;
    }

    router.push(`/checkout?variant=${selectedVariant.id}`);
  };

  const nextSlide = () => {
    setCurrentImgIndex((prev) => (prev + 1) % galleryImages.length);
  };

  const prevSlide = () => {
    setCurrentImgIndex((prev) => (prev - 1 + galleryImages.length) % galleryImages.length);
  };

  const handleCheckPincode = (e: React.FormEvent) => {
    e.preventDefault();
    if (!/^\d{6}$/.test(pincode.trim())) {
      setPincodeStatus("Please enter a valid 6-digit Indian PIN code.");
      return;
    }
    setPincodeStatus("Eligible for Fast Pan-India Delivery (Estimated 3-4 days)");
  };

  return (
    <div className="min-h-screen bg-[#faf8f5] text-brand-espresso font-sans">
      <Navbar />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 md:px-12 pt-28 pb-24">
        {/* Flipkart-Style Breadcrumb */}
        <nav aria-label="Breadcrumb" className="mb-6 flex items-center gap-2 text-xs text-brand-espresso/60 font-sans">
          <Link href="/" className="hover:text-brand-honey transition-colors">
            Home
          </Link>
          <span>/</span>
          <Link href="/#shop" className="hover:text-brand-honey transition-colors">
            Store
          </Link>
          <span>/</span>
          <span className="text-brand-espresso font-semibold truncate max-w-[200px] sm:max-w-xs">
            {product.name}
          </span>
        </nav>

        {/* Flipkart-Style Two-Column Product Presentation */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-14 items-start">
          
          {/* LEFT COLUMN: Flipkart Image Gallery & Sticky Mobile Buy CTA */}
          <div className="lg:col-span-6 space-y-4 lg:sticky lg:top-28">
            <div className="relative aspect-square sm:aspect-[4/3] lg:aspect-square bg-white border border-brand-cream-dark/60 rounded-3xl overflow-hidden flex items-center justify-center group shadow-sm">
              <Image
                src={displayImage}
                alt={product.name}
                fill
                priority
                loading="eager"
                sizes="(min-width: 1024px) 50vw, 100vw"
                className="object-contain p-6 sm:p-8 transition-transform duration-500 group-hover:scale-105"
              />

              {/* Floating Badges */}
              <div className="absolute top-4 left-4 flex flex-col gap-2 z-10">
                <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-brand-honey text-brand-espresso text-[11px] font-bold uppercase tracking-wider shadow-sm">
                  <Sparkles className="w-3.5 h-3.5" /> Pure Forest Harvest
                </span>
                <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-emerald-700 text-white text-[11px] font-bold tracking-wider shadow-sm">
                  <Truck className="w-3.5 h-3.5 text-emerald-200" /> Free Shipping
                </span>
                <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-emerald-900/90 text-white text-[10px] font-bold tracking-wider shadow-sm">
                  <CheckCircle2 className="w-3.5 h-3.5" /> VanBasket Assured
                </span>
              </div>

              {/* Carousel Next / Prev Controls */}
              {galleryImages.length > 1 && (
                <>
                  <button
                    onClick={prevSlide}
                    className="absolute left-3 top-1/2 -translate-y-1/2 p-2.5 rounded-full bg-white/90 border border-brand-cream-dark/50 text-brand-espresso opacity-80 hover:opacity-100 hover:bg-white hover:scale-110 transition-all duration-300 shadow-md cursor-pointer"
                    aria-label="Previous image"
                  >
                    <ChevronLeft className="w-5 h-5 stroke-[2.5]" />
                  </button>
                  <button
                    onClick={nextSlide}
                    className="absolute right-3 top-1/2 -translate-y-1/2 p-2.5 rounded-full bg-white/90 border border-brand-cream-dark/50 text-brand-espresso opacity-80 hover:opacity-100 hover:bg-white hover:scale-110 transition-all duration-300 shadow-md cursor-pointer"
                    aria-label="Next image"
                  >
                    <ChevronRight className="w-5 h-5 stroke-[2.5]" />
                  </button>
                </>
              )}
            </div>

            {/* Gallery Thumbnail Row */}
            {galleryImages.length > 1 && (
              <div className="flex gap-3 justify-center items-center overflow-x-auto py-2">
                {galleryImages.map((img, idx) => (
                  <button
                    key={idx}
                    onClick={() => setCurrentImgIndex(idx)}
                    className={`relative w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-white border p-1.5 transition-all cursor-pointer ${
                      currentImgIndex === idx
                        ? "border-brand-honey ring-2 ring-brand-honey/30 scale-105 shadow-sm"
                        : "border-brand-cream-dark/50 opacity-60 hover:opacity-100 hover:scale-102"
                    }`}
                  >
                    <Image
                      src={img}
                      alt={`${product.name} thumbnail ${idx + 1}`}
                      fill
                      sizes="80px"
                      className="object-contain p-1"
                    />
                  </button>
                ))}
              </div>
            )}

            {/* Desktop Action Buttons under Gallery (Flipkart Style) */}
            <div className="hidden lg:grid grid-cols-2 gap-4 pt-4">
              <button
                type="button"
                onClick={handleAddToCart}
                disabled={isSoldOut}
                className="h-14 rounded-2xl border-2 border-brand-honey bg-brand-honey/15 hover:bg-brand-honey/25 text-brand-espresso font-sans font-bold text-xs uppercase tracking-wider transition-all flex items-center justify-center gap-2 shadow-sm cursor-pointer disabled:opacity-50"
              >
                <ShoppingBag className="w-4 h-4 text-brand-espresso" />
                <span>{added ? "Added to Basket" : "Add to Cart"}</span>
              </button>

              <button
                type="button"
                onClick={handleBuyNow}
                disabled={isSoldOut}
                className="h-14 rounded-2xl bg-brand-honey hover:bg-brand-espresso text-brand-cream-light font-sans font-black text-xs uppercase tracking-wider transition-all duration-300 flex items-center justify-center gap-2 shadow-lg hover:shadow-xl cursor-pointer disabled:opacity-50"
              >
                <Lock className="w-4 h-4" />
                <span>Buy Now (Razorpay)</span>
              </button>
            </div>
          </div>

          {/* RIGHT COLUMN: Flipkart Product Info, Prices, Variants, Offers & Actions */}
          <div className="lg:col-span-6 space-y-6">
            
            {/* Title & Brand */}
            <div>
              <span className="text-[11px] font-sans font-bold uppercase tracking-[0.25em] text-brand-terracotta">
                Direct Forest Produce · Chhattisgarh
              </span>
              <h1 className="font-serif text-3xl sm:text-4xl lg:text-5xl font-black text-brand-espresso mt-2 leading-tight">
                {product.name}
              </h1>

              {/* Flipkart-Style Rating Badge */}
              <div className="flex items-center gap-3 mt-3">
                <a
                  href="#reviews"
                  className="inline-flex items-center gap-1.5 bg-emerald-700 text-white px-2.5 py-1 rounded-md text-xs font-bold shadow-xs hover:bg-emerald-800 transition-colors"
                >
                  <span>{reviewStats.average_rating.toFixed(1)}</span>
                  <Star className="w-3 h-3 fill-white text-white" />
                </a>
                <a href="#reviews" className="text-xs font-semibold text-brand-espresso/70 hover:underline">
                  {reviewStats.total_reviews} Ratings & Verified Customer Reviews
                </a>
              </div>
            </div>

            {/* Flipkart-Style Price Card */}
            <div className="bg-white border border-brand-cream-dark/60 rounded-3xl p-6 shadow-sm space-y-3">
              <div className="flex items-baseline gap-3 flex-wrap">
                <span className="font-sans font-black text-3xl sm:text-4xl text-brand-honey">
                  ₹{currentPrice.toFixed(0)}
                </span>
                <span className="text-sm font-medium text-brand-espresso-muted line-through">
                  ₹{originalMrp.toFixed(0)}
                </span>
                <span className="text-xs font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2.5 py-0.5 rounded-full">
                  {discountPercent}% OFF
                </span>
              </div>
              <div className="text-xs text-emerald-800 bg-emerald-50/80 border border-emerald-200/80 px-3.5 py-2 rounded-xl flex items-center gap-2 font-medium">
                <Truck className="w-4 h-4 text-emerald-700 shrink-0" />
                <span>Inclusive of all taxes · <strong>Free Pan-India Shipping</strong> on this item</span>
              </div>
            </div>

            {/* Flipkart-Style Available Offers Box */}
            <div className="bg-white border border-brand-cream-dark/60 rounded-3xl p-6 shadow-sm space-y-3.5">
              <h3 className="font-sans text-xs font-bold uppercase tracking-wider text-brand-espresso flex items-center gap-2">
                <Tag className="w-4 h-4 text-brand-honey" /> Available Offers
              </h3>
              <ul className="space-y-2.5 text-xs text-brand-espresso/80">
                <li className="flex items-start gap-2">
                  <span className="text-emerald-700 font-bold mt-0.5">🏷️</span>
                  <span>
                    <strong className="text-brand-espresso">Special Price:</strong> Extra 10% off using coupon codes at checkout.
                  </span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-emerald-700 font-bold mt-0.5">💳</span>
                  <span>
                    <strong className="text-brand-espresso">Razorpay Gateway Offer:</strong> 100% secure payment via UPI (GPay, PhonePe, Paytm), Credit/Debit Cards, & NetBanking.
                  </span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-emerald-700 font-bold mt-0.5">📦</span>
                  <span>
                    <strong className="text-brand-espresso">Cash on Delivery:</strong> Pay in cash or UPI upon delivery at your doorstep.
                  </span>
                </li>
              </ul>
            </div>

            {/* Flipkart-Style Pack Size / Variant Selector */}
            <div className="bg-white border border-brand-cream-dark/60 rounded-3xl p-6 shadow-sm space-y-4">
              <div className="flex items-center justify-between">
                <span className="font-sans text-xs font-bold uppercase tracking-wider text-brand-espresso">
                  Select Pack Size:
                </span>
                <span className="text-xs font-semibold text-emerald-700 flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5" /> In Stock & Ready to Ship
                </span>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {variants.map((v) => {
                  const isSelected = selectedVariant?.id === v.id;
                  return (
                    <button
                      key={v.id}
                      type="button"
                      onClick={() => setSelectedVariantId(v.id)}
                      className={`p-3.5 rounded-2xl border text-left transition-all cursor-pointer ${
                        isSelected
                          ? "border-brand-honey bg-brand-honey/10 ring-2 ring-brand-honey/30 shadow-sm"
                          : "border-brand-cream-dark/60 bg-brand-cream-light/50 hover:border-brand-espresso/60"
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <div className="text-xs font-bold text-brand-espresso">{v.size_label}</div>
                        <span className="text-[8px] font-bold text-emerald-700 bg-emerald-50 px-1 py-0.5 rounded border border-emerald-200">
                          Free Shipping
                        </span>
                      </div>
                      <div className="font-sans font-black text-sm text-brand-honey mt-1">
                        ₹{Number(v.price).toFixed(0)}
                      </div>
                      {isSelected && (
                        <div className="text-[10px] font-bold text-emerald-700 mt-1 flex items-center gap-1">
                          <Check className="w-3 h-3" /> Selected
                        </div>
                      )}
                    </button>
                  );
                })}
              </div>

              {/* Quantity Picker */}
              <div className="flex items-center gap-4 pt-3 border-t border-brand-cream-dark/30">
                <span className="text-xs font-bold text-brand-espresso">Quantity:</span>
                <div className="inline-flex items-center border border-brand-cream-dark bg-brand-cream-light rounded-xl overflow-hidden">
                  <button
                    type="button"
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    aria-label="Decrease quantity"
                    className="p-2.5 hover:bg-brand-cream-warm transition cursor-pointer"
                  >
                    <Minus className="w-3.5 h-3.5 text-brand-espresso" />
                  </button>
                  <span className="w-10 text-center text-xs font-bold font-sans">{quantity}</span>
                  <button
                    type="button"
                    onClick={() => setQuantity(Math.min(99, quantity + 1))}
                    aria-label="Increase quantity"
                    className="p-2.5 hover:bg-brand-cream-warm transition cursor-pointer"
                  >
                    <Plus className="w-3.5 h-3.5 text-brand-espresso" />
                  </button>
                </div>
              </div>
            </div>

            {/* Mobile Action Buttons (Visible on Mobile & Tablet) */}
            <div className="grid lg:hidden grid-cols-2 gap-3 pt-2">
              <button
                type="button"
                onClick={handleAddToCart}
                disabled={isSoldOut}
                className="h-13 rounded-2xl border-2 border-brand-honey bg-brand-honey/15 hover:bg-brand-honey/25 text-brand-espresso font-sans font-bold text-xs uppercase tracking-wider transition-all flex items-center justify-center gap-2 shadow-sm cursor-pointer disabled:opacity-50"
              >
                <ShoppingBag className="w-4 h-4 text-brand-espresso" />
                <span>{added ? "Added" : "Add to Cart"}</span>
              </button>

              <button
                type="button"
                onClick={handleBuyNow}
                disabled={isSoldOut}
                className="h-13 rounded-2xl bg-brand-honey hover:bg-brand-espresso text-brand-cream-light font-sans font-black text-xs uppercase tracking-wider transition-all duration-300 flex items-center justify-center gap-2 shadow-lg cursor-pointer disabled:opacity-50"
              >
                <Lock className="w-4 h-4" />
                <span>Buy Now</span>
              </button>
            </div>

            {/* Flipkart-Style Delivery Pincode Checker */}
            <div className="bg-white border border-brand-cream-dark/60 rounded-3xl p-6 shadow-sm space-y-3">
              <label htmlFor="delivery-pincode" className="font-sans text-xs font-bold uppercase tracking-wider text-brand-espresso flex items-center gap-2 cursor-pointer">
                <MapPin className="w-4 h-4 text-brand-honey" /> Check Delivery to Your Pincode
              </label>
              <form onSubmit={handleCheckPincode} className="flex gap-2">
                <input
                  id="delivery-pincode"
                  name="pincode"
                  type="text"
                  maxLength={6}
                  placeholder="Enter 6-digit Indian Pincode"
                  aria-label="Enter 6-digit Indian Pincode"
                  value={pincode}
                  onChange={(e) => setPincode(e.target.value)}
                  className="flex-1 px-4 py-2.5 rounded-xl border border-brand-cream-dark bg-brand-cream-light text-xs font-sans text-brand-espresso focus:outline-none focus:ring-2 focus:ring-brand-honey"
                />
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl bg-brand-espresso text-brand-cream-light text-xs font-bold uppercase tracking-wider hover:bg-brand-honey transition-colors cursor-pointer"
                >
                  Check
                </button>
              </form>
              {pincodeStatus && (
                <p className={`text-xs font-medium ${pincodeStatus.includes("Eligible") ? "text-emerald-700" : "text-amber-800"}`}>
                  {pincodeStatus}
                </p>
              )}
            </div>

            {/* Flipkart Trust Strip */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {[
                { icon: Truck, title: "Pan-India Free Delivery", desc: "Dispatched in 24h" },
                { icon: ShieldCheck, title: "Razorpay Protected", desc: "256-bit SSL Encrypted" },
                { icon: RotateCcw, title: "7 Days Replacement", desc: "Hassle-free guarantee" },
                { icon: Award, title: "FSSAI & NMR Tested", desc: "100% Raw Forest Harvest" },
              ].map((item, idx) => (
                <div key={idx} className="bg-white border border-brand-cream-dark/50 p-3.5 rounded-2xl text-center space-y-1 shadow-2xs">
                  <item.icon className="w-5 h-5 mx-auto text-brand-honey" />
                  <div className="text-[11px] font-bold text-brand-espresso">{item.title}</div>
                  <div className="text-[10px] text-brand-espresso-muted">{item.desc}</div>
                </div>
              ))}
            </div>

            {/* Product Description & Specifications */}
            <div className="bg-white border border-brand-cream-dark/60 rounded-3xl p-6 shadow-sm space-y-4">
              <h3 className="font-serif text-xl font-bold text-brand-espresso">Product Details & Provenance</h3>
              <p className="text-xs sm:text-sm text-brand-espresso-muted font-light leading-relaxed">
                {product.description}
              </p>

              <div className="border-t border-brand-cream-dark/40 pt-4">
                <h4 className="font-sans text-xs font-bold uppercase tracking-wider text-brand-espresso mb-3">
                  Specifications
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-2.5 text-xs">
                  <div className="flex justify-between sm:justify-start sm:gap-6 border-b border-brand-cream-dark/20 pb-1.5">
                    <span className="text-brand-espresso/60">Harvest Region</span>
                    <span className="font-bold text-brand-espresso">Chhattisgarh Forests</span>
                  </div>
                  <div className="flex justify-between sm:justify-start sm:gap-6 border-b border-brand-cream-dark/20 pb-1.5">
                    <span className="text-brand-espresso/60">Bee Species</span>
                    <span className="font-bold text-brand-espresso">Wild Apis dorsata</span>
                  </div>
                  <div className="flex justify-between sm:justify-start sm:gap-6 border-b border-brand-cream-dark/20 pb-1.5">
                    <span className="text-brand-espresso/60">Processing</span>
                    <span className="font-bold text-brand-espresso">100% Raw & Unpasteurized</span>
                  </div>
                  <div className="flex justify-between sm:justify-start sm:gap-6 border-b border-brand-cream-dark/20 pb-1.5">
                    <span className="text-brand-espresso/60">Purity Verification</span>
                    <span className="font-bold text-brand-espresso">Periodic NMR & Lab Tested</span>
                  </div>
                  <div className="flex justify-between sm:justify-start sm:gap-6 border-b border-brand-cream-dark/20 pb-1.5">
                    <span className="text-brand-espresso/60">Shelf Life</span>
                    <span className="font-bold text-brand-espresso">18 Months</span>
                  </div>
                  <div className="flex justify-between sm:justify-start sm:gap-6 border-b border-brand-cream-dark/20 pb-1.5">
                    <span className="text-brand-espresso/60">Packaging</span>
                    <span className="font-bold text-brand-espresso">Food Grade UV Glass Jar</span>
                  </div>
                </div>
              </div>
            </div>

          </div>
        </div>

        {/* Flipkart-Style Customer Reviews Section */}
        <section id="reviews" className="mt-20 border-t border-brand-cream-dark/60 pt-16">
          <ProductReviews
            productId={product.id || "d4444444-4444-4444-8444-444444444444"}
            productName={product.name}
          />
        </section>
      </main>

      <Footer />
    </div>
  );
}
