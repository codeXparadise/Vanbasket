# Aegis Learnings

## 2023-10-25
- **Task**: VanBasket Homepage Redesign.
- **Architectural Notes**: Replaced large monolithic `ProductDetail` usage on the homepage with a dedicated grid layout. Kept existing components like `TrustStrip` but refactored to act as a Specifications strip. Used placeholder text/images where required.
- **Vulnerabilities/Security**: No new endpoints or auth modifications were introduced. Build passes successfully.

## 2026-09-15 - Remove Hardcoded Razorpay Secrets
**Category:** Security
**Learning / Vulnerability:** Hardcoded fallback secrets for Razorpay integration (key_id, key_secret, webhook_secret) were found in the codebase. Static build environments try to access process.env eagerly which lead to providing these fallback strings inside client components and API endpoints, posing a security risk.
**Action / Prevention:** Replaced eager Razorpay instantiation with lazy loading using a Proxy pattern to prevent static build Next.js failure while ensuring no secrets are hardcoded. Removed fallback strings from all API endpoints and the checkout page, throwing server errors if the required environment variables are absent.
