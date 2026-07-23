"use client";

// [FIXED] - Fix "Forgot Password" Flow
import React, { useState } from "react";
import Link from "next/link";
import { Mail, ArrowLeft, CheckCircle2, AlertCircle } from "lucide-react";
import BrandLogo from "@/components/BrandLogo";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) return;

    setIsSubmitting(true);
    setError(null);
    setSuccessMsg(null);

    try {
      const res = await fetch("/api/auth/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.trim() }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Failed to process request.");
      } else {
        setSuccessMsg(
          data.message || "If an account exists with that email, a password reset link has been sent."
        );
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
          Reset Password
        </h1>
        <p className="text-xs text-brand-espresso-muted text-center mt-2 max-w-xs leading-relaxed">
          Enter your registered email address below to receive a secure, 1-hour password reset link.
        </p>

        {error && (
          <div className="w-full mt-6 p-4 bg-brand-terracotta/10 border border-brand-terracotta/30 text-brand-terracotta text-xs rounded-xl flex items-center gap-3 animate-scale-in">
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {successMsg ? (
          <div className="w-full mt-6 space-y-6 text-center animate-scale-in">
            <div className="p-5 bg-brand-forest/10 border border-brand-forest/30 text-brand-forest text-xs rounded-2xl flex flex-col items-center space-y-2">
              <CheckCircle2 className="w-8 h-8 text-brand-forest" />
              <p className="font-semibold leading-relaxed">{successMsg}</p>
            </div>
            <Link
              href="/login"
              className="inline-flex h-12 px-8 items-center justify-center rounded-full bg-brand-espresso text-brand-cream-light text-xs font-bold uppercase tracking-wider hover:bg-brand-espresso/90 transition shadow-md"
            >
              Return to Sign In
            </Link>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="w-full mt-6 space-y-4">
            <div className="space-y-1.5">
              <label htmlFor="reset-email" className="text-[10px] uppercase tracking-widest text-brand-espresso font-bold">
                Email Address
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-brand-espresso/45 absolute left-4 top-4 pointer-events-none" />
                <input
                  id="reset-email"
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@domain.com"
                  className="w-full h-12 pl-11 pr-4 rounded-xl bg-brand-cream-light/60 border border-brand-cream-dark/80 focus:border-brand-honey focus:outline-none text-xs font-semibold text-brand-espresso transition-all"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full h-12 bg-brand-honey text-white font-sans font-bold uppercase tracking-[0.2em] text-xs flex items-center justify-center rounded-full hover:bg-brand-honey-dark disabled:opacity-50 transition-all duration-300 shadow-md cursor-pointer mt-2"
            >
              {isSubmitting ? "Generating Link..." : "Send Reset Link"}
            </button>

            <div className="pt-2 text-center">
              <Link
                href="/login"
                className="inline-flex items-center gap-1.5 text-xs text-brand-espresso/60 hover:text-brand-espresso font-bold uppercase tracking-wider transition"
              >
                <ArrowLeft className="w-3.5 h-3.5" /> Back to Login
              </Link>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
