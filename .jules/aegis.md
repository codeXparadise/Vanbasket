# Aegis Learnings

## 2023-10-25
- **Task**: VanBasket Homepage Redesign.
- **Architectural Notes**: Replaced large monolithic `ProductDetail` usage on the homepage with a dedicated grid layout. Kept existing components like `TrustStrip` but refactored to act as a Specifications strip. Used placeholder text/images where required.
- **Vulnerabilities/Security**: No new endpoints or auth modifications were introduced. Build passes successfully.

## 2026-09-12 - Remove Hardcoded Razorpay Secrets and Implement Proxy Pattern
**Category:** Security
**Learning / Vulnerability:** Hardcoded Razorpay fallback secrets and keys were left in API routes and client checkout components, allowing potential bypass of server validations or exposure of internal test environments if variables failed to load.
**Action / Prevention:** Removed all string fallbacks, threw 500 configuration errors on missing secrets to fail securely, and implemented a lazy-initialization Proxy in `razorpay.ts` to prevent missing secret build failures during static Next.js compilation.
