# Account and cloud integration

Supabase project: stnetlqzgmuaqormvnvg. Canonical site: https://www.uniifyforartists.com.

Vercel functions use SUPABASE_PUBLISHABLE_KEY and optional SUPABASE_URL, APP_ORIGIN. No service-role key is used. Passwords, access tokens and refresh tokens are never persisted in browser storage. Sessions use Secure, HttpOnly, SameSite=Lax cookies. State-changing requests require the matching site Origin and JSON content type. Preview origins come only from Vercel's deployment environment.

Auth endpoints: POST /api/auth/signup, signin, resend-link, forgot-password, reset-password, callback, onboarding, signout; GET /api/auth/session. Passwords for signup/recovery are 10–128 characters. Email confirmation and password recovery use links only; OTP entry is unsupported. Supabase controls confirmation expiry, single use and provider rate limits.

The default Supabase emails contain links. auth-callback.html removes the token fragment immediately, validates the access token through Auth, rotates the refresh token, checks both belong to the same identity, and establishes the cookie session. Recovery then prompts for a new password. Code entry remains available for custom templates. Site URL and the explicit callback allowlist were saved through the dashboard on 24 November 2026. Email confirmations remain required.

Resend domain uniifyforartists.com is verified and Supabase custom SMTP was configured by the user. A live password recovery email was delivered through Resend on 24 November 2026. Default live email content was checked to contain a recovery link. Local templates use ConfirmationURL only; no OTP is displayed. Actual new-account confirmation and password submission still require user acceptance testing.

GET /api/workspace returns {data,revision,updated_at}; a missing record returns data:null, revision:0. PUT accepts {data,revision}; success returns {revision,updated_at}. A stale revision returns 409. Other users' IDs are never accepted as ownership inputs. The SQL function uses auth.uid() and RLS with the verified user's bearer token. Writes are atomic compare-and-save operations.

Workspace data retains schema version 3 and all task/release links, transitions, notes, history, observations and financial records. Additional fields: managerVersion, recommendationHistory and checkins. Maximum request size is 1.2 MB; profile images are resized to small JPEGs by the existing UI.

Accounts load cloud data before rendering. Failed/pending writes have an account-scoped browser backup and visible retry/export controls. Revision conflicts stop uploads until the artist exports pending work or loads the newer cloud copy. Reopening with a conflicting pending copy offers export and cloud selection rather than silently overwriting. One-time legacy import is offered only when no cloud copy exists. The local demo uses its own key.

Known operational limits: there is no continuous background cross-device refresh, offline initial loading, server-side queued email retry, or distributed app-level rate limiter beyond Supabase's controls. Another device sees updates on reload. Failed saves remain local until successfully retried; browser storage can be cleared by the user or browser. Signout waits for successful flush.

Run npm ci and npm test. Runtime functions are dependency-free; jsdom is a pinned development-only test dependency. Tests cover the browser DOM journey, two simulated devices/accounts, retry/conflict handling, API ownership and Supabase RLS in a rollback transaction. Actual inbox delivery and full live-account journey remain separately recorded acceptance checks.
