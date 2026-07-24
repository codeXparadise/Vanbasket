"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/utils/supabase/client";
import { Lock, Mail, Loader2, AlertCircle } from "lucide-react";

// [FIXED] - Add VanBasket Brand Logo & Name Everywhere
import BrandLogo from "@/components/BrandLogo";

export default function AdminLoginPage() {
  const router = useRouter();
  const supabase = createClient();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setErrorMsg("");

    if (password.length < 6) {
      setErrorMsg("Password must be at least 6 characters (Supabase constraint).");
      setIsLoading(false);
      return;
    }

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) throw error;

      if (data.user) {
        // Fetch role to ensure they are admin
        const { data: profile, error: profileError } = await supabase
          .from("profiles")
          .select("role")
          .eq("id", data.user.id)
          .single();

        if (profileError || !profile || profile.role !== "admin") {
          // Log out immediately if not admin
          await supabase.auth.signOut();
          setErrorMsg("Access Denied: You do not have administrator permissions.");
          setIsLoading(false);
          return;
        }

        router.push("/admin");
        router.refresh();
      }
    } catch (err: unknown) {
      const msg = typeof err === "object" && err !== null && "message" in err ? String((err as { message: string }).message) : "Failed to log in. Please check your credentials.";
      setErrorMsg(msg || "Failed to log in. Please check your credentials.");
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-brand-cream-light font-sans px-4 py-12 relative overflow-hidden">
      {/* Decorative ambient background spheres */}
      <div className="absolute top-[-10%] left-[-10%] w-[40vw] h-[40vw] rounded-full bg-brand-honey-light/20 blur-[120px]" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[35vw] h-[35vw] rounded-full bg-brand-honey/10 blur-[100px]" />

      <div className="w-full max-w-md bg-white/80 backdrop-blur-xl border border-brand-cream-dark/60 rounded-3xl p-8 md:p-10 shadow-2xl relative z-10">
        <div className="text-center mb-8 flex flex-col items-center">
          <BrandLogo width={140} height={45} showText={true} className="mb-4" />
          <h1 className="text-xl font-serif text-brand-espresso font-bold tracking-wide">
            VanBasket Admin Panel
          </h1>
          <p className="text-xs uppercase tracking-widest text-brand-espresso/60 mt-1 font-semibold">
            Control Center
          </p>
        </div>

        {errorMsg && (
          <div className="mb-6 flex items-start gap-3 bg-red-50 border border-red-200 text-red-700 rounded-xl p-4 text-xs">
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
            <span>{errorMsg}</span>
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-5">
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-brand-espresso/70 mb-2">
              Email Address
            </label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-brand-espresso/45">
                <Mail className="w-4 h-4" />
              </span>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="admin@example.com"
                className="w-full h-11 pl-10 pr-4 rounded-xl border border-brand-cream-dark bg-white focus:border-brand-honey focus:outline-none text-xs"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-brand-espresso/70 mb-2">
              Password
            </label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-brand-espresso/45">
                <Lock className="w-4 h-4" />
              </span>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full h-11 pl-10 pr-4 rounded-xl border border-brand-cream-dark bg-white focus:border-brand-honey focus:outline-none text-xs"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full h-11 mt-2 bg-brand-espresso hover:bg-brand-espresso/90 text-brand-cream-light font-bold text-xs uppercase tracking-wider rounded-xl transition duration-200 flex items-center justify-center gap-2 disabled:opacity-50"
          >
            {isLoading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Authenticating...</span>
              </>
            ) : (
              <span>Sign In to Admin</span>
            )}
          </button>
        </form>
      </div>
    </div>
  );
}
