"use client";

import React from "react";
import { Mountain, Users, Droplets, Sparkles } from "lucide-react";

interface BrandItem {
  text: string;
  icon: React.ComponentType<{ className?: string }>;
}

export const BrandMarquee: React.FC = () => {
  const brandPillars: BrandItem[] = [
    {
      text: "From Chhattisgarh",
      icon: Mountain,
    },
    {
      text: "Empowering Tribal",
      icon: Users,
    },
    {
      text: "Pure and authentic",
      icon: Droplets,
    },
    {
      text: "Preserving knowledge",
      icon: Sparkles,
    },
  ];

  // Quadruple for smooth infinite scrolling on ultra-wide screens
  const marqueeList = [
    ...brandPillars,
    ...brandPillars,
    ...brandPillars,
    ...brandPillars,
  ];

  return (
    <section className="relative bg-[#1c120c] text-brand-cream-light py-3.5 sm:py-4 border-y border-amber-900/30 overflow-hidden font-sans select-none z-20">
      {/* Edge Gradient Fades for seamless marquee appearance */}
      <div className="absolute left-0 top-0 bottom-0 w-16 sm:w-28 bg-gradient-to-r from-[#1c120c] to-transparent z-10 pointer-events-none" />
      <div className="absolute right-0 top-0 bottom-0 w-16 sm:w-28 bg-gradient-to-l from-[#1c120c] to-transparent z-10 pointer-events-none" />

      {/* Infinite Marquee Track */}
      <div className="relative w-full overflow-hidden">
        <div className="flex animate-marquee gap-8 sm:gap-14 w-max items-center">
          {marqueeList.map((item, index) => {
            const IconComponent = item.icon;
            return (
              <div
                key={index}
                className="flex items-center gap-3 shrink-0 group cursor-default"
              >
                {/* Icon in gold pill */}
                <div className="w-7 h-7 rounded-full bg-brand-honey/15 border border-brand-honey/30 flex items-center justify-center shrink-0 group-hover:bg-brand-honey/25 transition-colors">
                  <IconComponent className="w-3.5 h-3.5 text-brand-honey" />
                </div>

                {/* Text */}
                <span className="font-serif text-sm sm:text-base md:text-lg font-bold tracking-wide text-brand-cream-light whitespace-nowrap group-hover:text-brand-honey transition-colors">
                  {item.text}
                </span>

                {/* Golden separator star */}
                <span className="text-brand-honey/60 text-xs sm:text-sm pl-4 sm:pl-8">
                  ✦
                </span>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};
