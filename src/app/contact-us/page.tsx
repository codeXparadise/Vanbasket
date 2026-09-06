"use client";

import React, { useState, useEffect, Suspense } from "react";
import Link from "next/link";
import Image from "next/image";
import {
  ArrowLeft,
  Send,
  CheckCircle2,
  PhoneCall,
  Mail,
} from "lucide-react";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { useSearchParams } from "next/navigation";

// Crisp SVG Icons
const WhatsAppIcon = ({ className = "w-4 h-4" }: { className?: string }) => (
  <svg viewBox="0 0 24 24" fill="currentColor" className={className}>
    <path d="M12.031 6.172c-3.181 0-5.767 2.586-5.768 5.766-.001 1.298.38 2.27 1.019 3.287l-.582 2.128 2.182-.573c.978.58 1.911.928 3.145.929 3.178 0 5.767-2.587 5.768-5.766.001-3.187-2.575-5.77-5.764-5.771zm3.392 8.244c-.144.405-.837.774-1.17.824-.299.045-.677.063-1.092-.069-.252-.08-.575-.187-.988-.365-1.739-.751-2.874-2.502-2.961-2.617-.087-.116-.708-.94-.708-1.793s.448-1.273.607-1.446c.159-.173.346-.217.462-.217l.332.006c.106.005.249-.04.39.298.144.347.491 1.2.534 1.287.043.087.072.188.014.304-.058.116-.087.188-.173.289l-.26.304c-.087.086-.177.18-.076.354.101.174.449.741.964 1.201.662.591 1.221.774 1.394.86s.275.072.376-.043c.101-.116.433-.506.549-.68.116-.173.231-.145.39-.087s1.011.477 1.184.564.289.13.332.202c.045.072.045.419-.099.824zm-3.423-14.416c-6.627 0-12 5.373-12 12 0 2.159.579 4.179 1.594 5.918l-1.594 5.826 5.987-1.57c1.677.922 3.605 1.45 5.657 1.45 6.627 0 12-5.373 12-12s-5.373-11.624-11.644-11.624z" />
  </svg>
);

const InstagramIcon = ({ className = "w-4 h-4" }: { className?: string }) => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
  >
    <rect width="20" height="20" x="2" y="2" rx="5" ry="5" />
    <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
    <line x1="17.5" x2="17.51" y1="6.5" y2="6.5" />
  </svg>
);

function ContactUsContent() {
  const searchParams = useSearchParams();
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    company: "",
    inquiryType: "bulk-honey",
    message: "",
  });

  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  useEffect(() => {
    const inquiry = searchParams?.get("inquiry");
    if (inquiry === "bulk" || inquiry === "bulk-honey") {
      setFormData((prev) => ({
        ...prev,
        inquiryType: "bulk-honey",
        message: "Hello VanBasket, I am interested in bulk orders of Raw Wild Forest Honey. Please share wholesale pricing.",
      }));
    } else if (inquiry === "white-label" || inquiry === "whitelabel") {
      setFormData((prev) => ({
        ...prev,
        inquiryType: "white-labelling",
        message: "Hello VanBasket, I am interested in White Labelling and Private Branding options.",
      }));
    } else if (inquiry === "jamun-pulp" || inquiry === "bulk-jamun-pulp") {
      setFormData((prev) => ({
        ...prev,
        inquiryType: "bulk-jamun-pulp",
        message: "Hello VanBasket, I am interested in commercial bulk orders of Pure Jamun Pulp.",
      }));
    } else if (inquiry === "hampers") {
      setFormData((prev) => ({
        ...prev,
        inquiryType: "gift-hampers",
        message: "Hello VanBasket, I am inquiring about corporate gifting hampers.",
      }));
    }
  }, [searchParams]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setErrorMsg(null);

    try {
      const response = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: formData.name,
          email: formData.email,
          phone: formData.phone,
          company: formData.company,
          quantity: formData.inquiryType,
          message: formData.message,
        }),
      });

      const result = await response.json();
      if (!response.ok) throw new Error(result.error || "Failed to submit message.");

      setIsSubmitted(true);
      setFormData({
        name: "",
        email: "",
        phone: "",
        company: "",
        inquiryType: "bulk-honey",
        message: "",
      });
      setTimeout(() => {
        setIsSubmitted(false);
      }, 6000);
    } catch (err: unknown) {
      const error = err as Error;
      setErrorMsg(error.message || "Failed to send inquiry. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="relative min-h-screen bg-[#faf8f5] text-brand-espresso flex flex-col justify-between font-sans">
      <Navbar />

      {/* ============================================================ */}
      {/* 1. HERO SECTION WITH IMAGE & CONCISE TITLE "Contact Us"       */}
      {/* ============================================================ */}
      <section className="relative w-full h-[240px] sm:h-[280px] md:h-[300px] overflow-hidden bg-[#1c120c] flex items-center justify-center text-center">
        {/* Hero Background Image */}
        <Image
          src="/assets/hero/contact-us/vanbasket-contact-us-hero.jpg"
          alt="VanBasket Contact Us Hero"
          fill
          priority
          sizes="100vw"
          className="object-cover opacity-65"
        />

        {/* Ambient Dark Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-black/30" />

        {/* Concise Hero Title */}
        <div className="relative z-10 px-6 pt-10">
          <h1 className="font-serif text-4xl sm:text-5xl md:text-6xl font-bold text-white tracking-tight">
            Contact Us
          </h1>
        </div>
      </section>

      {/* ============================================================ */}
      {/* 2. TWO-GRID LAYOUT: LEFT ONLY MAP, RIGHT PROFESSIONAL FORM     */}
      {/* ============================================================ */}
      <main className="flex-grow max-w-7xl mx-auto px-4 sm:px-6 md:px-12 py-8 sm:py-12 md:py-16 w-full">
        
        {/* Back Link */}
        <div className="mb-4 sm:mb-6">
          <Link
            href="/"
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-gray-500 hover:text-brand-espresso transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" /> Back to Home
          </Link>
        </div>

        {/* Two-Column Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 sm:gap-8 lg:gap-12 items-stretch">
          
          {/* ------------------------------------------------------------ */}
          {/* LEFT: ONLY MAP (Clean, edge-to-edge inside rounded card)     */}
          {/* ------------------------------------------------------------ */}
          <div className="relative w-full h-[280px] sm:h-[360px] lg:h-full lg:min-h-[520px] rounded-2xl overflow-hidden border border-gray-200 shadow-sm bg-gray-100">
            <iframe
              title="VanBasket Location Map - Balod, Chhattisgarh"
              src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d29852.04074249269!2d81.18193535460918!3d20.73031222407508!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3a2ec904090f4d93%3A0x3795d8d576228fc0!2sBalod%2C%20Chhattisgarh%20491226!5e0!3m2!1sen!2sin!4v1788725467487!5m2!1sen!2sin"
              className="w-full h-full border-0"
              allowFullScreen
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
            />
          </div>

          {/* ------------------------------------------------------------ */}
          {/* RIGHT: CLEAN & PROFESSIONAL FORM                            */}
          {/* ------------------------------------------------------------ */}
          <div className="bg-white rounded-2xl border border-gray-200 p-5 sm:p-8 md:p-10 shadow-sm flex flex-col justify-between">
            {isSubmitted ? (
              <div className="h-full flex flex-col items-center justify-center text-center p-6 space-y-3 min-h-[360px]">
                <CheckCircle2 className="w-12 h-12 text-emerald-600" />
                <h2 className="font-serif text-2xl font-bold text-gray-900">Message Sent</h2>
                <p className="text-sm text-gray-600 max-w-sm leading-relaxed">
                  Thank you for reaching out to VanBasket. Your inquiry has been routed to our team and we will reply within 24 business hours.
                </p>
                <div className="pt-2">
                  <button
                    type="button"
                    onClick={() => setIsSubmitted(false)}
                    className="px-5 py-2 rounded-lg bg-gray-900 text-white text-xs font-medium hover:bg-gray-800 transition-colors cursor-pointer"
                  >
                    Send Another Message
                  </button>
                </div>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="border-b border-gray-100 pb-3">
                  <h2 className="font-serif text-2xl font-bold text-gray-900">
                    Get in Touch
                  </h2>
                  <p className="text-xs text-gray-500 mt-1">
                    Fill out the form below and our team will get back to you shortly.
                  </p>
                </div>

                {errorMsg && (
                  <div className="p-3 bg-red-50 border border-red-200 text-red-700 text-xs rounded-lg" role="alert">
                    {errorMsg}
                  </div>
                )}

                {/* Full Name & Email */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                  <div className="space-y-1">
                    <label htmlFor="contact-name" className="text-xs font-medium text-gray-700">Full Name *</label>
                    <input
                      id="contact-name"
                      name="name"
                      type="text"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      required
                      className="w-full h-11 px-3.5 rounded-lg border border-gray-300 bg-white text-sm text-gray-900 placeholder:text-gray-400 focus:border-gray-900 focus:ring-1 focus:ring-gray-900 outline-none"
                      placeholder="Your name"
                    />
                  </div>
                  <div className="space-y-1">
                    <label htmlFor="contact-email" className="text-xs font-medium text-gray-700">Email Address *</label>
                    <input
                      id="contact-email"
                      name="email"
                      type="email"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      required
                      className="w-full h-11 px-3.5 rounded-lg border border-gray-300 bg-white text-sm text-gray-900 placeholder:text-gray-400 focus:border-gray-900 focus:ring-1 focus:ring-gray-900 outline-none"
                      placeholder="you@domain.com"
                    />
                  </div>
                </div>

                {/* Phone & Company */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                  <div className="space-y-1">
                    <label htmlFor="contact-phone" className="text-xs font-medium text-gray-700">Phone Number *</label>
                    <input
                      id="contact-phone"
                      name="phone"
                      type="tel"
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      required
                      className="w-full h-11 px-3.5 rounded-lg border border-gray-300 bg-white text-sm text-gray-900 placeholder:text-gray-400 focus:border-gray-900 focus:ring-1 focus:ring-gray-900 outline-none"
                      placeholder="+91 98765 43210"
                    />
                  </div>
                  <div className="space-y-1">
                    <label htmlFor="contact-company" className="text-xs font-medium text-gray-700">Company (Optional)</label>
                    <input
                      id="contact-company"
                      name="company"
                      type="text"
                      value={formData.company}
                      onChange={(e) => setFormData({ ...formData, company: e.target.value })}
                      className="w-full h-11 px-3.5 rounded-lg border border-gray-300 bg-white text-sm text-gray-900 placeholder:text-gray-400 focus:border-gray-900 focus:ring-1 focus:ring-gray-900 outline-none"
                      placeholder="Company name"
                    />
                  </div>
                </div>

                {/* Subject / Type Selection */}
                <div className="space-y-1">
                  <label htmlFor="contact-inquiryType" className="text-xs font-medium text-gray-700">Subject *</label>
                  <select
                    id="contact-inquiryType"
                    name="inquiryType"
                    value={formData.inquiryType}
                    onChange={(e) => setFormData({ ...formData, inquiryType: e.target.value })}
                    className="w-full h-11 px-3.5 rounded-lg border border-gray-300 bg-white text-sm text-gray-900 focus:border-gray-900 focus:ring-1 focus:ring-gray-900 outline-none cursor-pointer"
                  >
                    <option value="bulk-honey">Bulk Wild Forest Honey (25kg - 200kg Drums)</option>
                    <option value="bulk-jamun-pulp">Bulk Pure Jamun Pulp (Commercial Reserve)</option>
                    <option value="white-labelling">White Labelling & Private Label Packaging</option>
                    <option value="gift-hampers">Corporate Gifting & Luxury Hampers</option>
                    <option value="retail-order">Consumer Jar Order & Delivery</option>
                    <option value="other">General Inquiry</option>
                  </select>
                </div>

                {/* Message */}
                <div className="space-y-1">
                  <label htmlFor="contact-message" className="text-xs font-medium text-gray-700">Message *</label>
                  <textarea
                    id="contact-message"
                    name="message"
                    rows={4}
                    value={formData.message}
                    onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                    required
                    className="w-full p-3.5 rounded-lg border border-gray-300 bg-white text-sm text-gray-900 placeholder:text-gray-400 focus:border-gray-900 focus:ring-1 focus:ring-gray-900 outline-none resize-none"
                    placeholder="Describe your inquiry or order requirements..."
                  />
                </div>

                {/* Clean Professional Flat Button */}
                <div className="pt-2">
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full h-12 rounded-lg bg-gray-900 hover:bg-gray-800 text-white text-sm font-semibold transition-colors flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                  >
                    {isSubmitting ? (
                      "Sending..."
                    ) : (
                      <>
                        <Send className="w-4 h-4" /> Submit Inquiry
                      </>
                    )}
                  </button>
                </div>

                {/* Small Social Button Icons (Instagram, Mail, WhatsApp, Call) */}
                <div className="pt-4 border-t border-gray-100 flex items-center justify-between">
                  <span className="text-xs text-gray-500 font-medium">
                    Quick connect:
                  </span>

                  <div className="flex items-center gap-2">
                    {/* WhatsApp */}
                    <a
                      href="https://wa.me/917724969017?text=Hello%20VanBasket"
                      target="_blank"
                      rel="noopener noreferrer"
                      title="WhatsApp"
                      className="w-8 h-8 rounded-lg bg-gray-100 hover:bg-emerald-600 hover:text-white text-gray-600 flex items-center justify-center transition-colors"
                    >
                      <WhatsAppIcon className="w-4 h-4" />
                    </a>

                    {/* Call */}
                    <a
                      href="tel:+917724969017"
                      title="Call"
                      className="w-8 h-8 rounded-lg bg-gray-100 hover:bg-gray-900 hover:text-white text-gray-600 flex items-center justify-center transition-colors"
                    >
                      <PhoneCall className="w-4 h-4" />
                    </a>

                    {/* Mail */}
                    <a
                      href="mailto:vanbasket526@gmail.com"
                      title="Email"
                      className="w-8 h-8 rounded-lg bg-gray-100 hover:bg-gray-900 hover:text-white text-gray-600 flex items-center justify-center transition-colors"
                    >
                      <Mail className="w-4 h-4" />
                    </a>

                    {/* Instagram */}
                    <a
                      href="https://instagram.com/vanbasket"
                      target="_blank"
                      rel="noopener noreferrer"
                      title="Instagram"
                      className="w-8 h-8 rounded-lg bg-gray-100 hover:bg-pink-600 hover:text-white text-gray-600 flex items-center justify-center transition-colors"
                    >
                      <InstagramIcon className="w-4 h-4" />
                    </a>
                  </div>
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
    <Suspense
      fallback={
        <div className="min-h-screen bg-[#faf8f5] flex items-center justify-center font-sans">
          <p className="text-xs uppercase tracking-widest text-gray-400 font-semibold">
            Loading...
          </p>
        </div>
      }
    >
      <ContactUsContent />
    </Suspense>
  );
}
