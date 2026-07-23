import type { Metadata } from "next";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://vanbasket.com";

export const metadata: Metadata = {
  title: "Our Story & Ethical Forest Harvesting | VanBasket",
  description:
    "Discover how VanBasket partners with local tribal communities in Chhattisgarh to ethically harvest raw, unfiltered wild forest honey without compromising the hives.",
  alternates: {
    canonical: `${siteUrl}/about-us`,
  },
  openGraph: {
    title: "Our Story & Ethical Forest Harvesting | VanBasket",
    description:
      "Sustainably harvested raw honey from Apis dorsata hives in dense Chhattisgarh forests. Preserving the forest, people, and pace of the harvest.",
    url: `${siteUrl}/about-us`,
    type: "website",
  },
};

export default function AboutUsLayout({ children }: { children: React.ReactNode }) {
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
        name: "About Us",
        item: `${siteUrl}/about-us`,
      },
    ],
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }}
      />
      {children}
    </>
  );
}
