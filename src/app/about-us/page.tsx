"use client";

import React from "react";
import Image from "next/image";
import {
  ChevronDown,
  Sparkles,
} from "lucide-react";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";

/**
 * =========================================================================
 * VANBASKET ABOUT US STORY CONFIGURATION
 * Single source of truth for About Us content and imagery.
 * =========================================================================
 */
export const VANBASKET_ABOUT_STORY = {
  // Photography Assets
  media: {
    heroBackground: "/assets/hero/about-us/vanbasket-about-us-hero.jpg",
    aboutVanBasketCommunity: "/assets/about-us/about-vanbasket-community.jpg",
    founderPortrait: "/assets/about-us/founder-bhupendra-sahu-portrait.jpg",
    chhattisgarhLand: "/assets/client-assets/kanopy.jpg",
    tribalPeople: "/assets/client-assets/male-tribal.jpg",
  },

  // Hero
  hero: {
    tag: "VanBasket · Origin Story",
    headline: "Born From The Forests Of Chhattisgarh.",
    supportingLine:
      "Connecting the richness of nature and traditional forest wisdom with the modern world.",
  },

  // 01 — About Brand: VanBasket
  aboutBrand: {
    headline: "About VanBasket",
    paragraph1:
      "VanBasket is a trusted manufacturer, supplier and trader of premium Jamun (Indian Blackberry) Pulp and Wild Forest Honey, sourced directly from the deep and dense forests of Chhattisgarh, India.",
    paragraph2:
      "We work closely with tribal forest communities, purchasing fresh Jamun fruits and raw wild forest honey directly from them. This direct sourcing model ensures the highest quality while creating sustainable livelihoods and improving the economic well-being of tribal families.",
    paragraph3:
      "At VanBasket, we are committed to delivering natural, health-conscious products that combine purity, quality, and sustainability. Every purchase supports ethical sourcing, forest conservation, and the empowerment of tribal communities, while bringing nature's finest products.",
  },

  // 02 — Founder Information with Vision and Mission
  founder: {
    sectionBadge: "Founder introduction",
    name: "Mr. Bhupendra Kumar Sahu",
    title: "Founder of VanBasket",
    bio1: "Mr. Bhupendra Kumar Sahu, Founder of VanBasket, brings over 15 years of extensive experience in organic certification, CSR initiatives, and community development across various regions of Chhattisgarh.",
    bio2: "His professional journey has provided him with a deep understanding of forest-based livelihoods, sustainable practices, organic products, and the communities that depend on forest resources. His close engagement with local communities has shaped his vision of creating a platform that connects the rich natural resources of Chhattisgarh with consumers while ensuring meaningful benefits for the people who live in and around these forest regions.",
    vision: {
      badge: "Our Vision",
      statement:
        "We envision Van Basket becoming a trusted name for authentic, naturally sourced forest products connecting consumers with the richness of Chhattisgarh's forests while preserving their biodiversity and traditional harvesting heritage.",
    },
    mission: {
      badge: "Our mission",
      statement:
        "Our mission is to deliver pure, authentic, and responsibly harvested forest products (wild forest honey & jamun pulp/slice) while creating lasting value for nature and local communities.",
    },
  },

  // 03 — The Land
  land: {
    chapter: "The Land",
    headline: "From A Land Rich In Nature.",
    lead: "VanBasket's products are sourced from the deep and dense forests and fertile regions of Chhattisgarh, India.",
    narrative:
      "Far from industrial corridors and monoculture farms lie the ancient Sal, Teak, and Mahua woodlands of Chhattisgarh. This biodiverse landscape is home to pristine river streams, unpolluted flora, and native wild bees who forage on sacred flowering canopies undisturbed for centuries.",
  },

  // 04 — The People
  people: {
    chapter: "The People",
    headline: "Behind Every Harvest, There Are People.",
    lead: "VanBasket works closely with tribal forest communities, purchasing fresh Jamun fruits and raw wild forest honey directly from them.",
    narrative:
      "For generations, indigenous forest dwellers have lived in deep harmony with the wild. Our direct sourcing model replaces exploitative intermediaries with transparent, dignified trade, fostering sustainable livelihoods and strengthening the economic well-being of tribal families across the forest belt.",
    stats: [
      { label: "Sourcing Model", value: "100% Direct" },
      { label: "Partnership", value: "Indigenous Co-Op" },
      { label: "Intermediaries", value: "Zero Middlemen" },
    ],
  },

  // 05 — Why We Stand For
  values: [
    {
      name: "AUTHENTICITY",
      description: "True single-origin wild produce with zero industrial adulteration or syrup feeds.",
    },
    {
      name: "NATURAL SOURCING",
      description: "Hand-gathered exclusively from wild forest trees, never from commercial monoculture boxes.",
    },
    {
      name: "QUALITY & PURITY",
      description: "Unpasteurized, unprocessed, cold-filtered nutrition preserving all living enzymes and pollen.",
    },
    {
      name: "SUSTAINABILITY",
      description: "Harvesting only nature’s surplus, leaving sufficient reserves for bee broods and seedlings.",
    },
    {
      name: "ETHICAL SOURCING",
      description: "Direct trade partnerships ensuring fair compensation directly to indigenous forest gatherers.",
    },
    {
      name: "COMMUNITY EMPOWERMENT",
      description: "Creating resilient, dignified forest livelihoods that keep tribal families economically strong.",
    },
    {
      name: "FOREST CONSERVATION",
      description: "Safeguarding Chhattisgarh’s fragile biospheres and native Apis dorsata pollinator colonies.",
    },
  ],
};

export default function AboutUsPage() {
  const story = VANBASKET_ABOUT_STORY;

  return (
    <div className="min-h-screen bg-[#FAF8F5] text-[#231815] font-sans antialiased selection:bg-[#d98b00]/20">
      {/* Global Brand Navigation */}
      <Navbar />

      <main className="relative">
        {/* =========================================================================
            CINEMATIC HERO
            Full-screen Chhattisgarh forest, large editorial typography, minimal text
           ========================================================================= */}
        <section className="relative min-h-[100svh] flex flex-col justify-between bg-[#15100c] text-white px-6 md:px-16 pt-32 pb-12 overflow-hidden">
          {/* Immersive Background Forest Imagery */}
          <div className="absolute inset-0 z-0">
            <Image
              src={story.media.heroBackground}
              alt="Forests of Chhattisgarh"
              fill
              priority
              sizes="100vw"
              className="object-cover object-center scale-105 transition-transform duration-[4000ms] ease-out"
            />
            {/* Cinematic Darkness Vignette & Texture */}
            <div className="absolute inset-0 bg-gradient-to-t from-[#15100c] via-[#15100c]/55 to-[#15100c]/70" />
            <div className="absolute inset-0 bg-radial-gradient from-transparent via-[#15100c]/40 to-[#15100c]/90 pointer-events-none" />
          </div>

          {/* Top Editorial Eyebrow */}
          <div className="relative z-10 max-w-7xl mx-auto w-full pt-4">
            <div className="inline-flex items-center gap-2.5 text-[11px] font-sans font-bold uppercase tracking-[0.3em] text-[#E0A838]">
              <Sparkles className="w-3.5 h-3.5 text-[#E0A838]" />
              <span>{story.hero.tag}</span>
            </div>
          </div>

          {/* Hero Main Typography */}
          <div className="relative z-10 max-w-7xl mx-auto w-full my-auto py-12">
            <h1 className="font-serif text-5xl sm:text-6xl md:text-7xl lg:text-8xl font-black tracking-tight leading-[1.02] text-[#FAF8F5] max-w-4xl">
              Born From <br />
              The Forests Of <br />
              <span className="italic font-normal text-[#E0A838]">Chhattisgarh.</span>
            </h1>

            <p className="mt-8 font-sans text-base sm:text-lg md:text-xl text-white/80 max-w-xl font-light leading-relaxed">
              {story.hero.supportingLine}
            </p>
          </div>

          {/* Bottom Elegant Scroll Indicator */}
          <div className="relative z-10 max-w-7xl mx-auto w-full flex items-center justify-between border-t border-white/15 pt-6 text-[11px] font-sans uppercase tracking-[0.25em] text-white/60">
            <span>Nature · People · Tradition</span>
            <div className="flex items-center gap-2 text-white/70 animate-bounce">
              <span>Scroll to explore</span>
              <ChevronDown className="w-3.5 h-3.5 text-[#E0A838]" />
            </div>
          </div>
        </section>

        {/* =========================================================================
            01 — ABOUT BRAND: ABOUT VANBASKET
            Matches presentation slide: Organic brush styling, earthy palette,
            direct harvest community photography and 3-paragraph narrative.
           ========================================================================= */}
        <section className="py-20 md:py-28 bg-[#F4EDE2] relative overflow-hidden border-b border-[#231815]/10">
          {/* Decorative painted organic brush accents */}
          <div className="absolute top-0 right-0 w-64 h-64 pointer-events-none opacity-40 select-none">
            <svg viewBox="0 0 200 200" fill="none" className="w-full h-full text-[#4E6238]">
              <path
                d="M40,20 C80,10 160,20 180,60 C200,100 170,160 140,180 C110,200 60,180 30,150 C10,120 10,70 40,20 Z"
                stroke="currentColor"
                strokeWidth="2.5"
                strokeDasharray="4 8 12 4"
                opacity="0.35"
              />
              <path
                d="M90,35 C130,30 175,60 165,110 C155,160 120,175 80,165"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeDasharray="2 6"
                opacity="0.4"
              />
            </svg>
          </div>

          <div className="absolute bottom-0 left-0 w-56 h-56 pointer-events-none opacity-30 select-none">
            <svg viewBox="0 0 200 200" fill="none" className="w-full h-full text-[#735738]">
              <path
                d="M160,180 C120,190 40,180 20,140 C0,100 30,40 60,20 C90,0 140,20 170,50 C190,80 190,130 160,180 Z"
                stroke="currentColor"
                strokeWidth="2"
                strokeDasharray="6 8"
                opacity="0.3"
              />
            </svg>
          </div>

          <div className="max-w-7xl mx-auto px-6 md:px-16 relative z-10">
            <div className="mb-12">
              <h2 className="font-serif text-4xl sm:text-5xl md:text-6xl font-black text-[#375429] tracking-tight">
                {story.aboutBrand.headline}
              </h2>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-14 items-center">
              {/* Left Column: 3 Paragraphs */}
              <div className="lg:col-span-6 space-y-6 text-[#1A1A1A]">
                <p className="font-sans text-base sm:text-lg font-bold leading-relaxed">
                  {story.aboutBrand.paragraph1}
                </p>

                <p className="font-sans text-sm sm:text-base font-medium text-[#262626] leading-relaxed">
                  {story.aboutBrand.paragraph2}
                </p>

                <p className="font-sans text-sm sm:text-base font-semibold text-[#1F1F1F] leading-relaxed">
                  {story.aboutBrand.paragraph3}
                </p>
              </div>

              {/* Right Column: Tribal Community Banner Photo */}
              <div className="lg:col-span-6">
                <div className="relative aspect-[4/3] rounded-xl overflow-hidden shadow-xl bg-stone-300 border-2 border-[#375429]/20 group">
                  <Image
                    src={story.media.aboutVanBasketCommunity}
                    alt="VanBasket Tribal Harvesters and Wild Forest Honey Harvest in Chhattisgarh"
                    fill
                    sizes="(max-width: 1024px) 100vw, 50vw"
                    className="object-cover transition-transform duration-700 ease-out group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-40" />
                  <div className="absolute bottom-3 left-4 text-white/90 text-xs font-sans tracking-wide">
                    Tribal Harvesters Partnership · Chhattisgarh, India
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* =========================================================================
            02 — ABOUT FOUNDER: FOUNDER INFORMATION WITH VISION & MISSION
            Matches presentation slide:
            - "Founder introduction" banner badge
            - High-res portrait of Mr. Bhupendra Kumar Sahu
            - Detailed biographical experience
            - 2 distinct columns below: "Our Vision" & "Our mission" with wooden banner badges
           ========================================================================= */}
        <section className="py-20 md:py-28 bg-[#FAF6F0] relative overflow-hidden border-b border-[#231815]/10">
          <div className="max-w-6xl mx-auto px-6 md:px-12 relative z-10">
            {/* Card Shell */}
            <div className="bg-[#FAF6F0] border-2 border-[#D8C7B0] rounded-3xl p-6 sm:p-10 md:p-14 shadow-lg">
              
              {/* Section Badge Banner: "Founder introduction" */}
              <div className="flex justify-center mb-10">
                <div className="relative inline-block px-8 py-2.5 bg-[#4F3B2A] text-white rounded-md shadow-md text-center">
                  <div className="absolute inset-x-0 -top-0.5 h-0.5 bg-[#785C42]/50 rounded-t" />
                  <span className="font-serif text-2xl sm:text-3xl font-bold tracking-wide">
                    {story.founder.sectionBadge}
                  </span>
                </div>
              </div>

              {/* Founder Profile Row */}
              <div className="grid grid-cols-1 md:grid-cols-12 gap-8 md:gap-12 items-center mb-14">
                {/* Left: Founder Portrait */}
                <div className="md:col-span-4 flex justify-center">
                  <div className="relative w-52 sm:w-60 aspect-[3/4] rounded-2xl overflow-hidden shadow-xl border-2 border-[#4F3B2A]/25 bg-stone-200">
                    <Image
                      src={story.media.founderPortrait}
                      alt={story.founder.name}
                      fill
                      priority
                      sizes="(max-width: 768px) 240px, 260px"
                      className="object-cover object-top"
                    />
                  </div>
                </div>

                {/* Right: Founder Biography */}
                <div className="md:col-span-8 space-y-4 text-[#1F1F1F]">
                  <p className="font-sans text-sm sm:text-base leading-relaxed">
                    <strong className="text-black font-bold">
                      {story.founder.name}
                    </strong>
                    , {story.founder.title}, brings over{" "}
                    <strong className="text-black font-semibold">15 years of extensive experience</strong> in
                    organic certification, CSR initiatives, and community development across various regions of
                    Chhattisgarh.
                  </p>

                  <p className="font-sans text-sm sm:text-base leading-relaxed text-[#2B2B2B]">
                    His professional journey has provided him with a deep understanding of{" "}
                    <strong className="text-black font-semibold">forest-based livelihoods</strong>, sustainable
                    practices, organic products, and the communities that depend on forest resources. His close
                    engagement with local communities has shaped his vision of creating a platform that connects
                    the rich natural resources of Chhattisgarh with consumers while ensuring meaningful benefits
                    for the people who live in and around these forest regions.
                  </p>
                </div>
              </div>

              {/* Two Column Grid: Vision & Mission */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-12 pt-8 border-t border-[#D8C7B0]">
                {/* Left: Our Vision */}
                <div className="space-y-4">
                  <div className="inline-block px-6 py-2 bg-[#4F3B2A] text-white rounded-md shadow-sm">
                    <span className="font-serif text-xl sm:text-2xl font-bold tracking-wide">
                      {story.founder.vision.badge}
                    </span>
                  </div>
                  <p className="font-sans text-sm sm:text-base text-[#1F1F1F] leading-relaxed">
                    {story.founder.vision.statement}
                  </p>
                </div>

                {/* Right: Our Mission */}
                <div className="space-y-4">
                  <div className="inline-block px-6 py-2 bg-[#4F3B2A] text-white rounded-md shadow-sm">
                    <span className="font-serif text-xl sm:text-2xl font-bold tracking-wide">
                      {story.founder.mission.badge}
                    </span>
                  </div>
                  <p className="font-sans text-sm sm:text-base text-[#1F1F1F] leading-relaxed">
                    {story.founder.mission.statement}
                  </p>
                </div>
              </div>

            </div>
          </div>
        </section>

        {/* =========================================================================
            03 — THE LAND: "From A Land Rich In Nature"
            Large landscape photography + deep prose
           ========================================================================= */}
        <section className="py-20 md:py-32 bg-[#FAF8F5] relative border-b border-[#231815]/10">
          <div className="max-w-7xl mx-auto px-6 md:px-16">
            
            <div className="text-[11px] font-sans font-bold uppercase tracking-[0.3em] text-[#C68A2C] mb-4">
              {story.land.chapter}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-20 items-center">
              {/* Left: Large Landscape Image */}
              <div className="lg:col-span-7">
                <div className="relative aspect-[4/3] md:aspect-[16/11] rounded-2xl overflow-hidden shadow-2xl bg-[#ebe5db]">
                  <Image
                    src={story.media.chhattisgarhLand}
                    alt="Chhattisgarh Forest Land"
                    fill
                    sizes="(max-width: 1024px) 100vw, 55vw"
                    className="object-cover transition-transform duration-1000 ease-out hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-60" />
                  <div className="absolute bottom-5 left-6 text-white text-xs font-sans tracking-widest uppercase font-semibold">
                    Chhattisgarh Sal & Mahua Woodlands
                  </div>
                </div>
              </div>

              {/* Right: Prose & Typography */}
              <div className="lg:col-span-5 space-y-6">
                <h2 className="font-serif text-3xl sm:text-4xl md:text-5xl font-black text-[#231815] leading-[1.12]">
                  {story.land.headline}
                </h2>

                <p className="font-sans text-base sm:text-lg text-[#231815]/90 font-medium leading-relaxed">
                  {story.land.lead}
                </p>

                <p className="font-sans text-sm sm:text-base text-[#231815]/70 font-light leading-relaxed">
                  {story.land.narrative}
                </p>

                <div className="pt-4 border-t border-[#231815]/10 flex items-center gap-6 text-xs uppercase tracking-widest text-[#231815]/60 font-bold">
                  <span>Untouched Flora</span>
                  <span>·</span>
                  <span>Wild Biosphere</span>
                </div>
              </div>
            </div>

          </div>
        </section>

        {/* =========================================================================
            04 — THE PEOPLE: "Behind Every Harvest, There Are People"
            Documentary human-focused photography, economic empowerment
           ========================================================================= */}
        <section className="py-20 md:py-32 bg-[#1F261F] text-[#FAF8F5] relative overflow-hidden border-b border-[#231815]/10">
          <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-[#E0A838]/5 rounded-full blur-3xl pointer-events-none" />

          <div className="max-w-7xl mx-auto px-6 md:px-16 relative z-10">
            <div className="text-[11px] font-sans font-bold uppercase tracking-[0.3em] text-[#E0A838] mb-4">
              {story.people.chapter}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-20 items-center">
              {/* Left Column: Human Story Content */}
              <div className="lg:col-span-6 space-y-8 order-2 lg:order-1">
                <h2 className="font-serif text-3xl sm:text-4xl md:text-5xl font-black leading-[1.1] text-white">
                  {story.people.headline}
                </h2>

                <p className="font-sans text-base sm:text-lg text-white/90 font-normal leading-relaxed">
                  {story.people.lead}
                </p>

                <p className="font-sans text-sm sm:text-base text-white/70 font-light leading-relaxed">
                  {story.people.narrative}
                </p>

                {/* Sourcing Stats Strip */}
                <div className="grid grid-cols-3 gap-4 pt-6 border-t border-white/15">
                  {story.people.stats.map((stat, idx) => (
                    <div key={idx}>
                      <div className="font-serif text-xl sm:text-2xl font-bold text-[#E0A838]">
                        {stat.value}
                      </div>
                      <div className="text-[10px] sm:text-[11px] uppercase tracking-wider text-white/60 mt-1 font-sans">
                        {stat.label}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Right Column: Human Photography */}
              <div className="lg:col-span-6 order-1 lg:order-2">
                <div className="relative aspect-[4/5] rounded-2xl overflow-hidden shadow-2xl bg-black/40 border border-white/10">
                  <Image
                    src={story.media.tribalPeople}
                    alt="Tribal Community Harvesters"
                    fill
                    sizes="(max-width: 1024px) 100vw, 45vw"
                    className="object-cover transition-transform duration-1000 ease-out hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-70" />
                  <div className="absolute bottom-5 left-6 right-6 text-white text-xs font-sans tracking-wider uppercase font-medium">
                    Sustainable Livelihoods & Direct Community Partnerships
                  </div>
                </div>
              </div>
            </div>

          </div>
        </section>

        {/* =========================================================================
            05 — WHY WE STAND FOR
            Clean editorial presentation with 7 core values
           ========================================================================= */}
        <section className="py-20 md:py-32 bg-[#F5EFE4] relative">
          <div className="max-w-7xl mx-auto px-6 md:px-16">
            
            <div className="max-w-2xl mb-16 space-y-3">
              <span className="text-[11px] font-sans font-bold uppercase tracking-[0.3em] text-[#C68A2C]">
                Core Values
              </span>
              <h2 className="font-serif text-3xl sm:text-4xl md:text-5xl font-black text-[#231815] leading-tight">
                Why We Stand For.
              </h2>
              <p className="font-sans text-sm sm:text-base text-[#231815]/70 font-light leading-relaxed">
                Seven uncompromised commitments embedded into every single jar and harvest.
              </p>
            </div>

            {/* Editorial List Layout */}
            <div className="divide-y divide-[#231815]/15 border-y border-[#231815]/15">
              {story.values.map((val, idx) => (
                <div
                  key={idx}
                  className="py-8 grid grid-cols-1 md:grid-cols-12 gap-4 items-baseline group hover:bg-white/40 transition-colors px-4 rounded-xl"
                >
                  <div className="md:col-span-1 font-serif text-xl font-bold text-[#C68A2C]/60">
                    0{idx + 1}
                  </div>
                  <div className="md:col-span-4 font-serif text-2xl font-bold text-[#231815] group-hover:text-[#C68A2C] transition-colors">
                    {val.name}
                  </div>
                  <div className="md:col-span-7 font-sans text-sm sm:text-base text-[#231815]/75 font-light leading-relaxed">
                    {val.description}
                  </div>
                </div>
              ))}
            </div>

          </div>
        </section>
      </main>

      {/* Global Brand Footer */}
      <Footer />
    </div>
  );
}
