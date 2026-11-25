import { act } from 'react';
import { createRoot } from 'react-dom/client';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { GrowOSProvider, useGrowOS } from './growos-context';
import { LICENSE_KEY, PENDING_KEY, checkoutUrl } from './license';

function Probe() {
  const { isPro, licenseSource, screen: s } = useGrowOS();
  return <p data-testid="probe">{`${isPro ? 'pro' : 'free'}|${licenseSource ?? 'none'}|${s}`}</p>;
}
// @testing-library/dom is not installed (peer dep), so render with react-dom directly.
(globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean }).IS_REACT_ACT_ENVIRONMENT = true;
let host: HTMLDivElement;
const mount = () => {
  host = document.createElement('div');
  document.body.appendChild(host);
  act(() => { createRoot(host).render(<GrowOSProvider><Probe /></GrowOSProvider>); });
};
const probe = () => host.querySelector('[data-testid="probe"]')!.textContent;
async function waitFor(check: () => void, timeout = 2000) {
  const start = Date.now();
  for (;;) {
    try { check(); return; } catch (e) {
      if (Date.now() - start > timeout) throw e;
      await act(async () => { await new Promise((r) => setTimeout(r, 15)); });
    }
  }
}

let api: Record<string, unknown>;
beforeEach(() => {
  localStorage.clear();
  api = {};
  vi.stubGlobal('fetch', vi.fn(async (url: string) => {
    const hit = api[url];
    if (!hit) return new Response('<html>', { status: 200, headers: { 'content-type': 'text/html' } });
    return new Response(JSON.stringify(hit), { status: 200, headers: { 'content-type': 'application/json' } });
  }));
  window.history.replaceState({}, '', '/');
});
afterEach(() => vi.unstubAllGlobals());

describe('PRO entitlement in the app', () => {
  it('?payment=success alone no longer unlocks PRO, and the parameter is stripped', async () => {
    window.history.replaceState({}, '', '/?payment=success');
    mount();
    await waitFor(() => expect(window.location.search).toBe(''));
    expect(probe()).toMatch(/^free\|none/);
  });

  it('keeps buyers from before licensing unlocked (grandfathered legacy flag)', async () => {
    localStorage.setItem('growos-state-v4', JSON.stringify({ userName: 'A', archetypeId: 'driver', isPro: true, screen: 'home' }));
    mount();
    await waitFor(() => expect(probe()).toBe('pro|legacy|home'));
  });

  it('unlocks from a verified Stripe return (session_id) and shows the success screen', async () => {
    api['/api/license/claim'] = { ok: true, token: 'v1.license.x.y', entitlements: ['pro'], email: 'b•••@example.com' };
    window.history.replaceState({}, '', '/?payment=success&session_id=cs_test_abcdefghijk');
    mount();
    await waitFor(() => expect(probe()).toBe('pro|license|purchase-success'));
    expect(JSON.parse(localStorage.getItem(LICENSE_KEY)!).token).toBe('v1.license.x.y');
    expect(window.location.search).toBe('');
  });

  it('drops a stored license that the server says was refunded', async () => {
    localStorage.setItem(LICENSE_KEY, JSON.stringify({ token: 't', entitlements: ['pro'], verifiedAt: 1 }));
    api['/api/license/verify'] = { ok: true, valid: false, entitlements: [] };
    mount();
    await waitFor(() => expect(probe()).toMatch(/^free/));
    expect(localStorage.getItem(LICENSE_KEY)).toBeNull();
  });

  it('keeps a cached license when the server cannot be reached (offline)', async () => {
    localStorage.setItem(LICENSE_KEY, JSON.stringify({ token: 't', entitlements: ['pro'], verifiedAt: 1 }));
    mount();
    await act(async () => { await new Promise((r) => setTimeout(r, 20)); });
    expect(probe()).toMatch(/^pro\|license/);
  });

  it('checkout URL carries the claim reference and the e-mail, on the right Payment Link', () => {
    const u = new URL(checkoutUrl(['audio'], 'gos_' + 'a'.repeat(32), 'me@example.com'));
    expect(u.origin + u.pathname).toBe('https://buy.stripe.com/00weVddu03yE4slezkejK06');
    expect(u.searchParams.get('client_reference_id')).toBe('gos_' + 'a'.repeat(32));
    expect(u.searchParams.get('prefilled_email')).toBe('me@example.com');
    expect(localStorage.getItem(PENDING_KEY)).toBeNull();
  });
});
