"use client";

import React, { useEffect, useRef, useState, useCallback } from "react";
import Image from "next/image";
import Link from "next/link";
import { ArrowRight, Sparkles, ChevronLeft, ChevronRight } from "lucide-react";

const heroImages = [
  {
    src: "/assets/hero/home/vanbasket-hero-01-forest-jar.jpg",
    subtitle: "Pure Forest Harvest",
    tagline: "Wild forest honey from Chhattisgarh",
  },
  {
    src: "/assets/hero/home/vanbasket-hero-02-honeycomb.jpg",
    subtitle: "Artisanal Reserve",
    tagline: "Raw Apis dorsata honey gathered from wild tree hives",
  },
  {
    src: "/assets/hero/home/vanbasket-hero-03-pour.jpg",
    subtitle: "Commercial & B2B Supply",
    tagline: "Unfiltered honey & natural Jamun pulp in bulk",
  },
  {
    src: "/assets/hero/home/vanbasket-hero-04-harvest.jpg",
    subtitle: "Indigenous Wisdom",
    tagline: "Sustainable tribal harvesting saving wild bees",
  },
];

export const Hero = () => {
  const [currentImage, setCurrentImage] = useState(0);
  const [isPaused, setIsPaused] = useState(false);

  // Swipe & Drag Gestures
  const touchStartX = useRef<number | null>(null);
  const touchEndX = useRef<number | null>(null);
  const isDragging = useRef(false);

  const nextSlide = useCallback(() => {
    setCurrentImage((prev) => (prev + 1) % heroImages.length);
  }, []);

  const prevSlide = useCallback(() => {
    setCurrentImage((prev) => (prev - 1 + heroImages.length) % heroImages.length);
  }, []);

  // Auto-slide effect with pause on hover
  useEffect(() => {
    if (isPaused) return;
    const timer = setInterval(() => {
      nextSlide();
    }, 5000);
    return () => clearInterval(timer);
  }, [isPaused, nextSlide]);

  // Touch Swipe Handlers
  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.targetTouches[0].clientX;
    touchEndX.current = null;
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    touchEndX.current = e.targetTouches[0].clientX;
  };

  const handleTouchEnd = () => {
    if (!touchStartX.current || !touchEndX.current) return;
    const distance = touchStartX.current - touchEndX.current;
    const minSwipeDistance = 50;

    if (distance > minSwipeDistance) {
      // Swiped left -> Next
      nextSlide();
    } else if (distance < -minSwipeDistance) {
      // Swiped right -> Prev
      prevSlide();
    }

    touchStartX.current = null;
    touchEndX.current = null;
  };

  // Mouse Drag / Swipe Handlers (for desktop)
  const handleMouseDown = (e: React.MouseEvent) => {
    isDragging.current = true;
    touchStartX.current = e.clientX;
    touchEndX.current = null;
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging.current) return;
    touchEndX.current = e.clientX;
  };

  const handleMouseUp = () => {
    if (!isDragging.current) return;
    isDragging.current = false;
    if (touchStartX.current && touchEndX.current) {
      const distance = touchStartX.current - touchEndX.current;
      const minSwipeDistance = 60;
      if (distance > minSwipeDistance) {
        nextSlide();
      } else if (distance < -minSwipeDistance) {
        prevSlide();
      }
    }
    touchStartX.current = null;
    touchEndX.current = null;
  };

  return (
    <section
      className="relative min-h-[calc(100svh-72px)] flex items-center overflow-hidden bg-brand-cream-warm text-brand-espresso select-none cursor-grab active:cursor-grabbing"
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => {
        setIsPaused(false);
        isDragging.current = false;
      }}
    >
      {/* Background Images */}
      {heroImages.map((item, idx) => (
        <Image
          key={idx}
          src={item.src}
          alt={`Hero Image ${idx + 1}`}
          fill
          priority={idx === 0}
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 100vw, 100vw"
          className={`object-cover object-center transition-opacity duration-[1200ms] ease-in-out pointer-events-none ${
            idx === currentImage ? "opacity-100 scale-100" : "opacity-0 scale-105"
          }`}
          style={{ transitionProperty: "opacity, transform" }}
        />
      ))}

      {/* Gradient Overlays */}
      <div className="absolute inset-0 bg-gradient-to-r from-brand-cream-light/95 via-brand-cream-light/80 to-transparent pointer-events-none" />
      <div className="absolute inset-0 bg-brand-espresso/10 mix-blend-multiply pointer-events-none" />

      {/* Content Container */}
      <div className="relative z-10 mx-auto max-w-7xl px-4 sm:px-6 md:px-12 w-full pb-16 pt-20 sm:pt-24 md:pt-28 md:pb-20">
        <div className="max-w-3xl text-left">
          <div className="space-y-4 sm:space-y-6">
            <div className="inline-flex items-center gap-2 border border-brand-honey/40 bg-brand-cream-light/80 px-3.5 py-1.5 sm:px-4 sm:py-2 rounded-full text-[10px] sm:text-xs font-sans font-bold uppercase tracking-[0.2em] sm:tracking-[0.25em] text-brand-espresso w-fit backdrop-blur shadow-sm">
              <Sparkles className="h-3 w-3 text-brand-honey shrink-0" />
              <span>{heroImages[currentImage].subtitle}</span>
            </div>

            <div className="space-y-3 sm:space-y-4">
              <h1 className="font-serif text-2xl sm:text-3xl md:text-5xl lg:text-[3.25rem] font-black leading-[1.2] sm:leading-[1.18] tracking-tight text-brand-espresso">
                Discover authentic jamun pulp, jamun slice and wild forest honey with traditional wisdom and natural richness of Chhattisgarh
              </h1>
            </div>

            <div className="pt-3 sm:pt-4 flex flex-col sm:flex-row items-stretch sm:items-center gap-3 sm:gap-4 max-w-md sm:max-w-none">
              <a
                href="#shop"
                className="press-pop honey-glow-btn group inline-flex h-12 sm:h-14 items-center justify-center rounded-full bg-brand-honey px-7 sm:px-8 text-xs font-bold uppercase tracking-[0.18em] text-brand-cream-light transition-all duration-300 hover:bg-brand-espresso shadow-lg hover:shadow-xl cursor-pointer"
              >
                <span>Shop Now</span>
                <ArrowRight className="ml-2 h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" />
              </a>

              <Link
                href="/about-us"
                className="inline-flex h-12 sm:h-14 items-center justify-center rounded-full border border-brand-espresso/20 bg-white/70 hover:bg-white px-7 text-xs font-bold uppercase tracking-[0.18em] text-brand-espresso transition-all duration-300 shadow-sm backdrop-blur"
              >
                Our Story
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Interactive Navigation Buttons (Left & Right Arrows) */}
      <button
        type="button"
        onClick={(e) => {
          e.stopPropagation();
          prevSlide();
        }}
        aria-label="Previous slide"
        className="absolute left-2 sm:left-4 md:left-6 top-1/2 -translate-y-1/2 z-20 h-9 w-9 sm:h-11 sm:w-11 md:h-12 md:w-12 rounded-full bg-white/75 hover:bg-white text-brand-espresso border border-brand-cream-dark/60 shadow-md hover:shadow-xl flex items-center justify-center backdrop-blur transition-all duration-300 hover:scale-105 active:scale-95 cursor-pointer"
      >
        <ChevronLeft className="w-4 h-4 sm:w-5 sm:h-5 md:w-6 md:h-6 text-brand-espresso" />
      </button>

      <button
        type="button"
        onClick={(e) => {
          e.stopPropagation();
          nextSlide();
        }}
        aria-label="Next slide"
        className="absolute right-2 sm:right-4 md:right-6 top-1/2 -translate-y-1/2 z-20 h-9 w-9 sm:h-11 sm:w-11 md:h-12 md:w-12 rounded-full bg-white/75 hover:bg-white text-brand-espresso border border-brand-cream-dark/60 shadow-md hover:shadow-xl flex items-center justify-center backdrop-blur transition-all duration-300 hover:scale-105 active:scale-95 cursor-pointer"
      >
        <ChevronRight className="w-4 h-4 sm:w-5 sm:h-5 md:w-6 md:h-6 text-brand-espresso" />
      </button>

      {/* Interactive Bottom Indicators & Swipe Guide */}
      <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-20 flex flex-col items-center gap-2">
        <div className="flex items-center gap-2 bg-white/50 backdrop-blur-md px-3.5 py-1.5 rounded-full border border-white/40 shadow-sm">
          {heroImages.map((_, idx) => (
            <button
              key={idx}
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                setCurrentImage(idx);
              }}
              aria-label={`Go to slide ${idx + 1}`}
              className={`transition-all duration-300 rounded-full ${
                idx === currentImage
                  ? "w-8 h-2 bg-brand-honey shadow-sm"
                  : "w-2 h-2 bg-brand-espresso/30 hover:bg-brand-espresso/60"
              }`}
            />
          ))}
        </div>
        <span className="text-[10px] font-sans font-medium uppercase tracking-wider text-brand-espresso/50 hidden sm:inline-block">
          Swipe or click arrows to explore
        </span>
      </div>
    </section>
  );
};
