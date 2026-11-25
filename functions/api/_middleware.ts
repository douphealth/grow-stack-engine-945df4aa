/**
 * Every /api/* route: turn an unexpected exception (typically D1 refusing queries, e.g. when the
 * account hits its daily D1 read limit) into a JSON 503 the app understands, instead of
 * Cloudflare's bare "error code: 1101" 500.
 *  - The app keeps polling a checkout claim and keeps cached PRO on verify.
 *  - The Stripe webhook gets a 5xx, so Stripe retries the event later (up to 3 days).
 */
import { json } from '../../server/http';

interface MiddlewareCtx { next: () => Promise<Response> }

export const onRequest = async (ctx: MiddlewareCtx): Promise<Response> => {
  try {
    return await ctx.next();
  } catch (e) {
    console.error('api error', e instanceof Error ? e.message : String(e));
    return json({ ok: false, error: 'temporarily_unavailable', retry: true }, 503, { 'retry-after': '60' });
  }
};
