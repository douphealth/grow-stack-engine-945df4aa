import { ADDONS, SUPPORT_URL, type Entitlement } from '../shared/catalog';
import type { Env } from './env';

export const mailConfigured = (env: Env) => Boolean(env.BREVO_API_KEY);

const esc = (s: string) => s.replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]!);

async function send(env: Env, to: string, subject: string, html: string, text: string): Promise<boolean> {
  if (!env.BREVO_API_KEY) return false;
  const base = (env.MAIL_API_BASE || 'https://api.brevo.com').replace(/\/$/, '');
  const res = await fetch(`${base}/v3/smtp/email`, {
    method: 'POST',
    headers: { 'api-key': env.BREVO_API_KEY, 'content-type': 'application/json', accept: 'application/json' },
    body: JSON.stringify({
      sender: { name: 'GrowOS by Gear Up to Grow', email: env.MAIL_FROM || 'info@gearuptogrow.com' },
      to: [{ email: to }],
      subject,
      htmlContent: html,
      textContent: text,
      tags: ['growos-transactional'],
    }),
  });
  return res.ok;
}

const wrap = (body: string) =>
  `<div style="font-family:system-ui,-apple-system,Segoe UI,sans-serif;max-width:520px;margin:0 auto;padding:24px;color:#0b1220;line-height:1.55">${body}` +
  `<p style="font-size:13px;color:#5d6779;margin-top:28px">Questions or a refund request? <a href="${SUPPORT_URL}">Contact Gear Up to Grow</a>. ` +
  `Your payment receipt comes separately from Stripe.</p></div>`;

export function sendPurchaseConfirmation(env: Env, to: string, origin: string, ent: Entitlement[]): Promise<boolean> {
  const addons = ent.filter((e) => e !== 'pro').map((e) => ADDONS[e as keyof typeof ADDONS].name);
  const app = `${origin}/?purchase=done`;
  const addonLine = addons.length
    ? `<p>Your add-ons (${addons.map(esc).join(', ')}) are listed on the purchase screen in the app. Download them from there.</p>`
    : '';
  const html = wrap(
    `<h1 style="font-size:22px">GrowOS PRO is unlocked</h1>` +
    `<p>Thanks for your purchase. PRO is active for <b>${esc(to)}</b>. It is a one-time purchase with lifetime access, and nothing renews.</p>` +
    addonLine +
    `<p><a href="${app}" style="display:inline-block;background:#d6ff4b;color:#0b1220;padding:12px 20px;border-radius:10px;text-decoration:none;font-weight:700">Open GrowOS</a></p>` +
    `<p>On a new phone or browser, open GrowOS, tap <b>Restore purchase</b> and enter this e-mail address. We will send you a sign-in link.</p>`,
  );
  const text = `GrowOS PRO is unlocked for ${to}. One-time purchase, lifetime access.\n` +
    (addons.length ? `Add-ons: ${addons.join(', ')} (download them in the app).\n` : '') +
    `Open GrowOS: ${app}\nNew device: tap "Restore purchase" and enter this e-mail.\nSupport or refunds: ${SUPPORT_URL}\n`;
  return send(env, to, 'Your GrowOS PRO purchase', html, text);
}

export function sendRestoreLink(env: Env, to: string, link: string): Promise<boolean> {
  const html = wrap(
    `<h1 style="font-size:22px">Restore GrowOS PRO</h1>` +
    `<p>Tap the button on the device where you want PRO. The link works for 30 minutes.</p>` +
    `<p><a href="${esc(link)}" style="display:inline-block;background:#d6ff4b;color:#0b1220;padding:12px 20px;border-radius:10px;text-decoration:none;font-weight:700">Restore my purchase</a></p>` +
    `<p style="font-size:13px;color:#5d6779">If you did not ask for this, you can ignore this e-mail.</p>`,
  );
  return send(env, to, 'Your GrowOS restore link', html, `Restore GrowOS PRO (valid 30 minutes): ${link}\nSupport: ${SUPPORT_URL}\n`);
}
