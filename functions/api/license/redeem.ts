/** POST /api/license/redeem { code } → exchanges an e-mailed restore code for a license token. */
import type { Ctx } from '../../../server/env';
import { json, notConfigured, readJson, sameOriginOrNoOrigin } from '../../../server/http';
import { verify } from '../../../server/crypto';
import { ensureSchema, licenseById } from '../../../server/db';
import { issueToken, maskEmail } from '../../../server/grant';

export const onRequestPost = async ({ request, env }: Ctx) => {
  if (!sameOriginOrNoOrigin(request, env)) return json({ ok: false, error: 'forbidden' }, 403);
  if (!env.DB || !env.LICENSE_SECRET) return notConfigured('Licensing');
  const body = await readJson<{ code?: string }>(request);
  const claims = await verify<{ lid: string }>(env.LICENSE_SECRET, 'restore', body?.code);
  if (!claims?.lid) return json({ ok: false, error: 'invalid_or_expired' }, 400);
  await ensureSchema(env.DB);
  const lic = await licenseById(env.DB, claims.lid);
  if (!lic || lic.status !== 'active') return json({ ok: false, error: 'no_active_license' }, 404);
  return json({ ok: true, token: await issueToken(env, lic), entitlements: lic.entitlements, email: maskEmail(lic.email) });
};
