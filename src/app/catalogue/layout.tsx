import type { Metadata } from "next";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://vanbasket.com";

export const metadata: Metadata = {
  title: "Pure Wild Forest Honey & Product Catalog | VanBasket",
  description:
    "Explore 100% pure raw Apis dorsata wild forest honey harvested ethically from Chhattisgarh hives. Available in 250g, 500g, and bulk wholesale quantities.",
  alternates: {
    canonical: `${siteUrl}/catalogue`,
  },
  openGraph: {
    title: "Pure Wild Forest Honey & Product Catalog | VanBasket",
    description:
      "Shop raw, unfiltered wild forest honey gathered from wild tree hives in Chhattisgarh. Zero sugar syrups or additives.",
    url: `${siteUrl}/catalogue`,
    type: "website",
  },
};

export default function CatalogueLayout({ children }: { children: React.ReactNode }) {
  const productJsonLd = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: "VanBasket Wild Forest Honey",
    image: [`${siteUrl}/assets/product-jar-1.png`],
    description:
      "Apis dorsata raw wild forest honey gathered from wild tree hives in the deep forests of Chhattisgarh. Rich in antioxidants and natural pollen.",
    brand: {
      "@type": "Brand",
      name: "VanBasket",
    },
    offers: {
      "@type": "Offer",
      url: `${siteUrl}/catalogue`,
      priceCurrency: "INR",
      price: "349.00",
      itemCondition: "https://schema.org/NewCondition",
      availability: "https://schema.org/InStock",
      seller: {
        "@type": "Organization",
        name: "VanBasket",
      },
    },
  };

  const breadcrumbJsonLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      {
        "@type": "ListItem",
        position: 1,
        name: "Home",
        item: siteUrl,
      },
      {
        "@type": "ListItem",
        position: 2,
        name: "Catalogue",
        item: `${siteUrl}/catalogue`,
      },
    ],
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(productJsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }}
      />
      {children}
    </>
  );
}
