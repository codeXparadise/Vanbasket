"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { useCart } from "@/context/CartContext";
import { ShoppingBag, Menu, X } from "lucide-react";
import { createClient } from "@/utils/supabase/client";
import { User } from "@supabase/supabase-js";

export const Navbar = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { cartCount, setIsCartOpen, authReady } = useCart();
  const [user, setUser] = useState<User | null>(null);
  const [profileName, setProfileName] = useState<string>("");
  const [supabase] = useState(() => createClient());

  useEffect(() => {
    document.body.classList.toggle("scroll-locked", isMobileMenuOpen);
    return () => document.body.classList.remove("scroll-locked");
  }, [isMobileMenuOpen]);

  useEffect(() => {
    const fetchUserAndProfile = async () => {
      try {
        const { data, error } = await supabase.auth.getUser();
        const u = error ? null : data?.user || null;
        setUser(u);
        if (u) {
          // Fetch real profile details
          const { data: profile } = await supabase
            .from("profiles")
            .select("full_name")
            .eq("id", u.id)
            .maybeSingle();

          if (profile?.full_name) {
            setProfileName(profile.full_name);
          } else if (u.user_metadata?.full_name) {
            setProfileName(u.user_metadata.full_name);
          }
        }
      } catch {
        setUser(null);
        setProfileName("");
      }
    };
    fetchUserAndProfile();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, session) => {
      try {
        const u = session?.user || null;
        setUser(u);
        if (u) {
          const { data: profile } = await supabase
            .from("profiles")
            .select("full_name")
            .eq("id", u.id)
            .maybeSingle();

          if (profile?.full_name) {
            setProfileName(profile.full_name);
          } else if (u.user_metadata?.full_name) {
            setProfileName(u.user_metadata.full_name);
          }
        } else {
          setProfileName("");
        }
      } catch {
        setUser(null);
        setProfileName("");
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [supabase]);

  // Compute initials (e.g. "Vishal Prajapati" -> "VP")
  const getInitials = (name: string) => {
    if (!name) return "U";
    const parts = name.trim().split(/\s+/);
    if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  };

  const getFirstName = (name: string) => {
    if (!name) return "";
    return name.trim().split(/\s+/)[0];
  };

  const navLinks = [
    { name: "Home", href: "/" },
    { name: "About Us", href: "/about-us" },
    { name: "Contact Us", href: "/contact-us" },
    { name: "Catalogue", href: "/catalogue" },
  ];

  return (
    <>
      <header
        className="sticky top-0 left-0 w-full z-40 bg-brand-cream-light/90 backdrop-blur-xl border-b border-brand-espresso/10 py-4.5 shadow-[0_8px_30px_rgba(36,27,21,0.06)] transition-all"
      >
        <div className="max-w-7xl mx-auto px-6 md:px-12 flex items-center justify-between">
          
          {/* Mobile Menu Toggle (Left) */}
          <button
            onClick={() => setIsMobileMenuOpen(true)}
            className="md:hidden text-brand-espresso p-1.5 hover:text-brand-honey transition-colors focus:outline-none"
            aria-label="Open navigation menu"
          >
            <Menu className="w-5 h-5 stroke-[1.75]" />
          </button>

          {/* Brand Logo Image */}
          <Link
            href="/"
            className="flex items-center justify-center md:justify-start text-brand-espresso transition-transform duration-300 hover:scale-[1.02] focus:outline-none"
            aria-label="Van Basket Homepage"
          >
            <div className="relative w-36 h-9">
              <Image
                src="/assets/logo-new.jpg"
                alt="Van Basket Foods from Forest"
                fill
                sizes="144px"
                priority
                className="object-contain"
              />
            </div>
          </Link>

          {/* Desktop Navigation Links */}
          <nav className="hidden md:flex items-center space-x-10">
            {navLinks.map((link) => (
              <Link
                key={link.name}
                href={link.href}
                className="text-xs font-sans font-bold uppercase tracking-[0.2em] text-brand-espresso/70 hover:text-brand-honey transition-colors duration-300 relative group py-1.5 focus:outline-none"
              >
                {link.name}
                <span className="absolute bottom-0 left-0 w-full h-[1.5px] bg-brand-honey scale-x-0 group-hover:scale-x-100 transition-transform duration-300 ease-organic origin-left" />
              </Link>
            ))}
          </nav>

          {/* User & Cart CTA Actions */}
          <div className="flex items-center space-x-3.5">
            {user ? (
              <Link
                href="/profile"
                className="group flex items-center space-x-2 focus:outline-none"
                aria-label="View user profile"
              >
                {profileName && (
                  <span className="hidden lg:inline text-[10px] font-sans font-bold uppercase tracking-wider text-brand-espresso/60 group-hover:text-brand-honey transition-colors duration-300">
                    Hello, {getFirstName(profileName)}
                  </span>
                )}
                <div className="w-8 h-8 rounded-full bg-brand-honey text-brand-cream-light font-sans text-xs font-bold flex items-center justify-center border border-brand-cream-dark/50 hover:bg-brand-honey-dark transition-all duration-300 shadow-sm relative group-hover:scale-105">
                  {getInitials(profileName || user.email || "")}
                </div>
              </Link>
            ) : (
              <Link
                href="/login"
                className="px-5 py-2.5 bg-brand-espresso/5 border border-brand-cream-dark hover:border-brand-espresso text-brand-espresso text-[10px] font-sans font-bold uppercase tracking-widest rounded-full hover:bg-brand-espresso hover:text-brand-cream-light transition-all duration-300 focus:outline-none"
                aria-label="Log in or sign up"
              >
                Sign In
              </Link>
            )}

            <button
              onClick={() => {
                setIsCartOpen(true);
              }}
              className="relative p-2.5 text-brand-espresso hover:text-brand-honey transition-colors focus:outline-none group"
              aria-label={`Open shopping cart. ${cartCount} items.`}
            >
              <ShoppingBag className="w-5 h-5 stroke-[1.5] group-hover:scale-105 transition-transform" />
              {authReady && cartCount > 0 && (
                <span className="absolute top-1.5 right-1.5 bg-brand-honey text-brand-cream-light font-sans text-[9px] font-black w-4.5 h-4.5 rounded-full flex items-center justify-center shadow-sm animate-drip">
                  {cartCount}
                </span>
              )}
            </button>
          </div>
        </div>
      </header>

      {/* Mobile Navigation Drawer */}
      <div
        className={`fixed inset-0 z-50 transition-opacity duration-500 ${
          isMobileMenuOpen ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
        }`}
      >
        {/* Backdrop overlay */}
        <div
          className="absolute inset-0 bg-brand-espresso/45 backdrop-blur-sm transition-opacity duration-500"
          onClick={() => setIsMobileMenuOpen(false)}
        />

        {/* Drawer Content */}
        <div
          className={`absolute top-0 left-0 w-[85%] max-w-xs h-full bg-brand-cream-light p-6 shadow-2xl flex flex-col justify-between transition-transform duration-500 ease-organic ${
            isMobileMenuOpen ? "translate-x-0" : "-translate-x-full"
          }`}
        >
          <div>
            <div className="flex items-center justify-between mb-10">
              <span className="font-serif text-base font-black tracking-wider lowercase text-brand-espresso">
                van bakset<span className="text-brand-honey">.</span>
              </span>
              <button
                onClick={() => setIsMobileMenuOpen(false)}
                className="text-brand-espresso/70 hover:text-brand-espresso p-1.5 focus:outline-none"
                aria-label="Close menu"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <nav className="flex flex-col space-y-5">
              {navLinks.map((link) => (
                <Link
                  key={link.name}
                  href={link.href}
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="text-sm font-sans font-bold uppercase tracking-wider text-brand-espresso hover:text-brand-honey transition-colors py-1.5 border-b border-brand-cream-dark/30"
                >
                  {link.name}
                </Link>
              ))}
              <Link
                href={user ? "/profile" : "/login"}
                onClick={() => setIsMobileMenuOpen(false)}
                className="text-sm font-sans font-bold uppercase tracking-wider text-brand-espresso hover:text-brand-honey transition-colors py-1.5 border-b border-brand-cream-dark/30"
              >
                {user ? `Account (${getFirstName(profileName || user.email || "User")})` : "Sign In / Register"}
              </Link>
            </nav>
          </div>

          <div className="border-t border-brand-cream-dark/40 pt-5">
            <p className="text-[10px] uppercase tracking-widest text-brand-espresso/50 mb-2">
              Van Bakset apothecary
            </p>
            <p className="text-xs text-brand-espresso-muted leading-relaxed font-light">
              Premium Wild Forest Honey from Chhattisgarh, sustainably harvested and packed for modern wellness.
            </p>
          </div>
        </div>
      </div>
    </>
  );
};
