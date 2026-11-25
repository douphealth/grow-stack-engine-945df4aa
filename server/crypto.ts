/** HMAC-signed tokens (license tokens, restore links, download links). WebCrypto only. */

const enc = new TextEncoder();

export function b64url(bytes: Uint8Array): string {
  let s = '';
  for (const b of bytes) s += String.fromCharCode(b);
  return btoa(s).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}

export function fromB64url(s: string): Uint8Array {
  const pad = s.length % 4 ? '='.repeat(4 - (s.length % 4)) : '';
  const bin = atob(s.replace(/-/g, '+').replace(/_/g, '/') + pad);
  return Uint8Array.from(bin, (c) => c.charCodeAt(0));
}

async function hmacKey(secret: string): Promise<CryptoKey> {
  return crypto.subtle.importKey('raw', enc.encode(secret), { name: 'HMAC', hash: 'SHA-256' }, false, ['sign', 'verify']);
}

export async function hmacHex(secret: string, data: string): Promise<string> {
  const sig = new Uint8Array(await crypto.subtle.sign('HMAC', await hmacKey(secret), enc.encode(data)));
  return [...sig].map((b) => b.toString(16).padStart(2, '0')).join('');
}

export function timingSafeEqual(a: string, b: string): boolean {
  if (a.length !== b.length) return false;
  let diff = 0;
  for (let i = 0; i < a.length; i++) diff |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return diff === 0;
}

export type TokenPurpose = 'license' | 'restore' | 'download';

/** Format: v1.<purpose>.<payload>.<sig>; the purpose is signed, so tokens cannot be swapped. */
export async function sign(secret: string, purpose: TokenPurpose, payload: Record<string, unknown>): Promise<string> {
  const body = b64url(enc.encode(JSON.stringify(payload)));
  const head = `v1.${purpose}.${body}`;
  const sig = new Uint8Array(await crypto.subtle.sign('HMAC', await hmacKey(secret), enc.encode(head)));
  return `${head}.${b64url(sig)}`;
}

export async function verify<T = Record<string, unknown>>(secret: string, purpose: TokenPurpose, token: unknown): Promise<T | null> {
  if (typeof token !== 'string' || token.length > 2048) return null;
  const parts = token.split('.');
  if (parts.length !== 4 || parts[0] !== 'v1' || parts[1] !== purpose) return null;
  const head = parts.slice(0, 3).join('.');
  let ok = false;
  try {
    ok = await crypto.subtle.verify('HMAC', await hmacKey(secret), fromB64url(parts[3]), enc.encode(head));
  } catch {
    return null;
  }
  if (!ok) return null;
  try {
    const payload = JSON.parse(new TextDecoder().decode(fromB64url(parts[2]))) as T & { exp?: number };
    if (typeof payload.exp === 'number' && payload.exp < Math.floor(Date.now() / 1000)) return null;
    return payload;
  } catch {
    return null;
  }
}

export function randomId(prefix: string, bytes = 12): string {
  const b = crypto.getRandomValues(new Uint8Array(bytes));
  return prefix + [...b].map((x) => x.toString(16).padStart(2, '0')).join('');
}

/** Stripe webhook signature check (scheme v1, 5-minute tolerance). */
export async function verifyStripeSignature(payload: string, header: string | null, secret: string, toleranceSec = 300): Promise<boolean> {
  if (!header) return false;
  const items = header.split(',').map((p) => p.split('=') as [string, string]);
  const t = items.find(([k]) => k === 't')?.[1];
  const sigs = items.filter(([k]) => k === 'v1').map(([, v]) => v);
  if (!t || !sigs.length) return false;
  if (Math.abs(Math.floor(Date.now() / 1000) - Number(t)) > toleranceSec) return false;
  const expected = await hmacHex(secret, `${t}.${payload}`);
  return sigs.some((s) => timingSafeEqual(s, expected));
}
