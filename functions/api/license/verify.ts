/** POST /api/license/verify { token } → current entitlements for that license (refunds revoke). */
import type { Ctx } from '../../../server/env';
import { json, notConfigured, readJson } from '../../../server/http';
import { verify } from '../../../server/crypto';
import { ensureSchema, licenseById } from '../../../server/db';
import { maskEmail } from '../../../server/grant';

export const onRequestPost = async ({ request, env }: Ctx) => {
  if (!env.DB || !env.LICENSE_SECRET) return notConfigured('Licensing');
  const body = await readJson<{ token?: string }>(request);
  const claims = await verify<{ lid: string }>(env.LICENSE_SECRET, 'license', body?.token);
  if (!claims?.lid) return json({ ok: false, valid: false }, 401);
  await ensureSchema(env.DB);
  const lic = await licenseById(env.DB, claims.lid);
  if (!lic || lic.status !== 'active') return json({ ok: true, valid: false, entitlements: [] });
  return json({ ok: true, valid: true, entitlements: lic.entitlements, email: maskEmail(lic.email) });
};
