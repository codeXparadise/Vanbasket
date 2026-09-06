"use client";

import React, { useRef, useState, useEffect, useCallback, useMemo } from "react";
import Image from "next/image";
import {
  ChevronLeft,
  ChevronRight,
  Sparkles,
  MapPin,
  Compass,
  Play,
  Pause,
  Volume2,
  VolumeX,
  X,
  Film,
  Camera,
  Maximize2,
} from "lucide-react";

export interface MediaStoryItem {
  id: string;
  type: "image" | "video";
  src: string;
  poster?: string;
  tag: string;
  location: string;
  title: string;
  description: string;
  duration?: string;
}

// Exactly 11 Curated Stories: Index 12, 13, 14 removed per user request
const ALL_MEDIA_STORIES: MediaStoryItem[] = [
  // 1. Reel 1: Live Process Video from client-assets
  {
    id: "process-video-1",
    type: "video",
    src: "/assets/client-assets/process_video_1.mp4",
    poster: "/assets/client-assets/gallery-1.jpg",
    tag: "Reel · Live Harvest",
    location: "Bastar Biosphere, Chhattisgarh",
    title: "Sacred Canopy Ascension",
    description: "Live documentary footage of indigenous gatherers climbing ancient Sal trees to sustainably forage Apis dorsata hives.",
    duration: "0:45",
  },
  // 2. Client Asset Gallery 1
  {
    id: "gallery-1",
    type: "image",
    src: "/assets/client-assets/gallery-1.jpg",
    tag: "Gallery · Forest Scouting",
    location: "Abujhmadh Reserve",
    title: "High-Canopy Scouting",
    description: "Generational hunters reading wild bee flight paths across dense virgin forest canopies.",
  },
  // 3. Reel 2: Smudging Rituals
  {
    id: "video-reel-1",
    type: "video",
    src: "/assets/videos/reel_1.mp4",
    poster: "/assets/client-assets/gallery-2.jpg",
    tag: "Reel · Ancient Ritual",
    location: "Bastar Tribal Valley",
    title: "Sacred Smudging Ritual",
    description: "Ancestral herbal smoke ceremony performed with reverence to pacify the bees without harming a single colony.",
    duration: "0:15",
  },
  // 4. Client Asset Gallery 2
  {
    id: "gallery-2",
    type: "image",
    src: "/assets/client-assets/gallery-2.jpg",
    tag: "Gallery · Wild Hives",
    location: "Dandakaranya Forest",
    title: "Apis Dorsata Giant Comb",
    description: "Natural multi-floral honeycomb clinging to towering Sal branches, untouched by pesticide or commercial boxes.",
  },
  // 5. Reel 3: Gravity Filtration
  {
    id: "video-reel-2",
    type: "video",
    src: "/assets/videos/reel_2.mp4",
    poster: "/assets/client-assets/gallery-3.jpg",
    tag: "Reel · Pure Drip",
    location: "Forest Base Camp",
    title: "Pure Muslin Gravity Drip",
    description: "Slow, natural gravity straining preserving living bio-active enzymes, royal propolis, and unpasteurized pollen grains.",
    duration: "0:18",
  },
  // 6. Client Asset Gallery 3
  {
    id: "gallery-3",
    type: "image",
    src: "/assets/client-assets/gallery-3.jpg",
    tag: "Gallery · Cold Extraction",
    location: "Forest Sourcing Camp",
    title: "Raw Honeycomb Crushing",
    description: "Cold manual extraction preserving active medicinal properties without artificial thermal heating.",
  },
  // 7. Reel 4: Forest Extraction
  {
    id: "video-reel-3",
    type: "video",
    src: "/assets/videos/reel3.mp4",
    poster: "/assets/client-assets/gallery-4.jpg",
    tag: "Reel · Liquid Gold",
    location: "Canopy Campsite",
    title: "Forest Nectar Flow",
    description: "Thick, multi-botanical golden nectar flowing directly from fresh comb into food-grade collection vessels.",
    duration: "0:12",
  },
  // 8. Client Asset Gallery 4
  {
    id: "gallery-4",
    type: "image",
    src: "/assets/client-assets/gallery-4.jpg",
    tag: "Gallery · Filtration",
    location: "Chhattisgarh Hills",
    title: "Gentle Cotton Straining",
    description: "Traditional dual-layer cotton straining removing natural hive particles while locking in dense forest aromas.",
  },
  // 9. Reel 5: Apothecary Bottling
  {
    id: "video-reel-4",
    type: "video",
    src: "/assets/videos/reel_4.mp4",
    poster: "/assets/client-assets/gallery-5.jpg",
    tag: "Reel · Amber Bottling",
    location: "Packaging Sanctuary",
    title: "Zero-Heat Bottling",
    description: "Sealed into UV-protective amber glass jars to protect delicate polyphenols and keep the nectar active.",
    duration: "0:20",
  },
  // 10. Client Asset Gallery 5
  {
    id: "gallery-5",
    type: "image",
    src: "/assets/client-assets/gallery-5.jpg",
    tag: "Gallery · Amber Jars",
    location: "VanBasket Hub",
    title: "Amber Glass Storage",
    description: "100% plastic-free amber glass packaging guaranteeing zero chemical leaching and lifelong purity.",
  },
  // 11. Client Asset Gallery 6
  {
    id: "gallery-6",
    type: "image",
    src: "/assets/client-assets/gallery-6.jpg",
    tag: "Gallery · Finished Harvest",
    location: "Direct Allocation",
    title: "Ready For Your Table",
    description: "Pure multi-floral wild honey ready to be delivered directly to conscious households across India.",
  },
];

type FilterCategory = "all" | "reels" | "gallery";

export const HarvestingTraditionsCarousel: React.FC = () => {
  const [filter, setFilter] = useState<FilterCategory>("all");
  const [activeIndex, setActiveIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [isMuted, setIsMuted] = useState(true);

  // Mobile swipe state
  const touchStartX = useRef(0);
  const touchStartY = useRef(0);
  const [mobileExitDirection, setMobileExitDirection] = useState<"left" | "right" | null>(null);

  // Lightbox Modal state
  const [selectedStory, setSelectedStory] = useState<MediaStoryItem | null>(null);
  const [modalPlaying, setModalPlaying] = useState(true);
  const [modalMuted, setModalMuted] = useState(false);
  const modalVideoRef = useRef<HTMLVideoElement | null>(null);

  // Video refs for autoplaying active video card
  const videoRefs = useRef<Record<string, HTMLVideoElement | null>>({});

  // Filtered stories
  const filteredStories = useMemo(() => {
    if (filter === "reels") return ALL_MEDIA_STORIES.filter((item) => item.type === "video");
    if (filter === "gallery") return ALL_MEDIA_STORIES.filter((item) => item.type === "image");
    return ALL_MEDIA_STORIES;
  }, [filter]);

  const total = filteredStories.length;

  const handleNext = useCallback(() => {
    setMobileExitDirection("left");
    setTimeout(() => {
      setActiveIndex((prev) => (prev + 1) % total);
      setMobileExitDirection(null);
    }, 180);
  }, [total]);

  const handlePrev = useCallback(() => {
    setMobileExitDirection("right");
    setTimeout(() => {
      setActiveIndex((prev) => (prev - 1 + total) % total);
      setMobileExitDirection(null);
    }, 180);
  }, [total]);

  // Reset active index when filter changes
  useEffect(() => {
    setActiveIndex(0);
  }, [filter]);

  // Auto-play active center video card muted
  useEffect(() => {
    const currentStory = filteredStories[activeIndex];
    Object.keys(videoRefs.current).forEach((id) => {
      const vid = videoRefs.current[id];
      if (vid) {
        if (currentStory && currentStory.type === "video" && currentStory.id === id) {
          vid.play().catch(() => {});
        } else {
          vid.pause();
        }
      }
    });
  }, [activeIndex, filteredStories]);

  // Auto-slide timer (paused on hover or when modal is open)
  useEffect(() => {
    if (isPaused || selectedStory) return;
    const interval = setInterval(() => {
      handleNext();
    }, 5000);
    return () => clearInterval(interval);
  }, [isPaused, selectedStory, handleNext]);

  // Mobile Touch Swipe Handlers
  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX;
    touchStartY.current = e.touches[0].clientY;
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    const deltaX = e.changedTouches[0].clientX - touchStartX.current;
    const deltaY = e.changedTouches[0].clientY - touchStartY.current;

    // Horizontal swipe threshold
    if (Math.abs(deltaX) > 45 && Math.abs(deltaX) > Math.abs(deltaY)) {
      if (deltaX < 0) {
        handleNext();
      } else {
        handlePrev();
      }
    }
  };

  // Lightbox Modal Navigation
  const handleModalNext = useCallback(() => {
    if (!selectedStory) return;
    const currentIdx = filteredStories.findIndex((s) => s.id === selectedStory.id);
    const nextIdx = (currentIdx + 1) % filteredStories.length;
    setSelectedStory(filteredStories[nextIdx]);
    setModalPlaying(true);
  }, [selectedStory, filteredStories]);

  const handleModalPrev = useCallback(() => {
    if (!selectedStory) return;
    const currentIdx = filteredStories.findIndex((s) => s.id === selectedStory.id);
    const prevIdx = (currentIdx - 1 + filteredStories.length) % filteredStories.length;
    setSelectedStory(filteredStories[prevIdx]);
    setModalPlaying(true);
  }, [selectedStory, filteredStories]);

  // Keyboard navigation for modal
  useEffect(() => {
    if (!selectedStory) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") setSelectedStory(null);
      if (e.key === "ArrowRight") handleModalNext();
      if (e.key === "ArrowLeft") handleModalPrev();
      if (e.key === " ") {
        e.preventDefault();
        setModalPlaying((prev) => !prev);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [selectedStory, handleModalNext, handleModalPrev]);

  // Sync modal video playback
  useEffect(() => {
    if (modalVideoRef.current && selectedStory?.type === "video") {
      if (modalPlaying) {
        modalVideoRef.current.play().catch(() => {});
      } else {
        modalVideoRef.current.pause();
      }
    }
  }, [modalPlaying, selectedStory]);

  return (
    <section className="py-20 md:py-28 bg-[#fbf8f1] border-y border-brand-cream-dark/30 relative overflow-hidden font-sans select-none">
      {/* Background Subtle Ambience */}
      <div className="absolute inset-0 bg-[radial-gradient(#d97706_1px,transparent_1px)] [background-size:24px_24px] opacity-10 pointer-events-none" />

      <div className="max-w-7xl mx-auto px-6 md:px-12 relative z-10">
        
        {/* CENTERED Section Header */}
        <div className="flex flex-col items-center text-center max-w-2xl mx-auto space-y-4 mb-10">
          <span className="inline-flex items-center gap-2 rounded-full bg-brand-honey/15 border border-brand-honey/30 px-4 py-1.5 text-[10px] font-bold uppercase tracking-[0.25em] text-brand-honey shadow-sm">
            <Compass className="w-3.5 h-3.5" /> Sacred Forest Chronicles
          </span>

          <h2 className="font-serif text-3xl sm:text-4xl md:text-5xl font-black text-brand-espresso leading-tight">
            Harvesting Gallery & Live Reels
          </h2>

          <p className="text-xs sm:text-sm text-brand-espresso/75 leading-relaxed font-normal max-w-xl">
            Step into the sacred tribal forests of Chhattisgarh. Explore real 9:16 vertical video reels and authentic documentary gallery photos capturing generational Apis dorsata honey foraging.
          </p>

          {/* Filter Tabs: Centered */}
          <div className="flex flex-wrap items-center justify-center gap-2 pt-2">
            <button
              type="button"
              onClick={() => setFilter("all")}
              className={`px-4 py-2 rounded-full text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                filter === "all"
                  ? "bg-brand-espresso text-brand-cream-light shadow-md scale-105"
                  : "bg-white text-brand-espresso/70 border border-brand-cream-dark/50 hover:bg-brand-cream-warm hover:text-brand-espresso"
              }`}
            >
              <Sparkles className="w-3.5 h-3.5" /> All Stories ({ALL_MEDIA_STORIES.length})
            </button>
            <button
              type="button"
              onClick={() => setFilter("reels")}
              className={`px-4 py-2 rounded-full text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                filter === "reels"
                  ? "bg-brand-honey text-brand-espresso font-black shadow-md scale-105"
                  : "bg-white text-brand-espresso/70 border border-brand-cream-dark/50 hover:bg-brand-cream-warm hover:text-brand-espresso"
              }`}
            >
              <Film className="w-3.5 h-3.5" /> 🎬 Video Reels (5)
            </button>
            <button
              type="button"
              onClick={() => setFilter("gallery")}
              className={`px-4 py-2 rounded-full text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                filter === "gallery"
                  ? "bg-brand-forest-light text-white font-bold shadow-md scale-105"
                  : "bg-white text-brand-espresso/70 border border-brand-cream-dark/50 hover:bg-brand-cream-warm hover:text-brand-espresso"
              }`}
            >
              <Camera className="w-3.5 h-3.5" /> 📷 Photo Gallery (6)
            </button>

            {/* Sound Toggle Button */}
            <button
              type="button"
              onClick={() => setIsMuted(!isMuted)}
              title={isMuted ? "Unmute Preview Audio" : "Mute Preview Audio"}
              className="px-3.5 py-2 rounded-full bg-white border border-brand-cream-dark/60 text-brand-espresso shadow-sm hover:shadow hover:bg-brand-cream-warm text-[11px] font-bold flex items-center gap-1.5 transition-all cursor-pointer ml-1"
            >
              {isMuted ? <VolumeX className="w-3.5 h-3.5 text-brand-honey" /> : <Volume2 className="w-3.5 h-3.5 text-emerald-600" />}
              <span>{isMuted ? "Sound Off" : "Sound On"}</span>
            </button>
          </div>
        </div>

        {/* ============================================================ */}
        {/* DESKTOP VIEW: 3D Animated Card Deck (Only 3 Cards Visible)    */}
        {/* Center Card on top, Left & Right behind, rest hidden          */}
        {/* ============================================================ */}
        <div
          className="hidden md:flex relative items-center justify-center h-[560px] lg:h-[600px] w-full my-6 overflow-visible perspective-[1200px]"
          onMouseEnter={() => setIsPaused(true)}
          onMouseLeave={() => setIsPaused(false)}
        >
          {filteredStories.map((item, idx) => {
            // Compute circular distance from activeIndex
            let offset = (idx - activeIndex) % total;
            if (offset > total / 2) offset -= total;
            if (offset < -total / 2) offset += total;

            const isCenter = offset === 0;
            const isLeft = offset === -1;
            const isRight = offset === 1;
            const isVisible = isCenter || isLeft || isRight;

            // Positioning styles for 3-card layout
            let transformClass = "translate-x-0 scale-50 opacity-0 pointer-events-none z-0";
            let cursorStyle = "cursor-default";

            if (isCenter) {
              transformClass = "translate-x-0 scale-100 opacity-100 z-30 shadow-2xl shadow-brand-espresso/35 cursor-pointer";
            } else if (isLeft) {
              transformClass = "-translate-x-[260px] lg:-translate-x-[320px] scale-[0.84] opacity-65 z-20 shadow-lg cursor-pointer hover:opacity-90 hover:scale-[0.87]";
            } else if (isRight) {
              transformClass = "translate-x-[260px] lg:translate-x-[320px] scale-[0.84] opacity-65 z-20 shadow-lg cursor-pointer hover:opacity-90 hover:scale-[0.87]";
            }

            return (
              <div
                key={item.id}
                onClick={() => {
                  if (isCenter) {
                    setSelectedStory(item);
                  } else if (isLeft) {
                    handlePrev();
                  } else if (isRight) {
                    handleNext();
                  }
                }}
                className={`absolute w-[280px] lg:w-[310px] aspect-[9/16] rounded-3xl overflow-hidden border border-brand-cream-dark/60 bg-black transition-all duration-700 ease-[cubic-bezier(0.25,1,0.5,1)] ${transformClass}`}
                style={{
                  willChange: "transform, opacity",
                  visibility: isVisible ? "visible" : "hidden",
                }}
              >
                {/* Media Layer */}
                {item.type === "video" ? (
                  <div className="relative w-full h-full overflow-hidden">
                    <video
                      ref={(el) => {
                        videoRefs.current[item.id] = el;
                      }}
                      src={item.src}
                      loop
                      muted={isMuted}
                      playsInline
                      poster={item.poster}
                      preload="metadata"
                      className="w-full h-full object-cover"
                    />
                    {/* Play Badge */}
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-12 h-12 rounded-full bg-black/50 backdrop-blur-md border border-white/30 text-white flex items-center justify-center shadow-xl group-hover:scale-110 transition-transform">
                      <Play className="w-5 h-5 ml-0.5 fill-current text-brand-honey" />
                    </div>
                    {item.duration && (
                      <div className="absolute top-4 right-4 z-10 px-2.5 py-0.5 rounded-full bg-black/60 backdrop-blur-md border border-white/20 text-[10px] font-mono font-bold text-white">
                        {item.duration}
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="relative w-full h-full overflow-hidden">
                    <Image
                      src={item.src}
                      alt={item.title}
                      fill
                      sizes="320px"
                      className="object-cover object-center"
                    />
                    <div className="absolute top-4 right-4 z-10 w-8 h-8 rounded-full bg-black/50 backdrop-blur-md border border-white/30 text-white flex items-center justify-center">
                      <Maximize2 className="w-3.5 h-3.5 text-white/90" />
                    </div>
                  </div>
                )}

                {/* Vignette Overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-brand-espresso via-brand-espresso/50 to-black/25 opacity-90 pointer-events-none" />

                {/* Top Tag */}
                <div className="absolute top-4 left-4 z-10 pointer-events-none">
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-black/55 backdrop-blur-md border border-white/20 text-[10px] font-bold uppercase tracking-wider text-brand-honey shadow-sm">
                    {item.type === "video" ? <Film className="w-3 h-3" /> : <Camera className="w-3 h-3" />}
                    {item.tag}
                  </span>
                </div>

                {/* Bottom Story Info */}
                <div className="absolute bottom-0 left-0 right-0 p-5 z-10 text-brand-cream-light space-y-1.5 pointer-events-none">
                  <div className="flex items-center gap-1.5 text-[10px] text-brand-honey font-semibold tracking-wide uppercase">
                    <MapPin className="w-3 h-3 text-brand-honey shrink-0" />
                    <span className="truncate">{item.location}</span>
                  </div>

                  <h3 className="font-serif text-lg lg:text-xl font-bold leading-tight text-white">
                    {item.title}
                  </h3>

                  <p className="font-sans text-xs text-white/80 leading-relaxed font-light line-clamp-2">
                    {item.description}
                  </p>

                  {isCenter && (
                    <div className="pt-1 flex items-center gap-1 text-[10px] font-bold text-brand-honey tracking-wider uppercase">
                      <span>{item.type === "video" ? "Click to watch reel" : "Click to view full photo"}</span>
                      <ChevronRight className="w-3 h-3" />
                    </div>
                  )}
                </div>
              </div>
            );
          })}

          {/* Left / Right Arrow Controls (Overlaid on Desktop) */}
          <button
            type="button"
            onClick={handlePrev}
            aria-label="Previous story"
            className="absolute left-4 lg:left-12 top-1/2 -translate-y-1/2 z-40 w-12 h-12 rounded-full bg-white/90 hover:bg-brand-honey hover:text-brand-espresso text-brand-espresso shadow-xl border border-brand-cream-dark/60 flex items-center justify-center transition-all duration-300 active:scale-95 cursor-pointer"
          >
            <ChevronLeft className="w-6 h-6" />
          </button>

          <button
            type="button"
            onClick={handleNext}
            aria-label="Next story"
            className="absolute right-4 lg:right-12 top-1/2 -translate-y-1/2 z-40 w-12 h-12 rounded-full bg-white/90 hover:bg-brand-honey hover:text-brand-espresso text-brand-espresso shadow-xl border border-brand-cream-dark/60 flex items-center justify-center transition-all duration-300 active:scale-95 cursor-pointer"
          >
            <ChevronRight className="w-6 h-6" />
          </button>
        </div>

        {/* ============================================================ */}
        {/* MOBILE / ANDROID VIEW: Layered Cards Stack (Tinder/Deck Style)*/}
        {/* Cards are layered on top of each other, sliding back/away     */}
        {/* ============================================================ */}
        <div
          className="md:hidden relative w-full h-[520px] flex items-center justify-center my-4"
          onTouchStart={handleTouchStart}
          onTouchEnd={handleTouchEnd}
        >
          {filteredStories.map((item, idx) => {
            // Stack offset relative to activeIndex
            const stackOffset = (idx - activeIndex + total) % total;

            // Only render top 3 cards in stack for maximum performance
            if (stackOffset > 2) return null;

            const isTop = stackOffset === 0;
            const isSecond = stackOffset === 1;
            const isThird = stackOffset === 2;

            let stackStyles = "";
            if (isTop) {
              if (mobileExitDirection === "left") {
                stackStyles = "-translate-x-full rotate-[-12deg] opacity-0 scale-95 z-30";
              } else if (mobileExitDirection === "right") {
                stackStyles = "translate-x-full rotate-[12deg] opacity-0 scale-95 z-30";
              } else {
                stackStyles = "translate-x-0 translate-y-0 scale-100 opacity-100 z-30 shadow-2xl shadow-brand-espresso/40";
              }
            } else if (isSecond) {
              stackStyles = "translate-y-3 scale-[0.94] opacity-80 z-20 shadow-lg";
            } else if (isThird) {
              stackStyles = "translate-y-6 scale-[0.88] opacity-50 z-10 shadow-md";
            }

            return (
              <div
                key={item.id}
                onClick={() => {
                  if (isTop) {
                    setSelectedStory(item);
                  } else {
                    handleNext();
                  }
                }}
                className={`absolute w-[270px] aspect-[9/16] rounded-3xl overflow-hidden border border-brand-cream-dark/60 bg-black transition-all duration-500 ease-[cubic-bezier(0.25,1,0.5,1)] ${stackStyles}`}
              >
                {/* Media Layer */}
                {item.type === "video" ? (
                  <div className="relative w-full h-full overflow-hidden">
                    <video
                      src={item.src}
                      loop
                      autoPlay={isTop}
                      muted={isMuted}
                      playsInline
                      poster={item.poster}
                      className="w-full h-full object-cover pointer-events-none"
                    />
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-11 h-11 rounded-full bg-black/50 backdrop-blur-md border border-white/30 text-white flex items-center justify-center pointer-events-none shadow-xl">
                      <Play className="w-5 h-5 ml-0.5 fill-current text-brand-honey" />
                    </div>
                    {item.duration && (
                      <div className="absolute top-4 right-4 z-10 px-2 py-0.5 rounded-full bg-black/60 backdrop-blur-md border border-white/20 text-[10px] font-mono font-bold text-white">
                        {item.duration}
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="relative w-full h-full overflow-hidden">
                    <Image
                      src={item.src}
                      alt={item.title}
                      fill
                      sizes="270px"
                      className="object-cover object-center pointer-events-none"
                    />
                  </div>
                )}

                {/* Vignette Overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-brand-espresso via-brand-espresso/55 to-black/25 opacity-90 pointer-events-none" />

                {/* Top Tag & Card Counter */}
                <div className="absolute top-4 left-4 right-4 flex items-center justify-between z-10 pointer-events-none">
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-black/55 backdrop-blur-md border border-white/20 text-[10px] font-bold uppercase tracking-wider text-brand-honey">
                    {item.type === "video" ? <Film className="w-3 h-3" /> : <Camera className="w-3 h-3" />}
                    {item.tag}
                  </span>
                  <span className="text-[10px] font-bold text-white/80 bg-black/40 backdrop-blur-sm px-2 py-0.5 rounded-full border border-white/10">
                    {idx + 1}/{total}
                  </span>
                </div>

                {/* Bottom Story Info */}
                <div className="absolute bottom-0 left-0 right-0 p-5 z-10 text-brand-cream-light space-y-1.5 pointer-events-none">
                  <div className="flex items-center gap-1 text-[10px] text-brand-honey font-semibold tracking-wide uppercase">
                    <MapPin className="w-3 h-3 text-brand-honey shrink-0" />
                    <span className="truncate">{item.location}</span>
                  </div>

                  <h3 className="font-serif text-lg font-bold leading-tight text-white">
                    {item.title}
                  </h3>

                  <p className="font-sans text-xs text-white/85 leading-relaxed font-light line-clamp-2">
                    {item.description}
                  </p>

                  {isTop && (
                    <div className="pt-1 flex items-center gap-1 text-[10px] font-bold text-brand-honey tracking-wider uppercase">
                      <span>Tap to open full view</span>
                      <ChevronRight className="w-3 h-3" />
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* Bottom Centered Controls & Slide Indicators */}
        <div className="mt-8 flex flex-col items-center gap-4 text-center">
          {/* Navigation Arrows for Mobile */}
          <div className="flex md:hidden items-center gap-4">
            <button
              type="button"
              onClick={handlePrev}
              aria-label="Previous story"
              className="w-11 h-11 rounded-full bg-white border border-brand-cream-dark/60 text-brand-espresso shadow-sm flex items-center justify-center active:scale-95 cursor-pointer"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <span className="text-xs font-bold text-brand-espresso/70 px-2">
              {activeIndex + 1} of {total}
            </span>
            <button
              type="button"
              onClick={handleNext}
              aria-label="Next story"
              className="w-11 h-11 rounded-full bg-brand-honey text-brand-espresso shadow-md flex items-center justify-center active:scale-95 cursor-pointer font-bold"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>

          {/* Dots Indicator */}
          <div className="flex items-center justify-center gap-1.5 overflow-x-auto max-w-full px-4 hide-scrollbar">
            {filteredStories.map((_, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => setActiveIndex(idx)}
                aria-label={`Slide to media ${idx + 1}`}
                className={`transition-all duration-300 rounded-full shrink-0 cursor-pointer ${
                  idx === activeIndex
                    ? "w-8 h-2 bg-brand-honey shadow-sm"
                    : "w-2 h-2 bg-brand-espresso/20 hover:bg-brand-espresso/40"
                }`}
              />
            ))}
          </div>

          <span className="text-[11px] font-sans font-medium uppercase tracking-wider text-brand-espresso/60 max-w-md">
            {total} Stories in Archive · Click or tap center card to experience in full screen
          </span>
        </div>

      </div>

      {/* Fullscreen Lightbox / Reels Modal Viewer */}
      {selectedStory && (
        <div
          className="fixed inset-0 z-50 bg-black/95 backdrop-blur-xl flex items-center justify-center p-4 sm:p-6 animate-fadeIn"
          onClick={() => setSelectedStory(null)}
        >
          {/* Modal Close Button */}
          <button
            type="button"
            onClick={() => setSelectedStory(null)}
            className="absolute top-5 right-5 z-50 w-11 h-11 rounded-full bg-white/10 hover:bg-white/25 text-white border border-white/20 flex items-center justify-center transition-all cursor-pointer active:scale-95"
            aria-label="Close modal"
          >
            <X className="w-6 h-6" />
          </button>

          {/* Modal Prev / Next Controls (Desktop) */}
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              handleModalPrev();
            }}
            className="hidden md:flex absolute left-6 top-1/2 -translate-y-1/2 z-50 w-12 h-12 rounded-full bg-white/10 hover:bg-brand-honey hover:text-brand-espresso text-white border border-white/20 items-center justify-center transition-all cursor-pointer active:scale-95"
            aria-label="Previous story"
          >
            <ChevronLeft className="w-6 h-6" />
          </button>
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              handleModalNext();
            }}
            className="hidden md:flex absolute right-6 top-1/2 -translate-y-1/2 z-50 w-12 h-12 rounded-full bg-white/10 hover:bg-brand-honey hover:text-brand-espresso text-white border border-white/20 items-center justify-center transition-all cursor-pointer active:scale-95"
            aria-label="Next story"
          >
            <ChevronRight className="w-6 h-6" />
          </button>

          {/* 9:16 Vertical Reel / Photo Frame */}
          <div
            className="relative w-full max-w-[390px] h-[85vh] max-h-[760px] aspect-[9/16] rounded-3xl overflow-hidden bg-black shadow-2xl border border-white/15 flex flex-col justify-end"
            onClick={(e) => e.stopPropagation()}
          >
            {selectedStory.type === "video" ? (
              <div className="absolute inset-0 w-full h-full bg-black">
                <video
                  ref={modalVideoRef}
                  src={selectedStory.src}
                  loop
                  autoPlay
                  playsInline
                  muted={modalMuted}
                  poster={selectedStory.poster}
                  className="w-full h-full object-cover"
                />
                
                {/* Tap anywhere to play/pause */}
                <div
                  className="absolute inset-0 z-10 cursor-pointer flex items-center justify-center"
                  onClick={() => setModalPlaying((prev) => !prev)}
                >
                  {!modalPlaying && (
                    <div className="w-16 h-16 rounded-full bg-black/60 backdrop-blur-md border border-white/30 text-white flex items-center justify-center shadow-2xl animate-scaleUp">
                      <Play className="w-8 h-8 ml-1 fill-white" />
                    </div>
                  )}
                </div>

                {/* Video Audio & Playback Controls Overlay */}
                <div className="absolute top-4 right-4 z-20 flex items-center gap-2">
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      setModalMuted(!modalMuted);
                    }}
                    className="w-10 h-10 rounded-full bg-black/60 backdrop-blur-md border border-white/20 text-white flex items-center justify-center hover:bg-brand-honey hover:text-brand-espresso transition-all cursor-pointer"
                  >
                    {modalMuted ? <VolumeX className="w-5 h-5" /> : <Volume2 className="w-5 h-5" />}
                  </button>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      setModalPlaying(!modalPlaying);
                    }}
                    className="w-10 h-10 rounded-full bg-black/60 backdrop-blur-md border border-white/20 text-white flex items-center justify-center hover:bg-brand-honey hover:text-brand-espresso transition-all cursor-pointer"
                  >
                    {modalPlaying ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5 ml-0.5 fill-current" />}
                  </button>
                </div>
              </div>
            ) : (
              <div className="absolute inset-0 w-full h-full">
                <Image
                  src={selectedStory.src}
                  alt={selectedStory.title}
                  fill
                  priority
                  className="object-cover"
                  sizes="390px"
                />
              </div>
            )}

            {/* Top Tag & Item Counter */}
            <div className="absolute top-4 left-4 z-20 flex items-center gap-2">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-black/60 backdrop-blur-md border border-white/20 text-[10px] font-bold uppercase tracking-wider text-brand-honey">
                {selectedStory.type === "video" ? <Film className="w-3 h-3" /> : <Camera className="w-3 h-3" />}
                {selectedStory.tag}
              </span>
            </div>

            {/* Bottom Story Gradient & Meta */}
            <div className="relative z-20 p-6 bg-gradient-to-t from-black via-black/80 to-transparent space-y-2 text-white pointer-events-none">
              <div className="flex items-center gap-1.5 text-[11px] text-brand-honey font-semibold uppercase tracking-wider">
                <MapPin className="w-3.5 h-3.5 text-brand-honey shrink-0" />
                <span>{selectedStory.location}</span>
              </div>

              <h3 className="font-serif text-2xl font-bold leading-tight">
                {selectedStory.title}
              </h3>

              <p className="font-sans text-xs text-white/85 leading-relaxed font-light">
                {selectedStory.description}
              </p>

              {/* Mobile Prev / Next Buttons */}
              <div className="flex md:hidden items-center justify-between pt-3 pointer-events-auto">
                <button
                  type="button"
                  onClick={handleModalPrev}
                  className="px-4 py-1.5 rounded-full bg-white/20 hover:bg-white/30 text-white text-xs font-bold flex items-center gap-1 cursor-pointer"
                >
                  <ChevronLeft className="w-4 h-4" /> Prev
                </button>
                <button
                  type="button"
                  onClick={handleModalNext}
                  className="px-4 py-1.5 rounded-full bg-brand-honey hover:bg-brand-honey/90 text-brand-espresso text-xs font-bold flex items-center gap-1 cursor-pointer"
                >
                  Next <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </section>
  );
};
