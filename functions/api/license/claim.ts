/**
 * POST /api/license/claim  { session_id?: "cs_…", ref?: "gos_…" }
 *
 * Called by the app after checkout. Two ways to find the payment, both checked against Stripe or
 * against a webhook-written record, never trusted from the browser:
 *  - session_id: Stripe's redirect after payment (/payment-success?session_id=… → /?payment=success&session_id=…)
 *  - ref: the random client_reference_id the app appended to the Payment Link before opening it.
 * Returns { ok:true, token, entitlements } or { ok:false, pending:true } while the payment is not visible yet.
 */
import type { Ctx } from '../../../server/env';
import { json, notConfigured, readJson, sameOriginOrNoOrigin, appOrigin } from '../../../server/http';
import { ensureSchema, licenseById, purchaseByRef } from '../../../server/db';
import { grantFromSession, issueToken, maskEmail } from '../../../server/grant';
import { getSession, listCompleteSessions, StripeError } from '../../../server/stripe';

const SESSION_RE = /^cs_(test|live)_[A-Za-z0-9]{10,200}$/;
const REF_RE = /^gos_[a-f0-9]{24,64}$/;

export const onRequestPost = async (ctx: Ctx) => {
  const { request, env } = ctx;
  if (!sameOriginOrNoOrigin(request, env)) return json({ ok: false, error: 'forbidden' }, 403);
  if (!env.DB || !env.LICENSE_SECRET) return notConfigured('Licensing');
  const body = await readJson<{ session_id?: string; ref?: string }>(request);
  const sessionId = typeof body?.session_id === 'string' && SESSION_RE.test(body.session_id) ? body.session_id : null;
  const ref = typeof body?.ref === 'string' && REF_RE.test(body.ref) ? body.ref : null;
  if (!sessionId && !ref) return json({ ok: false, error: 'bad_request' }, 400);

  await ensureSchema(env.DB);
  const origin = appOrigin(env, request);

  // 1. A webhook may already have stored the purchase for this ref.
  if (ref) {
    const p = await purchaseByRef(env.DB, ref);
    const lic = p && (await licenseById(env.DB, p.license_id));
    if (lic && lic.status === 'active') {
      return json({ ok: true, token: await issueToken(env, lic), entitlements: lic.entitlements, email: maskEmail(lic.email) });
    }
  }
  if (!env.STRIPE_SECRET_KEY) return json({ ok: false, pending: true });

  try {
    let session = sessionId ? await getSession(env, sessionId) : null;
    if (!session && ref) {
      const recent = await listCompleteSessions(env, { createdGte: Math.floor(Date.now() / 1000) - 6 * 3600 });
      const hit = recent.find((s) => s.client_reference_id === ref);
      session = hit ? await getSession(env, hit.id) : null;
    }
    if (!session) return json({ ok: false, pending: true });
    if (ref && sessionId && session.client_reference_id && session.client_reference_id !== ref) {
      return json({ ok: false, error: 'mismatch' }, 409);
    }
    if (session.status !== 'complete' || session.payment_status !== 'paid') return json({ ok: false, pending: true });
    const grant = await grantFromSession(env, session, origin, ctx.waitUntil.bind(ctx));
    if (!grant) return json({ ok: false, error: 'not_a_growos_purchase' }, 404);
    return json({ ok: true, ...grant });
  } catch (e) {
    if (e instanceof StripeError && e.status === 404) return json({ ok: false, error: 'unknown_session' }, 404);
    return json({ ok: false, error: 'upstream_unavailable' }, 502);
  }
};
