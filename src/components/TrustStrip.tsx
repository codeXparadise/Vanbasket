"use client";

import React from "react";
import {
  TreePine,
  Compass,
  Droplets,
  Sun,
  HeartHandshake,
  Leaf,
  Sparkles,
} from "lucide-react";

interface SpecItem {
  id: string;
  icon: React.ComponentType<{ className?: string }>;
  badgeText: string;
  title: string;
  subtitle: string;
}

export const TrustStrip: React.FC = () => {
  const specs: SpecItem[] = [
    {
      id: "wild",
      icon: TreePine,
      badgeText: "100% WILD",
      title: "Only 100% Wild Honey",
      subtitle: "Native Indian Provider",
    },
    {
      id: "collected",
      icon: Compass,
      badgeText: "FORAGED",
      title: "Collected, Not Farmed",
      subtitle: "Forest Cliff & Tree Hives",
    },
    {
      id: "unprocessed",
      icon: Droplets,
      badgeText: "RAW PURITY",
      title: "Unprocessed & Pure",
      subtitle: "Unpasteurized Natural Enzymes",
    },
    {
      id: "seasonal",
      icon: Sun,
      badgeText: "LIMITED",
      title: "Seasonal Rarity",
      subtitle: "Natural Flowering Cycles",
    },
    {
      id: "tribal",
      icon: HeartHandshake,
      badgeText: "FAIR TRADE",
      title: "Tribal Partnerships",
      subtitle: "Empowering Forest Gatherers",
    },
    {
      id: "cruelty",
      icon: Leaf,
      badgeText: "ECO-SAFE",
      title: "Cruelty-Free Harvest",
      subtitle: "Saving Bees & Wild Nature",
    },
  ];

  // Duplicate for continuous infinite scroll loop
  const marqueeSpecs = [...specs, ...specs, ...specs];

  return (
    <section className="relative bg-gradient-to-b from-brand-cream-light via-brand-cream-warm/40 to-brand-cream-light py-8 md:py-10 border-y border-brand-cream-dark/40 overflow-hidden font-sans select-none">
      {/* Decorative background glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[150px] bg-brand-honey/5 blur-3xl pointer-events-none rounded-full" />

      {/* Edge Gradient Fades for seamless marquee appearance */}
      <div className="absolute left-0 top-0 bottom-0 w-16 sm:w-28 bg-gradient-to-r from-brand-cream-light to-transparent z-10 pointer-events-none" />
      <div className="absolute right-0 top-0 bottom-0 w-16 sm:w-28 bg-gradient-to-l from-brand-cream-light to-transparent z-10 pointer-events-none" />

      {/* Infinite Marquee Track */}
      <div className="relative w-full overflow-hidden">
        <div className="flex animate-marquee gap-5 sm:gap-8 w-max items-center py-2">
          {marqueeSpecs.map((spec, index) => {
            const IconComponent = spec.icon;
            return (
              <div
                key={`${spec.id}-${index}`}
                className="group flex items-center gap-4 px-5 py-3 rounded-2xl bg-white/80 hover:bg-white border border-brand-cream-dark/60 hover:border-brand-honey/50 shadow-sm hover:shadow-lg transition-all duration-300 hover:-translate-y-1 cursor-pointer shrink-0"
              >
                {/* Concentric Medal Badge */}
                <div className="relative shrink-0">
                  <div className="relative w-12 h-12 rounded-full bg-gradient-to-b from-amber-50 via-brand-cream-warm to-amber-100/60 p-[2px] border border-brand-honey/30 shadow-xs group-hover:border-brand-honey transition-all">
                    <div className="w-full h-full rounded-full bg-white flex items-center justify-center">
                      <IconComponent className="w-5 h-5 text-brand-honey group-hover:scale-110 transition-transform duration-300" />
                    </div>
                  </div>
                  {/* Badge pill */}
                  <span className="absolute -bottom-1 left-1/2 -translate-x-1/2 px-1.5 py-0.2 rounded-full bg-brand-espresso text-brand-cream-light text-[7px] font-bold tracking-widest uppercase whitespace-nowrap shadow-xs">
                    {spec.badgeText}
                  </span>
                </div>

                {/* Text Content */}
                <div className="space-y-0.5 pr-2">
                  <h3 className="font-sans text-xs font-black uppercase tracking-wider text-brand-espresso group-hover:text-brand-honey transition-colors leading-tight">
                    {spec.title}
                  </h3>
                  <p className="font-sans text-[11px] text-brand-espresso/65 font-medium leading-tight">
                    {spec.subtitle}
                  </p>
                </div>

                {/* Subtle Divider dot */}
                <div className="w-1.5 h-1.5 rounded-full bg-brand-honey/40 ml-2" />
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};
