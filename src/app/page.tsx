"use client";

import React, { useEffect, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import dynamic from "next/dynamic";
import { Star, Quote, Play, ChevronRight, MessageSquare, Phone, Mail, ArrowRight, ShieldCheck, Sparkles, Package, Tag, Layers, CheckCircle2 } from "lucide-react";
import { Navbar } from "@/components/Navbar";
import { Hero } from "@/components/Hero";
import { ProductDetail } from "@/components/ProductDetail";
import { TrustStrip } from "@/components/TrustStrip";
import { Footer } from "@/components/Footer";

const GeoFaqSection = dynamic(
  () => import("@/components/GeoFaqSection").then((mod) => mod.GeoFaqSection),
  { ssr: true }
);

// Premium Review Testimonials
const customerReviews = [
  {
    name: "Aarav Sharma",
    location: "Mumbai, MH",
    rating: 5,
    date: "June 12, 2026",
    text: "The taste is incredibly deep and multi-floral. Unlike normal store-bought honey, this wild honey has a rustic aroma that proves its authentic forest origin.",
  },
  {
    name: "Priyanka Sen",
    location: "Kolkata, WB",
    rating: 5,
    date: "May 28, 2026",
    text: "Excellent packaging and super fast delivery. The family jar is absolute perfection. My kids love it with their morning milk.",
  },
  {
    name: "Vikram Reddy",
    location: "Bangalore, KA",
    rating: 5,
    date: "April 15, 2026",
    text: "I was looking for genuine Apis dorsata honey for ayurvedic formulations. Van Basket's harvest has exceeded my expectations. Raw, unfiltered.",
  },
];

// Instagram Lifestyle Creative Images for the horizontal gallery




// Reels Data (9:16 Aspect Ratio)


export default function Home() {











  return (
    <div className="relative min-h-screen bg-brand-cream-light text-brand-espresso flex flex-col justify-between">
      {/* Global Navigation */}
      <Navbar />

      {/* Main Content Layout */}
      <main className="flex-grow">
        
        {/* Hero Banner Section */}
        <Hero />

        {/* Collection Section */}
        <section className="py-16 bg-brand-cream-warm">
          <div className="mx-auto max-w-7xl px-6 md:px-12">
            <div className="text-center mb-12">
              <h2 className="font-serif text-4xl md:text-5xl font-bold text-brand-espresso">Our Collection</h2>
              <p className="mt-4 text-brand-espresso/80 max-w-2xl mx-auto font-sans">
                Pure, authentic forest products harvested sustainably by indigenous communities.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {[
                { title: "Wild Forest Honey", image: "/assets/product-1.jpg", link: "/catalogue" },
                { title: "Jamun Pulp", image: "/assets/jamun-pulp-bulk.jpg", link: "/catalogue" },
                { title: "Gift Hampers", image: "/assets/post_1.jpg", link: "/catalogue" },
                { title: "Bulk & B2B", image: "/assets/bulk-honey-order.jpg", link: "/contact-us?inquiry=bulk" }
              ].map((item, idx) => (
                <Link key={idx} href={item.link} className="group block relative aspect-[4/5] overflow-hidden rounded-2xl">
                  <Image
                    src={item.image}
                    alt={item.title}
                    fill
                    className="object-cover transition-transform duration-700 group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-brand-espresso/80 via-brand-espresso/20 to-transparent opacity-80 group-hover:opacity-90 transition-opacity" />
                  <div className="absolute bottom-6 left-6 right-6">
                    <h3 className="font-serif text-xl font-bold text-brand-cream-light">{item.title}</h3>
                    <div className="mt-2 flex items-center text-xs font-bold uppercase tracking-wider text-brand-honey opacity-0 group-hover:opacity-100 transition-opacity transform translate-y-2 group-hover:translate-y-0 duration-300">
                      Explore <ArrowRight className="ml-1 w-3 h-3" />
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>

        {/* Specifications Strip */}
        <TrustStrip />






        {/* Specifications Grids Section */}
        <TrustStrip />

        {/* B2B Commercial, Bulk Supply & White-Labelling Section */}
        <section className="py-20 md:py-28 bg-gradient-to-b from-brand-cream-light via-brand-cream-warm/30 to-brand-cream-light border-b border-brand-cream-dark/40 font-sans text-brand-espresso">
          <div className="mx-auto max-w-7xl px-6 md:px-12 space-y-12">
            
            <div className="text-center max-w-3xl mx-auto space-y-3">
              <span className="inline-flex items-center gap-2 rounded-full bg-brand-honey/15 border border-brand-honey/30 px-3.5 py-1 text-[10px] font-bold uppercase tracking-[0.25em] text-brand-honey">
                <Sparkles className="w-3.5 h-3.5" /> Commercial & B2B Solutions
              </span>
              <h2 className="font-serif text-3xl md:text-5xl font-black text-brand-espresso leading-tight">
                Beyond Retail Jars: <br className="hidden sm:inline" />
                <span className="text-brand-honey">Bulk Orders & White Labelling</span>
              </h2>
              <p className="text-xs sm:text-sm text-brand-espresso-muted font-light leading-relaxed max-w-2xl mx-auto">
                We don’t just pack consumer jars. Van Basket is a trusted B2B forest produce partner supplying raw forest honey in bulk, pure Jamun Pulps, and private label packaging for wellness brands, exporters, and corporate gifting.
              </p>
            </div>

            {/* 4 Feature Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {/* Card 1: Bulk Honey */}
              <div className="bg-white border border-brand-cream-dark/60 rounded-3xl p-6 shadow-sm hover:shadow-md transition-shadow space-y-4">
                <div className="w-12 h-12 rounded-2xl bg-amber-100 text-amber-800 flex items-center justify-center font-bold">
                  <Package className="w-6 h-6 text-brand-honey" />
                </div>
                <div>
                  <h3 className="font-serif font-black text-lg text-brand-espresso">Bulk Forest Honey</h3>
                  <p className="text-xs text-brand-espresso-muted mt-2 leading-relaxed">
                    Available in 25kg, 50kg, and 200kg food-grade pails & drums. 100% pure Apis dorsata honey with laboratory purity certificate.
                  </p>
                </div>
                <div className="pt-2 text-[11px] font-bold text-brand-honey flex items-center gap-1">
                  <span>From 25kg to Multi-Tons</span>
                </div>
              </div>

              {/* Card 2: Pure Jamun Pulp */}
              <div className="bg-white border border-brand-cream-dark/60 rounded-3xl p-6 shadow-sm hover:shadow-md transition-shadow space-y-4">
                <div className="w-12 h-12 rounded-2xl bg-purple-100 text-purple-800 flex items-center justify-center font-bold">
                  <Layers className="w-6 h-6 text-purple-700" />
                </div>
                <div>
                  <h3 className="font-serif font-black text-lg text-brand-espresso">Pure Jamun Pulps</h3>
                  <p className="text-xs text-brand-espresso-muted mt-2 leading-relaxed">
                    Seedless, thick, 100% natural seasonal Jamun pulp for health juice brands, ayurvedic wellness formulations, & food processing.
                  </p>
                </div>
                <div className="pt-2 text-[11px] font-bold text-purple-700 flex items-center gap-1">
                  <span>Commercial Beverage Standard</span>
                </div>
              </div>

              {/* Card 3: White Labelling */}
              <div className="bg-white border border-brand-cream-dark/60 rounded-3xl p-6 shadow-sm hover:shadow-md transition-shadow space-y-4">
                <div className="w-12 h-12 rounded-2xl bg-emerald-100 text-emerald-800 flex items-center justify-center font-bold">
                  <Tag className="w-6 h-6 text-emerald-700" />
                </div>
                <div>
                  <h3 className="font-serif font-black text-lg text-brand-espresso">White Labelling</h3>
                  <p className="text-xs text-brand-espresso-muted mt-2 leading-relaxed">
                    Turnkey private label packaging in UV dark glass jars, gold-foil custom labels, & branded gift boxes for luxury retail & export.
                  </p>
                </div>
                <div className="pt-2 text-[11px] font-bold text-emerald-700 flex items-center gap-1">
                  <span>Custom Luxury Branding</span>
                </div>
              </div>

              {/* Card 4: Direct Co-op Sourcing */}
              <div className="bg-white border border-brand-cream-dark/60 rounded-3xl p-6 shadow-sm hover:shadow-md transition-shadow space-y-4">
                <div className="w-12 h-12 rounded-2xl bg-amber-100 text-amber-800 flex items-center justify-center font-bold">
                  <ShieldCheck className="w-6 h-6 text-amber-700" />
                </div>
                <div>
                  <h3 className="font-serif font-black text-lg text-brand-espresso">Direct Forest Co-op</h3>
                  <p className="text-xs text-brand-espresso-muted mt-2 leading-relaxed">
                    Fair-trade, sustainable harvesting directly from Chhattisgarh forest tribal communities with full batch provenance tracking.
                  </p>
                </div>
                <div className="pt-2 text-[11px] font-bold text-amber-800 flex items-center gap-1">
                  <span>100% Traceable Origin</span>
                </div>
              </div>
            </div>

            {/* B2B Action Banner */}
            <div className="bg-brand-espresso text-white rounded-3xl p-6 md:p-8 flex flex-col md:flex-row items-center justify-between gap-6 shadow-lg">
              <div>
                <h4 className="font-serif text-xl font-bold text-brand-cream-light">
                  Ready for B2B Supply or Private Label Samples?
                </h4>
                <p className="text-xs text-brand-cream-light/75 mt-1 font-light">
                  Get custom quotes for bulk honey, seedless Jamun pulp, or turnkey white labelling within 2 hours.
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-3 shrink-0">
                <Link
                  href="/contact-us?inquiry=bulk"
                  className="px-5 py-3 rounded-xl bg-brand-honey hover:bg-brand-honey-dark text-brand-espresso font-bold text-xs uppercase tracking-wider transition shadow-sm flex items-center gap-2"
                >
                  <Mail className="w-4 h-4" /> Inquire Bulk Order
                </Link>
                <Link
                  href="/contact-us?inquiry=whitelabel"
                  className="px-5 py-3 rounded-xl bg-white/10 hover:bg-white/20 text-white border border-white/20 font-bold text-xs uppercase tracking-wider transition flex items-center gap-2"
                >
                  <Tag className="w-4 h-4 text-brand-honey" /> White Label Proposal
                </Link>
                <a
                  href="https://wa.me/917724969017?text=Hello%20Van%20Basket,%20I%20want%20to%20inquire%20about%20Bulk%20Orders%20and%20White%20Labelling"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-4 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs uppercase tracking-wider transition flex items-center gap-2"
                >
                  <MessageSquare className="w-4 h-4" /> B2B WhatsApp
                </a>
              </div>
            </div>

          </div>
        </section>


        {/* Product Listing Section */}
        <section id="shop" className="py-20 bg-brand-cream-light border-b border-brand-cream-dark/40">
          <div className="mx-auto max-w-7xl px-6 md:px-12">
            <div className="text-center mb-16">
              <h2 className="font-serif text-4xl md:text-5xl font-bold text-brand-espresso">Our Products</h2>
              <p className="mt-4 text-brand-espresso/80 max-w-2xl mx-auto font-sans">
                Directly from the wild forests to your home.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 lg:gap-12">
              {[
                { title: "Wild Forest Honey", size: "500g", price: "₹599", img: "/assets/product-1.jpg" },
                { title: "Wild Forest Honey", size: "250g", price: "₹350", img: "/assets/product-2.jpg" },
                { title: "Wild Forest Honey", size: "1kg", price: "₹xxx", img: "/assets/product-3.jpg" },
                { title: "Jamun Pulp", size: "1 kg", price: "₹xxx", img: "/assets/jamun-pulp-bulk.jpg" },
                { title: "Gift Hampers", size: "Assorted", price: "₹799", img: "/assets/post_1.jpg" },
                { title: "Raw Wild Forest Honey", size: "Bulk 45 kg (B2B)", price: "Inquire", img: "/assets/bulk-honey-order.jpg" },
                { title: "Jamun Pulp", size: "Bulk 25 kg (B2B)", price: "Inquire", img: "/assets/jamun-pulp-bulk.jpg" }
              ].map((prod, idx) => (
                <Link key={idx} href="/catalogue" className="group flex flex-col bg-white rounded-2xl border border-brand-cream-dark/40 overflow-hidden shadow-sm hover:shadow-lg transition-all duration-300">
                  <div className="relative aspect-square w-full bg-brand-cream-warm/20 p-6">
                    <Image
                      src={prod.img}
                      alt={prod.title}
                      fill
                      className="object-contain p-8 transition-transform duration-700 group-hover:scale-105"
                    />
                  </div>
                  <div className="p-6 flex flex-col flex-grow">
                    <div className="flex justify-between items-start mb-2">
                      <h3 className="font-serif text-xl font-bold text-brand-espresso">{prod.title}</h3>
                      <span className="font-sans font-bold text-brand-honey">{prod.price}</span>
                    </div>
                    <p className="font-sans text-xs text-brand-espresso/60 mb-6">{prod.size}</p>
                    <div className="mt-auto pt-4 border-t border-brand-cream-dark/30">
                      <span className="inline-flex items-center text-xs font-bold uppercase tracking-widest text-brand-espresso group-hover:text-brand-honey transition-colors">
                        {prod.price === "Inquire" ? "Contact Us" : "View Details"} <ArrowRight className="ml-2 w-3 h-3" />
                      </span>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>

        {/* Honey Process Video & Certification Marquee */}
        <section className="py-20 bg-brand-espresso text-brand-cream-light overflow-hidden">
          <div className="mx-auto max-w-5xl px-6 md:px-12 mb-16">
            <div className="relative aspect-video rounded-[2rem] overflow-hidden bg-brand-espresso-muted border border-brand-cream-light/20 shadow-2xl">
              {/* Placeholder Video - Update src when available */}
              <div className="absolute inset-0 flex items-center justify-center flex-col text-brand-cream-light/60">
                <Play className="w-16 h-16 mb-4 opacity-50" />
                <span className="font-sans text-xs uppercase tracking-widest font-bold">Process Video Coming Soon</span>
              </div>
            </div>
          </div>

          {/* Certification Marquee */}
          <div className="relative w-full flex items-center overflow-x-hidden py-6 border-y border-brand-cream-light/20 bg-brand-espresso/80">
            <div className="animate-marquee flex w-max gap-16 whitespace-nowrap text-sm font-bold uppercase tracking-[0.2em] text-brand-honey">
              {[
                "FSSAI Certified",
                "AIDPP Certified",
                "NMR Tested",
                "Glycemic Index Tested",
                "Periodic Quality Tested"
              ].map((cert, index) => (
                <span key={index} className="flex items-center gap-16">
                  {cert}
                  <ShieldCheck className="w-5 h-5 text-brand-cream-light opacity-50" />
                </span>
              ))}
              {[
                "FSSAI Certified",
                "AIDPP Certified",
                "NMR Tested",
                "Glycemic Index Tested",
                "Periodic Quality Tested"
              ].map((cert, index) => (
                <span key={`duplicate-${index}`} className="flex items-center gap-16">
                  {cert}
                  <ShieldCheck className="w-5 h-5 text-brand-cream-light opacity-50" />
                </span>
              ))}
            </div>
          </div>
        </section>

        {/* Our Process - Timeline Section */}
        <section className="py-24 bg-brand-cream-light font-sans relative">
          <div className="text-center max-w-2xl mx-auto space-y-4 mb-20 px-6">
            <h2 className="font-serif text-4xl md:text-5xl font-black text-brand-forest-light">
              Our Process
            </h2>
            <p className="text-sm text-brand-espresso font-medium">
              How we bring you the finest honey
            </p>
          </div>

          <div className="relative max-w-5xl mx-auto px-6">
            {/* Center Dotted Line */}
            <div className="absolute left-[30px] md:left-1/2 top-0 bottom-0 w-0 border-l-2 border-dashed border-brand-espresso/30 md:-translate-x-1/2 z-0" />

            <div className="space-y-16">
              {[
                {
                  step: "STEP 1",
                  title: "Locate the Hive",
                  desc: "We observe the bees and take notes to locate the exact location of wild, free-range hives.",
                  img: "/assets/post_1.jpg",
                  align: "left"
                },
                {
                  step: "STEP 2",
                  title: "Harvesting",
                  desc: "Honeycombs are collected using traditional methods without harming the bees, using bee-friendly resources.",
                  img: "/assets/SaveInta.com_693245979_17863277364686116_710550687666494002_n.jpg",
                  align: "right"
                },
                {
                  step: "STEP 3",
                  title: "Filtration (TBC)",
                  desc: "Our pure honey undergoes a simple, cold-filtration process to remove debris while keeping pollen and nutrients intact.",
                  img: "/assets/SaveInta.com_696917302_18056116802539579_2100519194037541284_n.jpg",
                  align: "left"
                },
                {
                  step: "STEP 4",
                  title: "Packaging (TBC)",
                  desc: "Carefully poured into glass jars to preserve the natural enzymes and authentic forest aroma.",
                  img: "/assets/hero-home-new.jpg",
                  align: "right"
                }
              ].map((item, idx) => (
                <div key={idx} className={`relative flex items-center justify-between md:justify-normal w-full ${item.align === 'right' ? 'md:flex-row-reverse' : ''}`}>

                  {/* Timeline Dot */}
                  <div className="absolute left-[24px] md:left-1/2 w-3 h-3 bg-brand-cream-light border-[2px] border-brand-espresso rounded-full md:-translate-x-1/2 z-10" />

                  {/* Spacer for empty side on desktop */}
                  <div className="hidden md:block w-5/12" />

                  {/* Content Card */}
                  <div className="w-[calc(100%-60px)] ml-[60px] md:ml-0 md:w-5/12">
                    <div className="bg-[#FAF8ED] p-6 rounded-[2rem] shadow-sm border border-brand-cream-dark/30 flex flex-col sm:flex-row items-center gap-6">
                      <div className="relative w-full sm:w-1/2 aspect-square rounded-2xl overflow-hidden shrink-0">
                        <Image src={item.img} alt={item.title} fill className="object-cover" />
                      </div>
                      <div className="text-left space-y-2 sm:w-1/2">
                        <span className="text-[10px] font-bold text-brand-honey tracking-widest">{item.step}</span>
                        <h3 className="font-serif text-xl font-bold text-brand-forest-light">{item.title}</h3>
                        <p className="text-xs text-brand-espresso/70 leading-relaxed font-medium">{item.desc}</p>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Honey Harvesting Gallery */}
        <section className="py-20 bg-brand-cream-warm/30 border-y border-brand-cream-dark/30">
          <div className="max-w-7xl mx-auto px-6 md:px-12 mb-10 text-center">
            <h2 className="font-serif text-3xl md:text-4xl font-bold text-brand-espresso">Harvesting Traditions</h2>
          </div>
          <div className="flex overflow-x-auto pb-8 snap-x snap-mandatory hide-scrollbar gap-4 px-6 md:px-12">
            {[
              "/assets/post_1.jpg",
              "/assets/SaveInta.com_671236435_18088753934113038_2584356244027066964_n.jpg",
              "/assets/SaveInta.com_694298566_18088759847113038_4397863112803506586_n.jpg",
              "/assets/SaveInta.com_696917302_18056116802539579_2100519194037541284_n.jpg",
              "/assets/SaveInta.com_701696506_17864127021686116_7189681978084491738_n.jpg",
            ].map((img, idx) => (
              <div key={idx} className="shrink-0 snap-center relative w-72 md:w-96 aspect-square rounded-3xl overflow-hidden border border-brand-cream-dark/40 shadow-sm">
                <Image src={img} alt="Harvesting Gallery" fill className="object-cover" />
              </div>
            ))}
          </div>
        </section>

        {/* B2B Corner */}
        <section className="py-20 md:py-28 bg-brand-forest-light text-brand-cream-light relative overflow-hidden">
          <div className="absolute inset-0 bg-[url('/assets/bulk-honey-order.jpg')] opacity-10 bg-cover bg-center mix-blend-overlay" />
          <div className="relative mx-auto max-w-7xl px-6 md:px-12 grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div className="space-y-8 text-left">
              <span className="inline-block px-3 py-1 bg-brand-honey/20 border border-brand-honey/40 rounded-full text-[10px] uppercase font-bold tracking-widest text-brand-honey">
                Commercial Division
              </span>
              <h2 className="font-serif text-4xl md:text-5xl font-black">B2B Corner</h2>
              <p className="font-sans text-sm md:text-base opacity-90 leading-relaxed max-w-md">
                Partner with VanBasket for authentic, single-origin forest products scaled for commercial needs.
              </p>
              <ul className="space-y-4 font-sans text-sm">
                <li className="flex items-center gap-3"><CheckCircle2 className="w-5 h-5 text-brand-honey" /> Jamun Pulp Manufacturing</li>
                <li className="flex items-center gap-3"><CheckCircle2 className="w-5 h-5 text-brand-honey" /> Jamun Pulp Bulk Supply</li>
                <li className="flex items-center gap-3"><CheckCircle2 className="w-5 h-5 text-brand-honey" /> Wild Forest Honey White Labelling</li>
                <li className="flex items-center gap-3"><CheckCircle2 className="w-5 h-5 text-brand-honey" /> Raw Forest Honey Bulk Supply</li>
              </ul>
              <Link
                href="/contact-us?inquiry=b2b"
                className="inline-flex h-14 items-center justify-center rounded-full bg-brand-honey px-8 text-xs font-bold uppercase tracking-[0.18em] text-brand-espresso transition-all hover:bg-brand-cream-light mt-4"
              >
                Inquire Now <ArrowRight className="ml-2 w-4 h-4" />
              </Link>
            </div>

            <div className="grid grid-cols-2 gap-4">
               <div className="relative aspect-square rounded-2xl overflow-hidden border border-brand-cream-light/20"><Image src="/assets/jamun-pulp-bulk.jpg" alt="Jamun Pulp" fill className="object-cover" /></div>
               <div className="relative aspect-square rounded-2xl overflow-hidden border border-brand-cream-light/20 mt-8"><Image src="/assets/bulk-honey-order.jpg" alt="Bulk Honey" fill className="object-cover" /></div>
            </div>
          </div>
        </section>







        {/* Customer Testimonials Section */}
        <section className="py-20 md:py-28 bg-brand-cream-warm/20 border-b border-brand-cream-dark/30 font-sans">
          <div className="mx-auto max-w-7xl px-6 md:px-12 space-y-12">
            
            <div className="text-center max-w-2xl mx-auto space-y-3">
              <span className="text-[10px] font-sans font-bold uppercase tracking-[0.3em] text-brand-terracotta block">
                Verified Customer Voices
              </span>
              <h2 className="font-serif text-3xl md:text-5xl font-black text-brand-espresso">
                Loved across India.
              </h2>
              <p className="text-xs sm:text-sm text-brand-espresso-muted font-light">
                Discover authentic feedback from health enthusiasts, ayurvedic practitioners, and families who enjoy our pure wild honey daily.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {customerReviews.map((rev, index) => (
                <div
                  key={index}
                  className="bg-white border border-brand-cream-dark/60 rounded-3xl p-8 shadow-sm flex flex-col justify-between space-y-6 hover:shadow-md transition-shadow"
                >
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1 text-brand-honey">
                        {[...Array(rev.rating)].map((_, i) => (
                          <Star key={i} className="w-4 h-4 fill-brand-honey text-brand-honey" />
                        ))}
                      </div>
                      <Quote className="w-6 h-6 text-brand-cream-dark/40" />
                    </div>
                    <p className="text-xs sm:text-sm text-brand-espresso leading-relaxed italic font-serif">
                      "{rev.text}"
                    </p>
                  </div>

                  <div className="pt-4 border-t border-brand-cream-dark/30 flex items-center justify-between text-xs">
                    <div>
                      <h4 className="font-bold text-brand-espresso">{rev.name}</h4>
                      <span className="text-[10px] text-brand-espresso-muted">{rev.location}</span>
                    </div>
                    <span className="text-[9px] text-brand-cream-dark font-sans">{rev.date}</span>
                  </div>
                </div>
              ))}
            </div>

          </div>
        </section>



        {/* Frequently Asked Questions */}
        <GeoFaqSection />

      </main>

      {/* Footer */}
      <Footer />
    </div>
  );
}
