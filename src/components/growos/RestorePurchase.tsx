import { useState } from 'react';
import { useGrowOS } from '@/lib/growos-context';
import { requestRestore } from '@/lib/license';
import { SUPPORT_URL } from '../../../shared/catalog';
import { Loader2, Mail } from 'lucide-react';

/** Restore on a new device: e-mail → 30-minute sign-in link → verified license token. */
export default function RestorePurchase() {
  const { purchaseConfig, userEmail } = useGrowOS();
  const [email, setEmail] = useState(userEmail || '');
  const [state, setState] = useState<'idle' | 'sending' | 'sent' | 'error'>('idle');
  const [message, setMessage] = useState('');

  if (!purchaseConfig.restoreByEmail) {
    return (
      <p className="glass-card p-4 text-left text-xs text-muted-foreground">
        Restore by e-mail is not available yet. <a href={SUPPORT_URL} target="_blank" rel="noopener" className="underline text-foreground">Contact us</a> with
        the e-mail you paid with and we will restore PRO for you.
      </p>
    );
  }

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setState('sending');
    const r = await requestRestore(email.trim());
    if (r.ok) { setState('sent'); setMessage(r.message || 'Check your inbox for a restore link.'); return; }
    setState('error');
    setMessage(r.error === 'invalid_email' ? 'Please enter a valid e-mail address.' : 'Something went wrong. Try again in a minute, or contact us.');
  };

  return (
    <form onSubmit={submit} className="glass-card p-4 text-left space-y-2" noValidate>
      <label htmlFor="restore-email" className="block text-xs font-semibold text-foreground">E-mail you paid with</label>
      <div className="flex gap-2">
        <input
          id="restore-email" type="email" autoComplete="email" inputMode="email" required value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="flex-1 min-w-0 rounded-lg bg-secondary px-3 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
          placeholder="you@example.com"
        />
        <button type="submit" disabled={state === 'sending'} className="rounded-lg bg-primary px-3 text-sm font-semibold text-primary-foreground disabled:opacity-60 flex items-center gap-1">
          {state === 'sending' ? <Loader2 className="w-4 h-4 animate-spin" aria-hidden /> : <Mail className="w-4 h-4" aria-hidden />} Send link
        </button>
      </div>
      {message && <p role="status" className={`text-xs ${state === 'error' ? 'text-destructive' : 'text-muted-foreground'}`}>{message}</p>}
    </form>
  );
}
