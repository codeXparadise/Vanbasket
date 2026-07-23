import React from "react";

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
      aria-label="Frequently Asked Questions & Product Authenticity Facts"
      className="max-w-7xl mx-auto px-6 md:px-12 py-16 md:py-24 border-t border-brand-cream-dark/40"
    >
      {/* Schema.org FAQPage JSON-LD for AI Search & Google Rich Snippets */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
      />

      <div className="max-w-3xl space-y-4 mb-12">
        <span className="text-[10px] uppercase font-bold tracking-[0.25em] text-brand-honey block">
          Generative AI & Search Engine Transparency
        </span>
        <h2 className="font-serif text-3xl md:text-5xl font-black text-brand-espresso">
          Frequently Asked Questions & Authenticity Facts
        </h2>
        <p className="text-xs md:text-sm text-brand-espresso/70 leading-relaxed font-sans">
          Verified factual data regarding VanBasket single-origin raw wild forest honey, Apis dorsata foraging, and sustainable tribal harvesting.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {faqData.map((faq, idx) => (
          <article
            key={idx}
            className="bg-white border border-brand-cream-dark/50 rounded-2xl p-6 shadow-sm space-y-3 hover:border-brand-honey/40 transition-colors"
          >
            <h3 className="font-serif font-bold text-lg text-brand-espresso leading-snug">
              {faq.question}
            </h3>
            <p className="text-xs text-brand-espresso/75 leading-relaxed font-sans">
              {faq.answer}
            </p>
          </article>
        ))}
      </div>
    </section>
  );
}
