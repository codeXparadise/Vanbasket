"use client";

import React from "react";
import { ShieldCheck, Leaf, Compass, Droplet } from "lucide-react";
import { LottiePlayer } from "@/components/LottiePlayer";

interface TrustItem {
  icon: React.ReactNode;
  title: string;
  description: string;
}

export const TrustStrip = () => {
  const items: TrustItem[] = [
    {
      icon: <Droplet className="w-6 h-6 text-brand-honey stroke-[1.5]" />,
      title: "Wild Tree Hives",
      description: "Collected directly from natural forest hives built high on trees by free-foraging bees.",
    },
    {
      icon: <ShieldCheck className="w-6 h-6 text-brand-honey stroke-[1.5]" />,
      title: "No Added Sugar",
      description: "Free from artificial sweeteners, preservatives, additives, and chemical feeding.",
    },
    {
      icon: <Leaf className="w-6 h-6 text-brand-honey stroke-[1.5]" />,
      title: "Tribal Harvested",
      description: "Ethical harvesting practices support forest communities and sustainable livelihoods.",
    },
    {
      icon: <Compass className="w-6 h-6 text-brand-honey stroke-[1.5]" />,
      title: "Chhattisgarh Forests",
      description: "Multi-floral honey sourced from dense forest vegetation and medicinal flora.",
    },
  ];

  return (
    <section id="purity" className="relative overflow-hidden border-y border-brand-honey/20 bg-[#fff8d8] py-16">
      <div className="absolute right-8 top-4 hidden h-24 w-24 opacity-80 md:block">
        <LottiePlayer src="/lottie/bee.lottie" label="Small bee animation" className="h-full w-full" />
      </div>
      <div className="max-w-7xl mx-auto px-6 md:px-12">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10">
          {items.map((item, index) => (
            <div
              key={index}
              className="interactive-lift flex flex-col items-start space-y-4 rounded-[1.5rem] border border-brand-honey/20 bg-white/45 p-5 backdrop-blur transition-transform duration-300 ease-organic"
            >
              {/* Icon Container */}
              <div className="p-3.5 bg-brand-cream-warm/75 rounded-full border border-brand-cream-dark/40 shadow-sm flex items-center justify-center">
                {item.icon}
              </div>
              
              {/* Text Group */}
              <div>
                <h3 className="font-serif font-bold text-lg text-brand-espresso mb-1">
                  {item.title}
                </h3>
                <p className="font-sans text-xs md:text-sm font-light text-brand-espresso-muted leading-relaxed">
                  {item.description}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
