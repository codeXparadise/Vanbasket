import { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://vanbasket.com";

  return {
    rules: [
      {
        userAgent: "*",
        allow: [
          "/",
          "/catalogue",
          "/about-us",
          "/contact-us",
          "/login",
          "/signup",
        ],
        disallow: [
          "/admin",
          "/admin/*",
          "/api/*",
          "/checkout",
          "/profile",
          "/reset-password",
          "/forgot-password",
          "/complete-profile",
        ],
      },
    ],
    sitemap: `${baseUrl}/sitemap.xml`,
  };
}
