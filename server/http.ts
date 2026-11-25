export function json(body: unknown, status = 200, headers: Record<string, string> = {}): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: {
      'content-type': 'application/json; charset=utf-8',
      'cache-control': 'no-store',
      'x-content-type-options': 'nosniff',
      ...headers,
    },
  });
}

export const notConfigured = (what: string) =>
  json({ ok: false, error: 'not_configured', detail: `${what} is not configured on this deployment` }, 503);

export async function readJson<T = Record<string, unknown>>(request: Request, maxBytes = 4096): Promise<T | null> {
  const len = Number(request.headers.get('content-length') || '0');
  if (len > maxBytes) return null;
  try {
    const text = await request.text();
    if (text.length > maxBytes) return null;
    return JSON.parse(text) as T;
  } catch {
    return null;
  }
}

/**
 * Public origin of the app. Behind the Cloudflare Worker proxy the request reaches Pages on
 * *.pages.dev, so links in e-mails must use APP_ORIGIN (https://grow-plan.gearuptogrow.com).
 */
export function appOrigin(env: { APP_ORIGIN?: string }, request: Request): string {
  const configured = (env.APP_ORIGIN || '').trim().replace(/\/+$/, '');
  return /^https:\/\/[a-z0-9.-]+$/i.test(configured) ? configured : new URL(request.url).origin;
}

/** Reject cross-site POSTs from browsers (CSRF on state-changing endpoints). The app's own
 * public origin (APP_ORIGIN, served through the Worker) counts as same-origin. */
export function sameOriginOrNoOrigin(request: Request, env: { APP_ORIGIN?: string } = {}): boolean {
  const origin = request.headers.get('origin');
  if (!origin) return true;
  try {
    const host = new URL(origin).host;
    if (host === new URL(request.url).host) return true;
    return Boolean(env.APP_ORIGIN) && host === new URL(appOrigin(env, request)).host;
  } catch {
    return false;
  }
}

export const EMAIL_RE = /^[^\s@]{1,64}@[^\s@]{1,190}\.[a-z]{2,24}$/i;
export const normEmail = (e: unknown) => (typeof e === 'string' ? e.trim().toLowerCase() : '');
