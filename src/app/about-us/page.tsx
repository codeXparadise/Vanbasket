"use client";

import React from "react";
import Image from "next/image";
import Link from "next/link";
import {
  ArrowRight,
  ChevronDown,
  Sparkles,
  TreePine,
  HeartHandshake,
  Compass,
  Award,
  Leaf,
  ShieldCheck,
  Quote,
} from "lucide-react";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";

/**
 * =========================================================================
 * VANBASKET ABOUT US STORY CONFIGURATION
 * All photography paths, editorial text, founder biography, and timeline
 * items are defined in this single source of truth for effortless editing.
 * =========================================================================
 */
export const VANBASKET_ABOUT_STORY = {
  // Photography Assets (easily swappable)
  media: {
    heroBackground: "/assets/hero/about-us/vanbasket-about-us-hero.jpg",
    chhattisgarhLand: "/assets/client-assets/kanopy.jpg",
    tribalPeople: "/assets/client-assets/male-tribal.jpg",
    tribalFemale: "/assets/client-assets/female-tribal.jpg",
    traditionalKnowledge: "/assets/client-assets/gallery-1.jpg",
    honeyHarvesting: "/assets/client-assets/gallery-3.jpg",
    jamunHarvesting: "/assets/product/Jamun%20Pulp/bulk/jamun-pulp-bulk.jpg",
    founderPortrait: "/assets/founder-portrait-final.jpg",
    visionBackground: "/assets/client-assets/gallery-2.jpg",
  },

  // 01 — Hero
  hero: {
    tag: "VanBasket · Origin Story",
    headline: "Born From The Forests Of Chhattisgarh.",
    supportingLine:
      "Connecting the richness of nature and traditional forest wisdom with the modern world.",
  },

  // 02 — The Land
  land: {
    chapter: "01 / The Land",
    headline: "From A Land Rich In Nature.",
    lead: "VanBasket's products are sourced from the deep and dense forests and fertile regions of Chhattisgarh, India.",
    narrative:
      "Far from industrial corridors and monoculture farms lie the ancient Sal, Teak, and Mahua woodlands of Chhattisgarh. This biodiverse landscape is home to pristine river streams, unpolluted flora, and native wild bees who forage on sacred flowering canopies undisturbed for centuries.",
  },

  // 03 — The People
  people: {
    chapter: "02 / The People",
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

  // 04 — Traditional Knowledge
  knowledge: {
    chapter: "03 / The Knowledge",
    headline: "Knowledge Passed Down Through Generations.",
    lead: "An ancestral understanding of the forest that cannot be taught in classrooms.",
    narrative:
      "The relationship between the forest and tribal harvesters is rooted in restraint. Using traditional herbal smudging to gently calm Apis dorsata bees without harming the hives, and hand-picking wild Jamun at the exact hour of ripeness, ancient wisdom ensures that nature always remains whole.",
    flow: [
      { title: "The Forest", desc: "Ancient biosphere reserves rich in medicinal botanicals" },
      { title: "Traditional Knowledge", desc: "Ancestral foraging practices passed parent to child" },
      { title: "Natural Harvesting", desc: "Cruelty-free gathering that preserves living hives" },
      { title: "Pure Products", desc: "Unpasteurized, unfiltered honey & thick Jamun pulp" },
    ],
  },

  // 05 — From Forest To You (The Journey Timeline)
  journey: {
    chapter: "04 / The Journey",
    headline: "From Forest To Your Table.",
    subhead: "A transparent path connecting untouched canopies with conscious homes.",
    steps: [
      {
        number: "01",
        stage: "THE FOREST",
        location: "Deep Chhattisgarh Woodlands",
        detail: "Pristine Sal and Mahua trees flowering in natural seasonal cycles.",
      },
      {
        number: "02",
        stage: "LOCAL COMMUNITIES",
        location: "Tribal Gatherers",
        detail: "Indigenous families reading weather, flora, and bee flight paths.",
      },
      {
        number: "03",
        stage: "NATURAL HARVEST",
        location: "Canopy & River Groves",
        detail: "Wild Apis dorsata honey and plump, ripe seasonal Jamun hand-gathered.",
      },
      {
        number: "04",
        stage: "CAREFUL PROCESSING",
        location: "Hygienic Cold Processing",
        detail: "Gentle muslin gravity filtration with zero heat and zero additives.",
      },
      {
        number: "05",
        stage: "VANBASKET",
        location: "Quality & Packaging",
        detail: "Purity certified and sealed in protective amber glass jars.",
      },
      {
        number: "06",
        stage: "YOUR TABLE",
        location: "Conscious Consumers",
        detail: "Pure, living nutrition delivered directly to households across India.",
      },
    ],
  },

  // 06 — Why VanBasket Exists
  purpose: {
    chapter: "05 / Purpose",
    headline: "More Than A Product.",
    statement:
      "VanBasket exists to connect the rich natural resources of Chhattisgarh with consumers while ensuring meaningful benefits for the communities living in and around these forest regions.",
    pillar1: "Preserving Forest Livelihoods",
    pillar2: "Conserving Native Bee Species",
    pillar3: "Honoring Generational Wisdom",
  },

  // 07 — The Founder
  founder: {
    chapter: "06 / Leadership",
    name: "Mr. Bhupendra Kumar Sahu",
    title: "Founder, VanBasket",
    headline: "A Vision Forged In The Forests of Chhattisgarh.",
    quote:
      "True community development happens when we build lasting bridges between the wealth of our forests and the health of our people, ensuring those who guard nature benefit most.",
    bio1: "Mr. Bhupendra Kumar Sahu brings over 15 years of extensive experience in organic certification, CSR initiatives and community development across various regions of Chhattisgarh.",
    bio2: "His professional journey has provided him with a deep understanding of forest-based livelihoods, sustainable practices, organic products and the communities that depend on forest resources.",
    bio3: "His close engagement with local communities has shaped his vision of creating a platform that connects the rich natural resources of Chhattisgarh with consumers while ensuring meaningful benefits for the people who live in and around these forest regions.",
  },

  // 08 — What We Stand For
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

  // 09 — Vision
  vision: {
    chapter: "08 / Our Vision",
    headline: "Our Vision",
    statement:
      "We envision VanBasket becoming a trusted name for authentic, naturally sourced forest products, connecting consumers with the richness of Chhattisgarh’s forests while preserving its biodiversity and traditional harvesting heritage.",
  },

  // 10 — Mission
  mission: {
    chapter: "09 / Our Mission",
    headline: "Our Mission",
    statement:
      "Our mission is to deliver pure, authentic, and responsibly harvested forest products — Wild Forest Honey and Jamun Pulp/Slice — while creating lasting value for nature and local communities.",
  },

  // 11 — Closing
  closing: {
    headline: "From The Forests Of Chhattisgarh, To Your Table.",
    supportingText: "Natural richness. Traditional wisdom. Meaningful connections.",
    cta: "EXPLORE OUR PRODUCTS",
  },
};

export default function AboutUsPage() {
  const story = VANBASKET_ABOUT_STORY;

  return (
    <div className="min-h-screen bg-[#FAF8F5] text-[#231815] font-sans antialiased selection:bg-[#d98b00]/20">
      {/* Global Brand Navigation */}
      <Navbar />

      <main className="relative">
        {/* =========================================================================
            01 — CINEMATIC HERO
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

          {/* Hero Main Typography (Newsreader Editorial Serif) */}
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
            02 — THE LAND: "From A Land Rich In Nature"
            Asymmetric editorial split: Large landscape photography + deep prose
           ========================================================================= */}
        <section className="py-24 md:py-36 bg-[#FAF8F5] relative border-b border-[#231815]/10">
          <div className="max-w-7xl mx-auto px-6 md:px-16">
            
            {/* Chapter Header */}
            <div className="text-[11px] font-sans font-bold uppercase tracking-[0.3em] text-[#C68A2C] mb-4">
              {story.land.chapter}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-20 items-center">
              {/* Left: Large Editorial Landscape Image */}
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

              {/* Right: Editorial Prose & Typography */}
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
            03 — THE PEOPLE: "Behind Every Harvest, There Are People"
            Documentary-style human-focused photography, economic empowerment
           ========================================================================= */}
        <section className="py-24 md:py-36 bg-[#1F261F] text-[#FAF8F5] relative overflow-hidden">
          {/* Subtle nature lighting effect */}
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

              {/* Right Column: Documentary Human Photography */}
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
            04 — TRADITIONAL KNOWLEDGE: "Knowledge Passed Down Through Generations"
            Connecting Forest -> Traditional Knowledge -> Harvesting -> Pure Produce
           ========================================================================= */}
        <section className="py-24 md:py-36 bg-[#FAF8F5] relative border-b border-[#231815]/10">
          <div className="max-w-7xl mx-auto px-6 md:px-16">
            
            <div className="text-[11px] font-sans font-bold uppercase tracking-[0.3em] text-[#C68A2C] mb-4">
              {story.knowledge.chapter}
            </div>

            <div className="max-w-3xl space-y-4 mb-16">
              <h2 className="font-serif text-3xl sm:text-4xl md:text-5xl font-black text-[#231815] leading-[1.12]">
                {story.knowledge.headline}
              </h2>
              <p className="font-sans text-base sm:text-lg text-[#231815]/90 font-medium leading-relaxed">
                {story.knowledge.lead}
              </p>
              <p className="font-sans text-sm sm:text-base text-[#231815]/70 font-light leading-relaxed">
                {story.knowledge.narrative}
              </p>
            </div>

            {/* Knowledge Flow Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 pt-4">
              {story.knowledge.flow.map((item, idx) => (
                <div
                  key={idx}
                  className="bg-white border border-[#231815]/10 p-7 rounded-2xl shadow-xs flex flex-col justify-between hover:border-[#C68A2C]/60 transition-colors duration-300"
                >
                  <div>
                    <span className="font-serif text-3xl font-bold text-[#C68A2C]/40 block mb-3">
                      0{idx + 1}
                    </span>
                    <h3 className="font-serif text-xl font-bold text-[#231815] mb-2">
                      {item.title}
                    </h3>
                    <p className="font-sans text-xs text-[#231815]/70 font-light leading-relaxed">
                      {item.desc}
                    </p>
                  </div>
                  <div className="pt-6 mt-6 border-t border-[#231815]/5 text-[10px] font-sans uppercase tracking-widest text-[#C68A2C] font-semibold">
                    Generational Lore
                  </div>
                </div>
              ))}
            </div>

          </div>
        </section>

        {/* =========================================================================
            05 — FROM FOREST TO YOU: Horizontal / Storytelling Timeline
            FOREST → LOCAL COMMUNITIES → NATURAL HARVEST → CAREFUL PROCESSING → VANBASKET → YOUR TABLE
           ========================================================================= */}
        <section className="py-24 md:py-36 bg-[#F3ECE0] relative overflow-hidden border-b border-[#231815]/10">
          <div className="max-w-7xl mx-auto px-6 md:px-16">
            
            <div className="text-[11px] font-sans font-bold uppercase tracking-[0.3em] text-[#C68A2C] mb-4">
              {story.journey.chapter}
            </div>

            <div className="max-w-2xl mb-16 space-y-3">
              <h2 className="font-serif text-3xl sm:text-4xl md:text-5xl font-black text-[#231815] leading-tight">
                {story.journey.headline}
              </h2>
              <p className="font-sans text-sm sm:text-base text-[#231815]/75 font-light leading-relaxed">
                {story.journey.subhead}
              </p>
            </div>

            {/* Timeline Steps Architecture */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {story.journey.steps.map((step, idx) => (
                <div
                  key={idx}
                  className="bg-[#FAF8F5] border border-[#231815]/10 rounded-2xl p-8 shadow-xs flex flex-col justify-between hover:shadow-md transition-shadow duration-300 relative overflow-hidden"
                >
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="font-serif text-4xl font-black text-[#C68A2C]">
                        {step.number}
                      </span>
                      <span className="text-[10px] font-sans font-bold uppercase tracking-wider text-[#231815]/50 bg-[#231815]/5 px-2.5 py-1 rounded-full">
                        Step {step.number}
                      </span>
                    </div>

                    <h3 className="font-serif text-xl font-bold text-[#231815] tracking-tight">
                      {step.stage}
                    </h3>

                    <p className="text-xs font-sans font-semibold text-[#C68A2C] uppercase tracking-wide">
                      {step.location}
                    </p>

                    <p className="font-sans text-xs sm:text-sm text-[#231815]/70 font-light leading-relaxed pt-1">
                      {step.detail}
                    </p>
                  </div>

                  <div className="pt-6 mt-6 border-t border-[#231815]/10 flex items-center justify-between text-[10px] font-sans uppercase tracking-widest text-[#231815]/60 font-bold">
                    <span>Authentic Traceability</span>
                    <ArrowRight className="w-3.5 h-3.5 text-[#C68A2C]" />
                  </div>
                </div>
              ))}
            </div>

          </div>
        </section>

        {/* =========================================================================
            06 — WHY VANBASKET EXISTS: "More Than A Product"
            Oversized typography, minimal editorial layout, strong brand purpose
           ========================================================================= */}
        <section className="py-24 md:py-36 bg-[#231815] text-[#FAF8F5] relative overflow-hidden">
          <div className="max-w-5xl mx-auto px-6 md:px-16 text-center space-y-10">
            <div className="text-[11px] font-sans font-bold uppercase tracking-[0.3em] text-[#E0A838]">
              {story.purpose.chapter}
            </div>

            <h2 className="font-serif text-4xl sm:text-5xl md:text-6xl font-black tracking-tight text-white leading-tight">
              {story.purpose.headline}
            </h2>

            <p className="font-serif italic text-xl sm:text-2xl md:text-3xl font-normal text-[#E0A838] leading-relaxed max-w-4xl mx-auto">
              &ldquo;{story.purpose.statement}&rdquo;
            </p>

            <div className="pt-10 flex flex-wrap items-center justify-center gap-6 sm:gap-12 text-xs sm:text-sm font-sans uppercase tracking-widest text-white/80 font-semibold border-t border-white/10">
              <span className="flex items-center gap-2">
                <Leaf className="w-4 h-4 text-[#E0A838]" /> {story.purpose.pillar1}
              </span>
              <span className="flex items-center gap-2">
                <TreePine className="w-4 h-4 text-[#E0A838]" /> {story.purpose.pillar2}
              </span>
              <span className="flex items-center gap-2">
                <HeartHandshake className="w-4 h-4 text-[#E0A838]" /> {story.purpose.pillar3}
              </span>
            </div>
          </div>
        </section>

        {/* =========================================================================
            07 — FOUNDER STORY: Mr. Bhupendra Kumar Sahu
            Storytelling layout (NOT a profile card), large portrait, large quote & bio
           ========================================================================= */}
        <section className="py-24 md:py-36 bg-[#FAF8F5] relative border-b border-[#231815]/10">
          <div className="max-w-7xl mx-auto px-6 md:px-16">
            
            <div className="text-[11px] font-sans font-bold uppercase tracking-[0.3em] text-[#C68A2C] mb-4">
              {story.founder.chapter}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-20 items-center">
              
              {/* Founder Image (Documentary Style, Chhattisgarh Forest Setting) */}
              <div className="lg:col-span-5">
                <div className="relative aspect-[3/4] rounded-2xl overflow-hidden shadow-2xl bg-[#ebe5db]">
                  <Image
                    src={story.media.founderPortrait}
                    alt={story.founder.name}
                    fill
                    priority
                    loading="eager"
                    sizes="(max-width: 1024px) 100vw, 40vw"
                    className="object-cover object-top transition-transform duration-1000 ease-out hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent opacity-80" />
                  <div className="absolute bottom-6 left-6 right-6 text-white">
                    <p className="font-serif text-xl font-bold">{story.founder.name}</p>
                    <p className="text-xs font-sans text-[#E0A838] uppercase tracking-wider font-semibold">
                      {story.founder.title}
                    </p>
                  </div>
                </div>
              </div>

              {/* Founder Story Prose */}
              <div className="lg:col-span-7 space-y-6">
                <div>
                  <h2 className="font-serif text-3xl sm:text-4xl md:text-5xl font-black text-[#231815] leading-[1.12]">
                    {story.founder.headline}
                  </h2>
                  <p className="font-sans text-xs uppercase tracking-widest text-[#C68A2C] font-bold mt-2">
                    {story.founder.name} · {story.founder.title}
                  </p>
                </div>

                {/* Big Quote */}
                <div className="border-l-2 border-[#C68A2C] pl-6 py-2">
                  <Quote className="w-5 h-5 text-[#C68A2C]/60 rotate-180 mb-2" />
                  <p className="font-serif italic text-base sm:text-lg text-[#231815]/90 leading-relaxed font-normal">
                    &ldquo;{story.founder.quote}&rdquo;
                  </p>
                </div>

                {/* Factual Biography Paragraphs */}
                <div className="space-y-4 font-sans text-sm sm:text-base text-[#231815]/75 font-light leading-relaxed">
                  <p>{story.founder.bio1}</p>
                  <p>{story.founder.bio2}</p>
                  <p>{story.founder.bio3}</p>
                </div>

                <div className="pt-4 flex items-center gap-4 text-xs font-sans uppercase tracking-widest text-[#231815]/60 font-bold">
                  <span>15+ Years Experience</span>
                  <span>·</span>
                  <span>Organic Stewardship</span>
                  <span>·</span>
                  <span>Community CSR</span>
                </div>
              </div>

            </div>

          </div>
        </section>

        {/* =========================================================================
            08 — WHAT WE STAND FOR
            Clean editorial presentation with typography, dividers, and photography
           ========================================================================= */}
        <section className="py-24 md:py-36 bg-[#F5EFE4] relative border-b border-[#231815]/10">
          <div className="max-w-7xl mx-auto px-6 md:px-16">
            
            <div className="max-w-2xl mb-16 space-y-3">
              <span className="text-[11px] font-sans font-bold uppercase tracking-[0.3em] text-[#C68A2C]">
                07 / Core Values
              </span>
              <h2 className="font-serif text-3xl sm:text-4xl md:text-5xl font-black text-[#231815] leading-tight">
                What We Stand For.
              </h2>
              <p className="font-sans text-sm sm:text-base text-[#231815]/70 font-light leading-relaxed">
                Seven uncompromised commitments embedded into every single jar and harvest.
              </p>
            </div>

            {/* Editorial List Layout (No SaaS Cards) */}
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

        {/* =========================================================================
            09 — OUR VISION: Standalone Powerful Visual Section
            Large typography, full-width natural backdrop, generous whitespace
           ========================================================================= */}
        <section className="py-28 md:py-40 bg-[#1A1815] text-white relative overflow-hidden">
          {/* Natural Atmospheric Backdrop */}
          <div className="absolute inset-0 z-0 opacity-25">
            <Image
              src={story.media.visionBackground}
              alt="Nature Background"
              fill
              sizes="100vw"
              className="object-cover"
            />
          </div>
          <div className="absolute inset-0 bg-gradient-to-t from-[#1A1815] via-[#1A1815]/80 to-[#1A1815]" />

          <div className="max-w-4xl mx-auto px-6 md:px-16 relative z-10 text-center space-y-8">
            <div className="text-[11px] font-sans font-bold uppercase tracking-[0.3em] text-[#E0A838]">
              {story.vision.chapter}
            </div>

            <h2 className="font-serif text-4xl sm:text-5xl md:text-6xl font-black text-white">
              {story.vision.headline}
            </h2>

            <p className="font-serif text-lg sm:text-xl md:text-2xl text-[#FAF8F5]/90 font-light leading-relaxed max-w-3xl mx-auto">
              &ldquo;{story.vision.statement}&rdquo;
            </p>

            <div className="pt-6 flex justify-center">
              <div className="w-16 h-0.5 bg-[#E0A838]" />
            </div>
          </div>
        </section>

        {/* =========================================================================
            10 — OUR MISSION: Distinct Editorial Companion Section
           ========================================================================= */}
        <section className="py-28 md:py-40 bg-[#FAF8F5] relative border-b border-[#231815]/10">
          <div className="max-w-4xl mx-auto px-6 md:px-16 text-center space-y-8">
            <div className="text-[11px] font-sans font-bold uppercase tracking-[0.3em] text-[#C68A2C]">
              {story.mission.chapter}
            </div>

            <h2 className="font-serif text-4xl sm:text-5xl md:text-6xl font-black text-[#231815]">
              {story.mission.headline}
            </h2>

            <p className="font-serif text-lg sm:text-xl md:text-2xl text-[#231815]/85 font-light leading-relaxed max-w-3xl mx-auto">
              &ldquo;{story.mission.statement}&rdquo;
            </p>

            <div className="pt-6 flex justify-center">
              <div className="w-16 h-0.5 bg-[#C68A2C]" />
            </div>
          </div>
        </section>

        {/* =========================================================================
            11 — CLOSING SECTION: Emotional Brand Statement & CTA
           ========================================================================= */}
        <section className="py-28 md:py-44 bg-[#15100c] text-white relative text-center overflow-hidden">
          {/* Subtle Ambient Radial Glow */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[350px] bg-[#E0A838]/10 rounded-full blur-3xl pointer-events-none" />

          <div className="max-w-4xl mx-auto px-6 md:px-16 relative z-10 space-y-8">
            <h2 className="font-serif text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-black text-white leading-tight">
              {story.closing.headline}
            </h2>

            <p className="font-sans text-base sm:text-lg md:text-xl text-[#E0A838] font-light tracking-wide">
              {story.closing.supportingText}
            </p>

            <div className="pt-8">
              <Link
                href="/#shop"
                className="inline-flex h-14 items-center justify-center rounded-full bg-[#E0A838] hover:bg-white text-[#15100c] font-sans text-xs font-bold uppercase tracking-[0.22em] px-10 shadow-xl transition-all duration-300 hover:scale-105"
              >
                <span>{story.closing.cta}</span>
                <ArrowRight className="ml-2.5 w-4 h-4" />
              </Link>
            </div>
          </div>
        </section>
      </main>

      {/* Global Brand Footer */}
      <Footer />
    </div>
  );
}
