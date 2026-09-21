"use client";

import React, { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { useCart } from "@/context/CartContext";
import { useToast } from "@/components/Toast";
import {
  Lock,
  ArrowRight,
  ShoppingBag,
  ShieldCheck,
  Truck,
  Mail,
  MessageSquare,
  Sparkles,
  ArrowDown,
} from "lucide-react";

interface VariantInfo {
  id: string;
  size_label: string;
  price: number;
  originalPrice?: number;
  image?: string;
  stock_qty: number;
  is_active: boolean;
}

interface CatalogueProduct {
  id: string;
  slug: string;
  title: string;
  badge?: string;
  badgeColor?: string;
  highlight?: string;
  img: string;
  isPurchasable: boolean;
  freeShipping?: boolean;
  variants: VariantInfo[];
}

const catalogueProducts: CatalogueProduct[] = [
  {
    id: "raw-wildflower-honey",
    slug: "raw-wildflower-honey",
    title: "Wild Forest Honey",
    badge: "Signature Harvest",
    badgeColor: "bg-brand-honey text-brand-espresso font-bold",
    highlight: "Raw Apis dorsata · Unfiltered multi-floral wild honey in amber glass",
    img: "/assets/product/500g%20Honey/product-1.jpg",
    isPurchasable: true,
    freeShipping: true,
    variants: [
      {
        id: "van-honey-250g",
        size_label: "250g",
        price: 280,
        originalPrice: 350,
        image: "/assets/product/250g%20Honey/product-1.png",
        stock_qty: 99,
        is_active: true,
      },
      {
        id: "van-honey-500g",
        size_label: "500g",
        price: 480,
        originalPrice: 599,
        image: "/assets/product/500g%20Honey/product-1.jpg",
        stock_qty: 99,
        is_active: true,
      },
      {
        id: "van-honey-1kg",
        size_label: "1kg",
        price: 1099,
        originalPrice: 1299,
        image: "/assets/product/500g%20Honey/product-2.jpg",
        stock_qty: 99,
        is_active: true,
      },
      {
        id: "van-honey-5kg",
        size_label: "5kg",
        price: 2599,
        originalPrice: 2999,
        image: "/assets/product/500g%20Honey/product-3.jpg",
        stock_qty: 99,
        is_active: true,
      },
    ],
  },
  {
    id: "van-jamun-pulp-1kg",
    slug: "jamun-pulp",
    title: "Pure Wild Jamun Pulp",
    badge: "Seasonal Superfood",
    badgeColor: "bg-purple-100 text-purple-900 border border-purple-200 font-bold",
    highlight: "100% natural, thick, seedless forest Jamun pulp for sugar balance & vitality",
    img: "/assets/product/Jamun%20Pulp/jamun%20pulp/image-1.png",
    isPurchasable: true,
    freeShipping: true,
    variants: [
      {
        id: "van-jamun-pulp-1kg",
        size_label: "1 kg",
        price: 499,
        originalPrice: 649,
        image: "/assets/product/Jamun%20Pulp/jamun%20pulp/image-1.png",
        stock_qty: 100,
        is_active: true,
      },
    ],
  },
  {
    id: "van-gift-hamper-luxury",
    slug: "gift-hampers",
    title: "Van Basket Gift Hamper",
    badge: "Festive Luxury",
    badgeColor: "bg-emerald-100 text-emerald-900 border border-emerald-200 font-bold",
    highlight: "Artisanal raw honey with wooden dipper in gold-accent festive luxury gift box",
    img: "/assets/instagram%20Post/post_1.jpg",
    isPurchasable: true,
    freeShipping: true,
    variants: [
      {
        id: "van-gift-hamper-luxury",
        size_label: "Luxury Box",
        price: 799,
        originalPrice: 999,
        image: "/assets/instagram%20Post/post_1.jpg",
        stock_qty: 50,
        is_active: true,
      },
    ],
  },
  {
    id: "van-bulk-honey-b2b",
    slug: "bulk-honey",
    title: "Bulk Honey & Jamun Pulp",
    badge: "Commercial Division",
    badgeColor: "bg-brand-forest text-brand-cream-light font-bold",
    highlight: "Direct Forest allocations in commercial 25kg - 200kg drums for retail & pharma",
    img: "/assets/product/bulk%20Honey/bulk-honey-order.jpg",
    isPurchasable: false,
    freeShipping: false,
    variants: [],
  },
];

export default function CataloguePage() {
  const router = useRouter();
  const { addToCartBatch, setIsCartOpen, isAuthenticated } = useCart();
  const { showToast } = useToast();

  // Track active selected variant for each product card
  const [selectedVariants, setSelectedVariants] = useState<Record<string, VariantInfo>>(() => {
    const initial: Record<string, VariantInfo> = {};
    catalogueProducts.forEach((prod) => {
      if (prod.variants && prod.variants.length > 0) {
        initial[prod.id] = prod.variants[0];
      }
    });
    return initial;
  });

  const handleVariantSelect = (prodId: string, variant: VariantInfo, e: React.MouseEvent) => {
    e.stopPropagation();
    setSelectedVariants((prev) => ({ ...prev, [prodId]: variant }));
  };

  const handleProductCardClick = (prod: CatalogueProduct) => {
    if (!prod.isPurchasable) {
      router.push(`/contact-us?inquiry=${prod.slug}`);
      return;
    }
    const currentVariant = selectedVariants[prod.id];
    const variantParam = currentVariant ? `?variant=${currentVariant.id}` : "";
    router.push(`/catalogue/${prod.slug}${variantParam}`);
  };

  const handleBuyNow = (prod: CatalogueProduct, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!prod.isPurchasable) return;

    const variant = selectedVariants[prod.id] || prod.variants[0];
    addToCartBatch(
      {
        id: variant.id,
        name: prod.title,
        variant: variant.size_label,
        price: variant.price,
        image: variant.image || prod.img,
      },
      1
    );

    showToast("success", `Proceeding to checkout for ${prod.title} (${variant.size_label})...`);

    if (!isAuthenticated) {
      router.push(`/login?redirect=${encodeURIComponent(`/checkout?variant=${variant.id}`)}`);
      return;
    }

    router.push(`/checkout?variant=${variant.id}`);
  };

  const handleAddToCartQuick = (prod: CatalogueProduct, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!prod.isPurchasable) return;

    const variant = selectedVariants[prod.id] || prod.variants[0];
    addToCartBatch(
      {
        id: variant.id,
        name: prod.title,
        variant: variant.size_label,
        price: variant.price,
        image: variant.image || prod.img,
      },
      1
    );

    setIsCartOpen(true);
    showToast("success", `Added ${prod.title} (${variant.size_label}) to your basket!`);
  };

  return (
    <div className="relative min-h-screen bg-brand-cream-light text-brand-espresso flex flex-col justify-between">
      <Navbar />

      {/* Full-Screen Hero Section */}
      <section className="relative w-full min-h-[calc(100svh-72px)] md:min-h-[calc(100vh-72px)] flex items-center overflow-hidden bg-brand-espresso text-brand-cream-light select-none">
        {/* Background Hero Image */}
        <Image
          src="/assets/hero/catalogue/vanbasket-catalogue-hero.jpg"
          alt="Wild forest honey catalogue"
          fill
          priority
          sizes="100vw"
          className="object-cover object-center scale-105 transition-transform duration-[6000ms] pointer-events-none"
        />

        {/* Multi-layered Cinematic Gradients */}
        <div className="absolute inset-0 bg-gradient-to-r from-brand-espresso/95 via-brand-espresso/80 to-brand-espresso/45 pointer-events-none" />
        <div className="absolute inset-0 bg-gradient-to-t from-brand-espresso/90 via-transparent to-brand-espresso/30 pointer-events-none" />
        <div className="absolute inset-0 bg-brand-espresso/20 mix-blend-multiply pointer-events-none" />

        {/* Hero Content Container */}
        <div className="relative z-10 mx-auto max-w-7xl px-4 sm:px-6 md:px-12 w-full py-20 sm:py-24 md:py-32 flex flex-col justify-center">
          <div className="max-w-3xl space-y-4 sm:space-y-6">
            <div className="inline-flex items-center gap-2 border border-brand-honey/40 bg-brand-cream-light/10 px-3.5 py-1.5 sm:px-4 sm:py-2 rounded-full text-[10px] sm:text-xs font-sans font-bold uppercase tracking-[0.25em] text-brand-honey backdrop-blur-md shadow-sm w-fit">
              <Sparkles className="h-3 w-3 sm:h-3.5 sm:w-3.5 text-brand-honey shrink-0" />
              <span>VanBasket Harvest Collection</span>
            </div>

            <div className="space-y-3 sm:space-y-4">
              <h1 className="font-serif text-3xl sm:text-5xl md:text-6xl lg:text-7xl font-black tracking-tight leading-[1.1] text-brand-cream-light">
                Pure, Raw & <br className="hidden sm:inline" />
                <span className="text-brand-honey font-serif">Wildly Authentic.</span>
              </h1>
              <p className="font-sans text-xs sm:text-base md:text-lg text-brand-cream-light/85 font-light leading-relaxed max-w-2xl">
                Ethically gathered wild honey and Jamun superfood products from the pristine canopies of Chhattisgarh. 100% natural, unfiltered, and delivered pure to your table.
              </p>
            </div>

            {/* Quality & Trust Badges */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 sm:gap-3.5 pt-2 max-w-2xl">
              <div className="flex items-center gap-2 bg-white/10 backdrop-blur-md border border-white/10 rounded-xl px-3 py-2">
                <ShieldCheck className="w-3.5 h-3.5 text-brand-honey shrink-0" />
                <span className="text-[11px] sm:text-xs font-medium text-brand-cream-light">100% Lab Tested</span>
              </div>
              <div className="flex items-center gap-2 bg-white/10 backdrop-blur-md border border-white/10 rounded-xl px-3 py-2">
                <Truck className="w-3.5 h-3.5 text-brand-honey shrink-0" />
                <span className="text-[11px] sm:text-xs font-medium text-brand-cream-light">Free Shipping</span>
              </div>
              <div className="flex items-center gap-2 bg-white/10 backdrop-blur-md border border-white/10 rounded-xl px-3 py-2">
                <Sparkles className="w-3.5 h-3.5 text-brand-honey shrink-0" />
                <span className="text-[11px] sm:text-xs font-medium text-brand-cream-light">Wild Apis Dorsata</span>
              </div>
              <div className="flex items-center gap-2 bg-white/10 backdrop-blur-md border border-white/10 rounded-xl px-3 py-2">
                <Lock className="w-3.5 h-3.5 text-brand-honey shrink-0" />
                <span className="text-[11px] sm:text-xs font-medium text-brand-cream-light">Razorpay Secured</span>
              </div>
            </div>

            {/* CTAs */}
            <div className="pt-2 sm:pt-4 flex flex-wrap items-center gap-3 sm:gap-4">
              <a
                href="#products-collection"
                className="press-pop honey-glow-btn inline-flex items-center justify-center gap-2 h-11 sm:h-12 px-6 sm:px-8 rounded-xl bg-brand-honey hover:bg-brand-espresso text-brand-cream-light font-sans text-xs sm:text-sm font-bold uppercase tracking-wider shadow-lg hover:shadow-xl transition-all duration-300 cursor-pointer"
              >
                <ShoppingBag className="w-4 h-4" />
                <span>Shop Products</span>
                <ArrowRight className="w-4 h-4 ml-0.5" />
              </a>
              <Link
                href="/about-us"
                className="inline-flex items-center justify-center gap-2 h-11 sm:h-12 px-5 sm:px-6 rounded-xl bg-white/10 hover:bg-white/20 border border-white/15 text-brand-cream-light font-sans text-xs sm:text-sm font-medium tracking-wide transition-all backdrop-blur"
              >
                Our Forest Story
              </Link>
            </div>
          </div>
        </div>

        {/* Scroll to Explore Anchor */}
        <div className="absolute bottom-4 sm:bottom-6 left-1/2 -translate-x-1/2 z-20 flex flex-col items-center gap-1 opacity-75 hover:opacity-100 transition-opacity">
          <span className="text-[9px] sm:text-[10px] font-sans uppercase tracking-[0.25em] text-brand-cream-light/70 font-medium">
            Explore products
          </span>
          <a
            href="#products-collection"
            className="animate-bounce p-1 text-brand-honey"
            aria-label="Scroll down to products"
          >
            <ArrowDown className="w-4 h-4" />
          </a>
        </div>
      </section>

      {/* Main Products Grid Section */}
      <main id="products-collection" className="flex-grow pt-14 sm:pt-20 pb-24 px-4 sm:px-6 md:px-12 max-w-7xl mx-auto w-full">
        {/* Section Heading */}
        <div className="mb-8 sm:mb-12 text-center max-w-2xl mx-auto space-y-2">
          <span className="text-[11px] sm:text-xs font-sans font-bold uppercase tracking-[0.25em] text-brand-honey">
            Direct from Wild Canopies
          </span>
          <h2 className="font-serif text-2xl sm:text-3xl md:text-4xl font-bold text-brand-espresso">
            Our Forest Harvests
          </h2>
          <p className="text-xs sm:text-sm text-brand-espresso/70 font-light max-w-lg mx-auto">
            Packed with vital living enzymes, active phytonutrients, and authentic tribal heritage.
          </p>
        </div>

        {/* Product Cards Grid — Matching Homepage Card Architecture */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 items-stretch">
          {catalogueProducts.map((prod) => {
            const activeVariant = selectedVariants[prod.id] || prod.variants[0];
            const currentPrice = activeVariant?.price;
            const currentOriginalPrice = activeVariant?.originalPrice;
            const currentImage = activeVariant?.image || prod.img;

            return (
              <div
                key={prod.id}
                onClick={() => handleProductCardClick(prod)}
                className="group relative bg-brand-cream-light border border-brand-cream-dark/60 rounded-3xl overflow-hidden shadow-xs hover:shadow-2xl transition-all duration-500 hover:-translate-y-1.5 flex flex-col justify-between cursor-pointer"
              >
                {/* Category / Stock Badge */}
                {prod.badge && (
                  <div className="absolute top-4 left-4 z-20">
                    <span
                      className={`px-3 py-1 rounded-full text-[10px] font-sans uppercase tracking-wider shadow-sm ${prod.badgeColor}`}
                    >
                      {prod.badge}
                    </span>
                  </div>
                )}

                {/* Free Shipping Badge */}
                {prod.freeShipping && (
                  <div className="absolute top-4 right-4 z-20">
                    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[9px] font-sans font-black uppercase tracking-wider shadow-sm bg-emerald-700 text-white">
                      <Truck className="w-3 h-3 text-emerald-200" /> Free Shipping
                    </span>
                  </div>
                )}

                {/* Product Image Showcase */}
                <div className="relative aspect-square w-full bg-gradient-to-b from-brand-cream-warm/40 to-brand-cream-warm/15 p-5 flex items-center justify-center overflow-hidden">
                  <Image
                    src={currentImage}
                    alt={prod.title}
                    fill
                    sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
                    className="object-contain p-4 transition-transform duration-700 group-hover:scale-105"
                  />
                </div>

                {/* Product Details & Actions */}
                <div className="p-4 sm:p-5 flex flex-col flex-grow justify-between space-y-3.5">
                  <div className="space-y-2.5">
                    {/* Product Name & Price */}
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <h3 className="font-serif text-base sm:text-lg font-bold text-brand-espresso group-hover:text-brand-honey transition-colors leading-snug">
                          {prod.title}
                        </h3>
                        {activeVariant?.size_label && (
                          <span className="text-[11px] font-sans text-brand-espresso/60 font-medium">
                            {activeVariant.size_label}
                          </span>
                        )}
                      </div>

                      {/* Price Breakdown */}
                      <div className="text-right shrink-0">
                        {prod.isPurchasable ? (
                          <>
                            <div className="font-sans font-black text-base sm:text-lg text-brand-honey">
                              ₹{currentPrice}
                            </div>
                            {currentOriginalPrice && (
                              <div className="text-[10px] text-brand-espresso-muted line-through">
                                ₹{currentOriginalPrice}
                              </div>
                            )}
                          </>
                        ) : (
                          <div className="font-sans font-black text-sm sm:text-base text-brand-honey">
                            Wholesale
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Variant Badges (Batch Style) */}
                    {prod.variants && prod.variants.length > 0 && (
                      <div className="flex flex-wrap items-center gap-1.5 pt-0.5">
                        {prod.variants.map((v) => {
                          const isSelected = activeVariant?.id === v.id;
                          return (
                            <button
                              key={v.id}
                              type="button"
                              onClick={(e) => handleVariantSelect(prod.id, v, e)}
                              className={`px-2.5 py-0.5 rounded-full text-[10px] font-semibold tracking-wide transition-colors cursor-pointer border ${
                                isSelected
                                  ? "bg-brand-honey text-brand-espresso border-brand-honey font-bold shadow-xs"
                                  : "bg-brand-cream-warm/90 text-brand-espresso border-brand-cream-dark/60 hover:border-brand-honey hover:bg-brand-honey/10"
                              }`}
                            >
                              {v.size_label}
                            </button>
                          );
                        })}
                      </div>
                    )}
                  </div>

                  {/* Bottom Action Section */}
                  <div className="pt-3 border-t border-brand-cream-dark/30 space-y-2">
                    {prod.isPurchasable ? (
                      <>
                        <div className="flex items-center gap-2">
                          {/* Primary Button: Direct Checkout */}
                          <button
                            type="button"
                            onClick={(e) => handleBuyNow(prod, e)}
                            className="flex-1 press-pop honey-glow-btn inline-flex items-center justify-center gap-1.5 h-11 px-3 rounded-xl bg-brand-honey hover:bg-brand-espresso text-brand-cream-light font-sans text-xs font-bold uppercase tracking-wider shadow-md hover:shadow-lg transition-all duration-300 cursor-pointer"
                          >
                            <Lock className="w-3.5 h-3.5" />
                            <span>Buy Now</span>
                            <ArrowRight className="w-3.5 h-3.5 ml-0.5 group-hover:translate-x-1 transition-transform" />
                          </button>

                          {/* Secondary Button: Add to Cart Drawer */}
                          <button
                            type="button"
                            onClick={(e) => handleAddToCartQuick(prod, e)}
                            title="Add to Basket"
                            aria-label={`Add ${prod.title} to basket`}
                            className="h-11 w-11 flex-shrink-0 flex items-center justify-center rounded-xl border border-brand-cream-dark bg-brand-cream-light hover:bg-brand-cream-warm text-brand-espresso transition-colors shadow-sm hover:shadow cursor-pointer"
                          >
                            <ShoppingBag className="w-4 h-4 text-brand-espresso" />
                          </button>
                        </div>

                        {/* Razorpay and Payment Security Guarantee */}
                        <div className="flex items-center justify-between text-[10px] text-brand-espresso/60 font-medium px-1">
                          <span className="inline-flex items-center gap-1">
                            <ShieldCheck className="w-3 h-3 text-emerald-600" /> Razorpay Secured
                          </span>
                          <span>COD Available</span>
                        </div>
                      </>
                    ) : (
                      <div className="space-y-1.5">
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            router.push(`/contact-us?inquiry=${prod.slug}`);
                          }}
                          className="w-full inline-flex items-center justify-center gap-1.5 h-11 px-3 rounded-xl bg-brand-espresso hover:bg-brand-honey text-brand-cream-light font-sans text-xs font-bold uppercase tracking-wider transition-colors duration-300 cursor-pointer"
                        >
                          <Mail className="w-3.5 h-3.5" />
                          <span>Inquire Wholesale</span>
                          <ArrowRight className="w-3.5 h-3.5 ml-1" />
                        </button>
                        <a
                          href={`https://wa.me/917724969017?text=${encodeURIComponent(
                            `Hello Van Basket, I want to inquire about Commercial Bulk Orders of ${prod.title}`
                          )}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          onClick={(e) => e.stopPropagation()}
                          className="w-full inline-flex items-center justify-center gap-1.5 h-8 rounded-xl bg-emerald-600/10 hover:bg-emerald-600/20 text-emerald-800 text-[10px] font-bold uppercase tracking-wider transition-colors"
                        >
                          <MessageSquare className="w-3 h-3" /> WhatsApp B2B
                        </a>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </main>

      <Footer />
    </div>
  );
}
