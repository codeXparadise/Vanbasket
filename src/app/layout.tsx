import type { Metadata } from "next";
import { Playfair_Display, Outfit } from "next/font/google";
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

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: "VanBasket - Raw Wild Forest Honey",
    template: "%s | VanBasket",
  },
  description:
    "Experience raw, unfiltered wild forest honey from Chhattisgarh. Sustainably harvested from Apis dorsata hives and bottled for modern wellness.",
  keywords: [
    "VanBasket",
    "raw honey",
    "wild forest honey",
    "single origin honey",
    "organic honey",
    "premium honey",
    "luxury honey brand",
    "Chhattisgarh forest honey",
  ],
  icons: {
    icon: "/favicon.ico",
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
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: "VanBasket",
    url: siteUrl,
    logo: `${siteUrl}/assets/logo.png`,
    description: "Sustainably harvested raw wild forest honey from Chhattisgarh.",
    sameAs: [],
  };

  return (
    <html lang="en" className="scroll-smooth">
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      </head>
      <body
        className={`${playfair.variable} ${outfit.variable} font-sans bg-brand-cream-light text-brand-espresso antialiased`}
      >
        <ErrorBoundary>
          <ToastProvider>
            <CartProvider>{children}</CartProvider>
          </ToastProvider>
        </ErrorBoundary>
      </body>
    </html>
  );
}
