"use client";

import React, { useState, useEffect, Suspense } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { createClient } from "@/utils/supabase/client";
import { Mail, Lock, User, Phone, ArrowRight, Eye, EyeOff } from "lucide-react";
import { LottiePlayer } from "@/components/LottiePlayer";
import BrandLogo from "@/components/BrandLogo";

function LoginContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [supabase] = useState(() => createClient());

  // Form toggle states (0 = Login, 1 = Register)
  const [activeForm, setActiveForm] = useState<"login" | "register">("login");

  // Common states
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  // Register only states
  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [isSuccess, setIsSuccess] = useState(false);
  const [resetMessage, setResetMessage] = useState<string | null>(null);

  const redirectUrl = searchParams?.get("redirect") || "/";

  // [FIXED] - Fix "Forgot Password" Flow
  useEffect(() => {
    if (searchParams?.get("reset") === "success") {
      setResetMessage("Password updated successfully! Please sign in with your new password.");
    }
    if (searchParams?.get("error") === "admin_account_restricted") {
      setError("Administrator accounts are restricted from logging into the customer storefront. Please sign in with customer credentials.");
    }
  }, [searchParams]);

  // Check if already logged in
  useEffect(() => {
    const checkUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user && !isSuccess) {
        const { data: profile } = await supabase
          .from("profiles")
          .select("role")
          .eq("id", user.id)
          .maybeSingle();
        if (profile?.role === "admin") {
          await supabase.auth.signOut();
          router.refresh();
        } else {
          window.location.assign(redirectUrl);
        }
      }
    };
    checkUser();
  }, [router, redirectUrl, supabase, isSuccess]);

  // Handle Sign In submission
  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      const { data, error: loginError } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (loginError) {
        setError(loginError.message);
        setIsLoading(false);
        return;
      }

      if (data?.user) {
        const { data: profile } = await supabase
          .from("profiles")
          .select("full_name, role")
          .eq("id", data.user.id)
          .maybeSingle();

        if (profile?.role === "admin") {
          await supabase.auth.signOut();
          setError("Admin accounts are restricted from logging in here.");
          setIsLoading(false);
          return;
        }

        if (!profile || !profile.full_name) {
          window.location.assign(`/complete-profile?redirect=${encodeURIComponent(redirectUrl)}`);
        } else {
          window.location.assign(redirectUrl);
        }
      }
    } catch {
      setError("An unexpected error occurred. Please try again.");
      setIsLoading(false);
    }
  };

  // Handle Registration submission
  const handleRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    if (password.length < 6) {
      setError("Password must be at least 6 characters.");
      setIsLoading(false);
      return;
    }

    if (fullName.trim().length < 2) {
      setError("Please enter your full name.");
      setIsLoading(false);
      return;
    }

    if (!phone.trim() || !/^[+()0-9\s-]{7,20}$/.test(phone.trim())) {
      setError("Please enter a valid mandatory phone number.");
      setIsLoading(false);
      return;
    }

    try {
      const response = await fetch("/api/auth/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: email.trim(),
          password,
          fullName: fullName.trim(),
          phone: phone.trim(),
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || "Failed to create account.");
        setIsLoading(false);
        return;
      }

      const { error: signInError } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password,
      });

      if (signInError) {
        setError("Account created, but sign-in failed. Please go to login.");
        setIsLoading(false);
        return;
      }

      setIsSuccess(true);
      setIsLoading(false);

      setTimeout(async () => {
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
          const { data: profile } = await supabase
             .from("profiles")
             .select("full_name")
             .eq("id", user.id)
             .maybeSingle();

          if (!profile || !profile.full_name) {
            window.location.assign(`/complete-profile?redirect=${encodeURIComponent(redirectUrl)}`);
          } else {
            window.location.assign(redirectUrl);
          }
        }
      }, 3500);
    } catch {
      setError("An unexpected error occurred. Please try again.");
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#faf8f5] text-brand-espresso flex items-stretch overflow-hidden relative">
      
      {/* Success Lottie Overlay */}
      {isSuccess && (
        <div className="fixed inset-0 bg-[#faf8f5]/95 backdrop-blur-md z-50 flex flex-col items-center justify-center animate-fade-in-up">
          <div className="w-80 h-80 max-w-full">
            <LottiePlayer
              src="/lottie/Account Created.lottie"
              label="Account Created successfully"
              className="w-full h-full"
            />
          </div>
          <h2 className="font-serif text-3xl font-black mt-6 text-brand-espresso text-center">
            Welcome to the Registry!
          </h2>
          <p className="text-xs text-brand-espresso-muted tracking-widest uppercase mt-2 font-bold animate-pulse">
            Configuring Honey Vault...
          </p>
        </div>
      )}

      {/* Main Grid Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-10 w-full min-h-screen">
        
        {/* Left Side: 60% Width Lottie File Animation */}
        <div className="hidden lg:flex lg:col-span-6 bg-brand-cream-light/40 border-r border-brand-cream-dark/40 items-center justify-center p-12 relative overflow-hidden">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(217,139,0,0.06)_0%,transparent_70%)] pointer-events-none" />
          <div className="w-full max-w-[580px] aspect-square relative z-10 flex items-center justify-center">
            <LottiePlayer 
              src="/lottie/Sign up.lottie" 
              label="Sign up & login animation" 
              className="w-full h-full object-contain" 
            />
          </div>
          <div className="absolute bottom-10 left-10 right-10 text-center space-y-2 z-10">
            <span className="text-[10px] uppercase tracking-[0.3em] text-brand-honey font-bold">Van Basket Apothecary</span>
            <h2 className="font-serif text-2xl font-black">Reserved Forest Nectar allocations</h2>
            <p className="text-xs text-brand-espresso-muted max-w-md mx-auto">
              Join the hive registry to order raw wild honey sustainably harvested by local tribal communities.
            </p>
          </div>
        </div>

        {/* Right Side: 40% Width Form with glassmorphism & background blur */}
        <div className="col-span-1 lg:col-span-4 flex items-center justify-center p-6 sm:p-12 md:p-16 relative overflow-hidden bg-[url('/assets/hero-bg.png')] bg-cover bg-center">
          
          {/* Glassmorphic card container */}
          <div className="w-full max-w-md bg-white/45 backdrop-blur-xl border border-white/60 rounded-[2.5rem] p-8 md:p-10 shadow-2xl flex flex-col justify-between relative z-10">
            
            {/* Header & Logo */}
            {/* [FIXED] - Add VanBasket Brand Logo & Name Everywhere */}
            <div className="flex flex-col items-center mb-8">
              <div className="mb-4 transition-transform hover:scale-[1.02]">
                <BrandLogo href="/" width={140} height={45} showText={true} />
              </div>
              
              {/* Tab Selectors for Side-by-Side Split Form */}
              <div className="flex bg-brand-espresso/5 border border-brand-cream-dark/50 rounded-full p-1 w-full max-w-[280px] mt-2 relative">
                <button
                  onClick={() => { setActiveForm("login"); setError(null); }}
                  className={`flex-1 py-2 text-center text-[10px] font-sans font-bold uppercase tracking-wider rounded-full transition-all duration-300 ${
                    activeForm === "login"
                      ? "bg-brand-espresso text-brand-cream-light shadow-sm"
                      : "text-brand-espresso/60 hover:text-brand-espresso"
                  }`}
                >
                  Sign In
                </button>
                <button
                  onClick={() => { setActiveForm("register"); setError(null); }}
                  className={`flex-1 py-2 text-center text-[10px] font-sans font-bold uppercase tracking-wider rounded-full transition-all duration-300 ${
                    activeForm === "register"
                      ? "bg-brand-espresso text-brand-cream-light shadow-sm"
                      : "text-brand-espresso/60 hover:text-brand-espresso"
                  }`}
                >
                  Register
                </button>
              </div>
            </div>

            {error && (
              <div className="p-3.5 bg-brand-terracotta/10 border border-brand-terracotta/30 text-brand-terracotta text-xs rounded-xl mb-5 text-center space-y-2" role="alert">
                <p>{error}</p>
                {error.toLowerCase().includes("already registered") && activeForm === "register" && (
                  <button
                    type="button"
                    onClick={() => {
                      setActiveForm("login");
                      setError(null);
                    }}
                    className="inline-block px-3 py-1 bg-brand-espresso text-white text-[10px] font-bold uppercase tracking-wider rounded-lg hover:bg-brand-espresso/80 transition-colors shadow-sm cursor-pointer"
                  >
                    Click Here To Sign In
                  </button>
                )}
              </div>
            )}
            {resetMessage && (
              <div className="p-3.5 bg-green-50 border border-green-200 text-green-700 text-xs rounded-xl mb-5 text-center" role="status">
                {resetMessage}
              </div>
            )}

            {/* Slider Switch Container */}
            <div className="relative overflow-hidden min-h-[340px]">
              
              {/* SIGN IN FORM */}
              <div className={`transition-all duration-500 ease-in-out ${
                activeForm === "login" 
                  ? "opacity-100 translate-x-0 pointer-events-auto" 
                  : "opacity-0 -translate-x-full pointer-events-none absolute inset-0"
              }`}>
                <form onSubmit={handleLoginSubmit} className="space-y-4">
                  <div className="space-y-1.5">
                    <label htmlFor="login-email" className="text-[10px] uppercase tracking-widest text-brand-espresso font-bold">
                      Email Address
                    </label>
                    <div className="relative">
                      <Mail className="absolute left-4 top-3.5 w-4 h-4 text-brand-espresso/35" />
                      <input
                        type="email"
                        id="login-email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="w-full h-12 pl-11 pr-4 rounded-xl bg-white/40 border border-brand-cream-dark/80 focus:border-brand-honey focus:outline-none font-sans text-sm backdrop-blur"
                        required
                        autoComplete="email"
                      />
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <div className="flex justify-between items-center">
                      <label htmlFor="login-password" className="text-[10px] uppercase tracking-widest text-brand-espresso font-bold">
                        Password
                      </label>
                      {/* [FIXED] - Fix "Forgot Password" Flow */}
                      <Link href="/forgot-password" className="text-[9px] text-brand-honey font-bold uppercase tracking-wider hover:underline">
                        Forgot?
                      </Link>
                    </div>
                    <div className="relative">
                      <Lock className="absolute left-4 top-3.5 w-4 h-4 text-brand-espresso/35" />
                      <input
                        type={showPassword ? "text" : "password"}
                        id="login-password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="w-full h-12 pl-11 pr-12 rounded-xl bg-white/40 border border-brand-cream-dark/80 focus:border-brand-honey focus:outline-none font-sans text-sm backdrop-blur"
                        required
                        autoComplete="current-password"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-4 top-3.5 text-brand-espresso/35 hover:text-brand-espresso/60 transition-colors"
                        aria-label={showPassword ? "Hide password" : "Show password"}
                      >
                        {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={isLoading}
                    className="w-full h-12 bg-brand-espresso text-brand-cream-light font-sans font-bold uppercase tracking-[0.2em] text-xs flex items-center justify-center gap-2 rounded-full hover:bg-brand-espresso/90 transition-colors disabled:opacity-50 mt-6 cursor-pointer shadow-md"
                  >
                    {isLoading ? "Signing In..." : (
                      <>
                        <span>Sign In</span>
                        <ArrowRight className="w-4 h-4" />
                      </>
                    )}
                  </button>
                </form>
              </div>

              {/* REGISTER FORM */}
              <div className={`transition-all duration-500 ease-in-out ${
                activeForm === "register" 
                  ? "opacity-100 translate-x-0 pointer-events-auto" 
                  : "opacity-0 translate-x-full pointer-events-none absolute inset-0"
              }`}>
                <form onSubmit={handleRegisterSubmit} className="space-y-4">
                  <div className="space-y-1.5">
                    <label htmlFor="reg-name" className="text-[10px] uppercase tracking-widest text-brand-espresso font-bold">
                      Full Name
                    </label>
                    <div className="relative">
                      <User className="absolute left-4 top-3.5 w-4 h-4 text-brand-espresso/35" />
                      <input
                        type="text"
                        id="reg-name"
                        value={fullName}
                        onChange={(e) => setFullName(e.target.value)}
                        className="w-full h-12 pl-11 pr-4 rounded-xl bg-white/40 border border-brand-cream-dark/80 focus:border-brand-honey focus:outline-none font-sans text-sm backdrop-blur"
                        required
                        autoComplete="name"
                      />
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <label htmlFor="reg-phone" className="text-[10px] uppercase tracking-widest text-brand-espresso font-bold">
                      Phone Number <span className="text-brand-terracotta">*</span>
                    </label>
                    <div className="relative">
                      <Phone className="absolute left-4 top-3.5 w-4 h-4 text-brand-espresso/35" />
                      <input
                        type="tel"
                        id="reg-phone"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        placeholder="+91 9876543210"
                        className="w-full h-12 pl-11 pr-4 rounded-xl bg-white/40 border border-brand-cream-dark/80 focus:border-brand-honey focus:outline-none font-sans text-sm backdrop-blur"
                        required
                        autoComplete="tel"
                      />
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <label htmlFor="reg-email" className="text-[10px] uppercase tracking-widest text-brand-espresso font-bold">
                      Email Address
                    </label>
                    <div className="relative">
                      <Mail className="absolute left-4 top-3.5 w-4 h-4 text-brand-espresso/35" />
                      <input
                        type="email"
                        id="reg-email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="w-full h-12 pl-11 pr-4 rounded-xl bg-white/40 border border-brand-cream-dark/80 focus:border-brand-honey focus:outline-none font-sans text-sm backdrop-blur"
                        required
                        autoComplete="email"
                      />
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <label htmlFor="reg-password" className="text-[10px] uppercase tracking-widest text-brand-espresso font-bold">
                      Password
                    </label>
                    <div className="relative">
                      <Lock className="absolute left-4 top-3.5 w-4 h-4 text-brand-espresso/35" />
                      <input
                        type={showPassword ? "text" : "password"}
                        id="reg-password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="w-full h-12 pl-11 pr-12 rounded-xl bg-white/40 border border-brand-cream-dark/80 focus:border-brand-honey focus:outline-none font-sans text-sm backdrop-blur"
                        required
                        autoComplete="new-password"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-4 top-3.5 text-brand-espresso/35 hover:text-brand-espresso/60 transition-colors"
                        aria-label={showPassword ? "Hide password" : "Show password"}
                      >
                        {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                    <p className="text-[9px] text-brand-espresso-muted">Min 6 characters required</p>
                  </div>

                  <button
                    type="submit"
                    disabled={isLoading}
                    className="w-full h-12 bg-brand-espresso text-brand-cream-light font-sans font-bold uppercase tracking-[0.2em] text-xs flex items-center justify-center gap-2 rounded-full hover:bg-brand-espresso/90 transition-colors disabled:opacity-50 mt-4 cursor-pointer shadow-md"
                  >
                    {isLoading ? "Creating Account..." : (
                      <>
                        <span>Register</span>
                        <ArrowRight className="w-4 h-4" />
                      </>
                    )}
                  </button>
                </form>
              </div>

            </div>

          </div>
        </div>

      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-brand-cream-light text-brand-espresso flex flex-col items-center justify-center">
        <p className="font-sans text-xs tracking-widest uppercase text-brand-espresso/60 animate-pulse">Loading login portal...</p>
      </div>
    }>
      <LoginContent />
    </Suspense>
  );
}
