# Top Me Up

Top Me Up lets someone verify a South African prepaid electricity meter, create a time-limited support link, and receive an electricity top-up from another person. Payments are handled by Paystack; successful payments are converted into electricity through Desert Retail's SOAP service.

## How the transaction works

1. The recipient submits an 11–13 digit prepaid meter number.
2. The server verifies that meter with Desert Retail and stores a 24-hour request.
3. A sender opens the opaque public link and starts a Paystack transaction.
4. Paystack redirects the sender to its hosted checkout.
5. A signed Paystack webhook is verified against the stored amount, currency, email, and request.
6. The server atomically claims the transaction, calls Desert Retail once, and stores the resulting token and receipt.
7. Explicit vending failures trigger a full refund. Ambiguous network failures enter `reconciliation_required` so the app never risks a duplicate vend.

The browser is never trusted to declare a payment successful, and electricity tokens are not placed in shareable URLs.

## Local setup

Requirements:

- Node.js 20 or newer
- pnpm
- a libSQL/Turso database
- Paystack test credentials
- Desert Retail test credentials and a valid test meter

Install and configure:

```powershell
pnpm install
Copy-Item .env.example .env.local
pnpm db:migrate
pnpm turbo
```

Open `http://localhost:3000`.

The variable names and expected formats are documented in `.env.example`. Never commit `.env.local` or provider credentials.

Before a staging smoke test, check `/api/readiness`. It returns HTTP 200 only when the required configuration is present, or HTTP 503 with safe configured/missing variable names. It never returns secret values.

## Paystack setup

Set the Paystack webhook URL to:

```text
https://YOUR_PUBLIC_HOST/api/paystack/webhook
```

The callback URL is derived from `APP_URL`. Use Paystack test mode until the full meter-verification, payment, vend, receipt, refund, and reconciliation paths have been signed off.

## Quality checks

```powershell
bun test lib/server-only/desert-retail lib/server-only/paystack
pnpm exec tsc --noEmit
pnpm run build
```

The tests cover SOAP serialization and parsing, Desert Retail request behavior, Paystack signature validation, and Paystack API boundaries.

The live provider checklist is in [`docs/test-mode-runbook.md`](docs/test-mode-runbook.md). Keep all provider keys in `.env.local` only.

## Deployment checklist

- Run database migrations against a backup or staging database first.
- Configure all production environment variables in the hosting platform.
- Register the exact production webhook URL in Paystack.
- Confirm HTTPS and verify that `APP_URL` is the public canonical origin.
- Confirm `/api/readiness` returns HTTP 200 without exposing configuration values.
- Test one low-value top-up with a provider-approved meter.
- Confirm duplicate webhooks do not vend twice.
- Force an explicit provider rejection and verify the Paystack refund.
- Force an ambiguous provider timeout and verify manual reconciliation.
- Confirm logs and analytics never contain credentials, meter numbers, electricity tokens, or payment authorization data.
- Add monitoring for `failed`, `refund_pending`, and `reconciliation_required` transactions.

## Known launch boundary

The codebase is integration-ready, but production readiness requires live credentials, the provider's current API document, a provider-approved meter, Paystack dashboard configuration, a chosen public HTTPS host, and end-to-end evidence from the real sandbox services. The Luvo Networks owner must also complete any Paystack merchant activation or agreement step; do not treat admin access alone as legal acceptance.
