# Aegis Learnings

## 2023-10-25
- **Task**: VanBasket Homepage Redesign.
- **Architectural Notes**: Replaced large monolithic `ProductDetail` usage on the homepage with a dedicated grid layout. Kept existing components like `TrustStrip` but refactored to act as a Specifications strip. Used placeholder text/images where required.
- **Vulnerabilities/Security**: No new endpoints or auth modifications were introduced. Build passes successfully.

## 2026-09-20 - Razorpay Instance Lazy Initialization & Secure Fail
**Category:** Security / Performance
**Learning / Vulnerability:** The `razorpay` instance was eagerly initialized at the module level using fallback secrets if environment variables were missing. This exposes unvalidated secrets in local setups or misconfigurations and creates unnecessary performance overhead during build steps (since Next.js builds would instantiate it despite not needing it directly for static pages).
**Action / Prevention:** Implemented a Proxy pattern to lazy-load the `Razorpay` instance. It now fails securely when secrets are missing and caches the instance to prevent performance overhead on subsequent property accesses, adhering to the standard of environment-driven, validated configurations.
