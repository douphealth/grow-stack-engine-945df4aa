/**
 * Client side of the verified PRO unlock. The browser never decides that a payment happened:
 * it asks /api/license/* and stores the signed token the server returns.
 */
import { paymentLinkFor, type AddonId, type Entitlement, type FunnelEvent } from '../../shared/catalog';

export const LICENSE_KEY = 'growos-license-v1';
export const PENDING_KEY = 'growos-pending-checkout-v1';
const TRACKED_ONCE_KEY = 'growos-tracked-once-v1';

export interface StoredLicense { token: string; entitlements: Entitlement[]; email?: string; verifiedAt: number }
export interface PendingCheckout { ref: string; addons: AddonId[]; startedAt: number }
export interface PurchaseConfig { licensing: boolean; verifiedCheckout: boolean; restoreByEmail: boolean; addons: Record<AddonId, boolean> }

export const DEFAULT_CONFIG: PurchaseConfig = {
  licensing: false, verifiedCheckout: false, restoreByEmail: false, addons: { audio: false, blueprint: false },
};

function read<T>(key: string): T | null {
  try { const raw = localStorage.getItem(key); return raw ? (JSON.parse(raw) as T) : null; } catch { return null; }
}
function write(key: string, value: unknown) {
  try { if (value === null) localStorage.removeItem(key); else localStorage.setItem(key, JSON.stringify(value)); } catch { /* private mode */ }
}

export const loadLicense = () => {
  const l = read<StoredLicense>(LICENSE_KEY);
  return l && typeof l.token === 'string' && Array.isArray(l.entitlements) ? l : null;
};
export const saveLicense = (l: StoredLicense | null) => write(LICENSE_KEY, l);
export const loadPending = () => {
  const p = read<PendingCheckout>(PENDING_KEY);
  return p && /^gos_[a-f0-9]{24,64}$/.test(p.ref) && Date.now() - p.startedAt < 6 * 3600_000 ? p : null;
};
export const savePending = (p: PendingCheckout | null) => write(PENDING_KEY, p);

export function newRef(): string {
  const b = crypto.getRandomValues(new Uint8Array(16));
  return 'gos_' + [...b].map((x) => x.toString(16).padStart(2, '0')).join('');
}

/** Payment Link URL with the claim reference (and the buyer's e-mail, when we have it). */
export function checkoutUrl(addons: AddonId[], ref: string, email?: string): string {
  const u = new URL(paymentLinkFor(addons));
  u.searchParams.set('client_reference_id', ref);
  if (email && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) u.searchParams.set('prefilled_email', email);
  return u.toString();
}

type ApiResult = { ok: boolean; token?: string; entitlements?: Entitlement[]; email?: string; pending?: boolean; error?: string; valid?: boolean; message?: string; url?: string };

async function post(path: string, body: unknown, timeoutMs = 12000): Promise<ApiResult & { status: number }> {
  const ctrl = new AbortController();
  const t = setTimeout(() => ctrl.abort(), timeoutMs);
  try {
    const res = await fetch(path, {
      method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify(body), signal: ctrl.signal,
    });
    const isJson = (res.headers.get('content-type') || '').includes('application/json');
    const data = isJson ? ((await res.json()) as ApiResult) : { ok: false, error: 'not_available' };
    return { ...data, status: res.status };
  } catch {
    return { ok: false, error: 'network', status: 0 };
  } finally {
    clearTimeout(t);
  }
}

export const claimPurchase = (q: { session_id?: string; ref?: string }) => post('/api/license/claim', q);
export const verifyLicense = (token: string) => post('/api/license/verify', { token });
export const requestRestore = (email: string) => post('/api/license/restore', { email });
export const redeemRestore = (code: string) => post('/api/license/redeem', { code });
export const requestDownload = (addon: AddonId, token: string) => post(`/api/download/${addon}`, { token });

export async function fetchPurchaseConfig(): Promise<PurchaseConfig> {
  try {
    const res = await fetch('/api/config', { headers: { accept: 'application/json' } });
    if (!res.ok || !(res.headers.get('content-type') || '').includes('application/json')) return DEFAULT_CONFIG;
    const c = (await res.json()) as Partial<PurchaseConfig>;
    return { ...DEFAULT_CONFIG, ...c, addons: { ...DEFAULT_CONFIG.addons, ...(c.addons || {}) } };
  } catch {
    return DEFAULT_CONFIG;
  }
}

/** Anonymous funnel counter: no cookies, no IDs. Silently does nothing when the API is absent. */
export function track(name: FunnelEvent, opts: { oncePerDevice?: boolean } = {}) {
  try {
    if (opts.oncePerDevice) {
      const seen = read<Record<string, number>>(TRACKED_ONCE_KEY) || {};
      if (seen[name]) return;
      write(TRACKED_ONCE_KEY, { ...seen, [name]: Date.now() });
    }
    const body = JSON.stringify({ name });
    if (navigator.sendBeacon && navigator.sendBeacon('/api/event', new Blob([body], { type: 'application/json' }))) return;
    void fetch('/api/event', { method: 'POST', headers: { 'content-type': 'application/json' }, body, keepalive: true }).catch(() => undefined);
  } catch { /* never break the app for analytics */ }
}
