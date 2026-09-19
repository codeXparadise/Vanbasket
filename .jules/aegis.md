# Aegis Learnings

## 2023-10-25
- **Task**: VanBasket Homepage Redesign.
- **Architectural Notes**: Replaced large monolithic `ProductDetail` usage on the homepage with a dedicated grid layout. Kept existing components like `TrustStrip` but refactored to act as a Specifications strip. Used placeholder text/images where required.
- **Vulnerabilities/Security**: No new endpoints or auth modifications were introduced. Build passes successfully.

## 2024-10-25 - Prevent Next.js Static Build Failures and Eliminate Hardcoded Fallback Secrets
**Category:** Security / Performance
**Learning / Vulnerability:** Multiple API routes and utility files contained hardcoded fallback secrets (e.g., Razorpay keys and Supabase keys) which is a major security vulnerability. Furthermore, strict validation of Razorpay environment variables caused Next.js static builds to fail because the variables are missing during the build phase. Simply fetching secrets during build time or module initialization isn't scalable and creates performance bottlenecks on property access.
**Action / Prevention:**
1. Replaced raw hardcoded fallback secrets with environment-driven, validated configurations. Redacted the previously hardcoded keys.
2. Implemented lazy initialization via the Proxy pattern in `src/utils/razorpay.ts` to instantiate the Razorpay SDK. This prevents Next.js static build failures caused by missing secrets during the build phase.
3. Cached the instantiated SDK object to ensure it is only created once, preventing severe performance overhead on every property access.
