# VanBasket - Release & Changelog

## 🛡️ Version 2.1 Patch Release (July 25, 2026)

### 1. 🔐 Supabase Auth & Refresh Token Error Fixes
- **Middleware Refresh Token Protection**: Wrapped `supabase.auth.getUser()` in `try...catch` blocks in `src/proxy.ts`.
- **Automatic Cookie Eviction**: On auth token expiration or `AuthApiError: Invalid Refresh Token`, invalid auth token cookies (`sb-*-auth-token`) are automatically cleared from response headers so browsers do not send stale tokens.
- **Client Auth Resilience**: Wrapped `getUser()` and `getSession()` in `try...catch...finally` in `Navbar.tsx`, `CartContext.tsx`, `AdminLayout.tsx`, and `admin/login/page.tsx`.

### 2. 🛡️ Vulnerability Patches & Security Upgrades
- **Zero Vulnerabilities**: Upgraded `eslint` to `^9.26.0` and `brace-expansion` to `5.0.8` via `package.json` overrides.
- **Package Lock Synchronization**: Ran `npm install` to resolve all sub-dependency locks. `npm audit` now reports **0 vulnerabilities**.

### 3. 🛒 Cart Drawer Performance & Instant Opening
- **Non-Blocking Auth Initialization**: Updated `CartContext.tsx` so `setAuthReady(true)` completes in a `finally` block without blocking cart drawer state.
- **Global Cart Drawer**: Mounted `<CartDrawer />` globally inside `src/app/layout.tsx` for seamless cart drawer opening across all pages (including `/`).

### 4. 📝 Contact Form API & Submission Resilience
- **Dedicated Server API Endpoint**: Created `src/app/api/contact/route.ts` to process contact queries safely on the server using `createServerClient`.
- **Automatic Schema & Error Fallback**: Gracefully formats `company` and `quantity` fields into the message body so database schema differences or client-side RLS rules never block user query submissions.

### 5. 🍇 Bulk Jamun Pulp Homepage Section
- **Dedicated Commercial Section**: Added a prominent "We Also Deal in Bulk Orders of Jamun Pulp" section directly below the main product on the Homepage (`src/app/page.tsx`).
- **Direct B2B Action Buttons**: Includes **Query Now** (redirects to `/contact-us?inquiry=jamun-pulp`), **WhatsApp Us** (`wa.me`), and **Call Hotline** (`tel:`).

### 6. 📦 Catalogue Section B2B Card CTAs
- **Enhanced Bulk Cards**: Updated **Bulk Order of Honey** and **Jamun Pulp** cards in `src/app/catalogue/page.tsx` with commercial supply information panels.
- **Instant B2B Contact Buttons**: Integrated 3 prominent buttons on bulk cards:
  1. **Query Now** (redirects to pre-filled contact form).
  2. **WhatsApp** (opens direct WhatsApp chat with product name pre-populated).
  3. **Call Us** (`tel:+917724969017`).

### 7. ⚙️ Admin Dashboard Stability
- Wrapped admin layout authentication calls in `try...catch` to prevent unhandled rejection loops or layout crashes.

---

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