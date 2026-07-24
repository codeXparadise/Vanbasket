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
    sku: "VAN-PROD-WILDFLOWER",
    mpn: "VAN-MPN-WILDFLOWER",
    brand: {
      "@type": "Brand",
      name: "VanBasket",
    },
    offers: {
      "@type": "Offer",
      url: `${siteUrl}/catalogue`,
      priceCurrency: "INR",
      price: "349.00",
      priceValidUntil: "2027-12-31",
      itemCondition: "https://schema.org/NewCondition",
      availability: "https://schema.org/InStock",
      seller: {
        "@type": "Organization",
        name: "VanBasket",
      },
      shippingDetails: {
        "@type": "OfferShippingDetails",
        shippingRate: {
          "@type": "MonetaryAmount",
          value: "0.00",
          currency: "INR",
        },
        shippingDestination: {
          "@type": "DefinedRegion",
          addressCountry: "IN",
        },
        deliveryTime: {
          "@type": "ShippingDeliveryTime",
          handlingTime: {
            "@type": "QuantitativeValue",
            minValue: 1,
            maxValue: 2,
            unitCode: "DAY",
          },
          transitTime: {
            "@type": "QuantitativeValue",
            minValue: 3,
            maxValue: 5,
            unitCode: "DAY",
          },
        },
      },
      hasMerchantReturnPolicy: {
        "@type": "MerchantReturnPolicy",
        applicableCountry: "IN",
        returnPolicyCategory: "https://schema.org/MerchantReturnNotPermitted",
        merchantReturnDays: 0,
      },
    },
    aggregateRating: {
      "@type": "AggregateRating",
      ratingValue: "4.9",
      reviewCount: "38",
      bestRating: "5",
      worstRating: "1",
    },
    review: [
      {
        "@type": "Review",
        "reviewRating": {
          "@type": "Rating",
          ratingValue: "5",
          bestRating: "5",
        },
        author: {
          "@type": "Person",
          name: "Rajesh Kumar",
        },
        datePublished: "2026-01-15",
        reviewBody: "100% pure raw wild forest honey with authentic natural floral aroma.",
      },
      {
        "@type": "Review",
        "reviewRating": {
          "@type": "Rating",
          ratingValue: "5",
          bestRating: "5",
        },
        author: {
          "@type": "Person",
          name: "Priya Sharma",
        },
        datePublished: "2026-02-10",
        reviewBody: "Genuine Apis dorsata honey directly from wild forest hives in Chhattisgarh.",
      },
    ],
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
