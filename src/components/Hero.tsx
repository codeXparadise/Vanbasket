"use client";

import React, { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import dynamic from "next/dynamic";
import { ArrowRight, Sparkles } from "lucide-react";

const LottiePlayer = dynamic(
  () => import("@/components/LottiePlayer").then((mod) => mod.LottiePlayer),
  { ssr: false }
);

const heroImages = [
  "/assets/hero-home-new.jpg",
  "/assets/post_1.jpg",
  "/assets/bulk-honey-order.jpg",
  "/assets/SaveInta.com_693245979_17863277364686116_710550687666494002_n.jpg"
];

export const Hero = () => {
  const [currentImage, setCurrentImage] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentImage((prev) => (prev + 1) % heroImages.length);
    }, 5000);
    return () => clearInterval(timer);
  }, []);

  return (
    <section className="relative min-h-[calc(100svh-72px)] flex items-center overflow-hidden bg-brand-cream-warm text-brand-espresso">

      {/* Background Images */}
      {heroImages.map((src, idx) => (
        <Image
          key={idx}
          src={src}
          alt={`Hero Image ${idx + 1}`}
          fill
          priority={idx === 0}
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 100vw, 100vw"
          className={`object-cover object-center transition-opacity duration-[1500ms] ease-in-out ${
            idx === currentImage ? 'opacity-100' : 'opacity-0'
          }`}
        />
      ))}

      <div className="absolute inset-0 bg-gradient-to-r from-brand-cream-light/95 via-brand-cream-light/80 to-transparent" />
      <div className="absolute inset-0 bg-brand-espresso/10 mix-blend-multiply" />

      {/* Floating Bee animations */}
      <div className="absolute left-[5%] top-[15%] hidden md:block h-16 w-16 opacity-90 animate-sparkle-1 pointer-events-none z-20">
        <LottiePlayer src="/lottie/bee.lottie" label="Floating Bee" className="h-full w-full" />
      </div>

      <div className="relative z-10 mx-auto max-w-7xl px-6 md:px-12 w-full pb-12 pt-28 md:pb-20">
        <div className="max-w-2xl text-left">
          
          <div className="space-y-6">
            <div className="inline-flex items-center gap-2 border border-brand-honey/40 bg-brand-cream-light/80 px-4 py-2 rounded-full text-[10px] font-sans font-bold uppercase tracking-[0.25em] text-brand-espresso w-fit backdrop-blur shadow-sm">
              <Sparkles className="h-3 w-3 text-brand-honey" />
              Pure Forest Harvest
            </div>

            <div className="space-y-4">
              <h1 className="font-serif text-5xl sm:text-6xl lg:text-7xl font-black leading-[1.05] tracking-tight text-brand-espresso">
                The taste of <span className="italic font-normal text-brand-honey">the forest.</span>
              </h1>
              <p className="text-sm sm:text-base leading-relaxed text-brand-espresso/80 font-sans max-w-xl">
                Discover authentic jamun pulp, jamun slice and wild forest honey with traditional wisdom and natural richness of Chhattisgarh.
              </p>
            </div>

            <div className="pt-4">
              <a
                href="#shop"
                className="press-pop honey-glow-btn group inline-flex h-14 items-center justify-center rounded-full bg-brand-honey px-8 text-xs font-bold uppercase tracking-[0.18em] text-brand-cream-light transition-all duration-300 hover:bg-brand-espresso shadow-lg hover:shadow-xl"
              >
                Shop Now
                <ArrowRight className="ml-2 h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" />
              </a>
            </div>

          </div>
        </div>
      </div>
    </section>
  );
};
