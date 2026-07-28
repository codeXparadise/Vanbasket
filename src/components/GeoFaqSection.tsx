"use client";

import React, { useState } from "react";
import { ChevronDown, Sparkles } from "lucide-react";

const faqData = [
  {
    question: "What makes VanBasket honey 100% pure, raw, and wild?",
    answer:
      "VanBasket honey is harvested directly from wild Apis dorsata hives located in the deep, unpolluted biosphere forests of Chhattisgarh, India. It is 100% raw, cold-gravity filtered without ultra-heating or pasteurization, retaining all natural pollen, enzymes, antioxidants, and propolis. It contains zero added sugar, zero C4 corn/rice syrups, and zero artificial preservatives.",
  },
  {
    question: "Which bee species produces VanBasket wild forest honey?",
    answer:
      "VanBasket wild honey is produced by Apis dorsata (the wild giant rock bee), an indigenous apex pollinator species that builds open-air combs in high forest canopies. Because Apis dorsata bees cannot be domesticated or artificially fed, they forage freely across thousands of wild medicinal flora and forest blossoms.",
  },
  {
    question: "Where is VanBasket forest honey harvested from?",
    answer:
      "Our honey is sustainably gathered from natural tree and rock hives across the dense, undisturbed forest reserves of Chhattisgarh, India, by indigenous tribal honey harvesters using ancient smoke-based methods that preserve the bee colonies.",
  },
  {
    question: "How is VanBasket honey packaged to preserve purity?",
    answer:
      "VanBasket honey is bottled in dark UV-protective apothecary amber glass jars to prevent photo-degradation and keep natural bioactive enzymes, flavor notes, and medicinal benefits intact for long-term storage.",
  },
  {
    question: "Does raw wild honey crystallize naturally?",
    answer:
      "Yes, natural crystallization is a hallmark of 100% pure raw honey. High concentrations of natural glucose and wild pollen induce gentle crystallization at cool temperatures. To return crystallized raw honey to liquid form, simply place the glass jar in a warm water bath below 40°C.",
  },
];

export function GeoFaqSection() {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  const toggleFaq = (index: number) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  const faqSchema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faqData.map((item) => ({
      "@type": "Question",
      name: item.question,
      acceptedAnswer: {
        "@type": "Answer",
        text: item.answer,
      },
    })),
  };

  return (
    <section
      aria-label="Frequently Asked Questions"
      className="max-w-4xl mx-auto px-6 md:px-12 py-16 md:py-24 border-t border-brand-cream-dark/40 font-sans text-brand-espresso"
    >
      {/* Schema.org FAQPage JSON-LD for AI Search & Google Rich Snippets */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
      />

      <div className="text-center space-y-3 mb-10 max-w-2xl mx-auto">
        <span className="inline-flex items-center gap-1.5 rounded-full bg-brand-honey/10 border border-brand-honey/20 px-3.5 py-1 text-[10px] font-bold uppercase tracking-[0.25em] text-brand-honey">
          <Sparkles className="w-3.5 h-3.5" /> Product Authenticity & Facts
        </span>
        <h2 className="font-serif text-3xl md:text-5xl font-black text-brand-espresso">
          Frequently Asked Questions
        </h2>
        <p className="text-xs md:text-sm text-brand-espresso-muted leading-relaxed font-light">
          Everything you need to know about our raw forest honey harvesting, Apis dorsata foraging, and packaging purity.
        </p>
      </div>

      {/* Accordion List */}
      <div className="space-y-3.5">
        {faqData.map((faq, idx) => {
          const isOpen = openIndex === idx;
          return (
            <div
              key={idx}
              className={`bg-white border rounded-2xl transition-all duration-300 overflow-hidden shadow-xs ${
                isOpen ? "border-brand-honey/60 ring-1 ring-brand-honey/20 shadow-sm" : "border-brand-cream-dark/60 hover:border-brand-honey/30"
              }`}
            >
              <button
                onClick={() => toggleFaq(idx)}
                className="w-full p-5 text-left flex items-center justify-between gap-4 focus:outline-none group"
                aria-expanded={isOpen}
              >
                <div className="flex items-center gap-3.5">
                  <div
                    className={`w-7 h-7 rounded-lg flex items-center justify-center font-bold text-xs shrink-0 transition-colors ${
                      isOpen ? "bg-brand-honey text-white" : "bg-brand-cream-light text-brand-espresso/60 group-hover:bg-brand-honey/20 group-hover:text-brand-espresso"
                    }`}
                  >
                    Q{idx + 1}
                  </div>
                  <h3 className="font-serif font-bold text-base md:text-lg text-brand-espresso leading-snug">
                    {faq.question}
                  </h3>
                </div>

                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 transition-transform duration-300 ${
                    isOpen ? "rotate-180 bg-brand-cream-light text-brand-honey" : "text-brand-espresso/50 group-hover:text-brand-espresso"
                  }`}
                >
                  <ChevronDown className="w-5 h-5 stroke-[2]" />
                </div>
              </button>

              <div
                className={`transition-all duration-300 ease-in-out ${
                  isOpen ? "max-h-96 opacity-100 pb-5 px-5 pt-0" : "max-h-0 opacity-0 overflow-hidden"
                }`}
              >
                <div className="pt-3 border-t border-brand-cream-dark/30 text-xs md:text-sm text-brand-espresso-muted leading-relaxed font-light space-y-2">
                  <p>{faq.answer}</p>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
