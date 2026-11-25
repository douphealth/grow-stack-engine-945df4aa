import { ADDONS, ENTITLEMENTS_BY_TOTAL, type Entitlement } from '../shared/catalog';
import type { Env } from './env';

export interface CheckoutSession {
  id: string;
  object: 'checkout.session';
  status: 'open' | 'complete' | 'expired' | null;
  payment_status: 'paid' | 'unpaid' | 'no_payment_required';
  mode: string;
  amount_total: number | null;
  currency: string | null;
  client_reference_id: string | null;
  customer_details?: { email?: string | null } | null;
  customer_email?: string | null;
  payment_link?: string | null;
  payment_intent?: string | null;
  livemode: boolean;
  created: number;
  line_items?: { data: { description?: string | null; price?: { product?: string | { name?: string } } }[] };
}

export class StripeError extends Error {
  constructor(public status: number, message: string) { super(message); }
}

async function stripeGet<T>(env: Env, path: string, params: [string, string][] = []): Promise<T> {
  const base = (env.STRIPE_API_BASE || 'https://api.stripe.com').replace(/\/$/, '');
  const qs = params.map(([k, v]) => `${encodeURIComponent(k)}=${encodeURIComponent(v)}`).join('&');
  const res = await fetch(`${base}${path}${qs ? `?${qs}` : ''}`, {
    headers: { Authorization: `Bearer ${env.STRIPE_SECRET_KEY}`, 'Stripe-Version': '2024-06-20' },
  });
  if (!res.ok) throw new StripeError(res.status, `Stripe ${path.split('/').slice(0, 3).join('/')} -> ${res.status}`);
  return (await res.json()) as T;
}

export function getSession(env: Env, id: string): Promise<CheckoutSession> {
  return stripeGet<CheckoutSession>(env, `/v1/checkout/sessions/${encodeURIComponent(id)}`, [['expand[]', 'line_items']]);
}

export async function listCompleteSessions(env: Env, filter: { createdGte?: number; email?: string }): Promise<CheckoutSession[]> {
  const params: [string, string][] = [['limit', '100'], ['status', 'complete']];
  if (filter.createdGte) params.push(['created[gte]', String(filter.createdGte)]);
  if (filter.email) params.push(['customer_details[email]', filter.email]);
  const page = await stripeGet<{ data: CheckoutSession[] }>(env, '/v1/checkout/sessions', params);
  return page.data || [];
}

export const sessionEmail = (s: CheckoutSession) => (s.customer_details?.email || s.customer_email || '').trim().toLowerCase();

/**
 * What a paid session entitles the buyer to. Returns null when the session is not a paid GrowOS
 * purchase (the Stripe account also sells other products, so "paid" alone is not enough).
 */
export function entitlementsFor(s: CheckoutSession, env: Env): Entitlement[] | null {
  if (s.status !== 'complete') return null;
  if (s.payment_status !== 'paid') return null;
  if (s.mode && s.mode !== 'payment') return null;

  const names = (s.line_items?.data || []).map((li) => {
    const product = li.price?.product;
    return `${li.description || ''} ${typeof product === 'object' && product?.name ? product.name : ''}`;
  });
  if (names.length) {
    if (!names.some((n) => /growos/i.test(n))) return null;
    const ent: Entitlement[] = ['pro'];
    for (const [id, a] of Object.entries(ADDONS)) if (names.some((n) => a.matchName.test(n))) ent.push(id as Entitlement);
    return ent;
  }

  // No line items: only trust the amount when the session came from a known GrowOS Payment Link.
  const allowed = (env.GROWOS_PAYMENT_LINK_IDS || '').split(',').map((x) => x.trim()).filter(Boolean);
  if (s.payment_link && allowed.includes(s.payment_link) && (s.currency || '').toLowerCase() === 'usd') {
    return ENTITLEMENTS_BY_TOTAL[s.amount_total ?? -1] ?? null;
  }
  return null;
}
