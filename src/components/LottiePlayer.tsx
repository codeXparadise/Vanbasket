"use client";

import React, { useEffect, useMemo } from "react";

interface LottiePlayerProps {
  src: string;
  label: string;
  className?: string;
  speed?: number;
  loop?: boolean;
  autoplay?: boolean;
}

let playerScriptRequested = false;

export function LottiePlayer({ src, label, className = "", speed = 1, loop = true, autoplay = true }: LottiePlayerProps) {
  useEffect(() => {
    if (typeof window === "undefined" || typeof document === "undefined") return;

    const loadLottieScript = () => {
      if (playerScriptRequested) return;
      playerScriptRequested = true;
      const script = document.createElement("script");
      script.type = "module";
      script.src = "https://unpkg.com/@dotlottie/player-component@2.7.12/dist/dotlottie-player.mjs";
      script.async = true;
      document.head.appendChild(script);
    };

    const runDelayedLoad = () => {
      const runCb = window.requestIdleCallback || ((cb) => setTimeout(cb, 1000));
      runCb(() => loadLottieScript());
    };

    if (document.readyState === "complete" || document.readyState === "interactive") {
      runDelayedLoad();
    } else {
      window.addEventListener("load", runDelayedLoad);
      return () => window.removeEventListener("load", runDelayedLoad);
    }
  }, []);

  const style = useMemo(
    () => ({
      width: "100%",
      height: "100%",
    }),
    []
  );

  return (
    <div className={`relative overflow-hidden ${className}`} aria-label={label}>
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="lottie-fallback-orbit" />
      </div>
      {React.createElement("dotlottie-player", {
        src,
        autoplay,
        loop,
        speed,
        background: "transparent",
        style,
      })}
    </div>
  );
}

