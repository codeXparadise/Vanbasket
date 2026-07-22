"use client";

import { useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";

export default function SignupPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectUrl = searchParams?.get("redirect") || "/";

  useEffect(() => {
    // Redirect immediately to the unified login/register page
    router.replace(`/login?redirect=${encodeURIComponent(redirectUrl)}`);
  }, [router, redirectUrl]);

  return (
    <div className="min-h-screen bg-brand-cream-light text-brand-espresso flex flex-col items-center justify-center font-sans">
      <p className="text-xs uppercase tracking-widest text-brand-espresso/60 font-semibold animate-pulse">
        Redirecting to registration...
      </p>
    </div>
  );
}
