/**
 * POST /api/event { name } → +1 on a per-day counter. No cookies, no IDs, no IP or user agent
 * stored. "purchase" is counted by the server when a payment is verified, never from the browser.
 */
import { FUNNEL_EVENTS } from '../../shared/catalog';
import type { Ctx } from '../../server/env';
import { json, readJson, sameOriginOrNoOrigin } from '../../server/http';
import { countEvent, ensureSchema } from '../../server/db';

const CLIENT_EVENTS = new Set<string>(FUNNEL_EVENTS.filter((e) => e !== 'purchase'));

export const onRequestPost = async (ctx: Ctx) => {
  const { request, env } = ctx;
  if (!sameOriginOrNoOrigin(request)) return new Response(null, { status: 403 });
  const body = await readJson<{ name?: string }>(request, 256);
  if (!body?.name || !CLIENT_EVENTS.has(body.name)) return json({ ok: false }, 400);
  if (env.DB) ctx.waitUntil(ensureSchema(env.DB).then(() => countEvent(env.DB!, body.name!)).catch(() => undefined));
  return new Response(null, { status: 204 });
};
