# GrowOS cutover runbook (PR #2 → grow-plan.gearuptogrow.com)

Prepared 2026-11-25. **Nothing below the "Prepared" table has been run.** Each step that touches money, Stripe,
the Worker or production needs the owner's go.

## Prepared (done, not live)

| What | Where | Effect today |
|---|---|---|
| D1 `growos-licenses` (9af870b2…), schema applied | CF account 284f1a03 | none: only production of the Pages project is bound to it, and nothing routes there yet |
| D1 `growos-licenses-preview` (6edd9853…), schema applied | CF account 284f1a03 | branch previews only |
| `wrangler.toml`: DB bindings (preview DB for branches, prod DB for `main`), `MAIL_FROM` | repo | applies on deploy |
| `LICENSE_SECRET` (random 32 bytes, never displayed) on **preview** and **production** | Pages project `grow-stack-engine-945df4aa` | applies on deploy |
| `/api/*` outage middleware (D1 errors → JSON 503 + retry) | repo | verified on the preview during a real D1 outage |
| Same-origin lead shim on the production domain | `src/integrations/supabase/client.ts` | lead capture keeps working behind the Worker |
| `work/G2_growos_worker_upstream.py` (`--dry`/`--apply`/`--rollback`) | project folder | not run |

## Blocker found: D1 free-tier daily read limit

On 2026-11-25 at about 18:00 UTC, account 284f1a03 hit the **D1 free-tier daily row-read limit**: error 7500,
"exceeded D1's free tier daily row read limit". The limit is shared by every D1 database on the account (tender-atlas,
carrier-index, foodscan-*). Until 00:00 UTC every D1 query fails. For GrowOS that means:
- existing buyers: unaffected (cached PRO is kept when verify fails);
- a new buyer: the app keeps "confirming" for up to 30 min, then they must reopen the app later or use Restore;
  the Stripe webhook is retried by Stripe for up to 3 days, so the purchase is never lost;
- restore by e-mail: fails until the reset.

**Decision needed (pick one before step 3):**
- **A (recommended):** Workers Paid on account 284f1a03, US$5/month, which includes 25 billion D1 row reads a month.
- **B:** find and cut the project that reads ~5M rows/day (outside GrowOS), and accept the risk.

## Steps

1. **Stripe (owner, dashboard). Restricted key.** Developers → API keys → Create restricted key
   `growos-license-verify`, permission **Checkout Sessions: Read** only. Then:
   ```
   npx wrangler pages secret put STRIPE_SECRET_KEY --project-name grow-stack-engine-945df4aa
   ```
2. **Stripe (owner, dashboard). Webhook.** Developers → Webhooks → Add endpoint
   `https://grow-plan.gearuptogrow.com/api/stripe/webhook`, events `checkout.session.completed`,
   `checkout.session.async_payment_succeeded`, `charge.refunded`. Copy the signing secret:
   ```
   npx wrangler pages secret put STRIPE_WEBHOOK_SECRET --project-name grow-stack-engine-945df4aa
   ```
   Until step 5 the endpoint answers from the old build (405). Stripe retries, and that is harmless. Alternatively,
   create the webhook right after step 5.
3. **Email (owner).** A Brevo transactional key (rotate the one hard-coded in the Worker), sender
   `info@gearuptogrow.com` verified in Brevo:
   ```
   npx wrangler pages secret put BREVO_API_KEY --project-name grow-stack-engine-945df4aa
   ```
4. **Merge PR #2** to `main`. Pages deploys production to `grow-stack-engine-945df4aa.pages.dev`. Check:
   `https://grow-stack-engine-945df4aa.pages.dev/api/config` →
   `{"licensing":true,"verifiedCheckout":true,"restoreByEmail":true,...}`.
5. **Worker (Claude with your go, or you).**
   `python work/G2_growos_worker_upstream.py --dry`, review, then `--apply`. The script checks
   `https://grow-plan.gearuptogrow.com/api/config` afterwards.
6. **Verify on the domain** (no payment): free flow at 375px, upgrade → each of the 4 links opens Stripe at
   $7.99 / $12.98 / $17.98 / $22.97, 0 console errors, a legacy device stays PRO, a lead from the quiz reaches Brevo list 8.
7. **One real purchase** of $7.99 by the owner, refunded afterwards: PRO unlocks in the original tab, the confirmation
   e-mail arrives, Restore works on a second browser, and the refund removes PRO on the next load.
8. Optional: on each Payment Link set *After payment → redirect* to
   `https://grow-plan.gearuptogrow.com/payment-success?session_id={CHECKOUT_SESSION_ID}` (faster unlock), and set
   the public business name in Stripe (checkout shows a personal name today).

## Rollback

| Undo | How |
|---|---|
| Step 5 (Worker) | `python work/G2_growos_worker_upstream.py --rollback`. Instant; the domain serves the June build again. Legacy buyers are unaffected; buyers from the new flow keep their token but the old build ignores it (they would need the old `isPro` flag). |
| Step 4 (merge) | Revert the merge commit on `main`, or Pages → Deployments → Rollback. |
| Steps 1–3 | Delete the secret: `npx wrangler pages secret delete <NAME> --project-name grow-stack-engine-945df4aa`. Delete the webhook endpoint / restricted key in Stripe. |
| D1 | Additive. Delete only if abandoning: `npx wrangler d1 delete growos-licenses` (and `-preview`). |
