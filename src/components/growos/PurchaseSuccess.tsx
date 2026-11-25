import { useState } from 'react';
import { useGrowOS } from '@/lib/growos-context';
import { requestDownload } from '@/lib/license';
import { ADDONS, SUPPORT_URL, type AddonId } from '../../../shared/catalog';
import { CheckCircle2, Download, Loader2 } from 'lucide-react';

export default function PurchaseSuccess() {
  const { setScreen, entitlements, license, archetype, purchaseConfig } = useGrowOS();
  const [busy, setBusy] = useState<AddonId | null>(null);
  const [note, setNote] = useState<string | null>(null);
  const owned = (Object.keys(ADDONS) as AddonId[]).filter((a) => entitlements.includes(a));

  const download = async (a: AddonId) => {
    if (!license) return;
    setBusy(a); setNote(null);
    const r = await requestDownload(a, license.token);
    setBusy(null);
    if (r.ok && r.url) { window.location.href = r.url; return; }
    setNote(r.error === 'not_available'
      ? `${ADDONS[a].name} is not ready to download yet. Contact us and we will send it or refund it.`
      : 'The download could not start. Try again, or contact us.');
  };

  return (
    <div className="min-h-screen px-5 pt-10 pb-28 max-w-md mx-auto text-center">
      <CheckCircle2 className="w-14 h-14 text-primary mx-auto mb-4" aria-hidden />
      <h1 className="text-3xl font-heading font-bold text-foreground mb-2">PRO is unlocked</h1>
      <p className="text-sm text-muted-foreground mb-1">
        Thanks for your purchase{license?.email ? <> (<span className="text-foreground">{license.email}</span>)</> : null}.
      </p>
      <p className="text-xs text-muted-foreground mb-6">
        Stripe e-mails your payment receipt.{purchaseConfig.restoreByEmail ? ' We also sent a confirmation with how to restore PRO on another device.' : ''}
      </p>

      <div className="glass-card p-4 text-left text-sm mb-4">
        <p className="font-semibold text-foreground mb-2">Now included</p>
        <ul className="space-y-1 text-muted-foreground text-xs list-disc pl-4">
          <li>All growth protocols in the Protocols tab</li>
          <li>The evening wind-down stack (after 6 pm)</li>
          {owned.map((a) => <li key={a}>{ADDONS[a].name}</li>)}
        </ul>
      </div>

      {owned.length > 0 && (
        <div className="space-y-2 mb-4">
          {owned.map((a) => (
            <button key={a} onClick={() => download(a)} disabled={busy !== null}
              className="w-full glass-card p-3 flex items-center justify-center gap-2 text-sm font-semibold text-foreground disabled:opacity-60">
              {busy === a ? <Loader2 className="w-4 h-4 animate-spin" aria-hidden /> : <Download className="w-4 h-4" aria-hidden />}
              Download {ADDONS[a].name}
            </button>
          ))}
          {note && <p role="status" className="text-xs text-destructive">{note}</p>}
        </div>
      )}

      <button onClick={() => setScreen(archetype ? 'protocols' : 'welcome')}
        className="w-full min-h-[52px] rounded-xl gradient-primary text-primary-foreground font-heading font-semibold text-lg mb-4">
        {archetype ? 'Open the protocol library' : 'Start GrowOS'}
      </button>
      <p className="text-xs text-muted-foreground">
        Questions or a refund request? <a href={SUPPORT_URL} target="_blank" rel="noopener" className="underline">Contact us</a>
      </p>
    </div>
  );
}
