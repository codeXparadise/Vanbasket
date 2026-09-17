# Aegis Learnings

## 2023-10-25
- **Task**: VanBasket Homepage Redesign.
- **Architectural Notes**: Replaced large monolithic `ProductDetail` usage on the homepage with a dedicated grid layout. Kept existing components like `TrustStrip` but refactored to act as a Specifications strip. Used placeholder text/images where required.
- **Vulnerabilities/Security**: No new endpoints or auth modifications were introduced. Build passes successfully.

## 2023-11-01 - [Razorpay Security Enhancement]
**Category:** Security
**Learning / Vulnerability:** The `src/utils/razorpay.ts` file initialized the `Razorpay` SDK eagerly at the module level. This exposed hardcoded fallback API credentials (`RAZORPAY_KEY_ID` and `RAZORPAY_KEY_SECRET`) directly within the codebase, which is a significant security risk for public or leaked code. Furthermore, early initialization can cause Next.js static builds to fail if environment secrets are not provided at build time.
**Action / Prevention:** Implemented a Proxy wrapper around the `Razorpay` instantiation. This ensures lazy initialization where environment variables are strictly verified at runtime (not build time), eliminating the need for hardcoded fallbacks and ensuring build pipelines succeed without requiring active secrets. Hardcoded fallback secrets have been completely removed, and access without secrets correctly throws a runtime error.
