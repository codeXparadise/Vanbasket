# VanBasket - Version 2.0 Release & Changelog

## 🚀 Version 2.0 Highlights

Version 2.0 brings major enhancements to production readiness, admin customer analytics, user registration rules, and search engine (Google Site Kit / Search Console) indexing.

---

### 1. 🔍 Google Indexing, SEO & Site Kit Integration
- **Google Site Kit Verification File**: Added `public/google92231e5441362cbe.html` for instant Google Search Console ownership verification.
- **Google Meta Tag Verification**: Configured `<meta name="google-site-verification" content="google92231e5441362cbe" />` in `src/app/layout.tsx`.
- **Dynamic & Static `robots.txt`**:
  - Added `src/app/robots.ts` & `public/robots.txt`.
  - Configured rules allowing Googlebot to index store pages (`/`, `/catalogue`, `/about-us`, `/contact-us`) while disallowing private/admin routes (`/admin`, `/api`, `/checkout`, `/profile`).
- **Dynamic & Static `sitemap.xml`**:
  - Added `src/app/sitemap.ts` & `public/sitemap.xml`.
  - Automatically queries active product catalog slugs from Supabase to generate dynamic product page URLs.
- **Google Analytics Tag (gtag.js)**: Integrated `G-5DNL355BVQ` via Next.js `Script` component in `src/app/layout.tsx`.
- **JSON-LD Rich Snippets**: Integrated `Organization` & `WebSite` structured data schema in `src/app/layout.tsx` for Google Search Result enhancement.

---

### 2. 📊 Admin Panel - User & Customer Behavior Analytics
- **Upgraded User Dashboard** (`src/app/admin/users/page.tsx`):
  - **KPI Cards**: Total Registered Customers, Active Buyers Count (with conversion %), Repeat Purchase Rate (%), and Average Customer Lifetime Value (LTV in ₹).
  - **Segmentation Tabs**: *All Customers*, *Active Buyers*, *VIP / High Value*, *New Signups (30d)*.
  - **Customer Behavior Inspector**: Detailed profile drawer showing email, mandatory phone record status, registered addresses, and chronological purchase history timeline with order statuses.

---

### 3. 🔐 Registration & Auth Enhancements
- **Mandatory Phone Number**: Phone validation enforced on signup API (`src/app/api/auth/signup/route.ts`).
- **Existing Email Handler**: Displays explicit warning `"This email address is already registered. Please log in to your account instead."` if an existing user attempts to re-register.
- **One-Click Sign In**: Added a direct `"Click Here To Sign In"` button inside the error alert box on `src/app/login/page.tsx`.

---

### 4. 🗄️ Production Database Reset SQL Migration
- **Script File**: `supabase/migrations/reset_database_production.sql`
- Safely wipes all test transactional data (`orders`, `order_items`, `payments`, `contact_queries`, `webhook_events`, `password_resets`, `addresses`) and non-admin test user accounts.
- **Preserves Admin Accounts** (`role = 'admin'`), product catalog (`products`, `product_variants`, `product_images`), and coupons.

---

## 🛠️ Summary of Changed Files

| Component | File Path | Description |
|---|---|---|
| **Google Verification** | `public/google92231e5441362cbe.html` | Google Site Kit verification file |
| **SEO & Crawling** | `src/app/robots.ts`, `public/robots.txt` | Googlebot crawling instructions |
| **Sitemap** | `src/app/sitemap.ts`, `public/sitemap.xml` | Dynamic catalog sitemap generator |
| **Root Layout** | `src/app/layout.tsx` | Site metadata, Google meta tag & JSON-LD |
| **Admin Panel** | `src/app/admin/users/page.tsx` | Customer behavior tracking & analytics |
| **Auth API** | `src/app/api/auth/signup/route.ts` | Mandatory phone & duplicate email checks |
| **Login / Register** | `src/app/login/page.tsx` | UI prompt and quick sign-in toggle button |
| **DB Migration** | `supabase/migrations/reset_database_production.sql` | Production database cleanup script |