"use client";

// [FIXED] - Custom 500 / Error Boundary Page with VanBasket Branding
import React, { useEffect } from "react";
import Link from "next/link";
import { RefreshCw, Home } from "lucide-react";
import BrandLogo from "@/components/BrandLogo";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    if (process.env.NODE_ENV !== "production") {
      console.error("Unhandled App Error:", error);
    }
  }, [error]);

  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-brand-cream-light p-6 text-center text-brand-espresso font-sans">
      <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] rounded-full bg-brand-honey/10 blur-[130px] pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] rounded-full bg-brand-terracotta/5 blur-[130px] pointer-events-none" />

      <div className="relative z-10 max-w-md w-full bg-white/70 backdrop-blur-xl border border-brand-cream-dark/60 rounded-[2.5rem] p-8 sm:p-10 shadow-2xl flex flex-col items-center">
        <BrandLogo width={140} height={45} showText={true} className="mb-6" />

        <div className="w-16 h-16 rounded-full bg-brand-terracotta/10 text-brand-terracotta flex items-center justify-center mb-4">
          <RefreshCw className="w-8 h-8 animate-spin-slow" />
        </div>

        <h1 className="font-serif text-3xl font-bold text-brand-espresso">Something went wrong</h1>
        <p className="mt-3 text-xs leading-relaxed text-brand-espresso-muted max-w-xs">
          An unexpected issue occurred while processing your request. Please try refreshing the page or return home.
        </p>

        <div className="mt-8 flex flex-col sm:flex-row gap-3 w-full">
          <button
            onClick={() => reset()}
            className="flex-1 h-12 inline-flex items-center justify-center rounded-full bg-brand-honey text-white text-[11px] font-bold uppercase tracking-wider shadow-md hover:bg-brand-honey-dark transition cursor-pointer"
          >
            <RefreshCw className="mr-2 h-4 w-4" /> Try Again
          </button>
          <Link
            href="/"
            className="flex-1 h-12 inline-flex items-center justify-center rounded-full border border-brand-espresso text-brand-espresso text-[11px] font-bold uppercase tracking-wider hover:bg-brand-espresso hover:text-brand-cream-light transition cursor-pointer"
          >
            <Home className="mr-2 h-4 w-4" /> Go Home
          </Link>
        </div>
      </div>
    </div>
  );
}
