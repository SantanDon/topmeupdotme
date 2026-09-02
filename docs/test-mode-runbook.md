# Top Me Up Test Mode runbook

This is the operator checklist for the first real end-to-end test. It deliberately keeps provider credentials out of chat, source control, and screenshots.

## 1. Private configuration

Create `.env.local` from `.env.example` and set:

- `APP_URL` to the public HTTPS staging URL.
- `PAYSTACK_SECRET_KEY` to the Paystack **Test Mode** secret key.
- `DESERT_RETAIL_API_URL`, `DESERT_RETAIL_USERNAME`, and `DESERT_RETAIL_PASSWORD` to the RAVASVend test account.
- `TURSO_DB_URL` and `TURSO_DB_AUTH_TOKEN` to the staging database.
- `RESEND_API_KEY` and `NOREPLY_EMAIL_DOMAIN` only if email delivery is being tested.

Never paste these values into WhatsApp, email, tickets, or the repository.

## 1.1 Readiness check

Request `GET /api/readiness` on the staging host before attempting a payment. A configured environment returns HTTP 200 with only `configured`, `missing`, and `status` fields. A missing environment returns HTTP 503 and names only the missing variables; it must never echo a secret value.

## 2. Dashboard and database

1. Run `pnpm db:migrate` against the staging database.
2. In Paystack Test Mode, register:
   `https://YOUR_STAGING_HOST/api/paystack/webhook`
3. Confirm the app is using the same public host in `APP_URL`.
4. Use a provider-approved RAVASVend test meter. Do not substitute a real customer meter.

## 3. Happy-path evidence

Record the timestamp and the `TMU-...` reference for each run.

1. Verify the meter. If multiple suppliers are returned, select the correct utility.
2. Create the time-limited support link.
3. Open the link and complete a low-value Paystack Test Mode checkout.
4. Confirm the signed `charge.success` webhook is accepted.
5. Confirm server-side payment verification matches amount, currency, email, reference, and request metadata.
6. Confirm one `CreditVend` request contains the selected voucher code and meter-scoped terminal ID.
7. Confirm the token, receipt, and completed status appear on the thank-you page.
8. If Resend is configured, confirm the sender receipt and recipient token email arrive without tokens in URLs.
9. Use **Download PDF** on the thank-you page and verify the receipt opens and is readable.

## 4. Failure evidence

- Replay the same Paystack webhook. It must not vend twice.
- Use a provider test case that returns an explicit rejection. Confirm a full refund is queued.
- Use a provider test case that returns `mustALR=true` or times out. Confirm Advice is attempted against the original message ID and the transaction remains honest (`completed` only with a confirmed token; otherwise reconciliation).
- Confirm logs contain no secret key, password, full meter number, token, or payment authorization data.
- Confirm the status endpoint returns `429` after the configured abuse threshold and includes `Retry-After`.

## 5. Release decision

Do not call the product production-ready until the evidence above is attached to the handoff, the RAVASVend validation cases requested by RA Cellular are complete, and the public staging build has been reviewed on mobile and desktop.
