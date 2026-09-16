# Aegis Learnings

## 2023-10-25
- **Task**: VanBasket Homepage Redesign.
- **Architectural Notes**: Replaced large monolithic `ProductDetail` usage on the homepage with a dedicated grid layout. Kept existing components like `TrustStrip` but refactored to act as a Specifications strip. Used placeholder text/images where required.
- **Vulnerabilities/Security**: No new endpoints or auth modifications were introduced. Build passes successfully.

## 2026-09-16 - Hardcoded Secrets & Next.js Build Failures in Razorpay Initialization
**Category:** Security - Critical
**Learning / Vulnerability:** Hardcoded Razorpay fallback secrets (`REDACTED_KEY_ID` / `REDACTED_KEY_SECRET`) were identified in `src/utils/razorpay.ts`. This poses a critical security risk. Direct initialization of Razorpay SDK with `process.env` secrets also causes Next.js static build failures when environment variables are not present during the build phase.
**Action / Prevention:** Removed the hardcoded fallback secrets. Implemented a Proxy pattern for lazy initialization of the Razorpay SDK to ensure environment variables are evaluated only at runtime, preventing build failures while securely relying on environment variables. Added fail-secure error throwing when keys are missing.
