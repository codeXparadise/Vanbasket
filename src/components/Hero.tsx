"use client";

import React, { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { ArrowRight, Sparkles } from "lucide-react";
import { createClient } from "@/utils/supabase/client";
import { LottiePlayer } from "@/components/LottiePlayer";

const heroFeatures = ["raw & unfiltered", "harvested ethically", "rich in antioxidants", "zero added sugar"];

export const Hero = () => {
  const [profileName, setProfileName] = useState("");
  const [supabase] = useState(() => createClient());

  useEffect(() => {
    const fetchProfile = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) return;

      const { data: profile } = await supabase
        .from("profiles")
        .select("full_name")
        .eq("id", user.id)
        .maybeSingle();

      setProfileName(profile?.full_name || user.user_metadata?.full_name || "");
    };

    fetchProfile();
  }, [supabase]);

  const firstName = profileName.trim().split(/\s+/)[0] || "";
  const [featureIndex, setFeatureIndex] = useState(0);
  const [typed, setTyped] = useState("");

  useEffect(() => {
    let cursor = 0;
    const timer = window.setInterval(() => {
      const target = heroFeatures[featureIndex];
      setTyped(target.slice(0, cursor + 1));
      cursor += 1;
      if (cursor >= target.length) {
        window.clearInterval(timer);
        window.setTimeout(() => setFeatureIndex((value) => (value + 1) % heroFeatures.length), 1200);
      }
    }, 72);
    return () => window.clearInterval(timer);
  }, [featureIndex]);

  return (
    <section className="relative min-h-[calc(100svh-72px)] flex items-end overflow-hidden bg-brand-espresso text-brand-cream-light">
      <Image src="/assets/hero-home-new.jpg" alt="Warm forest honey jar with wooden dipper" fill priority sizes="100vw" className="object-cover object-center" />
      <div className="absolute inset-0 bg-gradient-to-r from-brand-espresso/90 via-brand-espresso/55 to-brand-espresso/10" />
      <div className="absolute inset-0 bg-gradient-to-t from-brand-espresso/75 via-transparent to-brand-espresso/20" />

      {/* Floating Bee animations */}
      <div className="absolute left-[8%] top-[20%] hidden md:block h-16 w-16 opacity-90 animate-sparkle-1 pointer-events-none z-20">
        <LottiePlayer src="/lottie/bee.lottie" label="Floating Bee" className="h-full w-full" />
      </div>
      <div className="absolute right-[46%] bottom-[18%] hidden lg:block h-14 w-14 opacity-75 animate-sparkle-2 pointer-events-none z-20">
        <LottiePlayer src="/lottie/bee.lottie" label="Floating Bee" className="h-full w-full" speed={0.8} />
      </div>

      <div className="relative z-10 mx-auto max-w-7xl px-6 md:px-12 w-full pb-12 pt-28 md:pb-20">
        <div className="max-w-3xl">
          
          {/* Hero Content Left */}
          <div className="space-y-6 text-left">
            <div className="inline-flex items-center gap-2 border border-brand-cream-light/35 bg-brand-espresso/20 px-4 py-2 rounded-full text-[10px] font-sans font-bold uppercase tracking-[0.25em] text-brand-cream-light w-fit backdrop-blur">
              <Sparkles className="h-3 w-3" />
              {firstName ? `Welcome, ${firstName}` : "Pure Forest Harvest"}
            </div>

            <div className="space-y-4">
              <h1 className="font-serif text-5xl sm:text-7xl lg:text-[6.5rem] font-black leading-[0.92] tracking-tight text-brand-cream-light max-w-4xl">
                The taste of <span className="italic font-normal text-brand-honey">the forest.</span>
              </h1>
              <p className="max-w-xl text-sm sm:text-base leading-relaxed text-brand-cream-light/75 font-light">
                Apis dorsata raw single-origin honey, sustainably harvested by indigenous tribal communities in the biosphere reserves of Chhattisgarh. No added syrup. No compromised quality.
              </p>
              <p className="text-sm sm:text-base font-sans text-brand-cream-light/90">Our honey is <span className="font-bold text-brand-honey">{typed}<span className="typing-cursor">|</span></span></p>
            </div>

            <div className="flex flex-row items-center gap-4 pt-2">
              <a
                href="#shop"
                className="press-pop honey-glow-btn group inline-flex h-12 items-center justify-center rounded-full bg-brand-honey px-6 text-[10px] font-bold uppercase tracking-[0.18em] text-brand-espresso transition-all duration-300 hover:bg-brand-cream-light"
              >
                Order Reserve
                <ArrowRight className="ml-2 h-3.5 w-3.5 transition-transform duration-300 group-hover:translate-x-1" />
              </a>
              <Link
                href="/catalogue"
                className="press-pop inline-flex h-12 items-center justify-center rounded-full border border-brand-cream-light/50 bg-brand-espresso/10 px-6 text-[10px] font-bold uppercase tracking-[0.18em] text-brand-cream-light hover:bg-brand-cream-light hover:text-brand-espresso transition-all duration-300"
              >
                Catalogue
              </Link>
            </div>

            {/* Quick Metrics */}
            <div className="pt-6 border-t border-brand-cream-light/25 grid grid-cols-3 gap-4 max-w-lg">
              <div>
                <span className="font-serif text-lg font-black text-brand-honey">100%</span>
                <p className="text-[8px] uppercase tracking-widest text-brand-cream-light/60 font-bold mt-0.5">Raw Reserve</p>
              </div>
              <div>
                <span className="font-serif text-lg font-black text-brand-honey">Zero</span>
                <p className="text-[8px] uppercase tracking-widest text-brand-cream-light/60 font-bold mt-0.5">Additives</p>
              </div>
              <div>
                <span className="font-serif text-lg font-black text-brand-honey">Ethical</span>
                <p className="text-[8px] uppercase tracking-widest text-brand-cream-light/60 font-bold mt-0.5">Tribal Sourced</p>
              </div>
            </div>
          </div>

        </div>
      </div>
    </section>
  );
};
