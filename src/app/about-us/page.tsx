"use client";

import Image from "next/image";
import Link from "next/link";
import { ArrowRight, Leaf } from "lucide-react";
import { Navbar } from "@/components/Navbar";
import { TrustStrip } from "@/components/TrustStrip";
import { Footer } from "@/components/Footer";

const chapters = [
  { number: "01", title: "It begins in the canopy", text: "In the deep forests of Chhattisgarh, Apis dorsata bees build wild hives high above the forest floor. Their honey carries the character of many medicinal blossoms, not a single cultivated crop.", image: "/assets/post_1.jpg" },
  { number: "02", title: "Harvested with restraint", text: "Experienced local tribal communities read the forest, follow traditional methods and gather only what can be taken without compromising the hive. The forest remains the first customer.", image: "/assets/SaveInta.com_693245979_17863277364686116_710550687666494002_n.jpg" },
  { number: "03", title: "Brought to your table", text: "We bottle the harvest as it is: raw, unfiltered and free from artificial sweeteners, syrups, preservatives and chemical feed. A small-batch pantry staple with a long natural story.", image: "/assets/product-jar-2.png" },
];

export default function AboutUsPage() {
  return <div className="min-h-screen bg-brand-cream-light text-brand-espresso"><Navbar /><main>
    <section className="relative min-h-[70svh] flex items-end overflow-hidden bg-brand-espresso text-white">
      <Image src="/assets/hero-about-new.jpg" alt="Forest honey harvest" fill sizes="100vw" className="object-cover" />
      <div className="absolute inset-0 bg-gradient-to-t from-brand-espresso/90 via-brand-espresso/25 to-transparent" />
      <div className="relative z-10 max-w-7xl mx-auto w-full px-6 md:px-12 pb-14 md:pb-20">
        <p className="eyebrow text-brand-honey">Our heritage</p>
        <h1 className="font-serif text-5xl md:text-8xl font-black leading-[.9] max-w-4xl">A jar with a <em className="font-normal text-brand-honey">wild</em> beginning.</h1>
        <p className="mt-6 max-w-lg text-sm md:text-base text-white/75 leading-relaxed">Van Basket connects the generosity of Chhattisgarh&apos;s forests with modern homes, preserving the taste, people and pace of the harvest.</p>
      </div>
    </section>
    <div className="marquee-band"><div className="animate-marquee">{["FOREST TO TABLE", "APIS DORSATA", "NO ADDED SUGAR", "TRIBAL HARVEST", "RAW & UNFILTERED", "FOREST TO TABLE", "APIS DORSATA", "NO ADDED SUGAR"].map((word, i) => <span key={i}>{word}<b>✳</b></span>)}</div></div>
    <section className="max-w-7xl mx-auto px-6 md:px-12 py-20 md:py-32"><div className="max-w-2xl"><p className="eyebrow">The Van Basket point of view</p><h2 className="font-serif text-4xl md:text-6xl font-black leading-tight">Good honey should taste like somewhere.</h2><p className="mt-6 text-sm md:text-base leading-relaxed text-brand-espresso-muted">Not like a factory. Not like a flavouring. Our wild forest honey is a living record of the landscape where it was gathered: floral, mineral, warm and beautifully changeable.</p></div></section>
    <section className="max-w-6xl mx-auto px-6 md:px-12 pb-24 md:pb-36 space-y-20 md:space-y-32">{chapters.map((chapter, index) => <article key={chapter.number} className={`grid md:grid-cols-2 gap-8 md:gap-20 items-center ${index % 2 ? "md:[&>*:first-child]:order-2" : ""}`}><div className="relative aspect-[4/3] overflow-hidden bg-brand-cream-warm"><Image src={chapter.image} alt={chapter.title} fill sizes="(min-width: 768px) 50vw, 100vw" className="object-cover transition-transform duration-700 hover:scale-105" /></div><div><span className="font-serif text-5xl text-brand-honey/45">{chapter.number}</span><h3 className="font-serif text-3xl md:text-5xl font-black mt-2">{chapter.title}</h3><p className="mt-5 text-sm leading-relaxed text-brand-espresso-muted">{chapter.text}</p><Link href="/catalogue" className="inline-flex items-center gap-2 mt-7 text-[10px] uppercase tracking-[.2em] font-bold editorial-underline">Explore the harvest <ArrowRight className="w-3.5 h-3.5" /></Link></div></article>)}</section>
    <section className="bg-brand-forest text-brand-cream-light py-20 md:py-28"><div className="max-w-5xl mx-auto px-6 md:px-12 grid md:grid-cols-[1fr_auto] gap-10 items-center"><div><p className="eyebrow text-brand-honey">Our promise</p><h2 className="font-serif text-4xl md:text-6xl font-black">Keep the forest in the bottle.</h2><p className="mt-5 max-w-xl text-sm leading-relaxed text-white/70">Every decision is guided by purity, traceability and respect for the communities who know this forest best.</p></div><Leaf className="w-20 h-20 text-brand-honey/70 stroke-[1]" /></div></section>
    <TrustStrip />
  </main><Footer /></div>;
}
