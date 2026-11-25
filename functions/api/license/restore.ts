/**
 * POST /api/license/restore { email }
 * Sends a 30-minute sign-in link to the buyer's e-mail. The answer is the same whether or not a
 * purchase exists, so the endpoint cannot be used to find out who bought.
 * Buyers from before the license system are found in Stripe by e-mail and backfilled here.
 */
import type { Ctx } from '../../../server/env';
import { EMAIL_RE, json, normEmail, notConfigured, readJson, sameOriginOrNoOrigin, appOrigin } from '../../../server/http';
import { sign } from '../../../server/crypto';
import { allowRestoreEmail, ensureSchema, licenseByEmail } from '../../../server/db';
import { grantFromSession } from '../../../server/grant';
import { mailConfigured, sendRestoreLink } from '../../../server/mail';
import { getSession, listCompleteSessions } from '../../../server/stripe';

const GENERIC = { ok: true, message: 'If that e-mail bought GrowOS PRO, a restore link is on its way. Check your inbox and spam folder.' };

export const onRequestPost = async (ctx: Ctx) => {
  const { request, env } = ctx;
  if (!sameOriginOrNoOrigin(request, env)) return json({ ok: false, error: 'forbidden' }, 403);
  if (!env.DB || !env.LICENSE_SECRET) return notConfigured('Licensing');
  if (!mailConfigured(env)) return json({ ok: false, error: 'restore_email_unavailable' }, 503);
  const body = await readJson<{ email?: string }>(request);
  const email = normEmail(body?.email);
  if (!EMAIL_RE.test(email)) return json({ ok: false, error: 'invalid_email' }, 400);

  await ensureSchema(env.DB);
  if (!(await allowRestoreEmail(env.DB, email))) return json(GENERIC);

  const origin = appOrigin(env, request);
  let lic = await licenseByEmail(env.DB, email);
  if ((!lic || lic.status !== 'active') && env.STRIPE_SECRET_KEY) {
    try {
      for (const s of (await listCompleteSessions(env, { email })).slice(0, 20)) {
        await grantFromSession(env, await getSession(env, s.id), origin, () => undefined);
      }
      lic = await licenseByEmail(env.DB, email);
    } catch {
      /* Stripe unavailable: fall through with whatever D1 has */
    }
  }
  if (lic && lic.status === 'active') {
    const code = await sign(env.LICENSE_SECRET, 'restore', { lid: lic.id, exp: Math.floor(Date.now() / 1000) + 1800 });
    ctx.waitUntil(sendRestoreLink(env, email, `${origin}/?restore=${encodeURIComponent(code)}`).catch(() => false));
  }
  return json(GENERIC);
};
