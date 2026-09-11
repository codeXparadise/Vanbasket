# Aegis Learnings

## 2023-10-25
- **Task**: VanBasket Homepage Redesign.
- **Architectural Notes**: Replaced large monolithic `ProductDetail` usage on the homepage with a dedicated grid layout. Kept existing components like `TrustStrip` but refactored to act as a Specifications strip. Used placeholder text/images where required.
- **Vulnerabilities/Security**: No new endpoints or auth modifications were introduced. Build passes successfully.

## 2023-11-23 - Hardcoded Razorpay Secrets Removal
**Category:** Security
**Learning / Vulnerability:** Razorpay test secrets were hardcoded directly in `src/utils/razorpay.ts` and in various API routes (`src/app/api/payment/verify/route.ts`, `src/app/api/webhooks/razorpay/route.ts`) as fallbacks. In addition, the Razorpay SDK was being initialized at the module level. This forced either committing secrets directly to version control or causing Next.js static builds to fail if environment secrets were missing during the build phase.
**Action / Prevention:** Removed all hardcoded test credentials. Replaced the Razorpay instantiation with a lazy-loading Proxy pattern that accesses environment variables at runtime only when the SDK is actually used. This ensures Next.js builds properly without secrets while retaining secure, strict runtime validation. Never use hardcoded fallback secrets; always use validated environment-driven configurations and leverage the Proxy pattern for third-party SDKs that require runtime secrets but conflict with static site generation.
