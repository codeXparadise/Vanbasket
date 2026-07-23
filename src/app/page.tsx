"use client";

import React, { useEffect, useRef, useState } from "react";
import Image from "next/image";
import { Star, Quote, Play, VolumeX, Volume2, ChevronRight } from "lucide-react";
import { Navbar } from "@/components/Navbar";
import { Hero } from "@/components/Hero";
import { ProductDetail } from "@/components/ProductDetail";
import { TrustStrip } from "@/components/TrustStrip";
import { GeoFaqSection } from "@/components/GeoFaqSection";
import { CartDrawer } from "@/components/CartDrawer";
import { Footer } from "@/components/Footer";

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
                      sizes="224px"
                      className="object-cover transition-transform duration-700 ease-organic group-hover:scale-105"
                    />
                  </div>
                  <div className="space-y-0.5 pt-2">
                    <span className="text-[7px] font-sans font-bold uppercase tracking-widest text-brand-honey block">
                      {img.label}
                    </span>
                    <h4 className="font-serif text-[10px] font-black text-brand-espresso truncate">
                      {img.title}
                    </h4>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Reels segment: Windows has 2-grid (stacked reels + text), Android layout has only stacked reels (no text, space-saving) */}
        <section className="py-20 bg-gradient-to-b from-[#faf6ee] to-[#f5ebd8]/40 border-b border-brand-cream-dark/40 overflow-hidden">
          <div className="max-w-7xl mx-auto px-6 md:px-12">
            
            {/* Grid Layout: Responsive 2-grid for Desktop, Single Column for Android/Mobile */}
            <div className="grid grid-cols-1 md:grid-cols-12 gap-12 items-center">
              
              {/* Grid 1: Stacked swiping video card (Occupies 1 col on mobile grid-cols-1, 6 cols on desktop md:grid-cols-12) */}
              <div className="col-span-1 md:col-span-6 flex flex-col items-center justify-center relative mx-auto w-full">
                
                {/* Compact sound indicator & trigger */}
                <div className="w-full max-w-[280px] flex items-center justify-between mb-4 px-2">
                  <span className="text-[8px] font-sans font-bold uppercase tracking-[0.25em] text-brand-honey">
                    Swipe Preview
                  </span>
                  <button
                    onClick={toggleMute}
                    className="text-[9px] font-sans font-semibold text-brand-espresso/60 hover:text-brand-honey flex items-center gap-1.5"
                  >
                    {muted ? <VolumeX className="w-3.5 h-3.5" /> : <Volume2 className="w-3.5 h-3.5" />}
                    {muted ? "Muted" : "Sound On"}
                  </button>
                </div>

                {/* Stacked Cards Container */}
                <div className="relative w-full max-w-[280px] aspect-[9/16] perspective-card">
                  {reelsData.map((reel, index) => {
                    // Compute positions relative to active index
                    let offset = index - activeReelIndex;
                    if (offset < 0) offset += reelsData.length;

                    // Only render active card and background layers
                    if (offset > 2) return null;

                    const isActive = offset === 0;
                    const isSwipeAnimating = isActive && swipeTrigger;

                    // Layered Stack Styles - compact offsets for perfect mobile centering
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
                          preload={isActive ? "auto" : "metadata"}
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

              {/* Grid 2: Text Info - Visible ONLY on Windows/Desktop (col-span-6), Hidden on Android/Mobile */}
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
                  {reelsData.map((reel, index) => <button key={reel.id} onClick={() => setActiveReelIndex(index)} aria-label={`Show ${reel.title}`} className={`h-1.5 transition-all ${index === activeReelIndex ? "w-10 bg-brand-honey" : "w-4 bg-brand-cream-dark"}`} />)}
                </div>
              </div>

            </div>

          </div>
        </section>

        {/* 4 Specifications Grids Section - placed right under the video/reels section */}
        <TrustStrip />

        {/* Product Details & Checkout Section */}
        <section id="shop" className="border-b border-brand-cream-dark/40 bg-white/10">
          <ProductDetail />
        </section>

        {/* Page Break Divider 2 */}
        <div className="relative w-full h-12 bg-white/20 flex items-center justify-center overflow-hidden">
          <div className="w-full max-w-7xl px-6 md:px-12 flex items-center gap-4">
            <div className="flex-grow h-[1px] bg-brand-cream-dark/50" />
            <div className="w-1.5 h-1.5 rounded-full bg-brand-honey" />
            <div className="flex-grow h-[1px] bg-brand-cream-dark/40" />
          </div>
        </div>

        {/* Customer Testimonials & Reviews Grid */}
        <section className="py-20 bg-[#faf6ee]/50 backdrop-blur-sm border-b border-brand-cream-dark/40">
          <div className="max-w-7xl mx-auto px-6 md:px-12">
            <div className="text-center max-w-2xl mx-auto space-y-3 mb-16">
              <span className="text-[10px] font-sans font-bold uppercase tracking-[0.25em] text-brand-honey block">
                Client Reviews
              </span>
              <h2 className="font-serif text-3xl md:text-4xl font-black">
                Loved by Honey Connoisseurs
              </h2>
            </div>

            {/* Fully responsive layout: Column flex on mobile, Grid on desktop */}
            <div className="flex flex-col gap-6 md:grid md:grid-cols-3 md:gap-8 w-full">
              {customerReviews.map((review, idx) => (
                <div
                  key={idx}
                  className="bg-brand-cream-light/35 border border-brand-cream-dark/60 rounded-[2.5rem] p-6 md:p-8 shadow-sm flex flex-col justify-between hover:shadow-md transition-shadow duration-300 relative group w-full"
                >
                  <Quote className="absolute top-6 right-8 w-8 h-8 text-brand-honey/10 group-hover:text-brand-honey/20 transition-colors duration-300" />
                  
                  <div className="space-y-4">
                    <div className="flex items-center gap-1">
                      {[...Array(review.rating)].map((_, i) => (
                        <Star key={i} className="w-3.5 h-3.5 fill-brand-honey text-brand-honey" />
                      ))}
                    </div>
                    <p className="font-sans text-xs text-brand-espresso-muted leading-relaxed font-light italic">
                      &ldquo;{review.text}&rdquo;
                    </p>
                  </div>

                  <div className="pt-6 mt-6 border-t border-brand-cream-dark/40 flex items-center justify-between">
                    <div>
                      <h4 className="font-serif text-xs font-bold text-brand-espresso">{review.name}</h4>
                      <p className="text-[8px] text-brand-espresso-muted font-sans uppercase tracking-wider font-semibold mt-0.5">
                        {review.location}
                      </p>
                    </div>
                    <span className="text-[8px] font-sans text-brand-espresso-muted/65">{review.date}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* GEO & FAQ Authenticity Section */}
        <GeoFaqSection />
      </main>

      {/* Global Sliding Cart Drawer */}
      <CartDrawer />

      {/* Footer */}
      <Footer />
    </div>
  );
}
