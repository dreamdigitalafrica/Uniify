# Account integration status

The static prototype does not create accounts or send email. Signup, sign-in, reset and verification clients now call same-origin JSON endpoints and report unavailable services honestly. No passwords or verification codes are persisted in browser storage. The explicitly labelled demo setup works without authentication and preserves existing local workspace records.

Required server contracts (not implemented in this static project):

- POST `/api/auth/signup`: artist-name, email, password. Validate and create a pending account, send a six-digit code; return success JSON only after accepting the verification request.
- POST `/api/auth/verify-email`: email, code. Validate server-side expiry, attempt limits and single use; establish an HttpOnly secure session on success.
- POST `/api/auth/resend-code`: email. Enforce server-side rate limits and invalidate old codes.
- POST `/api/auth/signin`: email, password. Return `{ "onboarded": true|false }` with authenticated session. Reject unverified users or return them to verification.
- POST `/api/auth/forgot-password`: email. Return a uniform response, send reset instructions for eligible users.
- POST `/api/auth/onboarding`: role, stage, goal. Require a verified authenticated session and save answers.
- Errors: non-2xx status and `{ "error": "User-safe explanation" }`.

Production requires a selected identity/email provider, verified sender, server-side account storage, sessions, CSRF protection, password recovery completion and account-scoped workspace persistence. The local workspace is a demo, not an authorization boundary. Do not deploy these pages as a working production account service without that integration.

Founder supplied: Samuel Fakunle. Contact: Uniifyforartists@gmail.com. Biography has not been supplied; no biography was invented. This public contact address does not configure an email delivery service.
