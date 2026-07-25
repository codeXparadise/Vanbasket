"use client";

import React, { useState, useEffect, Suspense } from "react";
import Link from "next/link";
import { ArrowLeft, Send, CheckCircle2, PhoneCall, ShieldCheck } from "lucide-react";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { useSearchParams } from "next/navigation";

import { createClient } from "@/utils/supabase/client";
import Image from "next/image";

function ContactUsContent() {
  const searchParams = useSearchParams();
  const [supabase] = useState(() => createClient());
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    company: "",
    quantity: "250g-jars",
    message: "",
  });

  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  useEffect(() => {
    const inquiryType = searchParams?.get("inquiry");
    if (inquiryType === "bulk") {
      setFormData((prev) => ({
        ...prev,
        quantity: "bulk-wholesale",
        message: "Hello, I am interested in placing a bulk order for van basket raw honey. Please provide pricing details.",
      }));
    }
  }, [searchParams]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setErrorMsg(null);

    try {
      const { error } = await supabase
        .from("contact_queries")
        .insert({
          name: formData.name,
          email: formData.email,
          phone: formData.phone,
          company: formData.company,
          quantity: formData.quantity,
          message: formData.message,
        });

      if (error) throw error;

      setIsSubmitted(true);
      setFormData({
        name: "",
        email: "",
        phone: "",
        company: "",
        quantity: "250g-jars",
        message: "",
      });
      setTimeout(() => {
        setIsSubmitted(false);
      }, 5000);
    } catch (err: unknown) {
      const error = err as Error;
      setErrorMsg(error.message || "Failed to log query. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="relative min-h-screen bg-brand-cream-light text-brand-espresso flex flex-col justify-between">
      <Navbar />

      <main className="flex-grow pt-24 pb-20 px-6 md:px-12 max-w-7xl mx-auto w-full">
        <section className="relative min-h-[360px] flex items-end overflow-hidden bg-brand-espresso text-brand-cream-light mb-16">
          <Image src="/assets/hero-contact-new.jpg" alt="Warm honey and forest still life" fill sizes="100vw" className="object-cover opacity-70" />
          <div className="absolute inset-0 bg-gradient-to-r from-brand-espresso/90 to-transparent" />
          <div className="relative z-10 p-8 md:p-14 max-w-2xl">
            <p className="eyebrow text-brand-honey">Start a conversation</p>
            <h1 className="font-serif text-5xl md:text-7xl font-black leading-[.9] mt-3">Let&apos;s talk<br /><em className="font-normal text-brand-honey">honey.</em></h1>
            <p className="mt-5 text-sm text-white/75 max-w-md">For a jar, a gifting idea, or a larger forest reserve, our team is here to help.</p>
          </div>
        </section>
        {/* Navigation Back Button */}
        <div className="mb-8">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-xs font-sans font-bold uppercase tracking-widest text-brand-espresso/60 hover:text-brand-honey transition-colors duration-300 focus:outline-none"
          >
            <ArrowLeft className="w-3.5 h-3.5" /> Back to Home
          </Link>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 md:gap-16 items-start">
          
          {/* Left Column: Direct Info with Animation in Background (5 cols) */}
          <div className="lg:col-span-5 relative flex flex-col justify-between min-h-[520px]">
            <div className="relative aspect-[4/3] overflow-hidden bg-brand-cream-warm mb-6 contact-image"><Image src="/assets/SaveInta.com_694298566_18088759847113038_4397863112803506586_n.jpg" alt="Van Basket honey jar and forest harvest" fill sizes="(min-width: 1024px) 40vw, 100vw" className="object-cover" /></div>
            <div className="border border-brand-cream-dark/70 bg-white/50 overflow-hidden h-48"><iframe title="Van Basket forest sourcing map" src="https://www.google.com/maps?q=Chhattisgarh%20India&output=embed" className="w-full h-full border-0 grayscale opacity-80" loading="lazy" /></div>
            
            <div className="space-y-4 relative z-10">
              <span className="text-[9px] font-sans font-bold uppercase tracking-[0.25em] text-brand-honey">
                Artisanal Registry
              </span>
              <h1 className="font-serif text-3xl font-black text-brand-espresso leading-tight">
                Bulk Reserve.
              </h1>
              <p className="font-sans text-xs text-brand-espresso-muted leading-relaxed font-light">
                Submit an inquiry below to reserve private bulk batches for wedding favors, corporate gifting, or wholesale allocations.
              </p>
            </div>

            <div className="space-y-5 pt-6 border-t border-brand-cream-dark/50 relative z-10">
              <div className="flex items-center space-x-3.5">
                <div className="w-9 h-9 rounded-full bg-brand-honey/10 flex items-center justify-center text-brand-honey">
                  <PhoneCall className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-[10px] font-sans font-bold uppercase tracking-wider">Direct Hotline</h4>
                  <p className="text-[11px] font-sans text-brand-espresso-muted mt-0.5">+91 77249 69017</p>
                </div>
              </div>

              <div className="flex items-center space-x-3.5">
                <div className="w-9 h-9 rounded-full bg-brand-forest/10 flex items-center justify-center text-brand-forest">
                  <ShieldCheck className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-[10px] font-sans font-bold uppercase tracking-wider">Secure Audit</h4>
                  <p className="text-[11px] font-sans text-brand-espresso-muted mt-0.5">Response within 24 hours</p>
                </div>
              </div>
            </div>
          </div>


          {/* Right Column: Contact form (7 cols) */}
          <div className="lg:col-span-7 lg:pt-14">
            {isSubmitted ? (
              <div className="h-full flex flex-col items-center justify-center text-center p-6 space-y-4 min-h-[350px] animate-scale-in">
                <CheckCircle2 className="w-12 h-12 text-brand-forest animate-bounce" />
                <h3 className="font-serif text-xl font-bold">Inquiry Registered</h3>
                <p className="text-xs text-brand-espresso-muted max-w-xs font-sans leading-relaxed">
                  Thank you! Your private bulk batch reserve request has been logged. Our beekeeping registry team will reach out with options shortly.
                </p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                {errorMsg && (
                  <div className="p-3.5 bg-brand-terracotta/10 border border-brand-terracotta/30 text-brand-terracotta text-xs rounded-xl" role="alert">
                    {errorMsg}
                  </div>
                )}
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-[10px] uppercase font-bold tracking-widest text-brand-espresso">Name</label>
                    <input
                      type="text"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      required
                      className="w-full h-11 px-4 rounded-xl border border-brand-cream-dark/80 bg-brand-cream-light/40 focus:border-brand-honey focus:outline-none text-xs font-sans"
                      placeholder="Your Name"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[10px] uppercase font-bold tracking-widest text-brand-espresso">Email</label>
                    <input
                      type="email"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      required
                      className="w-full h-11 px-4 rounded-xl border border-brand-cream-dark/80 bg-brand-cream-light/40 focus:border-brand-honey focus:outline-none text-xs font-sans"
                      placeholder="you@email.com"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-[10px] uppercase font-bold tracking-widest text-brand-espresso">Phone</label>
                    <input
                      type="tel"
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      required
                      className="w-full h-11 px-4 rounded-xl border border-brand-cream-dark/80 bg-brand-cream-light/40 focus:border-brand-honey focus:outline-none text-xs font-sans"
                      placeholder="Contact number"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[10px] uppercase font-bold tracking-widest text-brand-espresso">Company</label>
                    <input
                      type="text"
                      value={formData.company}
                      onChange={(e) => setFormData({ ...formData, company: e.target.value })}
                      className="w-full h-11 px-4 rounded-xl border border-brand-cream-dark/80 bg-brand-cream-light/40 focus:border-brand-honey focus:outline-none text-xs font-sans"
                      placeholder="Optional"
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] uppercase font-bold tracking-widest text-brand-espresso">Target Batch Reserve</label>
                  <select
                    value={formData.quantity}
                    onChange={(e) => setFormData({ ...formData, quantity: e.target.value })}
                    className="w-full h-11 px-4 rounded-xl border border-brand-cream-dark/80 bg-brand-cream-light/40 focus:border-brand-honey focus:outline-none text-xs font-sans"
                  >
                    <option value="250g-jars">250g Individual Jars (Qty 10+)</option>
                    <option value="500g-jars">500g Signature Jars (Qty 10+)</option>
                    <option value="bulk-wholesale">Bulk Industrial Buckets (Wholesale)</option>
                    <option value="custom-event">Custom Events & Catering</option>
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] uppercase font-bold tracking-widest text-brand-espresso">Message & Specifications</label>
                  <textarea
                    rows={4}
                    value={formData.message}
                    onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                    required
                    className="w-full p-4 rounded-xl border border-brand-cream-dark/80 bg-brand-cream-light/40 focus:border-brand-honey focus:outline-none text-xs font-sans resize-none"
                    placeholder="Provide details about your custom size / wholesale requirements..."
                  />
                </div>

                <div className="pt-2">
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full h-12 bg-brand-espresso hover:bg-brand-espresso/95 text-brand-cream-light text-xs font-sans font-bold uppercase tracking-wider rounded-xl transition-all duration-300 flex items-center justify-center gap-2 cursor-pointer shadow-md hover:shadow-lg focus:outline-none disabled:opacity-40"
                  >
                    {isSubmitting ? (
                      "Logging Inquiry..."
                    ) : (
                      <>
                        <Send className="w-3.5 h-3.5" /> Submit Reserve Request
                      </>
                    )}
                  </button>
                </div>
              </form>
            )}
          </div>

        </div>
      </main>

      <Footer />
    </div>
  );
}

export default function ContactUsPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-brand-cream-light flex items-center justify-center font-sans">
        <p className="text-xs uppercase tracking-widest text-brand-espresso/60 font-semibold">
          Loading contact register...
        </p>
      </div>
    }>
      <ContactUsContent />
    </Suspense>
  );
}
