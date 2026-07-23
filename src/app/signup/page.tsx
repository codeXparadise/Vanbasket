"use client";

// [FIXED] - Add VanBasket Brand Logo & Name Everywhere
import { useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import BrandLogo from "@/components/BrandLogo";

export default function SignupPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectUrl = searchParams?.get("redirect") || "/";

  useEffect(() => {
    // Redirect immediately to the unified login/register page
    router.replace(`/login?redirect=${encodeURIComponent(redirectUrl)}`);
  }, [router, redirectUrl]);

  return (
    <div className="min-h-screen bg-brand-cream-light text-brand-espresso flex flex-col items-center justify-center font-sans space-y-4">
      <BrandLogo width={140} height={45} showText={true} />
      <p className="text-xs uppercase tracking-widest text-brand-espresso/60 font-semibold animate-pulse">
        Redirecting to registration...
      </p>
    </div>
  );
}
