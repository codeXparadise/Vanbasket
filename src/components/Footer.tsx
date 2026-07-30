"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { Award, Mail, Phone, MapPin } from "lucide-react";

export const Footer = () => {
  const [currentYear, setCurrentYear] = useState<number | null>(null);

  useEffect(() => {
    setCurrentYear(new Date().getFullYear());
  }, []);

  return (
    <footer className="relative overflow-hidden bg-brand-espresso py-20 text-brand-cream-light">
      <div className="absolute inset-x-0 top-0 h-10 bg-brand-honey honey-drip-edge opacity-10 pointer-events-none" />
      
      <div className="max-w-7xl mx-auto px-6 md:px-12 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16">
          
          {/* Brand Info & Newsletter (Left 5 Cols) */}
          <div className="lg:col-span-5 flex flex-col justify-between space-y-8">
            <div className="space-y-4">
              <Link href="/" className="inline-block relative w-36 h-9 transition-transform duration-300 hover:scale-[1.02] focus:outline-none">
                <Image
                  src="/assets/logo-new.jpg"
                  alt="Van Basket Foods from Forest"
                  fill
                  sizes="144px"
                  className="object-contain"
                />
              </Link>
              <p className="font-sans font-light text-xs text-brand-cream-dark/70 max-w-sm leading-relaxed">
                Bringing premium multi-floral wild honey from Chhattisgarh&apos;s dense forests to modern homes through sustainable harvesting and strict hygienic processing.
              </p>
            </div>


            {/* Legal details from PDF */}
            <div className="space-y-3 bg-white/5 border border-white/10 rounded-2xl p-5 text-[11px] text-brand-cream-dark/80 font-light max-w-sm">
              <div className="flex items-center gap-2 font-bold uppercase tracking-wider text-brand-honey text-[10px]">
                <Award className="h-3.5 w-3.5" />
                <span>Green Organics Partnership</span>
              </div>
              <div className="flex items-start gap-2 mt-2">
                <MapPin className="h-3.5 w-3.5 text-brand-honey flex-shrink-0 mt-0.5" />
                <span>HN 15, Ridhi Sidhi colony, Hirapur chock, siwani Balod, CG, pin 491226</span>
              </div>
              <div className="grid grid-cols-2 gap-2 border-t border-white/10 pt-2.5 mt-2">
                <div>
                  <p className="text-[9px] uppercase tracking-wider text-brand-cream-dark/40">FSSAI License</p>
                  <p className="font-semibold text-brand-cream-light">20525029000369</p>
                </div>
                <div>
                  <p className="text-[9px] uppercase tracking-wider text-brand-cream-dark/40">GSTIN ID</p>
                  <p className="font-semibold text-brand-cream-light">22ABCFG2092F1ZU</p>
                </div>
              </div>
            </div>
          </div>

          {/* Contact details (Middle 3 Cols) */}
          <div className="lg:col-span-3 space-y-6">
            <h4 className="font-sans text-xs uppercase tracking-widest text-brand-honey font-bold">
              Direct Contact
            </h4>
            <ul className="space-y-4 text-xs font-light text-brand-cream-dark/70">
              <li className="flex items-center gap-2">
                <Phone className="h-3.5 w-3.5 text-brand-honey" />
                <a href="tel:+917724969017" className="hover:text-brand-cream-light transition-colors">+91 7724969017</a>
              </li>
              <li className="flex items-start gap-2">
                <Mail className="h-3.5 w-3.5 text-brand-honey mt-0.5" />
                <div className="flex flex-col">
                  <a href="mailto:vanbasket526@gmail.com" className="hover:text-brand-cream-light transition-colors">vanbasket526@gmail.com</a>
                  <a href="mailto:greenorganics526@gmail.com" className="hover:text-brand-cream-light transition-colors">greenorganics526@gmail.com</a>
                </div>
              </li>
            </ul>
          </div>

          {/* Quick Links (Right 4 Cols) */}
          <div className="lg:col-span-4 grid grid-cols-2 gap-8">
            <div className="space-y-4">
              <h4 className="font-sans text-xs uppercase tracking-widest text-brand-honey font-bold">
                Products
              </h4>
              <ul className="space-y-2.5 text-xs font-light text-brand-cream-dark/70">
                <li><Link href="/#shop" className="hover:text-brand-cream-light transition-colors">250g Daily Jar (₹349)</Link></li>
                <li><Link href="/#shop" className="hover:text-brand-cream-light transition-colors">500g Family Jar (₹599)</Link></li>
                <li><Link href="/contact-us?inquiry=bulk" className="hover:text-brand-cream-light transition-colors">Bulk Wholesale</Link></li>
                <li className="text-[10px] text-brand-cream-dark/40 italic">Also deals in: Jamun Pulp</li>
              </ul>
            </div>

            <div className="space-y-4">
              <h4 className="font-sans text-xs uppercase tracking-widest text-brand-honey font-bold">
                Navigation
              </h4>
              <ul className="space-y-2.5 text-xs font-light text-brand-cream-dark/70">
                <li><Link href="/catalogue" className="hover:text-brand-cream-light transition-colors">Catalogue</Link></li>
                <li><Link href="/#story" className="hover:text-brand-cream-light transition-colors">Forest Story</Link></li>
                <li><Link href="/contact-us" className="hover:text-brand-cream-light transition-colors">Contact Form</Link></li>
              </ul>
            </div>
          </div>

        </div>

        {/* Footer Bottom Strip */}
        <div className="mt-16 pt-8 border-t border-white/10 flex flex-col md:flex-row items-center justify-between text-[11px] text-brand-cream-dark/40 font-light">
          <p>© {currentYear || 2026} Vanbasket (Green Organics). Sourced from Chhattisgarh forests.</p>
          <div className="flex space-x-6 mt-4 md:mt-0">
            <Link href="/#story" className="hover:text-brand-cream-light transition-colors">Harvest Standards</Link>
            <Link href="/#shop" className="hover:text-brand-cream-light transition-colors">Terms & Purity</Link>
          </div>
        </div>
      </div>
    </footer>
  );
};
