# Aegis Learnings

## 2023-10-25
- **Task**: VanBasket Homepage Redesign.
- **Architectural Notes**: Replaced large monolithic `ProductDetail` usage on the homepage with a dedicated grid layout. Kept existing components like `TrustStrip` but refactored to act as a Specifications strip. Used placeholder text/images where required.
- **Vulnerabilities/Security**: No new endpoints or auth modifications were introduced. Build passes successfully.

## 2024-05-18 - ⚡🛡️ Aegis: Remove hardcoded Razorpay API keys and secrets
**Category:** Security
**Learning / Vulnerability:** Hardcoded Razorpay API keys and webhook secrets were present as fallbacks in the codebase (`l9qpaUbLSGef0cxkzQocQYqv`, `rzp_test_T6F3LtF1tbHeC4`, `razorpay_webhook_secret_123`). Exposing API keys and webhooks secrets in source control is a critical security vulnerability and can lead to unauthorized payment captures, refund manipulations, and overall financial/data loss.
**Action / Prevention:** Removed all hardcoded fallback secrets and forced the application to rely strictly on environment variables (`process.env.RAZORPAY_KEY_SECRET`, `process.env.RAZORPAY_WEBHOOK_SECRET`, `process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID`, `process.env.RAZORPAY_KEY_ID`). Threw explicit configuration errors (HTTP 500 or Error objects) when these variables are missing to fail securely.
