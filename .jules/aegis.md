# Aegis Learnings

## 2023-10-25
- **Task**: VanBasket Homepage Redesign.
- **Architectural Notes**: Replaced large monolithic `ProductDetail` usage on the homepage with a dedicated grid layout. Kept existing components like `TrustStrip` but refactored to act as a Specifications strip. Used placeholder text/images where required.
- **Vulnerabilities/Security**: No new endpoints or auth modifications were introduced. Build passes successfully.

## 2024-05-18 - Remove Hardcoded Secrets from Razorpay Integration
**Category:** Security
**Learning / Vulnerability:** Hardcoded fallback secrets for Razorpay integration (key, secret, webhook secret) were exposed in source files. In `src/utils/razorpay.ts`, direct instantiation caused build-time errors when secrets were removed if Next.js statically built pages that imported it.
**Action / Prevention:** Implemented a JavaScript Proxy to lazily evaluate environment variables only when Razorpay endpoints are invoked at runtime. Removed all fallback secrets from source, ensuring the application fails securely if misconfigured.
