# Aegis Learnings

## 2026-09-18 - Hardcoded Razorpay Secrets and Lazy SDK Initialization
**Category:** Security
**Learning / Vulnerability:** Discovered hardcoded fallback Razorpay secrets in `verify/route.ts`, `webhooks/razorpay/route.ts`, `checkout/page.tsx`, and `utils/razorpay.ts`. Hardcoded secrets in production code could lead to exposure or misuse of API keys, compromising the payment gateway integration. Furthermore, Next.js static builds fail when trying to initialize server-side instances that require environment variables at build-time.
**Action / Prevention:** Replaced all hardcoded fallbacks with strict environment variable checks, securely failing (500 internal server error or explicit frontend error) if missing. Refactored `utils/razorpay.ts` to utilize a `Proxy` object, applying lazy initialization to instantiate the Razorpay client only at runtime, safely bypassing static build errors and enforcing secure runtime execution.

## 2023-10-25
- **Task**: VanBasket Homepage Redesign.
- **Architectural Notes**: Replaced large monolithic `ProductDetail` usage on the homepage with a dedicated grid layout. Kept existing components like `TrustStrip` but refactored to act as a Specifications strip. Used placeholder text/images where required.
- **Vulnerabilities/Security**: No new endpoints or auth modifications were introduced. Build passes successfully.
