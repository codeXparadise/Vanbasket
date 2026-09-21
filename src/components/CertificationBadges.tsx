"use client";

import React from "react";
import Image from "next/image";

interface CertBadgeItem {
  id: string;
  name: string;
  element: React.ReactNode;
}

export const CertificationBadges: React.FC = () => {
  const badges: CertBadgeItem[] = [
    // 1. FSSAI Official Logo
    {
      id: "fssai",
      name: "FSSAI Certified - Food Safety and Standards Authority of India",
      element: (
        <Image
          src="/assets/certifications/fssai-logo.png"
          alt="FSSAI Certified"
          width={180}
          height={90}
          className="h-10 sm:h-12 md:h-14 w-auto object-contain transition-transform duration-300 group-hover:scale-105"
          priority
        />
      ),
    },
    // 2. GST Official Logo
    {
      id: "gst",
      name: "GST Registered - Goods and Services Tax",
      element: (
        <Image
          src="/assets/certifications/gst-logo.png"
          alt="GST Registered - Goods and Services Tax"
          width={180}
          height={90}
          className="h-10 sm:h-12 md:h-14 w-auto object-contain transition-transform duration-300 group-hover:scale-105"
          priority
        />
      ),
    },
    // 3. DPIIT #startupindia Official Logo
    {
      id: "dpiit",
      name: "DPIIT #startupindia Recognized Enterprise",
      element: (
        <Image
          src="/assets/certifications/dpiit-logo.png"
          alt="DPIIT #startupindia Recognized"
          width={200}
          height={75}
          className="h-9 sm:h-11 md:h-13 w-auto object-contain transition-transform duration-300 group-hover:scale-105"
          priority
        />
      ),
    },
    // 4. Registered Trademark Official Stamp Logo
    {
      id: "trademark",
      name: "Registered Trademark Brand",
      element: (
        <Image
          src="/assets/certifications/trademark-logo.png"
          alt="Registered Trademark"
          width={150}
          height={75}
          className="h-10 sm:h-12 md:h-14 w-auto object-contain transition-transform duration-300 group-hover:scale-105"
          priority
        />
      ),
    },
  ];

  return (
    <div className="w-full font-sans">
      {/* 4 Official Certification Badges - Large, clear, with rich hover effect */}
      <div className="flex flex-wrap items-center justify-center gap-3 sm:gap-6">
        {badges.map((item) => (
          <div
            key={item.id}
            title={item.name}
            className="group h-16 sm:h-20 px-5 sm:px-8 rounded-2xl bg-white border border-brand-cream-dark/60 shadow-sm hover:shadow-xl hover:border-brand-honey hover:-translate-y-1 hover:scale-105 transition-all duration-300 flex items-center justify-center shrink-0 cursor-pointer"
          >
            <div className="shrink-0 flex items-center justify-center">
              {item.element}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
