## 2024-05-18 - Secured Unauthenticated Setup Admin Route
**Category:** Security
**Learning / Vulnerability:** The `/api/auth/setup-initial-admin` route allowed creation of an admin account without requiring any authentication or authorization token. This represents a critical vulnerability (CWE-288, CWE-306) allowing unauthenticated users to create admin accounts, especially in production environments where the endpoint was not locked down.
**Action / Prevention:** Implemented a check for `SETUP_ADMIN_TOKEN` that requires the caller to pass this token either in the JSON body (`setupToken`) or via the `x-setup-token` header. This completely locks down the endpoint in production unless the specific token is provided. Added environment variable checks to fail securely.
