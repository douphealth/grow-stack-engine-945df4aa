/**
 * POST /api/download/:addon { token } → { url } (10-minute link)
 * GET  /api/download/:addon?c=…       → the file, streamed from R2
 * Delivery is server-gated: the file is only served to a license that owns the add-on.
 */
import type { Ctx } from '../../../server/env';
import { json, notConfigured, readJson } from '../../../server/http';
import { sign, verify } from '../../../server/crypto';
import { ensureSchema, licenseById } from '../../../server/db';
import { addonFile, isAddon } from '../../../server/addons';

export const onRequestPost = async ({ request, env, params }: Ctx) => {
  if (!env.DB || !env.LICENSE_SECRET) return notConfigured('Licensing');
  const addon = params.addon;
  if (!isAddon(addon)) return json({ ok: false, error: 'unknown_addon' }, 404);
  const body = await readJson<{ token?: string }>(request);
  const claims = await verify<{ lid: string }>(env.LICENSE_SECRET, 'license', body?.token);
  if (!claims) return json({ ok: false, error: 'invalid_token' }, 401);
  await ensureSchema(env.DB);
  const lic = await licenseById(env.DB, claims.lid);
  if (!lic || lic.status !== 'active' || !lic.entitlements.includes(addon)) return json({ ok: false, error: 'not_owned' }, 403);
  if (!env.ADDON_FILES || !(await env.ADDON_FILES.head(addonFile(env, addon).key))) return json({ ok: false, error: 'not_available' }, 404);
  const code = await sign(env.LICENSE_SECRET, 'download', { lid: lic.id, a: addon, exp: Math.floor(Date.now() / 1000) + 600 });
  return json({ ok: true, url: `/api/download/${addon}?c=${encodeURIComponent(code)}` });
};

export const onRequestGet = async ({ request, env, params }: Ctx) => {
  if (!env.LICENSE_SECRET || !env.ADDON_FILES) return notConfigured('Downloads');
  const addon = params.addon;
  if (!isAddon(addon)) return json({ ok: false, error: 'unknown_addon' }, 404);
  const claims = await verify<{ lid: string; a: string }>(env.LICENSE_SECRET, 'download', new URL(request.url).searchParams.get('c'));
  if (!claims || claims.a !== addon) return json({ ok: false, error: 'link_expired' }, 403);
  const file = addonFile(env, addon);
  const obj = await env.ADDON_FILES.get(file.key);
  if (!obj) return json({ ok: false, error: 'not_available' }, 404);
  return new Response(obj.body, {
    headers: {
      'content-type': obj.httpMetadata?.contentType || 'application/octet-stream',
      'content-disposition': `attachment; filename="${file.filename}"`,
      'cache-control': 'private, no-store',
      'x-robots-tag': 'noindex',
    },
  });
};
