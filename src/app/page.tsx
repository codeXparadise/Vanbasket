"use client";

import React, { useEffect, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import dynamic from "next/dynamic";
import { useRouter } from "next/navigation";
import {
  Star,
  Quote,
  Play,
  ChevronRight,
  MessageSquare,
  Phone,
  Mail,
  ArrowRight,
  ShieldCheck,
  Sparkles,
  Package,
  Tag,
  Layers,
  CheckCircle2,
  ShoppingBag,
  CreditCard,
  Lock,
} from "lucide-react";
import { Navbar } from "@/components/Navbar";
import { Hero } from "@/components/Hero";
import { HarvestingTraditionsCarousel } from "@/components/HarvestingTraditionsCarousel";
import { CertificationBadges } from "@/components/CertificationBadges";
import { Footer } from "@/components/Footer";
import { useCart } from "@/context/CartContext";
import { useToast } from "@/components/Toast";

const GeoFaqSection = dynamic(
  () => import("@/components/GeoFaqSection").then((mod) => mod.GeoFaqSection),
  { ssr: true }
);

interface HomepageProduct {
  id: string; // verified Supabase product_variants UUID
  slug: string;
  title: string;
  size: string;
  price: number;
  priceDisplay: string;
  originalPriceDisplay?: string;
  badge?: string;
  badgeColor?: string;
  highlight?: string;
  img: string;
  isPurchasable: boolean;
  b2bInquiry?: string;
}

const homepageProducts: HomepageProduct[] = [
  {
    id: "b2222222-2222-2222-2222-222222222222",
    slug: "raw-wildflower-honey",
    title: "Wild Forest Honey",
    size: "500g Signature Jar",
    price: 599,
    priceDisplay: "₹599",
    originalPriceDisplay: "₹749",
    badge: "Signature Harvest",
    badgeColor: "bg-brand-honey text-brand-espresso font-bold",
    highlight: "Raw Apis dorsata · Unfiltered multi-floral wild honey in amber glass (also in 250g & 1kg)",
    img: "/assets/product/500g%20Honey/product-1.jpg",
    isPurchasable: true,
  },
  {
    id: "e1111111-1111-1111-1111-111111111111",
    slug: "jamun-pulp",
    title: "Pure Wild Jamun Pulp",
    size: "1 kg Natural Jar",
    price: 499,
    priceDisplay: "₹499",
    originalPriceDisplay: "₹649",
    badge: "Seasonal Superfood",
    badgeColor: "bg-purple-100 text-purple-900 border border-purple-200 font-bold",
    highlight: "100% natural, thick, seedless forest Jamun pulp for sugar balance & vitality",
    img: "/assets/product/Jamun%20Pulp/jamun%20pulp/image-1.png",
    isPurchasable: true,
  },
  {
    id: "f1111111-1111-1111-1111-111111111111",
    slug: "gift-hampers",
    title: "Van Basket Gift Hamper",
    size: "Assorted Luxury Box",
    price: 799,
    priceDisplay: "₹799",
    originalPriceDisplay: "₹999",
    badge: "Festive Luxury",
    badgeColor: "bg-emerald-100 text-emerald-900 border border-emerald-200 font-bold",
    highlight: "Artisanal raw honey with wooden dipper in gold-accent festive luxury gift box",
    img: "/assets/instagram%20Post/post_1.jpg",
    isPurchasable: true,
  },
  {
    id: "bulk-orders-b2b",
    slug: "bulk-honey",
    title: "Bulk Honey & Jamun Pulp",
    size: "Commercial 25kg - 200kg",
    price: 0,
    priceDisplay: "Wholesale",
    badge: "B2B & White Label",
    badgeColor: "bg-brand-espresso text-brand-cream-light font-bold",
    highlight: "Food-grade drums with NMR laboratory certificates for brands, ayurveda & exports",
    img: "/assets/product/bulk%20Honey/bulk-honey-order.jpg",
    isPurchasable: false,
    b2bInquiry: "bulk-honey",
  },
];

// Premium Review Testimonials
const customerReviews = [
  {
    name: "Aarav Sharma",
    location: "Mumbai, MH",
    rating: 5,
    date: "June 12, 2026",
    text: "The taste is incredibly deep and multi-floral. Unlike normal store-bought honey, this wild honey has a rustic aroma that proves its authentic forest origin.",
  },
  {
    name: "Priyanka Sen",
    location: "Kolkata, WB",
    rating: 5,
    date: "May 28, 2026",
    text: "Excellent packaging and super fast delivery. The family jar is absolute perfection. My kids love it with their morning milk.",
  },
  {
    name: "Vikram Reddy",
    location: "Bangalore, KA",
    rating: 5,
    date: "April 15, 2026",
    text: "I was looking for genuine Apis dorsata honey for ayurvedic formulations. Van Basket's harvest has exceeded my expectations. Raw, unfiltered.",
  },
];

export default function Home() {
  const router = useRouter();
  const { addToCartBatch, setIsCartOpen, isAuthenticated } = useCart();
  const { showToast } = useToast();

  const handleProductClick = (prod: HomepageProduct, e?: React.MouseEvent) => {
    if (e) e.preventDefault();

    if (!prod.isPurchasable) {
      const targetUrl =
        prod.b2bInquiry === "jamun-pulp"
          ? "/contact-us?inquiry=jamun-pulp"
          : "/contact-us?inquiry=bulk-honey";
      router.push(targetUrl);
      return;
    }

    // Opens the Flipkart-style Product Details page with images, description, buy option & reviews
    router.push(`/catalogue/${prod.slug}?variant=${prod.id}`);
  };

  const handleBuyNowDirect = (prod: HomepageProduct, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!prod.isPurchasable) return;

    addToCartBatch(
      {
        id: prod.id,
        name: prod.title,
        variant: prod.size,
        price: prod.price,
        image: prod.img,
      },
      1
    );

    showToast("success", `Proceeding to secure checkout for ${prod.title}...`);

    if (!isAuthenticated) {
      router.push(`/login?redirect=${encodeURIComponent(`/checkout?variant=${prod.id}`)}`);
      return;
    }

    router.push(`/checkout?variant=${prod.id}`);
  };

  const handleAddToCartQuick = (prod: HomepageProduct, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!prod.isPurchasable) return;

    addToCartBatch(
      {
        id: prod.id,
        name: prod.title,
        variant: prod.size,
        price: prod.price,
        image: prod.img,
      },
      1
    );
    setIsCartOpen(true);
    showToast("success", `Added ${prod.title} (${prod.size}) to your basket!`);
  };











  return (
    <div className="relative min-h-screen bg-brand-cream-light text-brand-espresso flex flex-col justify-between">
      {/* Global Navigation */}
      <Navbar />

      {/* Main Content Layout */}
      <main className="flex-grow">
        
        {/* Hero Banner Section */}
        <Hero />

        {/* Collection Section */}
        <section className="py-12 sm:py-16 bg-brand-cream-warm">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 md:px-12">
            <div className="text-center mb-8 sm:mb-12">
              <h2 className="font-serif text-3xl sm:text-4xl md:text-5xl font-bold text-brand-espresso">Our Collection</h2>
              <p className="mt-3 sm:mt-4 text-xs sm:text-sm text-brand-espresso/80 max-w-2xl mx-auto font-sans leading-relaxed">
                Pure, authentic forest products harvested sustainably by indigenous communities.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
              {[
                {
                  title: "Wild Forest Honey",
                  image: "/assets/product/250g%20Honey/product-1.png",
                  subtitle: "500g Signature Jar",
                  action: () => handleProductClick(homepageProducts[0]),
                },
                {
                  title: "Jamun Pulp",
                  image: "/assets/product/Jamun%20Pulp/jamun%20pulp/image-1.png",
                  subtitle: "1 kg Natural Jar",
                  action: () => handleProductClick(homepageProducts[1]),
                },
                {
                  title: "Gift Hampers",
                  image: "/assets/instagram%20Post/post_1.jpg",
                  subtitle: "Artisanal Luxury Box",
                  action: () => handleProductClick(homepageProducts[2]),
                },
                {
                  title: "Bulk & B2B",
                  image: "/assets/product/bulk%20Honey/bulk-honey-order.jpg",
                  subtitle: "Commercial 25-50kg+",
                  action: () => router.push("/contact-us?inquiry=bulk"),
                },
              ].map((item, idx) => (
                <div
                  key={idx}
                  onClick={item.action}
                  className="group block relative aspect-[4/5] overflow-hidden rounded-2xl cursor-pointer shadow-sm hover:shadow-xl transition-all duration-500"
                >
                  <Image
                    src={item.image}
                    alt={item.title}
                    fill
                    sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
                    className="object-cover transition-transform duration-700 group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-brand-espresso/90 via-brand-espresso/30 to-transparent opacity-80 group-hover:opacity-95 transition-opacity" />
                  <div className="absolute bottom-5 sm:bottom-6 left-5 sm:left-6 right-5 sm:right-6">
                    <span className="text-[10px] font-sans font-bold uppercase tracking-widest text-brand-honey">
                      {item.subtitle}
                    </span>
                    <h3 className="font-serif text-lg sm:text-xl font-bold text-brand-cream-light mt-1">{item.title}</h3>
                    <div className="mt-2.5 sm:mt-3 flex items-center text-xs font-bold uppercase tracking-wider text-brand-honey opacity-90 group-hover:opacity-100 transition-all transform translate-y-0.5 group-hover:translate-y-0 duration-300">
                      <span>{item.title === "Bulk & B2B" ? "Inquire Wholesale" : "Buy & Checkout Now"}</span>
                      <ArrowRight className="ml-1.5 w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Product Listing Section */}
        <section id="shop" className="py-14 sm:py-20 bg-brand-cream-light border-b border-brand-cream-dark/40">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 md:px-12">
            <div className="text-center mb-10 sm:mb-16">
              <h2 className="font-serif text-3xl sm:text-4xl md:text-5xl font-bold text-brand-espresso">Our Products</h2>
              <p className="mt-3 sm:mt-4 text-xs sm:text-sm text-brand-espresso/80 max-w-2xl mx-auto font-sans leading-relaxed">
                Directly from the wild forests to your home.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
              {homepageProducts.map((prod) => (
                <div
                  key={prod.id}
                  onClick={(e) => handleProductClick(prod, e)}
                  className="group flex flex-col bg-white rounded-3xl border border-brand-cream-dark/60 overflow-hidden shadow-sm hover:shadow-2xl hover:border-brand-honey/50 transition-all duration-300 cursor-pointer relative"
                >
                  {/* Category / Stock Badge */}
                  {prod.badge && (
                    <div className="absolute top-4 left-4 z-20">
                      <span className={`px-3 py-1 rounded-full text-[10px] font-sans uppercase tracking-wider shadow-sm ${prod.badgeColor}`}>
                        {prod.badge}
                      </span>
                    </div>
                  )}

                  {/* Product Image Showcase */}
                  <div className="relative aspect-square w-full bg-gradient-to-b from-brand-cream-warm/40 to-brand-cream-warm/15 p-5 flex items-center justify-center overflow-hidden">
                    <Image
                      src={prod.img}
                      alt={prod.title}
                      fill
                      sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
                      className="object-contain p-4 transition-transform duration-700 group-hover:scale-105"
                    />
                  </div>

                  {/* Product Details & Actions */}
                  <div className="p-5 sm:p-6 flex flex-col flex-grow justify-between space-y-4">
                    <div className="space-y-2">
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <h3 className="font-serif text-lg font-bold text-brand-espresso group-hover:text-brand-honey transition-colors leading-snug">
                            {prod.title}
                          </h3>
                          <span className="inline-block mt-1 text-[11px] font-semibold text-brand-espresso/75 bg-brand-cream-warm/80 px-2 py-0.5 rounded-md">
                            {prod.size}
                          </span>
                        </div>

                        {/* Price Breakdown */}
                        <div className="text-right shrink-0">
                          <div className="font-sans font-black text-lg text-brand-honey">
                            {prod.priceDisplay}
                          </div>
                          {prod.originalPriceDisplay && (
                            <div className="text-[10px] text-brand-espresso-muted line-through">
                              {prod.originalPriceDisplay}
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Product Highlight Note */}
                      {prod.highlight && (
                        <p className="font-sans text-xs text-brand-espresso-muted leading-relaxed pt-1 line-clamp-2">
                          {prod.highlight}
                        </p>
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
                              onClick={(e) => handleProductClick(prod, e)}
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
                            onClick={(e) => handleProductClick(prod, e)}
                            className="w-full inline-flex items-center justify-center gap-1.5 h-11 px-3 rounded-xl bg-brand-espresso hover:bg-brand-honey text-brand-cream-light font-sans text-xs font-bold uppercase tracking-wider transition-colors duration-300 cursor-pointer"
                          >
                            <Mail className="w-3.5 h-3.5" />
                            <span>Inquire Wholesale</span>
                            <ArrowRight className="w-3.5 h-3.5 ml-1" />
                          </button>
                          <a
                            href={`https://wa.me/917724969017?text=${encodeURIComponent(`Hello Van Basket, I want to inquire about Commercial Bulk Orders of Honey and Jamun Pulp`)}`}
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
              ))}
            </div>
          </div>
        </section>

        {/* Honey Process Video & Official Certifications Section */}
        <section className="py-20 md:py-28 bg-[#231815] text-brand-cream-light overflow-hidden">
          <div className="mx-auto max-w-5xl px-6 md:px-12 mb-10 md:mb-14">
            <div className="text-center max-w-2xl mx-auto mb-8 space-y-3">
              <span className="inline-flex items-center gap-2 rounded-full bg-brand-honey/15 border border-brand-honey/30 px-3.5 py-1 text-[10px] font-bold uppercase tracking-[0.25em] text-brand-honey">
                <Sparkles className="w-3.5 h-3.5" /> Live Documentary
              </span>
              <h2 className="font-serif text-3xl md:text-5xl font-black text-white">
                The Forest Harvest Process
              </h2>
              <p className="text-xs sm:text-sm text-brand-cream-light/75 font-light">
                Watch our indigenous gathering teams ascend wild forest canopies and gently harvest 100% raw Apis dorsata honeycombs.
              </p>
            </div>

            <div className="relative aspect-video rounded-[2rem] overflow-hidden bg-black border border-brand-cream-light/20 shadow-2xl">
              <video
                src="/assets/client-assets/process_video_1.mp4"
                controls
                playsInline
                poster="/assets/client-assets/gallery-1.jpg"
                className="w-full h-full object-cover"
              />
            </div>

            {/* Small Batch Logos Right Below Video with No Headings */}
            <div className="mt-8">
              <CertificationBadges />
            </div>
          </div>
        </section>

        {/* Our Process - Timeline Section */}
        <section className="py-24 bg-brand-cream-light font-sans relative">
          <div className="text-center max-w-2xl mx-auto space-y-4 mb-20 px-6">
            <h2 className="font-serif text-4xl md:text-5xl font-black text-brand-forest-light">
              Our Process
            </h2>
            <p className="text-sm text-brand-espresso font-medium">
              How we bring you the finest honey
            </p>
          </div>

          <div className="relative max-w-5xl mx-auto px-6">
            <div className="space-y-12 md:space-y-16">
              {[
                {
                  step: "STEP 1",
                  title: "Locate the Hive",
                  desc: "We observe the bees and take notes to locate the exact location of wild, free-range hives high in the forest canopies.",
                  img: "/assets/process/step-1-locate.jpg",
                  align: "left"
                },
                {
                  step: "STEP 2",
                  title: "Harvesting",
                  desc: "Honeycombs are collected using ancestral herbal smoke rituals without harming a single bee or damaging the hive branch.",
                  img: "/assets/process/step-2-harvest.jpg",
                  align: "right"
                },
                {
                  step: "STEP 3",
                  title: "Filtration",
                  desc: "Our pure honey undergoes a simple cold gravity-filtration through muslin cloth to remove debris while keeping living pollen intact.",
                  img: "/assets/process/step-3-filtration.jpg",
                  align: "left"
                },
                {
                  step: "STEP 4",
                  title: "Packaging",
                  desc: "Carefully poured into UV-protective amber glass jars to preserve natural enzymes, antioxidants, and authentic forest aroma.",
                  img: "/assets/process/step-4-packaging.jpg",
                  align: "right"
                }
              ].map((item, idx) => (
                <div key={idx} className={`group relative flex items-center justify-between md:justify-normal w-full ${item.align === 'right' ? 'md:flex-row-reverse' : ''}`}>

                  {/* Spacer for alternating layout on desktop */}
                  <div className="hidden md:block w-5/12" />

                  {/* Content Card with Animated Marching Dashed Border on Hover */}
                  <div className="w-full md:w-5/12">
                    <div className="relative bg-[#FAF8ED] p-4 sm:p-6 rounded-2xl sm:rounded-[2rem] shadow-sm hover:shadow-2xl transition-all duration-500 hover:-translate-y-2 flex flex-col sm:flex-row items-center gap-4 sm:gap-6 cursor-pointer overflow-hidden">
                      
                      {/* Animated Marching Dashed Border SVG */}
                      <svg className="absolute inset-0 w-full h-full pointer-events-none rounded-2xl sm:rounded-[2rem] overflow-hidden z-20">
                        <rect
                          x="2"
                          y="2"
                          width="calc(100% - 4px)"
                          height="calc(100% - 4px)"
                          rx="24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2.5"
                          className="text-brand-cream-dark/60 transition-colors duration-300 group-hover:text-brand-honey group-hover:animate-dash-border [stroke-dasharray:8_6]"
                        />
                      </svg>

                      {/* Image Thumbnail with smooth hover zoom */}
                      <div className="relative w-full sm:w-1/2 aspect-square rounded-xl sm:rounded-2xl overflow-hidden shrink-0 border border-brand-cream-dark/40 shadow-inner">
                        <Image
                          src={item.img}
                          alt={item.title}
                          fill
                          sizes="(max-width: 640px) 100vw, 250px"
                          className="object-cover transition-transform duration-700 group-hover:scale-110"
                        />
                      </div>

                      {/* Text Description */}
                      <div className="text-left space-y-2 sm:w-1/2 relative z-10 w-full">
                        <span className="inline-block text-[10px] font-bold text-brand-honey tracking-widest px-2.5 py-0.5 rounded-full bg-brand-honey/10 transition-colors duration-300 group-hover:bg-brand-honey group-hover:text-brand-espresso">
                          {item.step}
                        </span>
                        <h3 className="font-serif text-lg sm:text-xl font-bold text-brand-forest-light group-hover:text-brand-honey transition-colors">
                          {item.title}
                        </h3>
                        <p className="text-xs text-brand-espresso/75 leading-relaxed font-medium">
                          {item.desc}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Honey Harvesting Traditions 9:16 Carousel */}
        <HarvestingTraditionsCarousel />

        {/* B2B Corner */}
        <section className="py-14 sm:py-20 md:py-28 bg-brand-forest-light text-brand-cream-light relative overflow-hidden">
          <div className="absolute inset-0 bg-[url('/assets/product/bulk%20Honey/bulk-honey-order.jpg')] opacity-10 bg-cover bg-center mix-blend-overlay" />
          <div className="relative mx-auto max-w-7xl px-4 sm:px-6 md:px-12 grid grid-cols-1 lg:grid-cols-2 gap-8 sm:gap-12 items-center">
            <div className="space-y-6 sm:space-y-8 text-left">
              <span className="inline-block px-3 py-1 bg-brand-honey/20 border border-brand-honey/40 rounded-full text-[10px] uppercase font-bold tracking-widest text-brand-honey">
                Commercial Division
              </span>
              <h2 className="font-serif text-3xl sm:text-4xl md:text-5xl font-black leading-tight">B2B Corner</h2>
              <p className="font-sans text-xs sm:text-sm md:text-base opacity-90 leading-relaxed max-w-md">
                Partner with VanBasket for authentic, single-origin forest products scaled for commercial needs.
              </p>
              <ul className="space-y-3 sm:space-y-4 font-sans text-xs sm:text-sm">
                <li className="flex items-center gap-3"><CheckCircle2 className="w-4 h-4 sm:w-5 sm:h-5 text-brand-honey shrink-0" /> Jamun Pulp Manufacturing</li>
                <li className="flex items-center gap-3"><CheckCircle2 className="w-4 h-4 sm:w-5 sm:h-5 text-brand-honey shrink-0" /> Jamun Pulp Bulk Supply</li>
                <li className="flex items-center gap-3"><CheckCircle2 className="w-4 h-4 sm:w-5 sm:h-5 text-brand-honey shrink-0" /> Wild Forest Honey White Labelling</li>
                <li className="flex items-center gap-3"><CheckCircle2 className="w-4 h-4 sm:w-5 sm:h-5 text-brand-honey shrink-0" /> Raw Forest Honey Bulk Supply</li>
              </ul>
              <Link
                href="/contact-us?inquiry=b2b"
                className="inline-flex h-12 sm:h-14 items-center justify-center rounded-full bg-brand-honey px-7 sm:px-8 text-xs font-bold uppercase tracking-[0.18em] text-brand-espresso transition-all hover:bg-brand-cream-light mt-3 sm:mt-4 w-full sm:w-auto"
              >
                Inquire Now <ArrowRight className="ml-2 w-4 h-4" />
              </Link>
            </div>

            <div className="grid grid-cols-2 gap-3 sm:gap-4">
               <div className="relative aspect-square rounded-2xl overflow-hidden border border-brand-cream-light/20">
                 <Image
                   src="/assets/product/Jamun%20Pulp/bulk/jamun-pulp-bulk.jpg"
                   alt="Jamun Pulp"
                   fill
                   sizes="(max-width: 640px) 50vw, (max-width: 1024px) 50vw, 25vw"
                   className="object-cover"
                 />
               </div>
               <div className="relative aspect-square rounded-2xl overflow-hidden border border-brand-cream-light/20 mt-4 sm:mt-8">
                 <Image
                   src="/assets/product/bulk%20Honey/bulk-honey-order.jpg"
                   alt="Bulk Honey"
                   fill
                   sizes="(max-width: 640px) 50vw, (max-width: 1024px) 50vw, 25vw"
                   className="object-cover"
                 />
               </div>
            </div>
          </div>
        </section>

        {/* Customer Testimonials Section */}
        <section className="py-14 sm:py-20 md:py-28 bg-brand-cream-warm/20 border-b border-brand-cream-dark/30 font-sans">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 md:px-12 space-y-8 sm:space-y-12">
            
            <div className="text-center max-w-2xl mx-auto space-y-2.5 sm:space-y-3">
              <span className="text-[10px] font-sans font-bold uppercase tracking-[0.3em] text-brand-terracotta block">
                Verified Customer Voices
              </span>
              <h2 className="font-serif text-2xl sm:text-3xl md:text-5xl font-black text-brand-espresso">
                Loved across India.
              </h2>
              <p className="text-xs sm:text-sm text-brand-espresso-muted font-light leading-relaxed">
                Discover authentic feedback from health enthusiasts, ayurvedic practitioners, and families who enjoy our pure wild honey daily.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8">
              {customerReviews.map((rev, index) => (
                <div
                  key={index}
                  className="bg-white border border-brand-cream-dark/60 rounded-3xl p-5 sm:p-8 shadow-sm flex flex-col justify-between space-y-5 sm:space-y-6 hover:shadow-md transition-shadow"
                >
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1 text-brand-honey">
                        {[...Array(rev.rating)].map((_, i) => (
                          <Star key={i} className="w-4 h-4 fill-brand-honey text-brand-honey" />
                        ))}
                      </div>
                      <Quote className="w-6 h-6 text-brand-cream-dark/40" />
                    </div>
                    <p className="text-xs sm:text-sm text-brand-espresso leading-relaxed italic font-serif">
                      &ldquo;{rev.text}&rdquo;
                    </p>
                  </div>

                  <div className="pt-4 border-t border-brand-cream-dark/30 flex items-center justify-between text-xs">
                    <div>
                      <h4 className="font-bold text-brand-espresso">{rev.name}</h4>
                      <span className="text-[10px] text-brand-espresso-muted">{rev.location}</span>
                    </div>
                    <span className="text-[9px] text-brand-cream-dark font-sans">{rev.date}</span>
                  </div>
                </div>
              ))}
            </div>

          </div>
        </section>



        {/* Frequently Asked Questions */}
        <GeoFaqSection />

      </main>

      {/* Footer */}
      <Footer />
    </div>
  );
}
