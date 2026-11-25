/**
 * POST /api/stripe/webhook (Stripe → us). Events to subscribe:
 *   checkout.session.completed, checkout.session.async_payment_succeeded, charge.refunded
 * The session is re-read from Stripe (with line items) before anything is granted.
 */
import type { Ctx } from '../../../server/env';
import { json } from '../../../server/http';
import { verifyStripeSignature } from '../../../server/crypto';
import { ensureSchema, refundPurchase } from '../../../server/db';
import { grantFromSession } from '../../../server/grant';
import { getSession } from '../../../server/stripe';

const APP_ORIGIN = 'https://grow-plan.gearuptogrow.com';

export const onRequestPost = async (ctx: Ctx) => {
  const { request, env } = ctx;
  if (!env.STRIPE_WEBHOOK_SECRET || !env.DB || !env.LICENSE_SECRET || !env.STRIPE_SECRET_KEY) {
    return json({ ok: false, error: 'not_configured' }, 503);
  }
  const payload = await request.text();
  if (payload.length > 512 * 1024) return json({ ok: false }, 413);
  if (!(await verifyStripeSignature(payload, request.headers.get('stripe-signature'), env.STRIPE_WEBHOOK_SECRET))) {
    return json({ ok: false, error: 'bad_signature' }, 400);
  }
  const event = JSON.parse(payload) as { type: string; data: { object: Record<string, unknown> } };
  await ensureSchema(env.DB);
  const obj = event.data?.object || {};

  if (event.type === 'checkout.session.completed' || event.type === 'checkout.session.async_payment_succeeded') {
    const session = await getSession(env, String(obj.id));
    const grant = await grantFromSession(env, session, APP_ORIGIN, ctx.waitUntil.bind(ctx));
    return json({ ok: true, granted: Boolean(grant) });
  }
  if (event.type === 'charge.refunded') {
    const fully = obj.refunded === true || (typeof obj.amount === 'number' && obj.amount_refunded === obj.amount);
    if (fully && typeof obj.payment_intent === 'string') await refundPurchase(env.DB, obj.payment_intent);
    return json({ ok: true, refunded: fully });
  }
  return json({ ok: true, ignored: event.type });
};
