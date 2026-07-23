import type { Metadata } from "next";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://vanbasket.com";

export const metadata: Metadata = {
  title: "Contact Us & Wholesale Honey Inquiries | VanBasket",
  description:
    "Contact VanBasket for customer support, order assistance, bulk wild honey inquiries, and distribution partnerships. Sourced from Chhattisgarh forests.",
  alternates: {
    canonical: `${siteUrl}/contact-us`,
  },
  openGraph: {
    title: "Contact Us & Wholesale Honey Inquiries | VanBasket",
    description:
      "Get in touch with VanBasket team for support and wholesale raw wild forest honey orders.",
    url: `${siteUrl}/contact-us`,
    type: "website",
  },
};

export default function ContactUsLayout({ children }: { children: React.ReactNode }) {
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
        name: "Contact Us",
        item: `${siteUrl}/contact-us`,
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
