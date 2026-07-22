"use client";

import React, { useRef, useState } from "react";
import Image from "next/image";
import { Play, VolumeX, Volume2 } from "lucide-react";

const InstagramIcon = ({ className = "w-3.5 h-3.5" }: { className?: string }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
  >
    <rect width="20" height="20" x="2" y="2" rx="5" ry="5" />
    <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
    <line x1="17.5" x2="17.51" y1="6.5" y2="6.5" />
  </svg>
);

const reelsData = [
  { src: "/assets/videos/reel_1.mp4", id: "reel-1", label: "Harvesting Rituals" },
  { src: "/assets/videos/reel_2.mp4", id: "reel-2", label: "Pure Filtration" },
  { src: "/assets/videos/reel3.mp4", id: "reel-3", label: "Forest Extraction" },
  { src: "/assets/videos/reel_4.mp4", id: "reel-4", label: "Apothecary Packing" },
];

const postsData = [
  { src: "/assets/SaveInta.com_671236435_18088753934113038_2584356244027066964_n.jpg", likes: "1,240", caption: "Single-origin nectar straight from biosphere reserves." },
  { src: "/assets/SaveInta.com_693245979_17863277364686116_710550687666494002_n.jpg", likes: "982", caption: "Preserving ancient tribal beekeeping legacy." },
  { src: "/assets/SaveInta.com_694298566_18088759847113038_4397863112803506586_n.jpg", likes: "1,530", caption: "Glass jars designed to protect enzymes." },
  { src: "/assets/SaveInta.com_696917302_18056116802539579_2100519194037541284_n.jpg", likes: "845", caption: "Unprocessed. Organic. Raw." },
];

export const SocialShowcase = () => {
  const [muted, setMuted] = useState(true);
  const [activeReel, setActiveReel] = useState<string | null>(null);
  const videoRefs = useRef<Record<string, HTMLVideoElement | null>>({});

  const handleMouseEnter = (id: string) => {
    setActiveReel(id);
    const video = videoRefs.current[id];
    if (video) {
      video.play().catch(() => {});
    }
  };

  const handleMouseLeave = (id: string) => {
    setActiveReel(null);
    const video = videoRefs.current[id];
    if (video) {
      video.pause();
      video.currentTime = 0;
    }
  };

  const toggleMute = (e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
    setMuted(!muted);
  };

  return (
    <section className="py-24 bg-gradient-to-b from-[#fdfaf4] to-[#f9f3e5] overflow-hidden">
      <div className="max-w-7xl mx-auto px-6 md:px-12 space-y-16">
        
        {/* Title Block */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 border-b border-brand-cream-dark/50 pb-8">
          <div className="space-y-2">
            <span className="text-[10px] font-sans font-bold uppercase tracking-[0.3em] text-brand-honey flex items-center gap-2">
              <InstagramIcon className="w-3.5 h-3.5" /> Social Proof & Lifestyle
            </span>
            <h2 className="font-serif text-3xl md:text-5xl font-black text-brand-espresso">
              Van Basket in Motion
            </h2>
            <p className="font-sans text-xs text-brand-espresso-muted max-w-md font-light leading-relaxed">
              Explore the raw purity of the wild through our Instagram stories and community allocations.
            </p>
          </div>
          
          <button
            onClick={toggleMute}
            className="press-pop inline-flex items-center gap-2 px-5 py-2.5 rounded-full border border-brand-espresso/15 bg-white/60 hover:bg-brand-espresso hover:text-brand-cream-light text-[10px] font-sans font-bold uppercase tracking-wider transition-all duration-300"
          >
            {muted ? (
              <>
                <VolumeX className="w-4 h-4" /> Muted (Hover to Play)
              </>
            ) : (
              <>
                <Volume2 className="w-4 h-4" /> Sound Active
              </>
            )}
          </button>
        </div>

        {/* Showcase Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* Left Side: 4 Reels Autoplay on Hover (7 Columns) */}
          <div className="lg:col-span-7 space-y-6">
            <span className="text-[9px] font-sans font-bold uppercase tracking-widest text-brand-terracotta block">
              Watch The Harvest (Hover to preview)
            </span>
            
            <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-4 gap-4">
              {reelsData.map((reel) => {
                const isHovered = activeReel === reel.id;
                return (
                  <div
                    key={reel.id}
                    onMouseEnter={() => handleMouseEnter(reel.id)}
                    onMouseLeave={() => handleMouseLeave(reel.id)}
                    className="relative aspect-[9/16] w-full rounded-[2rem] overflow-hidden bg-brand-espresso border border-brand-cream-dark/60 shadow-lg group cursor-pointer transition-transform duration-500 hover:scale-[1.03] hover:shadow-xl"
                  >
                    {/* Dark overlay */}
                    <div className="absolute inset-0 bg-gradient-to-t from-brand-espresso/90 via-transparent to-brand-espresso/25 z-10 transition-opacity duration-300 group-hover:opacity-40" />

                    {/* Video element */}
                    <video
                      ref={(el) => {
                        videoRefs.current[reel.id] = el;
                      }}
                      src={reel.src}
                      loop
                      muted={muted}
                      playsInline
                      className="absolute inset-0 w-full h-full object-cover z-0"
                    />

                    {/* Play Overlay Icon (Visible when NOT hovered) */}
                    {!isHovered && (
                      <div className="absolute inset-0 flex items-center justify-center z-20 pointer-events-none transition-transform duration-500 group-hover:scale-110">
                        <div className="w-12 h-12 rounded-full bg-white/20 backdrop-blur-md border border-white/40 flex items-center justify-center text-white">
                          <Play className="w-5 h-5 fill-white ml-0.5" />
                        </div>
                      </div>
                    )}

                    {/* Reel Label */}
                    <div className="absolute bottom-4 left-4 right-4 z-20 space-y-1 pointer-events-none">
                      <span className="text-[8px] font-sans font-bold uppercase tracking-widest text-brand-honey">
                        Reel Feed
                      </span>
                      <h4 className="text-[10px] font-serif font-bold text-brand-cream-light leading-tight">
                        {reel.label}
                      </h4>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Right Side: Instagram Posts Grid (5 Columns) */}
          <div className="lg:col-span-5 space-y-6">
            <span className="text-[9px] font-sans font-bold uppercase tracking-widest text-brand-forest block">
              Instagram Stories
            </span>

            <div className="grid grid-cols-2 gap-4">
              {postsData.map((post, idx) => (
                <div
                  key={idx}
                  className="relative aspect-square w-full rounded-[2rem] overflow-hidden bg-brand-cream-light border border-brand-cream-dark/60 shadow-md group cursor-pointer hover:border-brand-honey transition-all duration-300"
                >
                  <Image
                    src={post.src}
                    alt={post.caption}
                    fill
                    sizes="(min-width: 1024px) 20vw, 45vw"
                    className="object-cover transition-transform duration-700 ease-organic group-hover:scale-105"
                  />
                  
                  {/* Subtle caption hover mask */}
                  <div className="absolute inset-0 bg-brand-espresso/80 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-end p-5 z-10">
                    <p className="text-[10px] text-brand-cream-light font-sans font-light leading-relaxed">
                      {post.caption}
                    </p>
                    <span className="text-[9px] font-sans font-bold text-brand-honey uppercase tracking-wider mt-2 block">
                      ❤️ {post.likes} Likes
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

        </div>

      </div>
    </section>
  );
};
