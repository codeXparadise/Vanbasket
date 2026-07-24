import type { Metadata } from "next";
import { Playfair_Display, Outfit } from "next/font/google";
import Script from "next/script";
import { CartProvider } from "@/context/CartContext";
import { ErrorBoundary } from "@/components/ErrorBoundary";
import { ToastProvider } from "@/components/Toast";
import "./globals.css";

const playfair = Playfair_Display({
  subsets: ["latin"],
  variable: "--font-serif",
  display: "swap",
});

const outfit = Outfit({
  subsets: ["latin"],
  variable: "--font-sans",
  display: "swap",
});

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://vanbasket.com";
const GA_TRACKING_ID = process.env.NEXT_PUBLIC_GA_ID || "G-5DNL355BVQ";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: "VanBasket - Raw Wild Forest Honey",
    template: "%s | VanBasket",
  },
  description:
    "Experience 100% pure, raw, unfiltered wild forest honey from Chhattisgarh. Sustainably harvested from Apis dorsata hives and bottled for modern wellness.",
  keywords: [
    "VanBasket",
    "raw honey",
    "wild forest honey",
    "single origin honey",
    "organic honey",
    "Apis dorsata honey",
    "premium honey",
    "luxury honey brand",
    "Chhattisgarh forest honey",
    "unfiltered honey India",
    "buy pure honey online",
  ],
  alternates: {
    canonical: siteUrl,
  },
  icons: {
    icon: [
      { url: "/favicon.ico", sizes: "any" },
      { url: "/logo.png", type: "image/png" },
      { url: "/logo.svg", type: "image/svg+xml" },
    ],
    shortcut: "/logo.png",
    apple: "/logo.png",
  },
  openGraph: {
    title: "VanBasket - Raw Wild Forest Honey",
    description:
      "Sustainably harvested wild forest honey from Chhattisgarh, with no added sugar, syrups or preservatives.",
    type: "website",
    siteName: "VanBasket",
    url: siteUrl,
    locale: "en_IN",
    images: [
      {
        url: `${siteUrl}/logo.png`,
        width: 1200,
        height: 630,
        alt: "VanBasket Wild Forest Honey",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "VanBasket - Raw Wild Forest Honey",
    description: "100% pure, raw, unfiltered wild forest honey sustainably harvested from Chhattisgarh.",
    images: [`${siteUrl}/logo.png`],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  verification: {
    google: process.env.NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION || "google92231e5441362cbe",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const organizationJsonLd = {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: "VanBasket",
    url: siteUrl,
    logo: `${siteUrl}/logo.png`,
    description: "Sustainably harvested raw wild forest honey from Chhattisgarh, India.",
    sameAs: [],
  };

  const webSiteJsonLd = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: "VanBasket",
    url: siteUrl,
    potentialAction: {
      "@type": "SearchAction",
      target: `${siteUrl}/catalogue?search={search_term_string}`,
      "query-input": "required name=search_term_string",
    },
  };

  return (
    <html lang="en" className="scroll-smooth">
      <head>
        {/* Preconnect resource hints for faster font & asset loading */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link rel="preconnect" href="https://checkout.razorpay.com" />

        {/* Structured Data (JSON-LD) for Google Rich Snippets */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationJsonLd) }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(webSiteJsonLd) }}
        />
      </head>
      <body
        className={`${playfair.variable} ${outfit.variable} font-sans bg-brand-cream-light text-brand-espresso antialiased`}
      >
        <Script
          src={`https://www.googletagmanager.com/gtag/js?id=${GA_TRACKING_ID}`}
          strategy="afterInteractive"
        />
        <Script id="google-analytics" strategy="afterInteractive">
          {`
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', '${GA_TRACKING_ID}', { page_path: window.location.pathname });
          `}
        </Script>
        <ErrorBoundary>
          <ToastProvider>
            <CartProvider>{children}</CartProvider>
          </ToastProvider>
        </ErrorBoundary>
      </body>
    </html>
  );
}
