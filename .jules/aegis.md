
## 2026-06-25 - Prevent Timing Attacks in HMAC Signature Verification
**Category:** Security - High
**Learning / Vulnerability:** String equality operators (`===` or `!==`) when comparing cryptographic hashes or signatures are vulnerable to timing attacks. An attacker could measure the time the comparison takes to short-circuit, guessing the HMAC signature byte-by-byte.
**Action / Prevention:** Always use `crypto.timingSafeEqual` along with a length check when verifying HMAC signatures in webhooks or payment verification callbacks. Converts strings to buffers using `Buffer.from(string, 'utf8')` before using `timingSafeEqual`.

## 2026-06-25 - Remove Hardcoded Secrets
**Category:** Security - Critical
**Learning / Vulnerability:** Code should never contain hardcoded secrets, as these can easily leak via version control or frontend code dumps. Fallback logical OR (`||`) constructs for environment variables that leak keys into the build are a common pitfall.
**Action / Prevention:** Remove all hardcoded webhook secrets and keys in `verify`, `webhooks`, and `razorpay` initializers. Replace with explicit env variable checks that error out (e.g., `500 Server Misconfiguration`) rather than silently using a leaked fallback value.
