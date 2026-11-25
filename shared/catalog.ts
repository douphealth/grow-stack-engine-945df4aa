/**
 * GrowOS catalog: the single source of truth for what is sold, at what price, through which
 * Stripe Payment Link. Imported by the app (src/) and by the Pages Functions (functions/).
 *
 * Prices are the ones the live Payment Links charge (owner-verified 2026-11-25). Do not add a
 * "was" price unless the product was really sold at it (EU Omnibus Directive / FTC rules).
 */

export type Entitlement = 'pro' | 'audio' | 'blueprint';
export type AddonId = Exclude<Entitlement, 'pro'>;

export const PRO_PRICE_CENTS = 799;

export const ADDONS: Record<AddonId, { name: string; priceCents: number; matchName: RegExp }> = {
  audio: { name: 'Growth Accelerator Audio Pack', priceCents: 499, matchName: /audio/i },
  blueprint: { name: '90-Day Transformation Blueprint', priceCents: 999, matchName: /blueprint/i },
};

/** The four hard-coded Payment Links. Keys are the combination of add-ons in the basket. */
export const PAYMENT_LINKS = {
  proOnly: 'https://buy.stripe.com/eVq8wP9dK2uA9MF0IuejK00',
  proAudio: 'https://buy.stripe.com/00weVddu03yE4slezkejK06',
  proBlueprint: 'https://buy.stripe.com/8x2eVd3Tq1qw3ohgHsejK07',
  proAudioBlueprint: 'https://buy.stripe.com/bJeaEX2Pm3yEcYR76SejK08',
} as const;

export function totalCents(addons: AddonId[]): number {
  return PRO_PRICE_CENTS + addons.reduce((sum, a) => sum + ADDONS[a].priceCents, 0);
}

export function paymentLinkFor(addons: AddonId[]): string {
  const audio = addons.includes('audio');
  const blueprint = addons.includes('blueprint');
  if (audio && blueprint) return PAYMENT_LINKS.proAudioBlueprint;
  if (blueprint) return PAYMENT_LINKS.proBlueprint;
  if (audio) return PAYMENT_LINKS.proAudio;
  return PAYMENT_LINKS.proOnly;
}

/** Totals each Payment Link charges, used as a cross-check when line items are unavailable. */
export const ENTITLEMENTS_BY_TOTAL: Record<number, Entitlement[]> = {
  [totalCents([])]: ['pro'],
  [totalCents(['audio'])]: ['pro', 'audio'],
  [totalCents(['blueprint'])]: ['pro', 'blueprint'],
  [totalCents(['audio', 'blueprint'])]: ['pro', 'audio', 'blueprint'],
};

export const formatUsd = (cents: number) => `$${(cents / 100).toFixed(2)}`;

export const SUPPORT_URL = 'https://gearuptogrow.com/contact/';

/** Privacy-friendly funnel events (counted per day, no identifiers). */
export const FUNNEL_EVENTS = ['plan_generated', 'upgrade_clicked', 'checkout_reached', 'purchase'] as const;
export type FunnelEvent = (typeof FUNNEL_EVENTS)[number];
