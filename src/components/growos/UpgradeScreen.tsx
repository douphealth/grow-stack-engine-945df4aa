import { useState } from 'react';
import { useGrowOS } from '@/lib/growos-context';
import { PROTOCOLS } from '@/lib/growos-data';
import { ADDONS, PRO_PRICE_CENTS, SUPPORT_URL, formatUsd, totalCents, type AddonId } from '../../../shared/catalog';
import RestorePurchase from './RestorePurchase';
import { ChevronLeft, Check, Minus, Crown, Loader2, ExternalLink, Shield, AlertCircle } from 'lucide-react';

const FREE_PROTOCOLS = PROTOCOLS.filter((p) => !p.isPremium).length;

/**
 * Every row is backed by a gate in the code (ProtocolsScreen/GoalSelect: isPremium protocols,
 * StateCheckIn: evening stack). Do not add rows for features that do not exist.
 */
const COMPARISON: { feature: string; free: string | boolean; pro: string | boolean }[] = [
  { feature: 'Growth DNA quiz and archetype card', free: true, pro: true },
  { feature: 'Daily check-in and adaptive morning stack', free: true, pro: true },
  { feature: 'Journal, streaks and analytics', free: true, pro: true },
  { feature: 'Growth protocols', free: `${FREE_PROTOCOLS}`, pro: `All ${PROTOCOLS.length}` },
  { feature: 'Evening wind-down stack (after 6 pm)', free: false, pro: true },
];

const Cell = ({ v, pro }: { v: string | boolean; pro?: boolean }) =>
  v === true ? <Check aria-label="Included" className={`w-4 h-4 mx-auto ${pro ? 'text-accent' : 'text-primary'}`} />
    : v === false ? <Minus aria-label="Not included" className="w-4 h-4 mx-auto text-muted-foreground/40" />
    : <span className={`text-xs font-semibold ${pro ? 'text-accent' : 'text-muted-foreground'}`}>{v}</span>;

export default function UpgradeScreen() {
  const { setScreen, isPro, licenseSource, purchaseConfig, startCheckout, checkoutStatus, checkoutError, checkPurchaseNow, cancelPendingCheckout } = useGrowOS();
  const [addons, setAddons] = useState<AddonId[]>([]);
  const [showRestore, setShowRestore] = useState(false);

  const offered = (Object.keys(ADDONS) as AddonId[]).filter((a) => purchaseConfig.addons[a]);
  const chosen = addons.filter((a) => offered.includes(a));
  const total = totalCents(chosen);
  const toggle = (a: AddonId) => setAddons((cur) => (cur.includes(a) ? cur.filter((x) => x !== a) : [...cur, a]));
  const waiting = checkoutStatus === 'waiting' || checkoutStatus === 'verifying';

  return (
    <div className="min-h-screen pb-40 px-5 pt-6 max-w-md mx-auto">
      <div className="flex items-center gap-3 mb-5">
        <button onClick={() => setScreen('home')} aria-label="Back" className="p-2 rounded-lg bg-secondary text-muted-foreground hover:text-foreground transition-colors">
          <ChevronLeft className="w-5 h-5" />
        </button>
        <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">GrowOS PRO</span>
      </div>

      <header className="text-center mb-6">
        <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-accent/15 border border-accent/20 mb-3">
          <Crown className="w-7 h-7 text-accent" aria-hidden />
        </div>
        <h1 className="text-3xl font-heading font-bold text-foreground mb-2">GrowOS PRO</h1>
        <p className="text-sm text-muted-foreground">
          One payment of <span className="text-foreground font-semibold">{formatUsd(PRO_PRICE_CENTS)}</span>. Lifetime access, no subscription.
        </p>
      </header>

      {isPro && (
        <div className="glass-card p-4 mb-5 text-sm text-foreground">
          <p className="font-semibold mb-1">PRO is active on this device.</p>
          {licenseSource === 'legacy' && (
            <p className="text-muted-foreground text-xs">
              You unlocked PRO before purchase verification existed. To use PRO on another device, tap “Restore purchase” and enter the e-mail you paid with.
            </p>
          )}
        </div>
      )}

      <section aria-labelledby="compare" className="glass-card p-4 mb-5">
        <h2 id="compare" className="text-sm font-heading font-bold text-foreground mb-3">What each plan includes</h2>
        <table className="w-full text-left">
          <thead>
            <tr className="text-xs text-muted-foreground">
              <th scope="col" className="font-normal pb-2"><span className="sr-only">Feature</span></th>
              <th scope="col" className="font-semibold pb-2 text-center w-16">Free</th>
              <th scope="col" className="font-semibold pb-2 text-center w-16 text-accent">PRO</th>
            </tr>
          </thead>
          <tbody>
            {COMPARISON.map((r) => (
              <tr key={r.feature} className="border-t border-border/30">
                <th scope="row" className="py-2 pr-2 text-xs font-normal text-foreground/85">{r.feature}</th>
                <td className="py-2 text-center"><Cell v={r.free} /></td>
                <td className="py-2 text-center"><Cell v={r.pro} pro /></td>
              </tr>
            ))}
            <tr className="border-t border-border/30">
              <th scope="row" className="py-2 pr-2 text-xs font-semibold text-foreground">Price</th>
              <td className="py-2 text-center text-xs text-muted-foreground">$0</td>
              <td className="py-2 text-center text-xs font-bold text-accent">{formatUsd(PRO_PRICE_CENTS)} once</td>
            </tr>
          </tbody>
        </table>
      </section>

      {offered.length > 0 && !isPro && (
        <fieldset className="mb-5">
          <legend className="text-xs text-muted-foreground uppercase tracking-wider mb-2">Optional add-ons (downloads)</legend>
          {offered.map((a) => (
            <label key={a} className={`glass-card p-4 mb-2 flex items-start gap-3 cursor-pointer ${addons.includes(a) ? 'ring-1 ring-accent/40' : ''}`}>
              <input type="checkbox" className="mt-1 h-4 w-4 accent-[hsl(var(--accent))]" checked={addons.includes(a)} onChange={() => toggle(a)} />
              <span className="flex-1">
                <span className="block text-sm font-semibold text-foreground">{ADDONS[a].name}</span>
                <span className="block text-xs text-muted-foreground">Delivered as a download right after payment.</span>
              </span>
              <span className="text-sm font-bold text-accent">+{formatUsd(ADDONS[a].priceCents)}</span>
            </label>
          ))}
        </fieldset>
      )}

      {waiting && (
        <div role="status" aria-live="polite" className="glass-card p-4 mb-5 text-sm">
          <p className="font-semibold text-foreground flex items-center gap-2">
            <Loader2 className="w-4 h-4 animate-spin" aria-hidden /> Waiting for your payment…
          </p>
          <p className="text-xs text-muted-foreground mt-1">Finish paying in the Stripe tab. PRO unlocks here as soon as Stripe confirms it.</p>
          <div className="flex gap-3 mt-3 text-xs">
            <button onClick={() => checkPurchaseNow()} className="font-semibold text-primary">I’ve paid, check now</button>
            <button onClick={cancelPendingCheckout} className="text-muted-foreground">Cancel</button>
          </div>
        </div>
      )}

      {checkoutError && (
        <div role="alert" className="flex items-start gap-2 p-3 mb-5 rounded-xl bg-destructive/10 border border-destructive/20">
          <AlertCircle className="w-4 h-4 text-destructive shrink-0 mt-0.5" aria-hidden />
          <p className="text-sm text-destructive">{checkoutError}</p>
        </div>
      )}

      <div className="text-center text-xs text-muted-foreground space-y-2">
        <button onClick={() => setShowRestore((v) => !v)} className="font-semibold text-primary">
          Already bought? Restore purchase
        </button>
        {showRestore && <RestorePurchase />}
        <p>
          Questions or a refund request? <a href={SUPPORT_URL} target="_blank" rel="noopener" className="underline">Contact us</a>
        </p>
      </div>

      {!isPro && (
        <div className="fixed bottom-0 inset-x-0 z-40 bg-background/95 backdrop-blur border-t border-border/40 px-5 pt-3 pb-[max(1rem,env(safe-area-inset-bottom))]">
          <div className="max-w-md mx-auto">
            <button
              onClick={() => startCheckout(chosen)}
              className="w-full min-h-[52px] rounded-xl gradient-accent text-accent-foreground font-heading font-bold text-lg flex items-center justify-center gap-2 active:scale-[0.98] transition-transform"
            >
              {waiting ? 'Reopen checkout' : 'Get PRO'} · {formatUsd(total)}
              <ExternalLink className="w-4 h-4" aria-hidden />
            </button>
            <p className="mt-2 text-[11px] text-muted-foreground flex items-center justify-center gap-1">
              <Shield className="w-3 h-3" aria-hidden /> One-time payment in USD, processed by Stripe in a new tab.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
