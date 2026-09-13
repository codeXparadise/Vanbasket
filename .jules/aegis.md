# Aegis Learnings

## 2024-05-24 - Remove Hardcoded Secrets
**Category:** Security
**Learning / Vulnerability:** Found hardcoded Razorpay secrets and webhooks scattered across initialization files, webhook route, and verify route. This is a critical security vulnerability and violates safe credential management rules. Exposing test keys poses risks to environments not strictly separating testing vs prod.
**Action / Prevention:** Implemented a Proxy wrapper around `Razorpay` initialization to lazily load credentials (since Next.js static builds require the file to evaluate without failing on missing env variables). Replaced route handlers fallback string credentials with explicit missing secret checks returning safe 500 error logs without leaking stacks.

## 2023-10-25
- **Task**: VanBasket Homepage Redesign.
- **Architectural Notes**: Replaced large monolithic `ProductDetail` usage on the homepage with a dedicated grid layout. Kept existing components like `TrustStrip` but refactored to act as a Specifications strip. Used placeholder text/images where required.
- **Vulnerabilities/Security**: No new endpoints or auth modifications were introduced. Build passes successfully.
