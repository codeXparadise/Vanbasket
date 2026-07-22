"use client";

import React, { useEffect, useRef } from "react";
import { HandHeart, HeartPulse, Leaf } from "lucide-react";
import { LottiePlayer } from "@/components/LottiePlayer";

const harvestSteps = [
  {
    step: "01",
    title: "Flora Sourcing",
    tag: "Chhattisgarh Canopy",
    desc: "Wild bees forage freely across deep medicinal wildflowers in biosphere reserves.",
    icon: Leaf,
    color: "text-brand-forest bg-brand-forest/10",
  },
  {
    step: "02",
    title: "Ethical Harvest",
    tag: "Tribal Tradition",
    desc: "Sustainably hand-harvested by local tribes using ancestral smoke methods that protect the hive.",
    icon: HandHeart,
    color: "text-brand-honey bg-brand-honey/10",
  },
  {
    step: "03",
    title: "Raw Allocation",
    tag: "Apothecary Cold-Poured",
    desc: "Direct filtration without high-heat pasteurization, preserving active live enzymes.",
    icon: HeartPulse,
    color: "text-brand-terracotta bg-brand-terracotta/10",
  },
];

export const Story = () => {
  const storyRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) entry.target.classList.add("revealed");
        });
      },
      { threshold: 0.1 }
    );

    const nodes = storyRef.current?.querySelectorAll(".reveal-on-scroll");
    nodes?.forEach((node) => observer.observe(node));

    return () => observer.disconnect();
  }, []);

  return (
    <section id="story" ref={storyRef} className="relative overflow-hidden bg-brand-cream-light py-24 text-brand-espresso">
      <div className="mx-auto max-w-7xl px-6 md:px-12 space-y-20">
        
        {/* Intro */}
        <div className="reveal-on-scroll text-center max-w-2xl mx-auto space-y-3">
          <span className="text-[10px] font-sans font-bold uppercase tracking-[0.3em] text-brand-honey block">
            Untouched Forest Ecosystem
          </span>
          <h2 className="font-serif text-3xl md:text-5xl font-black leading-tight text-gradient-amber">
            The Wild Harvest Cycle.
          </h2>
          <p className="text-xs sm:text-sm text-brand-espresso-muted font-light leading-relaxed max-w-md mx-auto">
            Traditional tribal allocation from hive to home. No commercial boxing or sugar feeding.
          </p>
        </div>

        {/* Story Bento Grid Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">
          
          {/* Left Column: Delivery Guy Animation Card (4 Columns) */}
          <div className="lg:col-span-4 glass-card rounded-[2.5rem] p-8 flex flex-col items-center justify-center text-center shadow-lg min-h-[350px] reveal-on-scroll">
            <div className="h-44 w-44">
              <LottiePlayer src="/lottie/Delivery guy.lottie" label="Delivery animation" className="h-full w-full" />
            </div>
            <h4 className="font-serif text-lg font-bold mt-4">Pure Hive to Home</h4>
            <p className="text-[11px] text-brand-espresso-muted mt-2 font-light max-w-xs leading-relaxed">
              Hygienically packaged to preserve natural forest aroma, live vitamins, and rich antioxidants.
            </p>
          </div>

          {/* Right Column: Step Timeline (8 Columns) */}
          <div className="lg:col-span-8 flex flex-col justify-between gap-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {harvestSteps.map((item, idx) => {
                const IconComponent = item.icon;
                return (
                  <div
                    key={idx}
                    className="glass-card rounded-[2.5rem] p-6 flex flex-col justify-between min-h-[300px] shadow-md hover:shadow-lg transition-all duration-300 reveal-on-scroll"
                  >
                    <div className="space-y-4">
                      {/* Badge / Step */}
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-serif font-black text-brand-honey/40">{item.step}</span>
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center ${item.color}`}>
                          <IconComponent className="w-5 h-5" />
                        </div>
                      </div>

                      {/* Header */}
                      <div className="space-y-1">
                        <span className="text-[8px] font-sans font-bold uppercase tracking-wider text-brand-espresso-muted/60 block">
                          {item.tag}
                        </span>
                        <h3 className="font-serif text-lg font-black text-brand-espresso">
                          {item.title}
                        </h3>
                      </div>

                      {/* Desc */}
                      <p className="text-[11px] text-brand-espresso-muted leading-relaxed font-light">
                        {item.desc}
                      </p>
                    </div>

                    <span className="text-[9px] font-sans font-bold uppercase tracking-widest text-brand-honey mt-4">
                      ✓ Ethically Managed
                    </span>
                  </div>
                );
              })}
            </div>

            {/* Quick Benefits strip */}
            <div className="glass-card rounded-[2rem] p-6 flex flex-col sm:flex-row items-center justify-between gap-4 shadow-sm reveal-on-scroll">
              <span className="text-[10px] font-sans font-bold uppercase tracking-widest text-brand-terracotta">
                Wellness Focus
              </span>
              <div className="flex flex-wrap justify-center gap-x-6 gap-y-2 text-[10px] font-sans font-semibold text-brand-espresso-muted">
                <span>• Natural immunity boost</span>
                <span>• Rich in antioxidants</span>
                <span>• Aids metabolism & throat relief</span>
              </div>
            </div>
          </div>

        </div>

      </div>
    </section>
  );
};
