import type { Entitlement } from '../shared/catalog';
import { sign } from './crypto';
import { countEvent, ensureSchema, markEmailSent, recordPurchase, type License } from './db';
import type { Env } from './env';
import { mailConfigured, sendPurchaseConfirmation } from './mail';
import { entitlementsFor, sessionEmail, type CheckoutSession } from './stripe';

export interface Grant { token: string; entitlements: Entitlement[]; email: string }

export async function issueToken(env: Env, license: License): Promise<string> {
  return sign(env.LICENSE_SECRET!, 'license', { lid: license.id, iat: Math.floor(Date.now() / 1000) });
}

export const maskEmail = (e: string) => e.replace(/^(.)[^@]*(@.*)$/, (_m, a, b) => `${a}•••${b}`);

/**
 * Turn a Stripe Checkout Session into a license. Returns null if it is not a paid GrowOS purchase.
 * Safe to call from the webhook and from the claim endpoint for the same session.
 */
export async function grantFromSession(
  env: Env, session: CheckoutSession, origin: string, waitUntil: (p: Promise<unknown>) => void,
): Promise<Grant | null> {
  const ent = entitlementsFor(session, env);
  const email = sessionEmail(session);
  if (!ent || !email) return null;
  await ensureSchema(env.DB!);
  const { license, isNew } = await recordPurchase(env.DB!, {
    sessionId: session.id, email, entitlements: ent, ref: session.client_reference_id,
    paymentIntent: session.payment_intent ?? null, amountTotal: session.amount_total,
    currency: session.currency, livemode: session.livemode,
  });
  if (isNew) {
    waitUntil(countEvent(env.DB!, 'purchase').catch(() => undefined));
    if (mailConfigured(env)) {
      waitUntil((async () => {
        if (await markEmailSent(env.DB!, session.id)) await sendPurchaseConfirmation(env, email, origin, license.entitlements);
      })().catch(() => undefined));
    }
  }
  return { token: await issueToken(env, license), entitlements: license.entitlements, email: maskEmail(email) };
}
