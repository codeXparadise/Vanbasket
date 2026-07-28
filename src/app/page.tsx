"use client";

import React, { useEffect, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import dynamic from "next/dynamic";
import { Star, Quote, Play, VolumeX, Volume2, ChevronRight, MessageSquare, Phone, Mail, ArrowRight, ShieldCheck, Sparkles, Package, Tag, Layers, CheckCircle2 } from "lucide-react";
import { Navbar } from "@/components/Navbar";
import { Hero } from "@/components/Hero";
import { ProductDetail } from "@/components/ProductDetail";
import { TrustStrip } from "@/components/TrustStrip";
import { Footer } from "@/components/Footer";

const GeoFaqSection = dynamic(
  () => import("@/components/GeoFaqSection").then((mod) => mod.GeoFaqSection),
  { ssr: true }
);

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

// Instagram Lifestyle Creative Images for the horizontal gallery
const instagramGalleryImages = [
  { src: "/assets/SaveInta.com_671236435_18088753934113038_2584356244027066964_n.jpg", title: "Forest Harvest Reserve", label: "Biosphere Sourced" },
  { src: "/assets/SaveInta.com_693245979_17863277364686116_710550687666494002_n.jpg", title: "Tribal Tradition", label: "Ethically Gathered" },
  { src: "/assets/SaveInta.com_694298566_18088759847113038_4397863112803506586_n.jpg", title: "Apothecary Packaging", label: "UV Protection Glass" },
  { src: "/assets/SaveInta.com_696917302_18056116802539579_2100519194037541284_n.jpg", title: "100% Pure Forest Honey", label: "Zero Syrup Additives" },
  { src: "/assets/SaveInta.com_701696506_17864127021686116_7189681978084491738_n.jpg", title: "Artisanal Selection", label: "Raw & Unfiltered" },
  { src: "/assets/post_1.jpg", title: "Wild Bee Habitats", label: "Free Foraging Bees" },
];

const marqueeWords = [
  "100% Natural Forest Honey",
  "Apis Dorsata Apex Species",
  "Chhattisgarh Forest Origin",
  "No Sugar Syrups or Additives",
  "Traditional Tribal Sourced",
  "Multi-Floral Nectar",
  "Antioxidant Rich",
  "Sustainably Harvested",
];

// Reels Data (9:16 Aspect Ratio)
const reelsData = [
  { src: "/assets/videos/reel_1.mp4", id: "swipe-reel-1", title: "Harvesting Rituals", desc: "Watch traditional smoke methods to ethically source honey without harming the hive." },
  { src: "/assets/videos/reel_2.mp4", id: "swipe-reel-2", title: "Pure Cold Filtration", desc: "Direct gravity filtering protects essential pollen, live enzymes, and royal jelly." },
  { src: "/assets/videos/reel3.mp4", id: "swipe-reel-3", title: "Forest Foraging", desc: "Our free Apis dorsata bees extract nectar from organic medicinal forest blossoms." },
  { src: "/assets/videos/reel_4.mp4", id: "swipe-reel-4", title: "Pure Apothecary Packaging", desc: "Hermetically sealed into heavy-duty dark glass jars to block UV sunlight." },
];

export default function Home() {
  const [muted, setMuted] = useState(true);
  const [activeReelIndex, setActiveReelIndex] = useState(0);
  const [swipeTrigger, setSwipeTrigger] = useState(false);
  const videoRefs = useRef<Record<string, HTMLVideoElement | null>>({});

  const handleNextReel = () => {
    // Trigger swipe animation
    setSwipeTrigger(true);
    setTimeout(() => {
      // Pause current video
      const currentVideo = videoRefs.current[reelsData[activeReelIndex].id];
      if (currentVideo) {
        currentVideo.pause();
        currentVideo.currentTime = 0;
      }
      
      // Update index
      setActiveReelIndex((prev) => (prev + 1) % reelsData.length);
      setSwipeTrigger(false);
    }, 400); // matches the transform duration
  };

  const toggleMute = () => {
    setMuted(!muted);
  };

  useEffect(() => {
    const activeId = reelsData[activeReelIndex].id;
    Object.entries(videoRefs.current).forEach(([id, video]) => {
      if (!video) return;
      video.muted = muted;
      if (id !== activeId) video.pause();
    });
    const activeVideo = videoRefs.current[activeId];
    if (activeVideo) {
      activeVideo.currentTime = 0;
      activeVideo.play().catch(() => {});
    }
  }, [activeReelIndex, muted]);

  return (
    <div className="relative min-h-screen bg-brand-cream-light text-brand-espresso flex flex-col justify-between">
      {/* Global Navigation */}
      <Navbar />

      {/* Main Content Layout */}
      <main className="flex-grow">
        
        {/* Hero Banner Section */}
        <Hero />

        {/* Horizontal Image Gallery Section immediately below Hero */}
        <section className="py-12 bg-brand-cream-warm/10 border-b border-brand-cream-dark/30 overflow-hidden space-y-6">
          {/* Marquee Row 1: Texts Moving Left */}
          <div className="relative w-full flex items-center overflow-x-hidden py-3 bg-brand-espresso">
            <div className="animate-marquee flex w-max gap-12 whitespace-nowrap text-[10px] font-bold uppercase tracking-[0.25em] text-brand-cream-light">
              {[...marqueeWords, ...marqueeWords].map((word, index) => (
                <span key={`${word}-${index}`} className="flex items-center gap-6">
                  {word}
                  <span className="h-1.5 w-1.5 rounded-full bg-brand-honey" />
                </span>
              ))}
            </div>
          </div>

          {/* Marquee Row 2: Instagram Images Moving Right */}
          <div className="relative w-full flex items-center overflow-x-hidden py-2">
            <div className="animate-marquee-reverse flex w-max gap-8 whitespace-nowrap">
              {[...instagramGalleryImages, ...instagramGalleryImages].map((img, index) => (
                <div
                  key={`${img.src}-${index}`}
                  className="w-56 aspect-[3/4] bg-white border border-brand-cream-dark/50 rounded-[1.8rem] p-3.5 shadow-sm flex flex-col justify-between hover:border-brand-honey transition-all duration-300 group select-none cursor-pointer"
                >
                  <div className="relative w-full h-[78%] rounded-xl overflow-hidden bg-brand-cream-light border border-brand-cream-dark/20">
                    <Image
                      src={img.src}
                      alt={img.title}
                      fill
                      sizes="(max-width: 768px) 224px, 224px"
                      className="object-cover transition-transform duration-700 ease-organic group-hover:scale-105"
                    />
                  </div>
                  <div className="pt-2 px-1">
                    <span className="text-[9px] font-sans font-bold uppercase tracking-widest text-brand-terracotta block">
                      {img.label}
                    </span>
                    <h4 className="text-xs font-serif font-bold text-brand-espresso truncate">
                      {img.title}
                    </h4>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Video Reels Section (Interactive Harvest Chronicles) */}
        <section className="py-16 md:py-24 border-b border-brand-cream-dark/30 bg-brand-cream-light">
          <div className="mx-auto max-w-7xl px-6 md:px-12">
            
            <div className="grid grid-cols-1 md:grid-cols-12 gap-12 items-center">

              {/* Grid 1: Video Card Stack (Centered Mobile Layout) */}
              <div className="md:col-span-6 relative flex flex-col items-center justify-center">
                
                {/* Audio Mute/Unmute Floating Button Header */}
                <div className="w-full flex justify-between items-center mb-6 max-w-[310px] sm:max-w-[340px]">
                  <div className="flex items-center gap-2">
                    <span className="h-2 w-2 rounded-full bg-brand-terracotta animate-pulse" />
                    <span className="text-[10px] font-sans font-bold uppercase tracking-widest text-brand-espresso">
                      Live Harvest Footage
                    </span>
                  </div>

                  <button
                    onClick={toggleMute}
                    className="press-pop inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-brand-espresso text-brand-cream-light text-[9px] font-bold uppercase tracking-wider hover:bg-brand-honey hover:text-brand-espresso transition-colors"
                  >
                    {muted ? (
                      <>
                        <VolumeX className="w-3.5 h-3.5 text-brand-honey" />
                        <span>Unmute</span>
                      </>
                    ) : (
                      <>
                        <Volume2 className="w-3.5 h-3.5 text-brand-honey" />
                        <span>Muted</span>
                      </>
                    )}
                  </button>
                </div>

                {/* Stack Container */}
                <div className="relative w-full max-w-[310px] sm:max-w-[340px] aspect-[9/16] flex items-center justify-center">
                  {reelsData.map((reel, index) => {
                    const offset = (index - activeReelIndex + reelsData.length) % reelsData.length;
                    const isActive = offset === 0;
                    const isSwipeAnimating = isActive && swipeTrigger;

                    // Layered Stack Styles
                    const scale = 1 - offset * 0.05;
                    const rotate = offset * 3;
                    const translateY = offset * 12;
                    const translateX = offset * 6;
                    const opacity = 1 - offset * 0.35;

                    return (
                      <div
                        key={reel.id}
                        onMouseEnter={() => {
                          if (isActive) {
                            videoRefs.current[reel.id]?.play().catch(() => {});
                          }
                        }}
                        onMouseLeave={() => {
                          if (isActive) {
                            videoRefs.current[reel.id]?.pause();
                          }
                        }}
                        style={{
                          transform: isSwipeAnimating
                            ? "translateX(-150%) rotate(-12deg) scale(0.9)"
                            : `translate3d(${translateX}px, ${translateY}px, -${offset * 20}px) rotate(${rotate}deg) scale(${scale})`,
                          opacity: isSwipeAnimating ? 0 : opacity,
                          zIndex: 30 - offset,
                        }}
                        className={`absolute inset-0 w-full h-full rounded-[2.5rem] overflow-hidden bg-brand-espresso border border-brand-cream-dark/60 shadow-xl transition-all duration-500 origin-bottom cursor-pointer group`}
                      >
                        {/* Video */}
                        <video
                          ref={(el) => {
                            videoRefs.current[reel.id] = el;
                          }}
                          src={reel.src}
                          loop
                          muted={muted}
                          preload={isActive ? "metadata" : "none"}
                          playsInline
                          className="absolute inset-0 w-full h-full object-cover pointer-events-none"
                        />

                        {/* Mask overlay */}
                        <div className="absolute inset-0 bg-gradient-to-t from-brand-espresso/80 via-transparent to-brand-espresso/15 z-10" />

                        {/* Active Indicators */}
                        {isActive && (
                          <>
                            <div className="absolute inset-0 flex items-center justify-center z-20 pointer-events-none group-hover:scale-110 transition-transform">
                              <div className="w-11 h-11 rounded-full bg-white/25 backdrop-blur-md border border-white/40 flex items-center justify-center text-white">
                                <Play className="w-4 h-4 fill-white ml-0.5" />
                              </div>
                            </div>

                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleNextReel();
                              }}
                              className="absolute bottom-5 right-5 z-20 w-10 h-10 rounded-full bg-brand-honey hover:bg-brand-honey-dark text-brand-cream-light flex items-center justify-center shadow-lg transition-transform active:scale-95"
                              aria-label="Swipe next video"
                            >
                              <ChevronRight className="w-5 h-5 stroke-[2.5]" />
                            </button>

                            <div className="absolute bottom-5 left-5 right-16 z-20 pointer-events-none text-white space-y-0.5">
                              <span className="text-[7px] font-sans font-bold uppercase tracking-widest text-brand-honey block">
                                Wild Forest
                              </span>
                              <h4 className="text-xs font-serif font-black leading-tight text-brand-cream-light">
                                {reel.title}
                              </h4>
                            </div>
                          </>
                        )}
                      </div>
                    );
                  })}
                </div>

              </div>

              {/* Grid 2: Text Info */}
              <div className="md:col-span-6 space-y-6">
                <span className="text-[10px] font-sans font-bold uppercase tracking-[0.3em] text-brand-honey block">
                  Interactive Chronicles
                </span>
                <h2 className="font-serif text-3xl md:text-5xl font-black text-brand-espresso leading-tight">
                  Harvested with Care.
                </h2>
                <div className="space-y-4 pt-4 border-t border-brand-cream-dark/50">
                  <div className="space-y-1">
                    <h4 className="text-xs font-bold uppercase tracking-wider text-brand-terracotta">
                      {reelsData[activeReelIndex].title}
                    </h4>
                    <p className="text-xs text-brand-espresso-muted leading-relaxed font-light">
                      {reelsData[activeReelIndex].desc}
                    </p>
                  </div>
                </div>
                <div className="flex gap-2 pt-2">
                  {reelsData.map((reel, index) => (
                    <button
                      key={reel.id}
                      onClick={() => setActiveReelIndex(index)}
                      aria-label={`Show ${reel.title}`}
                      className={`h-1.5 transition-all ${index === activeReelIndex ? "w-10 bg-brand-honey" : "w-4 bg-brand-cream-dark"}`}
                    />
                  ))}
                </div>
              </div>

            </div>

          </div>
        </section>

        {/* Specifications Grids Section */}
        <TrustStrip />

        {/* B2B Commercial, Bulk Supply & White-Labelling Section */}
        <section className="py-20 md:py-28 bg-gradient-to-b from-brand-cream-light via-brand-cream-warm/30 to-brand-cream-light border-b border-brand-cream-dark/40 font-sans text-brand-espresso">
          <div className="mx-auto max-w-7xl px-6 md:px-12 space-y-12">
            
            <div className="text-center max-w-3xl mx-auto space-y-3">
              <span className="inline-flex items-center gap-2 rounded-full bg-brand-honey/15 border border-brand-honey/30 px-3.5 py-1 text-[10px] font-bold uppercase tracking-[0.25em] text-brand-honey">
                <Sparkles className="w-3.5 h-3.5" /> Commercial & B2B Solutions
              </span>
              <h2 className="font-serif text-3xl md:text-5xl font-black text-brand-espresso leading-tight">
                Beyond Retail Jars: <br className="hidden sm:inline" />
                <span className="text-brand-honey">Bulk Orders & White Labelling</span>
              </h2>
              <p className="text-xs sm:text-sm text-brand-espresso-muted font-light leading-relaxed max-w-2xl mx-auto">
                We don’t just pack consumer jars. Van Basket is a trusted B2B forest produce partner supplying raw forest honey in bulk, pure Jamun Pulps, and private label packaging for wellness brands, exporters, and corporate gifting.
              </p>
            </div>

            {/* 4 Feature Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {/* Card 1: Bulk Honey */}
              <div className="bg-white border border-brand-cream-dark/60 rounded-3xl p-6 shadow-sm hover:shadow-md transition-shadow space-y-4">
                <div className="w-12 h-12 rounded-2xl bg-amber-100 text-amber-800 flex items-center justify-center font-bold">
                  <Package className="w-6 h-6 text-brand-honey" />
                </div>
                <div>
                  <h3 className="font-serif font-black text-lg text-brand-espresso">Bulk Forest Honey</h3>
                  <p className="text-xs text-brand-espresso-muted mt-2 leading-relaxed">
                    Available in 25kg, 50kg, and 200kg food-grade pails & drums. 100% pure Apis dorsata honey with laboratory purity certificate.
                  </p>
                </div>
                <div className="pt-2 text-[11px] font-bold text-brand-honey flex items-center gap-1">
                  <span>From 25kg to Multi-Tons</span>
                </div>
              </div>

              {/* Card 2: Pure Jamun Pulp */}
              <div className="bg-white border border-brand-cream-dark/60 rounded-3xl p-6 shadow-sm hover:shadow-md transition-shadow space-y-4">
                <div className="w-12 h-12 rounded-2xl bg-purple-100 text-purple-800 flex items-center justify-center font-bold">
                  <Layers className="w-6 h-6 text-purple-700" />
                </div>
                <div>
                  <h3 className="font-serif font-black text-lg text-brand-espresso">Pure Jamun Pulps</h3>
                  <p className="text-xs text-brand-espresso-muted mt-2 leading-relaxed">
                    Seedless, thick, 100% natural seasonal Jamun pulp for health juice brands, ayurvedic wellness formulations, & food processing.
                  </p>
                </div>
                <div className="pt-2 text-[11px] font-bold text-purple-700 flex items-center gap-1">
                  <span>Commercial Beverage Standard</span>
                </div>
              </div>

              {/* Card 3: White Labelling */}
              <div className="bg-white border border-brand-cream-dark/60 rounded-3xl p-6 shadow-sm hover:shadow-md transition-shadow space-y-4">
                <div className="w-12 h-12 rounded-2xl bg-emerald-100 text-emerald-800 flex items-center justify-center font-bold">
                  <Tag className="w-6 h-6 text-emerald-700" />
                </div>
                <div>
                  <h3 className="font-serif font-black text-lg text-brand-espresso">White Labelling</h3>
                  <p className="text-xs text-brand-espresso-muted mt-2 leading-relaxed">
                    Turnkey private label packaging in UV dark glass jars, gold-foil custom labels, & branded gift boxes for luxury retail & export.
                  </p>
                </div>
                <div className="pt-2 text-[11px] font-bold text-emerald-700 flex items-center gap-1">
                  <span>Custom Luxury Branding</span>
                </div>
              </div>

              {/* Card 4: Direct Co-op Sourcing */}
              <div className="bg-white border border-brand-cream-dark/60 rounded-3xl p-6 shadow-sm hover:shadow-md transition-shadow space-y-4">
                <div className="w-12 h-12 rounded-2xl bg-amber-100 text-amber-800 flex items-center justify-center font-bold">
                  <ShieldCheck className="w-6 h-6 text-amber-700" />
                </div>
                <div>
                  <h3 className="font-serif font-black text-lg text-brand-espresso">Direct Forest Co-op</h3>
                  <p className="text-xs text-brand-espresso-muted mt-2 leading-relaxed">
                    Fair-trade, sustainable harvesting directly from Chhattisgarh forest tribal communities with full batch provenance tracking.
                  </p>
                </div>
                <div className="pt-2 text-[11px] font-bold text-amber-800 flex items-center gap-1">
                  <span>100% Traceable Origin</span>
                </div>
              </div>
            </div>

            {/* B2B Action Banner */}
            <div className="bg-brand-espresso text-white rounded-3xl p-6 md:p-8 flex flex-col md:flex-row items-center justify-between gap-6 shadow-lg">
              <div>
                <h4 className="font-serif text-xl font-bold text-brand-cream-light">
                  Ready for B2B Supply or Private Label Samples?
                </h4>
                <p className="text-xs text-brand-cream-light/75 mt-1 font-light">
                  Get custom quotes for bulk honey, seedless Jamun pulp, or turnkey white labelling within 2 hours.
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-3 shrink-0">
                <Link
                  href="/contact-us?inquiry=bulk"
                  className="px-5 py-3 rounded-xl bg-brand-honey hover:bg-brand-honey-dark text-brand-espresso font-bold text-xs uppercase tracking-wider transition shadow-sm flex items-center gap-2"
                >
                  <Mail className="w-4 h-4" /> Inquire Bulk Order
                </Link>
                <Link
                  href="/contact-us?inquiry=whitelabel"
                  className="px-5 py-3 rounded-xl bg-white/10 hover:bg-white/20 text-white border border-white/20 font-bold text-xs uppercase tracking-wider transition flex items-center gap-2"
                >
                  <Tag className="w-4 h-4 text-brand-honey" /> White Label Proposal
                </Link>
                <a
                  href="https://wa.me/917724969017?text=Hello%20Van%20Basket,%20I%20want%20to%20inquire%20about%20Bulk%20Orders%20and%20White%20Labelling"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-4 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs uppercase tracking-wider transition flex items-center gap-2"
                >
                  <MessageSquare className="w-4 h-4" /> B2B WhatsApp
                </a>
              </div>
            </div>

          </div>
        </section>

        {/* Product Details & Checkout Section */}
        <section id="shop" className="border-b border-brand-cream-dark/40 bg-white/10">
          <ProductDetail showReviews={false} />
        </section>

        {/* Bulk Jamun Pulp & Commercial Supply Section */}
        <section className="py-20 md:py-28 bg-brand-cream-warm/40 border-b border-brand-cream-dark/40 relative overflow-hidden">
          <div className="mx-auto max-w-7xl px-6 md:px-12">
            <div className="bg-brand-espresso text-brand-cream-light rounded-[2.5rem] p-8 md:p-14 shadow-2xl relative overflow-hidden grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
              
              {/* Left Column: Visual Card & Image */}
              <div className="lg:col-span-5 relative">
                <div className="relative aspect-[4/3] rounded-[1.8rem] overflow-hidden bg-brand-cream-light border border-brand-cream-dark/30 shadow-lg">
                  <Image
                    src="/assets/post_1.jpg"
                    alt="Jamun Pulp Bulk Sourcing"
                    fill
                    sizes="(max-width: 1024px) 100vw, 500px"
                    className="object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-brand-espresso/80 via-transparent to-transparent" />
                  <div className="absolute bottom-4 left-4 right-4 text-white">
                    <span className="text-[9px] font-sans font-bold uppercase tracking-widest bg-brand-honey text-brand-cream-light px-2.5 py-1 rounded-full">
                      Seasonal Reserve
                    </span>
                    <h3 className="font-serif text-lg font-bold text-brand-cream-light mt-2">
                      Pure Seedless Jamun Pulp
                    </h3>
                  </div>
                </div>
              </div>

              {/* Right Column: Information & Actions */}
              <div className="lg:col-span-7 space-y-6">
                <div className="space-y-3">
                  <span className="inline-flex items-center gap-2 rounded-full bg-brand-honey/15 border border-brand-honey/30 px-3 py-1 text-[10px] font-bold uppercase tracking-[0.25em] text-brand-honey">
                    <Sparkles className="w-3.5 h-3.5" />
                    Commercial & Wholesale Division
                  </span>
                  <h2 className="font-serif text-3xl md:text-5xl font-black leading-tight text-brand-cream-light">
                    We also deal in Bulk Orders of <em className="font-normal text-brand-honey">Jamun Pulp</em>
                  </h2>
                  <p className="font-sans text-xs md:text-sm text-brand-cream-light/80 leading-relaxed font-light">
                    Sourced directly from pristine forest belts, our Jamun Pulp is 100% natural, seedless, and unadulterated. Ideal for commercial beverage formulation, ayurvedic wellness brands, food processors, and large-scale catering.
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                  <div className="flex items-start gap-2.5 p-3 rounded-2xl bg-white/5 border border-white/10">
                    <ShieldCheck className="w-4 h-4 text-brand-honey shrink-0 mt-0.5" />
                    <div>
                      <h4 className="font-bold text-white uppercase tracking-wider text-[10px]">100% Pure & Unfiltered</h4>
                      <p className="text-[11px] text-brand-cream-light/60 mt-0.5">Zero added sugars, colorings, or chemical preservatives.</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-2.5 p-3 rounded-2xl bg-white/5 border border-white/10">
                    <ShieldCheck className="w-4 h-4 text-brand-honey shrink-0 mt-0.5" />
                    <div>
                      <h4 className="font-bold text-white uppercase tracking-wider text-[10px]">Custom Packaging</h4>
                      <p className="text-[11px] text-brand-cream-light/60 mt-0.5">Available in 5kg food pails up to 50kg wholesale barrels.</p>
                    </div>
                  </div>
                </div>

                {/* 3 Prominent Action Buttons */}
                <div className="flex flex-wrap items-center gap-3 pt-2">
                  {/* Button 1: Query Now */}
                  <Link
                    href="/contact-us?inquiry=jamun-pulp"
                    className="h-12 px-6 bg-brand-honey hover:bg-brand-honey-dark text-brand-cream-light font-sans font-bold uppercase tracking-wider text-xs rounded-xl flex items-center justify-center gap-2 transition-all shadow-md hover:shadow-lg"
                  >
                    <Mail className="w-4 h-4" />
                    <span>Query Now</span>
                  </Link>

                  {/* Button 2: WhatsApp Chat */}
                  <a
                    href="https://wa.me/917724969017?text=Hello%20Van%20Basket,%20I%20want%20to%20inquire%20about%20bulk%20orders%20of%20Jamun%20Pulp"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="h-12 px-6 bg-emerald-600 hover:bg-emerald-700 text-white font-sans font-bold uppercase tracking-wider text-xs rounded-xl flex items-center justify-center gap-2 transition-all shadow-md hover:shadow-lg"
                  >
                    <MessageSquare className="w-4 h-4" />
                    <span>WhatsApp Us</span>
                  </a>

                  {/* Button 3: Call Direct */}
                  <a
                    href="tel:+917724969017"
                    className="h-12 px-6 bg-white/10 hover:bg-white/20 text-white border border-white/20 font-sans font-bold uppercase tracking-wider text-xs rounded-xl flex items-center justify-center gap-2 transition-all"
                  >
                    <Phone className="w-4 h-4 text-brand-honey" />
                    <span>Call Hotline</span>
                  </a>
                </div>
              </div>

            </div>
          </div>
        </section>

        {/* Customer Testimonials Section */}
        <section className="py-20 md:py-28 bg-brand-cream-warm/20 border-b border-brand-cream-dark/30 font-sans">
          <div className="mx-auto max-w-7xl px-6 md:px-12 space-y-12">
            
            <div className="text-center max-w-2xl mx-auto space-y-3">
              <span className="text-[10px] font-sans font-bold uppercase tracking-[0.3em] text-brand-terracotta block">
                Verified Customer Voices
              </span>
              <h2 className="font-serif text-3xl md:text-5xl font-black text-brand-espresso">
                Loved across India.
              </h2>
              <p className="text-xs sm:text-sm text-brand-espresso-muted font-light">
                Discover authentic feedback from health enthusiasts, ayurvedic practitioners, and families who enjoy our pure wild honey daily.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {customerReviews.map((rev, index) => (
                <div
                  key={index}
                  className="bg-white border border-brand-cream-dark/60 rounded-3xl p-8 shadow-sm flex flex-col justify-between space-y-6 hover:shadow-md transition-shadow"
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
                      "{rev.text}"
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
