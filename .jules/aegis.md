# Aegis Learnings

## 2023-10-25
- **Task**: VanBasket Homepage Redesign.
- **Architectural Notes**: Replaced large monolithic `ProductDetail` usage on the homepage with a dedicated grid layout. Kept existing components like `TrustStrip` but refactored to act as a Specifications strip. Used placeholder text/images where required.
- **Vulnerabilities/Security**: No new endpoints or auth modifications were introduced. Build passes successfully.

## 2025-01-22 - Hardcoded Razorpay Secrets in Fallback Variables
**Category:** Security - Critical
**Learning / Vulnerability:** Razorpay environment variables (`RAZORPAY_KEY_SECRET`, `RAZORPAY_KEY_ID`, `RAZORPAY_WEBHOOK_SECRET`) were using predictable hardcoded string fallbacks in critical backend API routes (`src/app/api/payment/verify/route.ts`, `src/app/api/webhooks/razorpay/route.ts`), configuration (`src/utils/razorpay.ts`), and the frontend `src/app/checkout/page.tsx`. This exposed a vulnerability where an attacker could construct perfectly valid webhook or payment signatures by exploiting the known fallback secret when the application is misconfigured or fails to load environment variables, bypassing payment verification.
**Action / Prevention:** The hardcoded fallback secrets were removed and replaced with standard environment variable checks that explicitly fail and return an HTTP 500 error if they are missing. In the Next.js setup where Razorpay's initialisation throws if it's completely empty, mock placeholders were added which are harmless and invalid for API verification, ensuring the app fails securely.
