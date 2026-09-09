# Aegis Learnings

## 2023-10-25
- **Task**: VanBasket Homepage Redesign.
- **Architectural Notes**: Replaced large monolithic `ProductDetail` usage on the homepage with a dedicated grid layout. Kept existing components like `TrustStrip` but refactored to act as a Specifications strip. Used placeholder text/images where required.
- **Vulnerabilities/Security**: No new endpoints or auth modifications were introduced. Build passes successfully.

## 2026-09-09 - Hardcoded Secret Fallbacks & Lazy Initialization
**Category:** Security / Performance
**Learning / Vulnerability:** Discovered critical vulnerabilities where `RAZORPAY_KEY_SECRET` and `RAZORPAY_WEBHOOK_SECRET` used hardcoded string fallbacks in production APIs if environment variables were missing, enabling potential spoofing of webhook and payment verifications. Furthermore, static initialization of the Razorpay SDK during Next.js builds caused potential build failures when secrets were undefined.
**Action / Prevention:**
1. Removed all hardcoded secret fallbacks, enforcing a secure fail (HTTP 500) if the environment variables are not correctly configured.
2. Implemented a lazy initialization Proxy pattern for the Razorpay SDK in `src/utils/razorpay.ts`. This defers secret resolution and SDK instantiation until runtime, keeping static builds safe and preventing credentials from leaking into build artifacts.
