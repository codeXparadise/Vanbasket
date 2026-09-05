"use client";

import React from "react";
import Image from "next/image";

interface SpecItem {
  iconUrl: string;
  title: string;
}

export const TrustStrip = () => {
  const specs: SpecItem[] = [
    { iconUrl: "/assets/spec-icons/wild.svg", title: "Only 100% wild honey Indian provider" },
    { iconUrl: "/assets/spec-icons/collected.svg", title: "Honey is collected, not farmed" },
    { iconUrl: "/assets/spec-icons/unprocessed.svg", title: "Unprocessed & Unpasteurized" },
    { iconUrl: "/assets/spec-icons/seasonal.svg", title: "Seasonal Rarity – Flowering Seasons" },
    { iconUrl: "/assets/spec-icons/tribal.svg", title: "Tribal Partnerships" },
    { iconUrl: "/assets/spec-icons/cruelty.svg", title: "Cruelty-free – Saving Nature" },
  ];

  return (
    <section className="relative bg-brand-cream-light py-10 border-b border-brand-cream-dark/30">
      <div className="max-w-7xl mx-auto px-6">
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6">
          {specs.map((spec, index) => (
            <div key={index} className="flex flex-col items-center justify-center text-center space-y-3 group">
              <div className="w-16 h-16 rounded-full bg-brand-cream-warm border border-brand-cream-dark/40 flex items-center justify-center shadow-sm group-hover:border-brand-honey transition-colors">
                {/* Fallback to a styled div since we don't have the SVG files yet */}
                <div className="w-8 h-8 bg-brand-honey/20 rounded-full" />
              </div>
              <p className="font-sans text-[10px] font-bold uppercase tracking-wider text-brand-espresso leading-snug">
                {spec.title}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
