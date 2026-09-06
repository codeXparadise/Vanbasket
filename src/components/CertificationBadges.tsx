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
      name: "FSSAI Certified",
      element: (
        <Image
          src="/assets/certifications/fssai-logo.png"
          alt="FSSAI Certified"
          width={130}
          height={65}
          className="h-6 sm:h-7 w-auto object-contain"
          priority
        />
      ),
    },
    // 2. GST Official Logo
    {
      id: "gst",
      name: "GST Registered",
      element: (
        <Image
          src="/assets/certifications/gst-logo.png"
          alt="GST Registered - Goods and Services Tax"
          width={130}
          height={65}
          className="h-6 sm:h-7 w-auto object-contain"
          priority
        />
      ),
    },
    // 3. DPIIT #startupindia Official Logo
    {
      id: "dpiit",
      name: "DPIIT #startupindia Recognized",
      element: (
        <Image
          src="/assets/certifications/dpiit-logo.png"
          alt="DPIIT #startupindia Recognized"
          width={140}
          height={48}
          className="h-6 sm:h-7 w-auto object-contain"
          priority
        />
      ),
    },
    // 4. Registered Trademark Official Stamp Logo
    {
      id: "trademark",
      name: "Registered Trademark",
      element: (
        <Image
          src="/assets/certifications/trademark-logo.png"
          alt="Registered Trademark"
          width={100}
          height={50}
          className="h-6 sm:h-7 w-auto object-contain"
          priority
        />
      ),
    },
  ];

  return (
    <div className="w-full font-sans">
      {/* 4 Official Certification Badges - Small, sleek, no headings */}
      <div className="flex flex-wrap items-center justify-center gap-2.5 sm:gap-3.5">
        {badges.map((item) => (
          <div
            key={item.id}
            title={item.name}
            className="h-10 sm:h-11 px-3.5 sm:px-4 rounded-xl bg-white/95 border border-white/20 shadow-sm flex items-center justify-center shrink-0 hover:bg-white transition-colors"
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
