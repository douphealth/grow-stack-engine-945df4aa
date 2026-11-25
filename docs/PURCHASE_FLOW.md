# GrowOS purchase flow: verified PRO unlock

## How it works

```
Upgrade screen ──"Get PRO"──▶ Stripe Payment Link (new tab)
   │  ?client_reference_id=gos_<random>  (&prefilled_email=…)
   │
   ├─ the app tab polls POST /api/license/claim {ref}         ─┐
   ├─ Stripe redirect /?payment=success&session_id=cs_…        ├─▶ server reads the Checkout Session
   │     → POST /api/license/claim {session_id}                │   from Stripe (line items must say
   └─ Stripe webhook POST /api/stripe/webhook                 ─┘   "GrowOS"), writes D1, returns a
                                                                    signed token (HMAC, LICENSE_SECRET)
New device: "Restore purchase" → e-mail → 30-min link /?restore=… → POST /api/license/redeem → token
On every load: POST /api/license/verify {token} → current entitlements (refunds revoke)
```

- **`?payment=success` no longer unlocks anything.** It is stripped from the URL.
- **Existing buyers stay unlocked.** A device that already has `isPro: true` in `growos-state-v4`
  keeps PRO ("legacy"). Nothing writes that flag any more, so it cannot spread. Legacy buyers can
  link their purchase to an e-mail with "Restore purchase"; `restore` looks them up in Stripe by
  e-mail and backfills a license.
- **Add-ons are sold only when deliverable.** `/api/config` reports an add-on as available only
  when its file exists in the `ADDON_FILES` R2 bucket. Until then the Upgrade screen offers PRO
  alone. Downloads are served by `/api/download/:addon` to licenses that own the add-on only.
- **Funnel events** (`plan_generated`, `upgrade_clicked`, `checkout_reached`; `purchase` is counted
  by the server on a verified payment) are +1 counters per day in D1. No cookies, no IDs, no IP.
  `SELECT day, name, count FROM event_counts ORDER BY day DESC;`

Client-side limit: PRO features run in the browser, so a determined user can always patch the
JavaScript. This change removes the shareable URL grant, makes PRO revocable, and server-gates the
paid downloads, which are the only paid assets that leave the server.

## Configuration (Cloudflare Pages project `grow-stack-engine-945df4aa`)

| Binding | Type | Needed for |
|---|---|---|
| `DB` | D1 database (e.g. `growos-licenses`) | everything (licenses, purchases, events) |
| `LICENSE_SECRET` | secret, 32+ random bytes | tokens, restore and download links |
| `STRIPE_SECRET_KEY` | secret, **restricted** key: Checkout Sessions *read* | claim, restore backfill, webhook |
| `STRIPE_WEBHOOK_SECRET` | secret `whsec_…` | webhook (recommended) |
| `BREVO_API_KEY` | secret | restore e-mails + purchase confirmation |
| `MAIL_FROM` | var, default `info@gearuptogrow.com` | sender (must be a verified Brevo sender) |
| `ADDON_FILES` | R2 bucket | add-on delivery; keys `growos/growth-accelerator-audio-pack.zip`, `growos/90-day-transformation-blueprint.pdf` (override with `ADDON_AUDIO_KEY` / `ADDON_BLUEPRINT_KEY`) |
| `GROWOS_PAYMENT_LINK_IDS` | var, optional `plink_…,plink_…` | amount-only fallback when line items are missing |

Without `DB` + `LICENSE_SECRET` every endpoint answers `503 not_configured` and the app keeps
working on the free plan (and legacy PRO).

Stripe (owner action):
1. Webhook endpoint `https://grow-plan.gearuptogrow.com/api/stripe/webhook`, events
   `checkout.session.completed`, `checkout.session.async_payment_succeeded`, `charge.refunded`.
2. Optional but better: on each of the 4 Payment Links set *After payment → redirect* to
   `https://grow-plan.gearuptogrow.com/payment-success?session_id={CHECKOUT_SESSION_ID}`.
   Not required: the `client_reference_id` claim unlocks the original tab without it.
3. Turn on *Email customers about successful payments* (Stripe receipts).

## Local test

```
npm run build
npx wrangler pages dev dist --d1 DB --binding LICENSE_SECRET=dev --binding STRIPE_SECRET_KEY=sk_test_… 
npx vitest run           # 23 tests: tokens, webhook signature, claim/restore/refund, downloads, app entitlement
```

## Production cutover

See [CUTOVER.md](CUTOVER.md): what is already prepared, the D1 free-tier blocker, and the ordered owner steps.

## Rollback

- App: revert the merge commit on `main` (Pages redeploys the previous build), or in the Pages
  dashboard *Rollback* to the previous production deployment.
- Worker: point the upstream host back to `grow-stack-engine.gearup-flow-master.pages.dev`
  (or redeploy the previous Worker version).
- Data: D1 tables are additive; leaving them in place is harmless.
