# Aegis Learnings

## 2026-09-14 - Remove Hardcoded Razorpay Secrets and Implement Proxy Initialization
**Category:** Security - Critical
**Learning / Vulnerability:** Hardcoded fallback secrets for `RAZORPAY_KEY_ID`, `RAZORPAY_KEY_SECRET`, and `RAZORPAY_WEBHOOK_SECRET` were found in the codebase. Direct initialization of Razorpay SDK with missing environment variables caused Next.js static builds to fail. Hardcoding fallback secrets allows attackers potential access if source code is exposed, and failing builds block deployments.
**Action / Prevention:** Implemented a Proxy pattern for lazy initialization of the Razorpay SDK to prevent build-time failures while maintaining strict runtime validation of secrets. Removed all hardcoded fallback secrets from client and server code, enforcing environment-driven configuration and throwing explicit errors when missing.

## 2023-10-25
- **Task**: VanBasket Homepage Redesign.
- **Architectural Notes**: Replaced large monolithic `ProductDetail` usage on the homepage with a dedicated grid layout. Kept existing components like `TrustStrip` but refactored to act as a Specifications strip. Used placeholder text/images where required.
- **Vulnerabilities/Security**: No new endpoints or auth modifications were introduced. Build passes successfully.
