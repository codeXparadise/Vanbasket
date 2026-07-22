"use client";

import React, { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { createClient } from "@/utils/supabase/client";
import { User, Phone, ArrowRight } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

function CompleteProfileContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [userId, setUserId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [supabase] = useState(() => createClient());

  const redirectUrl = searchParams?.get("redirect") || "/";

  useEffect(() => {
    const fetchUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        // User not logged in, redirect to login page
        router.push(`/login?redirect=${encodeURIComponent(redirectUrl)}`);
        return;
      }
      setUserId(user.id);
      
      // Pre-populate if profile already exists
      const { data: profile } = await supabase
        .from("profiles")
        .select("full_name, phone")
        .eq("id", user.id)
        .single();

      if (profile) {
        setFullName(profile.full_name || "");
        setPhone(profile.phone || "");
      }
    };
    fetchUser();
  }, [router, redirectUrl, supabase]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!userId) return;

    setIsLoading(true);
    setError(null);

    try {
      const { error: updateError } = await supabase
        .from("profiles")
        .update({
          full_name: fullName.trim(),
          phone: phone.trim(),
        })
        .eq("id", userId);

      if (updateError) {
        setError(updateError.message);
        setIsLoading(false);
        return;
      }

      router.push(redirectUrl);
    } catch {
      setError("An unexpected error occurred during profile update.");
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-brand-cream-light text-brand-espresso flex items-center justify-center py-16 px-6 relative overflow-hidden">
      {/* Background accents */}
      <div className="absolute top-0 left-0 w-84 h-84 bg-brand-cream-warm/40 rounded-br-[200px] pointer-events-none -z-10" />
      <div className="absolute bottom-0 right-0 w-96 h-96 bg-brand-honey/5 rounded-tl-[300px] pointer-events-none -z-10" />

      <div className="w-full max-w-lg bg-brand-cream-warm/45 border border-brand-cream-dark/60 rounded-[32px] p-8 md:p-10 shadow-sm relative z-10">
        
        <div className="flex flex-col items-center mb-8">
          <Link href="/" className="h-10 w-32 relative text-brand-espresso mb-4">
            <Image src="/assets/logo.svg" alt="VAN" fill sizes="128px" className="object-contain" />
          </Link>
          <h1 className="font-serif text-2xl font-bold text-center">Complete Profile</h1>
          <p className="font-sans text-xs text-brand-espresso-muted text-center mt-1">
            We need a few details to manage your allocations and confirm deliveries.
          </p>
        </div>

        {error && (
          <div className="p-4 bg-brand-terracotta/10 border border-brand-terracotta/30 text-brand-terracotta text-xs rounded-xl mb-6">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-1.5">
              <label htmlFor="fullName" className="text-xs uppercase tracking-widest text-brand-espresso font-semibold">
                Full Name
              </label>
              <div className="relative">
                <User className="absolute left-4 top-3.5 w-4 h-4 text-brand-espresso/35" />
                <input
                  type="text"
                  id="fullName"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="e.g. John Doe"
                  className="w-full h-12 pl-11 pr-4 rounded-xl bg-brand-cream-light border border-brand-cream-dark/80 focus:border-brand-honey focus:outline-none font-sans text-sm"
                  required
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label htmlFor="phone" className="text-xs uppercase tracking-widest text-brand-espresso font-semibold">
                Phone Number
              </label>
              <div className="relative">
                <Phone className="absolute left-4 top-3.5 w-4 h-4 text-brand-espresso/35" />
                <input
                  type="tel"
                  id="phone"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="e.g. +91 99999 88888"
                  className="w-full h-12 pl-11 pr-4 rounded-xl bg-brand-cream-light border border-brand-cream-dark/80 focus:border-brand-honey focus:outline-none font-sans text-sm"
                  required
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading || !userId}
              className="w-full h-12 bg-brand-espresso text-brand-cream-light font-sans font-bold uppercase tracking-[0.2em] text-xs flex items-center justify-center gap-2 rounded-full hover:bg-brand-espresso/90 transition-colors disabled:opacity-50 mt-2"
            >
              {isLoading ? "Saving Details..." : (
                <>
                  <span>Save and Continue</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
        </form>

      </div>
    </div>
  );
}

export default function CompleteProfilePage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-brand-cream-light text-brand-espresso flex flex-col items-center justify-center">
        <p className="font-sans text-xs tracking-widest uppercase text-brand-espresso/60 animate-pulse">Loading registration portal...</p>
      </div>
    }>
      <CompleteProfileContent />
    </Suspense>
  );
}
