"use client";

// [FIXED] - Fix "Forgot Password" Flow
import React, { useState, useEffect, Suspense } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Lock, AlertCircle, CheckCircle2, Eye, EyeOff } from "lucide-react";
import BrandLogo from "@/components/BrandLogo";

function ResetPasswordForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams?.get("token") || "";

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    if (!token) {
      setError("Invalid or missing password reset token. Please request a new reset link.");
    }
  }, [token]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token) {
      setError("Reset token missing.");
      return;
    }

    if (password.length < 6) {
      setError("Password must be at least 6 characters long.");
      return;
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      const res = await fetch("/api/auth/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Failed to reset password.");
      } else {
        setSuccess(true);
        setTimeout(() => {
          router.push("/login?reset=success");
        }, 2000);
      }
    } catch {
      setError("Network error. Please try again later.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-brand-cream-light text-brand-espresso flex items-center justify-center p-6 relative overflow-hidden bg-[url('/assets/hero-bg.png')] bg-cover bg-center">
      <div className="w-full max-w-md bg-white/60 backdrop-blur-xl border border-white/70 rounded-[2.5rem] p-8 md:p-10 shadow-2xl flex flex-col items-center">
        
        {/* Top Logo */}
        <div className="mb-6">
          <BrandLogo href="/" width={140} height={45} showText={true} />
        </div>

        <h1 className="font-serif text-2xl font-black text-brand-espresso text-center">
          Create New Password
        </h1>
        <p className="text-xs text-brand-espresso-muted text-center mt-2 max-w-xs leading-relaxed">
          Set a new strong password for your VanBasket account.
        </p>

        {error && (
          <div className="w-full mt-6 p-4 bg-brand-terracotta/10 border border-brand-terracotta/30 text-brand-terracotta text-xs rounded-xl flex flex-col items-center gap-2 text-center animate-scale-in">
            <AlertCircle className="w-5 h-5 flex-shrink-0" />
            <span>{error}</span>
            <Link
              href="/forgot-password"
              className="mt-1 text-[10px] uppercase tracking-wider font-bold underline hover:text-brand-terracotta/80"
            >
              Request New Link
            </Link>
          </div>
        )}

        {success ? (
          <div className="w-full mt-6 p-5 bg-brand-forest/10 border border-brand-forest/30 text-brand-forest text-xs rounded-2xl flex flex-col items-center text-center space-y-2 animate-scale-in">
            <CheckCircle2 className="w-8 h-8 text-brand-forest animate-bounce" />
            <p className="font-bold">Password Reset Successful!</p>
            <p className="text-[10px] text-brand-forest/80">Redirecting to login page...</p>
          </div>
        ) : (
          !error && (
            <form onSubmit={handleSubmit} className="w-full mt-6 space-y-4">
              <div className="space-y-1.5">
                <label htmlFor="new-password" className="text-[10px] uppercase tracking-widest text-brand-espresso font-bold">
                  New Password
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-brand-espresso/45 absolute left-4 top-4 pointer-events-none" />
                  <input
                    id="new-password"
                    type={showPassword ? "text" : "password"}
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="At least 6 characters"
                    className="w-full h-12 pl-11 pr-10 rounded-xl bg-brand-cream-light/60 border border-brand-cream-dark/80 focus:border-brand-honey focus:outline-none text-xs font-semibold text-brand-espresso transition-all"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-3.5 text-brand-espresso/45 hover:text-brand-espresso p-1"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <div className="space-y-1.5">
                <label htmlFor="confirm-password" className="text-[10px] uppercase tracking-widest text-brand-espresso font-bold">
                  Confirm Password
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-brand-espresso/45 absolute left-4 top-4 pointer-events-none" />
                  <input
                    id="confirm-password"
                    type={showPassword ? "text" : "password"}
                    required
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Repeat new password"
                    className="w-full h-12 pl-11 pr-4 rounded-xl bg-brand-cream-light/60 border border-brand-cream-dark/80 focus:border-brand-honey focus:outline-none text-xs font-semibold text-brand-espresso transition-all"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full h-12 bg-brand-espresso text-white font-sans font-bold uppercase tracking-[0.2em] text-xs flex items-center justify-center rounded-full hover:bg-brand-espresso/90 disabled:opacity-50 transition-all duration-300 shadow-md cursor-pointer mt-2"
              >
                {isSubmitting ? "Updating Password..." : "Update Password"}
              </button>
            </form>
          )
        )}
      </div>
    </div>
  );
}

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-brand-cream-light flex items-center justify-center text-xs uppercase font-bold text-brand-espresso">Loading reset portal...</div>}>
      <ResetPasswordForm />
    </Suspense>
  );
}
