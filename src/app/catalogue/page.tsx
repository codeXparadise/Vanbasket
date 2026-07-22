"use client";

import React, { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { CartDrawer } from "@/components/CartDrawer";
import { useCart } from "@/context/CartContext";
import { Check, Mail, Plus } from "lucide-react";

interface VariantCard {
  id: string;
  size_label: string;
  price: number;
  stock_qty: number;
  is_active: boolean;
}

interface ProductCard {
  id: string;
  slug: string;
  name: string;
  description: string;
  image: string;
  variants: VariantCard[];
  inquiryOnly?: boolean;
  tags?: string[];
}

const staticProducts: ProductCard[] = [
  {
    id: "raw-wildflower-honey",
    slug: "raw-wildflower-honey",
    name: "Raw Wildflower Honey",
    description: "Apis dorsata raw wild honey gathered from wild tree hives in the deep forests of Chhattisgarh. Rich in antioxidants and natural pollen.",
    image: "/assets/product-1.jpg",
    tags: ["100% Pure Sourced", "Forest Harvested"],
    variants: [
      { id: "a1111111-1111-1111-1111-111111111111", size_label: "250g", price: 350, stock_qty: 99, is_active: true },
      { id: "b2222222-2222-2222-2222-222222222222", size_label: "500g", price: 699, stock_qty: 99, is_active: true },
    ],
  },
  {
    id: "bulk-honey",
    slug: "bulk-honey",
    name: "Bulk Order of Honey",
    description: "Ethically gathered pure forest honey in bulk quantities. Ideal for retail brands, distribution partners, and wholesale commercial needs.",
    image: "/assets/bulk-honey-new.jpg",
    inquiryOnly: true,
    tags: ["B2B wholesale", "Bulk Quantities"],
    variants: [],
  },
  {
    id: "jamun-pulp",
    slug: "jamun-pulp",
    name: "Jamun Pulp",
    description: "Seasonal natural jamun pulp, carefully processed to preserve taste, nutrients, and health properties. Available on direct business inquiry.",
    image: "/assets/post_1.jpg",
    inquiryOnly: true,
    tags: ["B2B wholesale", "Seasonal Harvest"],
    variants: [],
  },
];

export default function CataloguePage() {
  const { addToCartBatch } = useCart();
  const [addedItems, setAddedItems] = useState<Record<string, boolean>>({});

  const handleAddToCart = (product: ProductCard, variant: VariantCard) => {
    setAddedItems((prev) => ({ ...prev, [variant.id]: true }));
    addToCartBatch(
      {
        id: variant.id,
        name: product.name,
        variant: variant.size_label,
        price: variant.price,
        image: product.image,
      },
      1
    );
    setTimeout(() => {
      setAddedItems((prev) => ({ ...prev, [variant.id]: false }));
    }, 1500);
  };

  return (
    <div className="relative min-h-screen bg-brand-cream-light text-brand-espresso flex flex-col justify-between">
      <Navbar />
      <main className="flex-grow pt-28 pb-24 px-6 md:px-12 max-w-7xl mx-auto w-full">
        {/* Banner Section */}
        <div className="relative mb-14 min-h-[300px] md:min-h-[380px] overflow-hidden bg-brand-espresso text-brand-cream-light flex items-end p-8 md:p-14 rounded-[2.5rem]">
          <Image src="/assets/hero-bg.png" alt="Wild forest honey" fill sizes="100vw" className="object-cover opacity-70" />
          <div className="absolute inset-0 bg-gradient-to-r from-brand-espresso/90 to-transparent" />
          <div className="relative z-10 space-y-4 max-w-xl">
            <span className="text-[10px] font-sans font-bold uppercase tracking-[0.3em] text-brand-terracotta">van basket catalogue</span>
            <h1 className="font-serif text-4xl md:text-6xl font-black tracking-tight leading-none text-brand-cream-light">Pure & Raw.</h1>
            <p className="font-sans text-xs md:text-sm text-brand-cream-light/75 font-light leading-relaxed max-w-md">
              Ethically sourced forest products from organic hives. Fully static listing for lightning-fast performance.
            </p>
          </div>
        </div>

        {/* 3 Grid Layout */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {staticProducts.map((item) => (
            <div key={item.id} className="bg-white border border-brand-honey/15 rounded-[2.5rem] overflow-hidden p-6 shadow-sm flex flex-col justify-between">
              <div className="space-y-6">
                {/* Clickable Image to Redirect to Wild Honey first variant / detail view page */}
                <Link 
                  href={item.inquiryOnly ? `/contact-us?inquiry=${item.id}` : `/catalogue/${item.variants[0]?.id || "a1111111-1111-1111-1111-111111111111"}`}
                  className="relative block aspect-square rounded-[1.8rem] overflow-hidden bg-brand-cream-light border border-brand-cream-dark/30 group cursor-pointer"
                >
                  <Image 
                    src={item.image} 
                    alt={item.name} 
                    fill 
                    sizes="(max-w-768px) 100vw, 350px" 
                    className="object-contain p-6 transition-transform duration-500 group-hover:scale-105" 
                  />
                </Link>

                {/* Info */}
                <div className="space-y-3">
                  <div className="flex flex-wrap gap-2">
                    {item.tags?.map((tag) => (
                      <span key={tag} className="text-[8px] font-bold uppercase tracking-wider bg-brand-honey/10 text-brand-honey px-2.5 py-1 rounded-full">
                        {tag}
                      </span>
                    ))}
                  </div>
                  <Link 
                    href={item.inquiryOnly ? `/contact-us?inquiry=${item.id}` : `/catalogue/${item.variants[0]?.id || "a1111111-1111-1111-1111-111111111111"}`}
                    className="block hover:text-brand-honey transition"
                  >
                    <h3 className="font-serif font-black text-2xl text-brand-espresso">{item.name}</h3>
                  </Link>
                  <p className="font-sans text-[12px] text-brand-espresso-muted leading-relaxed font-light">{item.description}</p>
                </div>
              </div>

              {/* Interaction Details */}
              <div className="mt-8 pt-6 border-t border-brand-cream-dark/30">
                {item.inquiryOnly ? (
                  <Link 
                    href={`/contact-us?inquiry=${item.id}`} 
                    className="w-full inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-brand-honey hover:bg-brand-honey-dark text-white px-5 text-[10px] font-sans font-bold uppercase tracking-widest transition"
                  >
                    <Mail className="w-3.5 h-3.5" /> Inquiry for details
                  </Link>
                ) : (
                  <div className="space-y-3">
                    <p className="text-[9px] font-bold uppercase tracking-widest text-brand-espresso/60">Available packages</p>
                    <div className="space-y-2">
                      {item.variants.map((variant) => {
                        const isAdded = addedItems[variant.id] || false;
                        return (
                          <div key={variant.id} className="flex items-center justify-between gap-3 rounded-2xl border border-brand-cream-dark/25 bg-brand-cream-light/35 px-4 py-2.5">
                            <div>
                              <p className="font-semibold text-xs text-brand-espresso">{variant.size_label}</p>
                              <p className="text-[10px] text-brand-espresso/60">Rs. {Number(variant.price).toFixed(2)}</p>
                            </div>
                            <div className="flex items-center gap-1.5">
                              <Link href={`/catalogue/${variant.id}`} className="h-9 px-3 rounded-lg border border-brand-espresso text-brand-espresso text-[9px] font-bold uppercase tracking-widest flex items-center justify-center transition hover:bg-brand-espresso hover:text-white">
                                View
                              </Link>
                              <button
                                onClick={() => handleAddToCart(item, variant)}
                                disabled={isAdded}
                                className={`h-9 px-3 rounded-lg text-[9px] font-bold uppercase tracking-widest flex items-center justify-center gap-1.5 transition ${
                                  isAdded ? "bg-brand-forest text-brand-cream-light" : "bg-brand-espresso text-brand-cream-light hover:bg-brand-espresso/90"
                                }`}
                              >
                                {isAdded ? <><Check className="w-3 h-3" /> Added</> : <><Plus className="w-3 h-3" /> Add</>}
                              </button>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </main>
      <CartDrawer />
      <Footer />
    </div>
  );
}
