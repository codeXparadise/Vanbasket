"use client";

import React, { useState } from "react";

export const OurProcessCycle: React.FC = () => {
  const [activeStep, setActiveStep] = useState<number | null>(null);

  const steps = [
    {
      id: 1,
      title: "Collection of Jamun fruit and forest honey",
      stepNum: "01",
      icon: (
        <svg viewBox="0 0 120 100" className="w-12 h-10 xs:w-14 xs:h-12 sm:w-20 sm:h-16 md:w-24 md:h-20 lg:w-28 lg:h-24 drop-shadow-sm">
          {/* Branch */}
          <path d="M10 25 Q35 22 55 35" stroke="#3E2723" strokeWidth="3.5" strokeLinecap="round" fill="none" />
          <path d="M25 24 Q30 15 40 18" stroke="#3E2723" strokeWidth="2" strokeLinecap="round" fill="none" />
          <path d="M42 30 Q46 38 48 42" stroke="#3E2723" strokeWidth="2" strokeLinecap="round" fill="none" />
          
          {/* Beehive */}
          <g transform="translate(18, 28)">
            {/* Hanging thread */}
            <path d="M22 0 L22 6" stroke="#4E342E" strokeWidth="2" />
            {/* Hive tiers */}
            <ellipse cx="22" cy="8" rx="11" ry="5" fill="#E5A93C" stroke="#2E1C0C" strokeWidth="1.5" />
            <ellipse cx="22" cy="14" rx="14" ry="6" fill="#F5B041" stroke="#2E1C0C" strokeWidth="1.5" />
            <ellipse cx="22" cy="21" rx="16" ry="6.5" fill="#E5A93C" stroke="#2E1C0C" strokeWidth="1.5" />
            <ellipse cx="22" cy="28" rx="14" ry="6" fill="#F5B041" stroke="#2E1C0C" strokeWidth="1.5" />
            <ellipse cx="22" cy="34" rx="10" ry="5" fill="#D4AC0D" stroke="#2E1C0C" strokeWidth="1.5" />
            <ellipse cx="22" cy="38" rx="6" ry="3.5" fill="#B7950B" stroke="#2E1C0C" strokeWidth="1.5" />
            {/* Entrance hole */}
            <ellipse cx="22" cy="22" rx="3.5" ry="3" fill="#1C140E" />
          </g>

          {/* Jamun Fruits Group */}
          <g transform="translate(62, 18)">
            {/* Stem & Leaves */}
            <path d="M18 10 Q14 2 2 12" stroke="#4E7029" strokeWidth="2.5" fill="none" strokeLinecap="round" />
            <path d="M18 10 Q28 4 38 10 Q28 16 18 10" fill="#689F38" stroke="#33691E" strokeWidth="1.2" />
            <path d="M8 8 Q10 0 20 2 Q14 8 8 8" fill="#7CB342" stroke="#33691E" strokeWidth="1" />
            
            {/* Fruit 1 (Left, standing slightly tilted) */}
            <ellipse cx="14" cy="36" rx="12" ry="17" fill="#6A1B9A" transform="rotate(-8 14 36)" />
            <ellipse cx="14" cy="36" rx="11.5" ry="16.5" fill="url(#jamunGrad1)" transform="rotate(-8 14 36)" stroke="#4A148C" strokeWidth="1.5" />
            <ellipse cx="11" cy="28" rx="3.5" ry="7" fill="white" opacity="0.35" transform="rotate(-15 11 28)" />

            {/* Fruit 2 (Right, leaning) */}
            <ellipse cx="32" cy="38" rx="13" ry="18" fill="#4A148C" transform="rotate(12 32 38)" />
            <ellipse cx="32" cy="38" rx="12.5" ry="17.5" fill="url(#jamunGrad2)" transform="rotate(12 32 38)" stroke="#38006B" strokeWidth="1.5" />
            <ellipse cx="36" cy="30" rx="3.5" ry="7.5" fill="white" opacity="0.35" transform="rotate(18 36 30)" />
          </g>

          <defs>
            <radialGradient id="jamunGrad1" cx="35%" cy="35%" r="65%">
              <stop offset="0%" stopColor="#9C27B0" />
              <stop offset="60%" stopColor="#6A1B9A" />
              <stop offset="100%" stopColor="#4A148C" />
            </radialGradient>
            <radialGradient id="jamunGrad2" cx="40%" cy="30%" r="65%">
              <stop offset="0%" stopColor="#AB47BC" />
              <stop offset="55%" stopColor="#7B1FA2" />
              <stop offset="100%" stopColor="#38006B" />
            </radialGradient>
          </defs>
        </svg>
      ),
    },
    {
      id: 2,
      title: "Transportation",
      stepNum: "02",
      icon: (
        <svg viewBox="0 0 140 90" className="w-14 h-9 xs:w-16 xs:h-11 sm:w-24 sm:h-16 md:w-28 md:h-18 lg:w-32 lg:h-20 drop-shadow-sm">
          {/* Produce in Truck bed */}
          <g transform="translate(18, 12)">
            <ellipse cx="20" cy="14" rx="18" ry="8" fill="#BCAAA4" />
            <circle cx="12" cy="11" r="5" fill="#D7CCC8" />
            <circle cx="22" cy="9" r="6" fill="#A1887F" />
            <circle cx="32" cy="11" r="5" fill="#8D6E63" />
            <circle cx="17" cy="7" r="4.5" fill="#BCAAA4" />
            <circle cx="27" cy="7" r="4" fill="#D7CCC8" />
          </g>

          {/* Wooden Slat Bed */}
          <rect x="14" y="24" width="50" height="22" rx="2" fill="#8D6E63" stroke="#4E342E" strokeWidth="1.5" />
          <line x1="14" y1="31" x2="64" y2="31" stroke="#4E342E" strokeWidth="1.5" />
          <line x1="14" y1="38" x2="64" y2="38" stroke="#4E342E" strokeWidth="1.5" />
          <line x1="28" y1="24" x2="28" y2="46" stroke="#4E342E" strokeWidth="1.5" />
          <line x1="44" y1="24" x2="44" y2="46" stroke="#4E342E" strokeWidth="1.5" />

          {/* Truck Chassis & Underbody */}
          <rect x="12" y="44" width="102" height="6" fill="#37474F" />

          {/* Red Truck Cab & Hood */}
          <path
            d="M62 46 L62 20 Q62 16 66 14 L82 14 Q88 14 90 22 L93 26 L112 26 Q116 26 116 30 L116 46 Z"
            fill="#D32F2F"
            stroke="#B71C1C"
            strokeWidth="1.5"
          />
          {/* Cab Window */}
          <path d="M68 18 L80 18 Q84 18 85 24 L86 28 L68 28 Z" fill="#B3E5FC" stroke="#0288D1" strokeWidth="1" />
          {/* Driver Silhouette in Window */}
          <circle cx="75" cy="23" r="3" fill="#37474F" />
          <path d="M71 28 C71 25 79 25 79 28 Z" fill="#37474F" />
          
          {/* Chrome Front Bumper & Headlight */}
          <rect x="114" y="40" width="4" height="6" rx="1" fill="#CFD8DC" stroke="#78909C" strokeWidth="0.8" />
          <circle cx="114" cy="32" r="2.5" fill="#FFF59D" stroke="#FBC02D" strokeWidth="0.8" />

          {/* Truck Wheels */}
          {/* Rear Wheel */}
          <g transform="translate(32, 50)">
            <circle cx="0" cy="0" r="11" fill="#263238" />
            <circle cx="0" cy="0" r="6" fill="#78909C" stroke="#37474F" strokeWidth="1" />
            <circle cx="0" cy="0" r="2.5" fill="#ECEFF1" />
          </g>
          {/* Front Wheel */}
          <g transform="translate(98, 50)">
            <circle cx="0" cy="0" r="11" fill="#263238" />
            <circle cx="0" cy="0" r="6" fill="#78909C" stroke="#37474F" strokeWidth="1" />
            <circle cx="0" cy="0" r="2.5" fill="#ECEFF1" />
          </g>
        </svg>
      ),
    },
    {
      id: 3,
      title: "Quality assurance & processing",
      stepNum: "03",
      icon: (
        <svg viewBox="0 0 140 100" className="w-14 h-10 xs:w-16 xs:h-12 sm:w-24 sm:h-18 md:w-28 md:h-20 lg:w-32 lg:h-24 drop-shadow-sm">
          {/* Overhead Ventilation Pipe */}
          <path d="M20 18 L120 18" stroke="#B0BEC5" strokeWidth="4" strokeLinecap="round" />
          <path d="M70 18 L70 26" stroke="#90A4AE" strokeWidth="2.5" />
          <rect x="66" y="26" width="8" height="4" fill="#78909C" />

          {/* Processing Conveyor Incline & Table */}
          <polygon points="10,65 115,65 115,76 10,76" fill="#90A4AE" stroke="#546E7A" strokeWidth="1" />
          <polygon points="10,32 50,65 42,65 8,34" fill="#B0BEC5" stroke="#546E7A" strokeWidth="1" />

          {/* Conveyor Rollers & Fruit on Belt */}
          <circle cx="22" cy="45" r="3" fill="#E65100" />
          <circle cx="29" cy="51" r="3" fill="#FB8C00" />
          <circle cx="36" cy="58" r="3" fill="#EF6C00" />
          <circle cx="48" cy="62" r="3.2" fill="#E65100" />
          <circle cx="56" cy="62" r="3.2" fill="#FFA726" />
          <circle cx="64" cy="62" r="3.2" fill="#E65100" />

          {/* Machine Tank & Dials */}
          <rect x="88" y="44" width="22" height="21" rx="2" fill="#CFD8DC" stroke="#78909C" strokeWidth="1" />
          <circle cx="95" cy="51" r="2" fill="#455A64" />
          <circle cx="103" cy="51" r="2" fill="#455A64" />
          <circle cx="95" cy="58" r="2" fill="#455A64" />
          <circle cx="103" cy="58" r="2" fill="#455A64" />
          <rect x="91" y="38" width="16" height="6" fill="#B0BEC5" stroke="#78909C" strokeWidth="1" />

          {/* Worker 1 (Left - Hygiene Suit) */}
          <g transform="translate(60, 36)">
            {/* Cap */}
            <ellipse cx="10" cy="5" rx="5" ry="3.5" fill="#42A5F5" />
            {/* Head & Mask */}
            <circle cx="10" cy="9" r="4" fill="#FFCCBC" />
            <rect x="7" y="9.5" width="6" height="3" rx="1" fill="#E0E0E0" />
            {/* Body / Coat */}
            <path d="M5 14 L15 14 L17 32 L3 32 Z" fill="#90CAF9" stroke="#1E88E5" strokeWidth="0.8" />
            {/* Hands examining */}
            <path d="M5 18 L1 26" stroke="#90CAF9" strokeWidth="2.5" strokeLinecap="round" />
            <path d="M15 18 L19 26" stroke="#90CAF9" strokeWidth="2.5" strokeLinecap="round" />
          </g>

          {/* Worker 2 (Right - Clipboard Inspector) */}
          <g transform="translate(108, 38)">
            {/* Cap */}
            <ellipse cx="10" cy="5" rx="5" ry="3.5" fill="#42A5F5" />
            {/* Head & Mask */}
            <circle cx="10" cy="9" r="4" fill="#FFCCBC" />
            <rect x="7" y="9.5" width="6" height="3" rx="1" fill="#E0E0E0" />
            {/* Body / Coat */}
            <path d="M5 14 L15 14 L17 38 L3 38 Z" fill="#90CAF9" stroke="#1E88E5" strokeWidth="0.8" />
            {/* Clipboard in hand */}
            <rect x="0" y="20" width="7" height="10" rx="1" fill="#D7CCC8" stroke="#5D4037" strokeWidth="0.8" />
            <line x1="2" y1="23" x2="5" y2="23" stroke="#5D4037" strokeWidth="0.8" />
            <line x1="2" y1="26" x2="5" y2="26" stroke="#5D4037" strokeWidth="0.8" />
            <path d="M11 38 L10 50 M14 38 L15 50" stroke="#263238" strokeWidth="2.5" strokeLinecap="round" />
          </g>

          {/* Machine Legs */}
          <line x1="25" y1="76" x2="25" y2="92" stroke="#455A64" strokeWidth="3" />
          <line x1="75" y1="76" x2="75" y2="92" stroke="#455A64" strokeWidth="3" />
          <line x1="105" y1="76" x2="105" y2="92" stroke="#455A64" strokeWidth="3" />
        </svg>
      ),
    },
    {
      id: 4,
      title: "Packaging",
      stepNum: "04",
      icon: (
        <svg viewBox="0 0 120 100" className="w-12 h-10 xs:w-14 xs:h-12 sm:w-20 sm:h-16 md:w-24 md:h-20 lg:w-28 lg:h-24 drop-shadow-sm">
          {/* Isometric 3D Cardboard Delivery Box */}
          <g transform="translate(15, 15)">
            {/* Top Face */}
            <polygon points="45,0 88,18 45,34 2,18" fill="#F0C78A" stroke="#C89D58" strokeWidth="1.2" />
            {/* Top Tape Strip */}
            <polygon points="45,0 52,3 45,34 38,31" fill="#FDFEFE" opacity="0.85" />
            <polygon points="45,0 49,2 45,34 41,32" fill="#E8EDF2" />

            {/* Left Face */}
            <polygon points="2,18 45,34 45,72 2,56" fill="#DEB06B" stroke="#B5863D" strokeWidth="1.2" />
            {/* Left Tape drop */}
            <polygon points="38,31 45,34 45,46 38,43" fill="#FDFEFE" opacity="0.85" />

            {/* Right Face */}
            <polygon points="45,34 88,18 88,56 45,72" fill="#C99B52" stroke="#A27329" strokeWidth="1.2" />
            {/* Right Tape drop */}
            <polygon points="45,34 52,31 52,43 45,46" fill="#E8EDF2" opacity="0.85" />

            {/* Packaging Badge Label */}
            <rect x="58" y="38" width="16" height="10" rx="1" fill="#FFFFFF" opacity="0.8" />
            <line x1="61" y1="41" x2="71" y2="41" stroke="#5D4037" strokeWidth="0.8" />
            <line x1="61" y1="44" x2="68" y2="44" stroke="#5D4037" strokeWidth="0.8" />
          </g>
        </svg>
      ),
    },
    {
      id: 5,
      title: "Storage",
      stepNum: "05",
      icon: (
        <svg viewBox="0 0 120 100" className="w-12 h-10 xs:w-14 xs:h-12 sm:w-20 sm:h-16 md:w-24 md:h-20 lg:w-28 lg:h-24 drop-shadow-sm">
          {/* Warehouse Building */}
          <g transform="translate(18, 12)">
            {/* Gable Roof */}
            <polygon points="42,0 84,18 84,24 42,6 0,24 0,18" fill="#37474F" />
            
            {/* Main Warehouse Wall Frame */}
            <rect x="6" y="24" width="72" height="52" fill="#ECEFF1" stroke="#37474F" strokeWidth="3" />
            
            {/* Overhead Vent triangle */}
            <polygon points="42,9 33,21 51,21" fill="#B0BEC5" />

            {/* Warehouse Roller Door Opening */}
            <rect x="18" y="36" width="48" height="40" fill="#FFFFFF" stroke="#37474F" strokeWidth="2.5" />

            {/* Blue Storage Boxes Inside */}
            {/* Bottom Row */}
            <rect x="23" y="60" width="12" height="12" rx="1.5" fill="#1976D2" stroke="#0D47A1" strokeWidth="1.2" />
            <rect x="36" y="60" width="12" height="12" rx="1.5" fill="#1976D2" stroke="#0D47A1" strokeWidth="1.2" />
            <rect x="49" y="60" width="12" height="12" rx="1.5" fill="#1976D2" stroke="#0D47A1" strokeWidth="1.2" />
            
            {/* Box seam details */}
            <line x1="29" y1="60" x2="29" y2="72" stroke="#90CAF9" strokeWidth="1" />
            <line x1="42" y1="60" x2="42" y2="72" stroke="#90CAF9" strokeWidth="1" />
            <line x1="55" y1="60" x2="55" y2="72" stroke="#90CAF9" strokeWidth="1" />

            {/* Top Stacked Row */}
            <rect x="29" y="47" width="12" height="12" rx="1.5" fill="#2196F3" stroke="#0D47A1" strokeWidth="1.2" />
            <rect x="43" y="47" width="12" height="12" rx="1.5" fill="#2196F3" stroke="#0D47A1" strokeWidth="1.2" />
            <line x1="35" y1="47" x2="35" y2="59" stroke="#E3F2FD" strokeWidth="1" />
            <line x1="49" y1="47" x2="49" y2="59" stroke="#E3F2FD" strokeWidth="1" />
          </g>
        </svg>
      ),
    },
    {
      id: 6,
      title: "Sales and marketing",
      stepNum: "06",
      icon: (
        <svg viewBox="0 0 120 100" className="w-12 h-10 xs:w-14 xs:h-12 sm:w-20 sm:h-16 md:w-24 md:h-20 lg:w-28 lg:h-24 drop-shadow-sm">
          {/* Yellow Circular Badge */}
          <g transform="translate(18, 8)">
            <circle cx="42" cy="42" r="38" fill="#FBC02D" />
            <circle cx="42" cy="42" r="34" fill="#FDD835" />

            {/* Business Persons (Icons in dark blue/teal) */}
            {/* Person 1 (Left) */}
            <g transform="translate(24, 22)">
              <circle cx="6" cy="6" r="4.5" fill="#003B46" />
              <path d="M0 24 L3 13 L9 13 L12 24 Z" fill="#003B46" />
              {/* Tie */}
              <polygon points="6,13 7,19 6,21 5,19" fill="#00796B" />
            </g>

            {/* Person 2 (Center - Leader) */}
            <g transform="translate(36, 17)">
              <circle cx="6" cy="6" r="5" fill="#003B46" />
              <path d="M-1 29 L3 14 L9 14 L13 29 Z" fill="#003B46" />
              {/* Tie */}
              <polygon points="6,14 7.5,21 6,23 4.5,21" fill="#009688" />
            </g>

            {/* Person 3 (Right) */}
            <g transform="translate(48, 22)">
              <circle cx="6" cy="6" r="4.5" fill="#003B46" />
              <path d="M0 24 L3 13 L9 13 L12 24 Z" fill="#003B46" />
              {/* Tie */}
              <polygon points="6,13 7,19 6,21 5,19" fill="#00796B" />
            </g>

            {/* Upward Growth Trend Arrow (White) */}
            <path
              d="M10 52 L26 42 L42 48 L68 22 L68 32 M68 22 L58 22"
              fill="none"
              stroke="#FFFFFF"
              strokeWidth="5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </g>
        </svg>
      ),
    },
  ];

  return (
    <section className="py-16 sm:py-24 bg-[#F5EFE6] text-brand-espresso font-sans relative overflow-hidden border-b border-brand-cream-dark/50">
      {/* Decorative Subtle Background Flourish */}
      <div className="absolute inset-0 bg-[radial-gradient(#2D5A27_0.75px,transparent_0.75px)] [background-size:24px_24px] opacity-[0.035] pointer-events-none" />

      <div className="relative max-w-6xl mx-auto px-4 sm:px-6 md:px-8">
        {/* Section Header */}
        <div className="text-center max-w-2xl mx-auto space-y-2 mb-10 sm:mb-16">
          <span className="inline-block text-[10px] font-bold uppercase tracking-[0.28em] text-[#2D5A27] bg-[#2D5A27]/10 px-3.5 py-1 rounded-full">
            Lifecycle & Value Chain
          </span>
          <h2 className="font-serif text-3xl sm:text-4xl md:text-5xl font-black text-brand-espresso">
            Our Forest Harvest Cycle
          </h2>
          <p className="text-xs sm:text-sm text-brand-espresso/75 leading-relaxed font-light">
            From the wild canopies of Chhattisgarh to pure, lab-tested wellness delivered to your hands.
          </p>
        </div>

        {/* ========================================================================= */}
        {/* UNIFIED CIRCULAR PROCESS CYCLE (Identical on Mobile & Desktop)             */}
        {/* ========================================================================= */}
        <div className="relative w-full max-w-[920px] mx-auto aspect-[16/11] select-none">
          {/* SVG Background connecting circular arrows */}
          <svg viewBox="0 0 900 620" className="absolute inset-0 w-full h-full pointer-events-none z-0">
            <defs>
              {/* Arrowhead marker */}
              <marker id="greenArrow" viewBox="0 0 10 10" refX="6" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
                <path d="M 0 1.5 L 8 5 L 0 8.5 z" fill="#33691E" />
              </marker>
            </defs>

            {/* Curved Arrow 1 -> 2: From Collection (top-left) to Transportation (top-center) */}
            <path
              d="M 235 155 Q 310 95 400 95"
              fill="none"
              stroke="#33691E"
              strokeWidth="9"
              strokeLinecap="round"
              markerEnd="url(#greenArrow)"
              className="opacity-90"
            />

            {/* Curved Arrow 2 -> 3: From Transportation (top-center) to Processing (top-right) */}
            <path
              d="M 525 95 Q 615 95 680 155"
              fill="none"
              stroke="#33691E"
              strokeWidth="9"
              strokeLinecap="round"
              markerEnd="url(#greenArrow)"
              className="opacity-90"
            />

            {/* Curved Arrow 3 -> 4: From Processing (top-right) to Packaging (bottom-right) */}
            <path
              d="M 755 245 Q 780 320 755 390"
              fill="none"
              stroke="#33691E"
              strokeWidth="9"
              strokeLinecap="round"
              markerEnd="url(#greenArrow)"
              className="opacity-90"
            />

            {/* Curved Arrow 4 -> 5: From Packaging (bottom-right) to Storage (bottom-center) */}
            <path
              d="M 685 480 Q 615 540 525 540"
              fill="none"
              stroke="#33691E"
              strokeWidth="9"
              strokeLinecap="round"
              markerEnd="url(#greenArrow)"
              className="opacity-90"
            />

            {/* Curved Arrow 5 -> 6: From Storage (bottom-center) to Sales & Marketing (bottom-left) */}
            <path
              d="M 400 540 Q 310 540 240 480"
              fill="none"
              stroke="#33691E"
              strokeWidth="9"
              strokeLinecap="round"
              markerEnd="url(#greenArrow)"
              className="opacity-90"
            />

            {/* Curved Arrow 6 -> 1: From Sales & Marketing (bottom-left) to Collection (top-left) */}
            <path
              d="M 165 390 Q 140 320 165 245"
              fill="none"
              stroke="#33691E"
              strokeWidth="9"
              strokeLinecap="round"
              markerEnd="url(#greenArrow)"
              className="opacity-90"
            />
          </svg>

          {/* Central Starburst Badge: "Our process" */}
          <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-10">
            <div className="relative flex items-center justify-center cursor-default group">
              {/* Organic 16-point Starburst Badge SVG */}
              <svg viewBox="0 0 160 160" className="w-16 h-16 xs:w-20 xs:h-20 sm:w-28 sm:h-28 md:w-36 md:h-36 lg:w-44 lg:h-44 drop-shadow-md transition-transform duration-500 group-hover:scale-105">
                <path
                  d="M80 0 L94 18 L116 12 L122 34 L144 38 L140 60 L158 72 L146 90 L158 108 L140 120 L144 142 L122 146 L116 168 L94 162 L80 180 L66 162 L44 168 L38 146 L16 142 L20 120 L2 108 L14 90 L2 72 L20 60 L16 38 L38 34 L44 12 L66 18 Z"
                  fill="#33691E"
                />
                <circle cx="80" cy="80" r="50" fill="#3B7D24" />
                <circle cx="80" cy="80" r="46" fill="none" stroke="#689F38" strokeWidth="1.5" strokeDasharray="3 3" />
              </svg>
              {/* Badge Text */}
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                <span className="font-serif text-[9px] xs:text-[11px] sm:text-base md:text-lg lg:text-xl font-black text-brand-cream-light text-center leading-tight drop-shadow tracking-wide">
                  Our<br />process
                </span>
              </div>
            </div>
          </div>

          {/* 6 Step Nodes Positioned in Ring */}
          
          {/* Node 1: Collection of Jamun fruit and forest honey (Top-Left) */}
          <div
            onClick={() => setActiveStep(activeStep === 1 ? null : 1)}
            onMouseEnter={() => setActiveStep(1)}
            onMouseLeave={() => setActiveStep(null)}
            className={`absolute left-[0.5%] sm:left-[2%] lg:left-[3%] top-[4%] sm:top-[6%] lg:top-[8%] w-[86px] xs:w-[105px] sm:w-[160px] md:w-[210px] lg:w-[230px] flex flex-col items-center text-center transition-all duration-300 z-10 cursor-pointer ${
              activeStep === 1 ? "scale-105" : "hover:scale-102"
            }`}
          >
            <div className="p-0.5 xs:p-1 sm:p-2 transition-transform duration-300">
              {steps[0].icon}
            </div>
            <h3 className="font-sans text-[7px] xs:text-[8.5px] sm:text-xs lg:text-[13px] font-bold text-brand-espresso leading-tight sm:leading-snug max-w-[82px] xs:max-w-[100px] sm:max-w-[170px] md:max-w-[200px] mt-0.5 sm:mt-1">
              {steps[0].title}
            </h3>
          </div>

          {/* Node 2: Transportation (Top-Center) */}
          <div
            onClick={() => setActiveStep(activeStep === 2 ? null : 2)}
            onMouseEnter={() => setActiveStep(2)}
            onMouseLeave={() => setActiveStep(null)}
            className={`absolute left-1/2 -translate-x-1/2 top-[-2%] sm:top-[0%] w-[86px] xs:w-[105px] sm:w-[160px] md:w-[210px] lg:w-[230px] flex flex-col items-center text-center transition-all duration-300 z-10 cursor-pointer ${
              activeStep === 2 ? "scale-105" : "hover:scale-102"
            }`}
          >
            <div className="p-0.5 xs:p-1 sm:p-2 transition-transform duration-300">
              {steps[1].icon}
            </div>
            <h3 className="font-sans text-[7px] xs:text-[8.5px] sm:text-xs lg:text-[13px] font-bold text-brand-espresso leading-tight sm:leading-snug max-w-[82px] xs:max-w-[100px] sm:max-w-[170px] md:max-w-[200px] mt-0.5 sm:mt-1">
              {steps[1].title}
            </h3>
          </div>

          {/* Node 3: Quality assurance & processing (Top-Right) */}
          <div
            onClick={() => setActiveStep(activeStep === 3 ? null : 3)}
            onMouseEnter={() => setActiveStep(3)}
            onMouseLeave={() => setActiveStep(null)}
            className={`absolute right-[0.5%] sm:right-[2%] lg:right-[3%] top-[4%] sm:top-[6%] lg:top-[8%] w-[86px] xs:w-[105px] sm:w-[160px] md:w-[210px] lg:w-[230px] flex flex-col items-center text-center transition-all duration-300 z-10 cursor-pointer ${
              activeStep === 3 ? "scale-105" : "hover:scale-102"
            }`}
          >
            <div className="p-0.5 xs:p-1 sm:p-2 transition-transform duration-300">
              {steps[2].icon}
            </div>
            <h3 className="font-sans text-[7px] xs:text-[8.5px] sm:text-xs lg:text-[13px] font-bold text-brand-espresso leading-tight sm:leading-snug max-w-[82px] xs:max-w-[100px] sm:max-w-[170px] md:max-w-[200px] mt-0.5 sm:mt-1">
              {steps[2].title}
            </h3>
          </div>

          {/* Node 4: Packaging (Bottom-Right) */}
          <div
            onClick={() => setActiveStep(activeStep === 4 ? null : 4)}
            onMouseEnter={() => setActiveStep(4)}
            onMouseLeave={() => setActiveStep(null)}
            className={`absolute right-[0.5%] sm:right-[2%] lg:right-[3%] bottom-[3%] sm:bottom-[5%] lg:bottom-[8%] w-[86px] xs:w-[105px] sm:w-[160px] md:w-[210px] lg:w-[230px] flex flex-col items-center text-center transition-all duration-300 z-10 cursor-pointer ${
              activeStep === 4 ? "scale-105" : "hover:scale-102"
            }`}
          >
            <div className="p-0.5 xs:p-1 sm:p-2 transition-transform duration-300">
              {steps[3].icon}
            </div>
            <h3 className="font-sans text-[7px] xs:text-[8.5px] sm:text-xs lg:text-[13px] font-bold text-brand-espresso leading-tight sm:leading-snug max-w-[82px] xs:max-w-[100px] sm:max-w-[170px] md:max-w-[200px] mt-0.5 sm:mt-1">
              {steps[3].title}
            </h3>
          </div>

          {/* Node 5: Storage (Bottom-Center) */}
          <div
            onClick={() => setActiveStep(activeStep === 5 ? null : 5)}
            onMouseEnter={() => setActiveStep(5)}
            onMouseLeave={() => setActiveStep(null)}
            className={`absolute left-1/2 -translate-x-1/2 bottom-[-2%] sm:bottom-[0%] w-[86px] xs:w-[105px] sm:w-[160px] md:w-[210px] lg:w-[230px] flex flex-col items-center text-center transition-all duration-300 z-10 cursor-pointer ${
              activeStep === 5 ? "scale-105" : "hover:scale-102"
            }`}
          >
            <div className="p-0.5 xs:p-1 sm:p-2 transition-transform duration-300">
              {steps[4].icon}
            </div>
            <h3 className="font-sans text-[7px] xs:text-[8.5px] sm:text-xs lg:text-[13px] font-bold text-brand-espresso leading-tight sm:leading-snug max-w-[82px] xs:max-w-[100px] sm:max-w-[170px] md:max-w-[200px] mt-0.5 sm:mt-1">
              {steps[4].title}
            </h3>
          </div>

          {/* Node 6: Sales and marketing (Bottom-Left) */}
          <div
            onClick={() => setActiveStep(activeStep === 6 ? null : 6)}
            onMouseEnter={() => setActiveStep(6)}
            onMouseLeave={() => setActiveStep(null)}
            className={`absolute left-[0.5%] sm:left-[2%] lg:left-[3%] bottom-[3%] sm:bottom-[5%] lg:bottom-[8%] w-[86px] xs:w-[105px] sm:w-[160px] md:w-[210px] lg:w-[230px] flex flex-col items-center text-center transition-all duration-300 z-10 cursor-pointer ${
              activeStep === 6 ? "scale-105" : "hover:scale-102"
            }`}
          >
            <div className="p-0.5 xs:p-1 sm:p-2 transition-transform duration-300">
              {steps[5].icon}
            </div>
            <h3 className="font-sans text-[7px] xs:text-[8.5px] sm:text-xs lg:text-[13px] font-bold text-brand-espresso leading-tight sm:leading-snug max-w-[82px] xs:max-w-[100px] sm:max-w-[170px] md:max-w-[200px] mt-0.5 sm:mt-1">
              {steps[5].title}
            </h3>
          </div>
        </div>

      </div>
    </section>
  );
};
