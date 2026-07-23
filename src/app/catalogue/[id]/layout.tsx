import type { Metadata } from "next";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://vanbasket.com";

export async function generateMetadata({
  params,
}: {
  params: { id: string };
}): Promise<Metadata> {
  const isBulk = params.id === "bulk-honey";
  const isJamun = params.id === "jamun-pulp";

  const title = isBulk
    ? "Bulk Order Pure Wild Forest Honey | Wholesale VanBasket"
    : isJamun
    ? "Natural Seasonal Jamun Pulp | VanBasket Pantry"
    : "Raw Wildflower Forest Honey | VanBasket 100% Pure Apis Dorsata";

  const description = isBulk
    ? "Buy 100% pure raw wild forest honey in bulk quantities for wholesale, distribution, and commercial retail brands. Sourced from Chhattisgarh tree hives."
    : isJamun
    ? "Fresh seasonal jamun pulp processed to preserve natural taste and health benefits. Available on direct inquiry from VanBasket."
    : "Buy pure raw Apis dorsata wild forest honey gathered from wild tree hives in Chhattisgarh. Zero sugar syrups, zero preservatives, 100% natural.";

  const image = isBulk
    ? `${siteUrl}/assets/bulk-honey-new.jpg`
    : `${siteUrl}/assets/product-jar-1.png`;

  return {
    title,
    description,
    alternates: {
      canonical: `${siteUrl}/catalogue/${params.id}`,
    },
    openGraph: {
      title,
      description,
      url: `${siteUrl}/catalogue/${params.id}`,
      type: "website",
      images: [
        {
          url: image,
          width: 1200,
          height: 630,
          alt: title,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [image],
    },
  };
}

export default function ProductDetailLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: { id: string };
}) {
  const isBulk = params.id === "bulk-honey";
  const isJamun = params.id === "jamun-pulp";

  const productName = isBulk
    ? "Bulk Order Pure Wild Forest Honey"
    : isJamun
    ? "Natural Seasonal Jamun Pulp"
    : "VanBasket Raw Wildflower Forest Honey";

  const productDescription = isBulk
    ? "Ethically gathered pure forest honey in bulk quantities. Ideal for retail brands, distribution partners, and wholesale commercial needs."
    : isJamun
    ? "Seasonal natural jamun pulp, carefully processed to preserve taste, nutrients, and health properties."
    : "Apis dorsata raw wild honey gathered from wild tree hives in the deep forests of Chhattisgarh. Rich in antioxidants and natural pollen.";

  const productImage = isBulk
    ? `${siteUrl}/assets/bulk-honey-new.jpg`
    : `${siteUrl}/assets/product-jar-1.png`;

  const price = isBulk ? "10000.00" : isJamun ? "500.00" : "350.00";

  const productJsonLd = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: productName,
    image: [productImage],
    description: productDescription,
    sku: `VAN-PROD-${params.id.toUpperCase()}`,
    mpn: `VAN-MPN-${params.id.toUpperCase()}`,
    brand: {
      "@type": "Brand",
      name: "VanBasket",
    },
    offers: {
      "@type": "Offer",
      url: `${siteUrl}/catalogue/${params.id}`,
      priceCurrency: "INR",
      price: price,
      priceValidUntil: "2027-12-31",
      itemCondition: "https://schema.org/NewCondition",
      availability: "https://schema.org/InStock",
      seller: {
        "@type": "Organization",
        name: "VanBasket",
      },
    },
    aggregateRating: {
      "@type": "AggregateRating",
      ratingValue: "4.9",
      reviewCount: "38",
      bestRating: "5",
      worstRating: "1",
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
      {
        "@type": "ListItem",
        position: 3,
        name: productName,
        item: `${siteUrl}/catalogue/${params.id}`,
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
