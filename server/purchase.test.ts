// @vitest-environment node
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { createD1 } from './test/d1-shim';
import { hmacHex, sign, verify, verifyStripeSignature } from './crypto';
import { _resetSchemaCacheForTests } from './db';
import { entitlementsFor, type CheckoutSession } from './stripe';
import type { Ctx, Env } from './env';
import { onRequestPost as claim } from '../functions/api/license/claim';
import { onRequestPost as verifyEp } from '../functions/api/license/verify';
import { onRequestPost as restore } from '../functions/api/license/restore';
import { onRequestPost as redeem } from '../functions/api/license/redeem';
import { onRequestPost as webhook } from '../functions/api/stripe/webhook';
import { onRequestPost as event } from '../functions/api/event';
import { onRequestGet as config } from '../functions/api/config';
import { onRequestPost as dlPost, onRequestGet as dlGet } from '../functions/api/download/[addon]';
import { paymentLinkFor, totalCents } from '../shared/catalog';

const SECRET = 'test-license-secret-0123456789abcdef';
const WHSEC = 'whsec_test_secret';
const ORIGIN = 'https://grow-plan.gearuptogrow.com';

const session = (over: Partial<CheckoutSession> = {}): CheckoutSession => ({
  id: 'cs_test_a1B2c3D4e5F6g7H8i9J0', object: 'checkout.session', status: 'complete', payment_status: 'paid',
  mode: 'payment', amount_total: 799, currency: 'usd', client_reference_id: 'gos_' + 'a'.repeat(32),
  customer_details: { email: 'Buyer@Example.com' }, payment_link: 'plink_x', payment_intent: 'pi_1', livemode: false,
  created: Math.floor(Date.now() / 1000),
  line_items: { data: [{ description: 'GrowOS PRO — Lifetime Access' }] },
  ...over,
});

let env: Env;
let sessions: Record<string, CheckoutSession>;
let mails: { to: string; subject: string; html: string }[];
let waits: Promise<unknown>[];

function ctx(path: string, body?: unknown, init: RequestInit = {}, params: Record<string, string> = {}): Ctx {
  const request = new Request(`${ORIGIN}${path}`, {
    method: body === undefined && !init.method ? 'GET' : 'POST',
    headers: { 'content-type': 'application/json', origin: ORIGIN, ...(init.headers as Record<string, string>) },
    body: body === undefined ? undefined : typeof body === 'string' ? body : JSON.stringify(body),
    ...init,
  });
  return { request, env, params, waitUntil: (p) => { waits.push(p); } };
}
const settle = () => Promise.all(waits.splice(0));

beforeEach(() => {
  _resetSchemaCacheForTests();
  sessions = {};
  mails = [];
  waits = [];
  env = {
    DB: createD1(), LICENSE_SECRET: SECRET, STRIPE_SECRET_KEY: 'rk_test_fake', STRIPE_WEBHOOK_SECRET: WHSEC,
    STRIPE_API_BASE: 'https://stripe.test', BREVO_API_KEY: 'brevo-test', MAIL_API_BASE: 'https://mail.test',
  };
  vi.stubGlobal('fetch', vi.fn(async (input: RequestInfo | URL, init?: RequestInit) => {
    const url = new URL(typeof input === 'string' ? input : input instanceof URL ? input.href : input.url);
    if (url.host === 'mail.test') {
      const b = JSON.parse(String(init?.body));
      mails.push({ to: b.to[0].email, subject: b.subject, html: b.htmlContent });
      return new Response('{"messageId":"m"}', { status: 201 });
    }
    if (url.host === 'stripe.test') {
      expect((init?.headers as Record<string, string>).Authorization).toBe('Bearer rk_test_fake');
      const m = url.pathname.match(/^\/v1\/checkout\/sessions\/([^/]+)$/);
      if (m) return sessions[m[1]] ? Response.json(sessions[m[1]]) : new Response('{}', { status: 404 });
      if (url.pathname === '/v1/checkout/sessions') {
        const email = url.searchParams.get('customer_details[email]');
        const data = Object.values(sessions).filter((s) => s.status === 'complete' && (!email || s.customer_details?.email?.toLowerCase() === email));
        return Response.json({ data: data.map(({ line_items, ...rest }) => rest) });
      }
    }
    return new Response('not found', { status: 404 });
  }));
});
afterEach(() => vi.unstubAllGlobals());

describe('catalog', () => {
  it('maps every add-on combination to the right Payment Link and total', () => {
    expect([paymentLinkFor([]), totalCents([])]).toEqual(['https://buy.stripe.com/eVq8wP9dK2uA9MF0IuejK00', 799]);
    expect([paymentLinkFor(['audio']), totalCents(['audio'])]).toEqual(['https://buy.stripe.com/00weVddu03yE4slezkejK06', 1298]);
    expect([paymentLinkFor(['blueprint']), totalCents(['blueprint'])]).toEqual(['https://buy.stripe.com/8x2eVd3Tq1qw3ohgHsejK07', 1798]);
    expect([paymentLinkFor(['audio', 'blueprint']), totalCents(['blueprint', 'audio'])]).toEqual(['https://buy.stripe.com/bJeaEX2Pm3yEcYR76SejK08', 2297]);
  });
});

describe('tokens and signatures', () => {
  it('signs and verifies, and rejects tampering, wrong purpose and expiry', async () => {
    const t = await sign(SECRET, 'license', { lid: 'lic_1' });
    expect(await verify(SECRET, 'license', t)).toMatchObject({ lid: 'lic_1' });
    expect(await verify(SECRET, 'restore', t)).toBeNull();
    expect(await verify('other-secret', 'license', t)).toBeNull();
    const [v, p, , s] = t.split('.');
    const forged = [v, p, Buffer.from('{"lid":"lic_2"}').toString('base64url'), s].join('.');
    expect(await verify(SECRET, 'license', forged)).toBeNull();
    const expired = await sign(SECRET, 'restore', { lid: 'lic_1', exp: Math.floor(Date.now() / 1000) - 1 });
    expect(await verify(SECRET, 'restore', expired)).toBeNull();
  });

  it('checks Stripe webhook signatures with a time tolerance', async () => {
    const payload = '{"id":"evt_1"}';
    const t = Math.floor(Date.now() / 1000);
    const good = `t=${t},v1=${await hmacHex(WHSEC, `${t}.${payload}`)}`;
    expect(await verifyStripeSignature(payload, good, WHSEC)).toBe(true);
    expect(await verifyStripeSignature(payload + ' ', good, WHSEC)).toBe(false);
    const old = `t=${t - 3600},v1=${await hmacHex(WHSEC, `${t - 3600}.${payload}`)}`;
    expect(await verifyStripeSignature(payload, old, WHSEC)).toBe(false);
  });
});

describe('entitlementsFor', () => {
  it('derives PRO and add-ons from GrowOS line items only', () => {
    expect(entitlementsFor(session(), env)).toEqual(['pro']);
    expect(entitlementsFor(session({ line_items: { data: [
      { description: 'GrowOS PRO — Lifetime Access' }, { description: 'Growth Accelerator Audio Pack' }, { description: '90-Day Transformation Blueprint' },
    ] } }), env)).toEqual(['pro', 'audio', 'blueprint']);
    expect(entitlementsFor(session({ line_items: { data: [{ description: 'French Bulldog Care Plan' }] } }), env)).toBeNull();
    expect(entitlementsFor(session({ payment_status: 'unpaid' }), env)).toBeNull();
    expect(entitlementsFor(session({ status: 'open' }), env)).toBeNull();
  });
  it('trusts amount-only sessions just for allow-listed Payment Links', () => {
    const s = session({ line_items: undefined, amount_total: 1798, payment_link: 'plink_growos' });
    expect(entitlementsFor(s, env)).toBeNull();
    expect(entitlementsFor(s, { ...env, GROWOS_PAYMENT_LINK_IDS: 'plink_growos' })).toEqual(['pro', 'blueprint']);
  });
});

describe('purchase flow', () => {
  it('the old URL grant is gone: a claim with no payment behind it unlocks nothing', async () => {
    const r = await claim(ctx('/api/license/claim', { ref: 'gos_' + 'b'.repeat(32) }));
    expect(await r.json()).toEqual({ ok: false, pending: true });
    const bad = await claim(ctx('/api/license/claim', { session_id: 'cs_test_doesnotexist000' }));
    expect(bad.status).toBe(404);
  });

  it('claim by ref (client_reference_id) issues a token once Stripe shows the payment, and sends one e-mail', async () => {
    const s = session();
    sessions[s.id] = s;
    const r = await claim(ctx('/api/license/claim', { ref: s.client_reference_id }));
    const body = await r.json();
    expect(body).toMatchObject({ ok: true, entitlements: ['pro'], email: 'b•••@example.com' });
    await settle();
    expect(mails).toHaveLength(1);
    expect(mails[0]).toMatchObject({ to: 'buyer@example.com', subject: 'Your GrowOS PRO purchase' });

    const v = await (await verifyEp(ctx('/api/license/verify', { token: body.token }))).json();
    expect(v).toMatchObject({ ok: true, valid: true, entitlements: ['pro'] });

    // Second claim (other tab / webhook) is idempotent: same license, no second e-mail.
    await claim(ctx('/api/license/claim', { session_id: s.id }));
    await settle();
    expect(mails).toHaveLength(1);
  });

  it('rejects a session_id that belongs to a different checkout ref', async () => {
    const s = session();
    sessions[s.id] = s;
    const r = await claim(ctx('/api/license/claim', { session_id: s.id, ref: 'gos_' + 'c'.repeat(32) }));
    expect(r.status).toBe(409);
  });

  it('does not unlock for another product sold on the same Stripe account', async () => {
    const s = session({ line_items: { data: [{ description: 'Frenchie Care Plan' }] } });
    sessions[s.id] = s;
    const r = await claim(ctx('/api/license/claim', { session_id: s.id }));
    expect(r.status).toBe(404);
  });

  it('webhook grants, and a full refund revokes', async () => {
    const s = session({ id: 'cs_test_webhookSession0001', client_reference_id: null });
    sessions[s.id] = s;
    const send = async (evt: unknown) => {
      const payload = JSON.stringify(evt);
      const t = Math.floor(Date.now() / 1000);
      return webhook(ctx('/api/stripe/webhook', payload, { headers: { 'stripe-signature': `t=${t},v1=${await hmacHex(WHSEC, `${t}.${payload}`)}` } }));
    };
    expect(await (await send({ type: 'checkout.session.completed', data: { object: { id: s.id } } })).json()).toMatchObject({ ok: true, granted: true });
    const forged = await webhook(ctx('/api/stripe/webhook', '{"type":"checkout.session.completed"}', { headers: { 'stripe-signature': 't=1,v1=00' } }));
    expect(forged.status).toBe(400);

    // Restore on a new device → e-mailed code → token
    await settle();
    mails = [];
    expect(await (await restore(ctx('/api/license/restore', { email: 'BUYER@example.com' }))).json()).toMatchObject({ ok: true });
    await settle();
    expect(mails).toHaveLength(1);
    const code = decodeURIComponent(mails[0].html.match(/\?restore=([^"&]+)/)![1].replace(/&amp;/g, '&'));
    const red = await (await redeem(ctx('/api/license/redeem', { code }))).json();
    expect(red).toMatchObject({ ok: true, entitlements: ['pro'] });

    expect(await (await send({ type: 'charge.refunded', data: { object: { payment_intent: 'pi_1', refunded: true, amount: 799, amount_refunded: 799 } } })).json()).toMatchObject({ refunded: true });
    const v = await (await verifyEp(ctx('/api/license/verify', { token: red.token }))).json();
    expect(v).toMatchObject({ ok: true, valid: false });
  });

  it('restore backfills buyers from before licensing by looking them up in Stripe, and never says who bought', async () => {
    const s = session({ id: 'cs_test_oldBuyerBeforeLicense', client_reference_id: null, customer_details: { email: 'old@example.com' } });
    sessions[s.id] = s;
    const a = await (await restore(ctx('/api/license/restore', { email: 'old@example.com' }))).json();
    const b = await (await restore(ctx('/api/license/restore', { email: 'nobody@example.com' }))).json();
    expect(a).toEqual(b);
    await settle();
    expect(mails.map((m) => m.subject)).toContain('Your GrowOS restore link');
    expect(mails.every((m) => m.to !== 'nobody@example.com')).toBe(true);
  });

  it('rate-limits restore e-mails per address', async () => {
    sessions['cs_test_rateLimitedBuyer01'] = session({ id: 'cs_test_rateLimitedBuyer01', customer_details: { email: 'r@example.com' } });
    await restore(ctx('/api/license/restore', { email: 'r@example.com' }));
    await restore(ctx('/api/license/restore', { email: 'r@example.com' }));
    await settle();
    expect(mails.filter((m) => m.subject === 'Your GrowOS restore link')).toHaveLength(1);
  });

  it('rejects cross-site POSTs', async () => {
    const r = await claim(ctx('/api/license/claim', { ref: 'gos_' + 'a'.repeat(32) }, { headers: { origin: 'https://evil.example' } }));
    expect(r.status).toBe(403);
  });

  it('answers 503 (not a crash) when licensing is not configured', async () => {
    env = {};
    expect((await claim(ctx('/api/license/claim', { ref: 'gos_' + 'a'.repeat(32) }))).status).toBe(503);
    expect(await (await config(ctx('/api/config'))).json()).toMatchObject({ licensing: false, addons: { audio: false, blueprint: false } });
  });
});

describe('add-on delivery and events', () => {
  it('serves an add-on only to its owner and only when the file exists', async () => {
    const files: Record<string, string> = { 'growos/90-day-transformation-blueprint.pdf': '%PDF-1.7 test' };
    env.ADDON_FILES = {
      head: async (k) => (files[k] ? { size: files[k].length } : null),
      get: async (k) => (files[k] ? { body: new Response(files[k]).body!, size: files[k].length, httpMetadata: { contentType: 'application/pdf' } } : null),
    };
    expect(await (await config(ctx('/api/config'))).json()).toMatchObject({ addons: { audio: false, blueprint: true } });

    const s = session({ line_items: { data: [{ description: 'GrowOS PRO — Lifetime Access' }, { description: '90-Day Transformation Blueprint' }] } });
    sessions[s.id] = s;
    const { token } = await (await claim(ctx('/api/license/claim', { session_id: s.id }))).json();

    expect((await dlPost(ctx('/api/download/audio', { token }, {}, { addon: 'audio' }))).status).toBe(403);
    const { url } = await (await dlPost(ctx('/api/download/blueprint', { token }, {}, { addon: 'blueprint' }))).json();
    const file = await dlGet(ctx(url, undefined, {}, { addon: 'blueprint' }));
    expect(file.headers.get('content-disposition')).toContain('Blueprint.pdf');
    expect(await file.text()).toBe('%PDF-1.7 test');
    expect((await dlGet(ctx('/api/download/blueprint?c=forged', undefined, {}, { addon: 'blueprint' }))).status).toBe(403);
  });

  it('counts funnel events without identifiers and refuses client-side "purchase"', async () => {
    expect((await event(ctx('/api/event', { name: 'plan_generated' }))).status).toBe(204);
    expect((await event(ctx('/api/event', { name: 'purchase' }))).status).toBe(400);
    await settle();
    const rows = (env.DB as ReturnType<typeof createD1>).raw.prepare('SELECT * FROM event_counts').all();
    expect(rows).toEqual([{ day: new Date().toISOString().slice(0, 10), name: 'plan_generated', count: 1 }]);
  });
});

describe('api middleware', () => {
  it('turns an exception (e.g. D1 read limit) into a JSON 503 with retry', async () => {
    const { onRequest } = await import('../functions/api/_middleware');
    const res = await onRequest({ next: async () => { throw new Error('D1_ERROR: daily read limit exceeded'); } });
    expect(res.status).toBe(503);
    expect(res.headers.get('retry-after')).toBe('60');
    expect(await res.json()).toEqual({ ok: false, error: 'temporarily_unavailable', retry: true });
  });
  it('passes normal responses through untouched', async () => {
    const { onRequest } = await import('../functions/api/_middleware');
    const res = await onRequest({ next: async () => new Response(null, { status: 204 }) });
    expect(res.status).toBe(204);
  });
});
