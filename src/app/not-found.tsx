// [FIXED] - Custom 404 Page with VanBasket Branding
import React from "react";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { LottiePlayer } from "@/components/LottiePlayer";
import BrandLogo from "@/components/BrandLogo";

export default function NotFound() {
  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-brand-cream-light p-6 text-center text-brand-espresso">
      {/* Background blobs */}
      <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] rounded-full bg-brand-honey/10 blur-[130px] pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] rounded-full bg-brand-forest/5 blur-[130px] pointer-events-none" />
      <div className="absolute inset-0 honeycomb-bg opacity-10 pointer-events-none" />

      <div className="relative z-10 max-w-md w-full glass-card rounded-[2.5rem] p-8 sm:p-10 shadow-2xl flex flex-col items-center">
        <BrandLogo width={140} height={45} showText={true} className="mb-4" />
        <div className="h-48 w-48">
          <LottiePlayer src="/lottie/Page Not Found 404.lottie" label="404 page animation" className="h-full w-full" />
        </div>
        <h1 className="mt-6 font-serif text-6xl font-black text-gradient-amber">404</h1>
        <h2 className="mt-2 font-serif text-2xl font-bold">Honey Trail Lost</h2>
        <p className="mt-3 text-xs leading-relaxed text-brand-espresso-muted font-light max-w-xs">
          The harvest batch or link you are seeking is either sold out or has been relocated to another honeycomb.
        </p>
        <Link
          href="/"
          className="press-pop mt-8 inline-flex h-12 items-center justify-center rounded-full bg-brand-espresso px-8 text-[11px] font-bold uppercase tracking-[0.2em] text-brand-cream-light shadow-md transition-all hover:bg-brand-honey hover:text-brand-espresso"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Go to Hive
        </Link>
      </div>
    </div>
  );
}

