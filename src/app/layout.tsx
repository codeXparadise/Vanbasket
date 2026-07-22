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

export const metadata: Metadata = {
  title: {
    default: "Van Bakset | Wild Forest Honey from Chhattisgarh",
    template: "%s | Van Bakset",
  },
  description:
    "Experience raw, unfiltered wild forest honey from Chhattisgarh. Sustainably harvested from Apis dorsata hives and bottled for modern wellness.",
  keywords: [
    "Van Bakset",
    "raw honey",
    "wild forest honey",
    "single origin honey",
    "organic honey",
    "premium honey",
    "luxury honey brand",
  ],
  openGraph: {
    title: "Van Bakset | Wild Forest Honey from Chhattisgarh",
    description:
      "Sustainably harvested wild forest honey from Chhattisgarh, with no added sugar, syrups or preservatives.",
    type: "website",
    siteName: "Van Bakset",
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="scroll-smooth">
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
