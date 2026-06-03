import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useGrowOS } from '@/lib/growos-context';
import { supabase } from '@/integrations/supabase/client';
import {
  ChevronLeft, Check, X, Crown, Headphones, BookOpen, Zap, Shield,
  Star, Users, Sparkles, Lock, Brain, Moon, Timer,
  BarChart3, Palette, Wifi, Ban, Target, Heart, Flame,
  ArrowRight, ChevronDown, ChevronUp, Loader2, AlertCircle
} from 'lucide-react';

const Infinity2 = ({ className }: { className?: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d="M12 12c-2-2.67-4-4-6-4a4 4 0 1 0 0 8c2 0 4-1.33 6-4Zm0 0c2 2.67 4 4 6 4a4 4 0 0 0 0-8c-2 0-4 1.33-6 4Z"/>
  </svg>
);

/* ─── DATA ─── */
const COMPARISON_ROWS: [string, boolean | string, boolean | string][] = [
  ['Growth DNA Quiz & Card', true, true],
  ['Daily State Check-In', true, true],
  ['Growth Stacks', '1/day', 'Unlimited'],
  ['Active Protocols', '1', '3+ simultaneous'],
  ['Protocol Library', '3 free', '20+ premium'],
  ['Journal', 'Text only', 'AI Smart Journal'],
  ['Affirmations', '5/day', '500+ categorized'],
  ['Analytics Dashboard', false, true],
  ['Growth Radar Chart', false, true],
  ['Custom Stack Builder', false, true],
  ['Focus Timer (Pomodoro)', false, true],
  ['Evening Wind-Down Stack', false, true],
  ['Offline Mode', false, true],
  ['Priority Community Badge', false, true],
  ['Ad-Free Experience', false, true],
];

const PRO_FEATURES = [
  { icon: Infinity2, title: 'Unlimited Growth Stacks', desc: 'Morning, midday, and evening stacks that adapt to how you feel right now' },
  { icon: Brain, title: 'AI Adaptive Engine', desc: 'Your stack intelligently adjusts based on energy, mood, clarity, and time available' },
  { icon: Target, title: 'Full Protocol Library (20+)', desc: 'Science-backed protocols for focus, confidence, sleep, mindset, and more' },
  { icon: BookOpen, title: 'Smart Journal with AI', desc: 'AI-powered prompts that adapt to your journey + insight extraction' },
  { icon: BarChart3, title: 'Growth Analytics Dashboard', desc: 'Track your progress with radar charts, trends, streaks, and dimension scores' },
  { icon: Palette, title: 'Custom Stack Builder', desc: 'Mix and match micro-actions to create your perfect growth routine' },
  { icon: Timer, title: 'Focus Timer', desc: 'Built-in Pomodoro + Deep Work modes with ambient soundscapes' },
  { icon: Moon, title: 'Night Wind-Down Stack', desc: 'Evening routine for reflection, gratitude, and sleep optimization' },
  { icon: Flame, title: 'Stack up to 3 Protocols', desc: 'Run multiple growth challenges simultaneously for accelerated results' },
  { icon: Heart, title: '500+ Categorized Affirmations', desc: 'Confidence, abundance, health, relationships, career, and more' },
  { icon: Wifi, title: 'Offline Mode', desc: 'Access your stacks, protocols, and journal anywhere — even without internet' },
  { icon: Ban, title: 'Zero Ads — Forever', desc: 'A clean, distraction-free growth experience. No ads. No upsells. Ever.' },
];

const TESTIMONIALS = [
  { name: 'Sarah K.', role: 'Product Designer', text: 'GrowOS replaced 4 apps for me. The morning stack is genuinely life-changing. I\'ve never been this consistent.', avatar: '👩‍🎨', rating: 5 },
  { name: 'Marcus T.', role: 'Entrepreneur', text: 'The Growth DNA quiz was eerily accurate. I\'m on a 42-day streak and my focus has 3x\'d. Best $7.99 I\'ve spent.', avatar: '🧑‍💻', rating: 5 },
  { name: 'Priya R.', role: 'Medical Student', text: 'The AI adaptive stacks know exactly what I need each morning. It\'s like having a personal coach in my pocket.', avatar: '👩‍⚕️', rating: 5 },
  { name: 'Jake L.', role: 'Software Engineer', text: 'I\'ve tried Headspace, Calm, Todoist... none of them connected the dots like GrowOS does. This app gets me.', avatar: '👨‍💻', rating: 5 },
];

/* ─── COMPONENT ─── */
export default function UpgradeScreen() {
  const { setScreen } = useGrowOS();
  const [bump1, setBump1] = useState(false);
  const [bump2, setBump2] = useState(false);
  const [showComparison, setShowComparison] = useState(false);
  const [showAllFeatures, setShowAllFeatures] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const total = 7.99 + (bump1 ? 4.99 : 0) + (bump2 ? 9.99 : 0);
  const savings = (bump1 ? 5 : 0) + (bump2 ? 10 : 0);

  const handlePurchase = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const { data, error: fnError } = await supabase.functions.invoke('create-checkout', {
        body: { includeBump1: bump1, includeBump2: bump2 },
      });

      if (fnError) throw fnError;
      if (data?.url) {
        window.open(data.url, '_blank');
      } else {
        throw new Error('No checkout URL returned');
      }
    } catch (err) {
      console.error('Checkout error:', err);
      setError('Unable to start checkout. Please try again or contact support.');
    } finally {
      setIsLoading(false);
    }
  };

  const visibleFeatures = showAllFeatures ? PRO_FEATURES : PRO_FEATURES.slice(0, 6);

  return (
    <div className="min-h-screen pb-10 px-5 pt-6 max-w-md mx-auto">
      {/* Header */}
      <div className="flex items-center gap-3 mb-4">
        <button onClick={() => setScreen('home')} className="p-2 rounded-lg bg-secondary text-muted-foreground hover:text-foreground transition-colors">
          <ChevronLeft className="w-5 h-5" />
        </button>
        <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Upgrade</span>
      </div>

      {/* Hero */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-6 relative">
        <div className="absolute inset-0 -top-20 pointer-events-none">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 rounded-full bg-accent/10 blur-[80px]" />
        </div>
        <motion.div
          animate={{ rotate: [0, 5, -5, 0] }}
          transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
          className="inline-flex items-center justify-center w-20 h-20 rounded-2xl bg-gradient-to-br from-accent/30 to-accent/10 border border-accent/20 mb-4"
        >
          <Crown className="w-10 h-10 text-accent" />
        </motion.div>
        <h1 className="text-3xl font-heading font-bold text-foreground mb-2">Unlock GrowOS PRO</h1>
        <p className="text-muted-foreground text-sm mb-1">
          Like having a <span className="text-foreground font-semibold">$500/month life coach</span> — for $7.99. Once.
        </p>
        <p className="text-xs text-muted-foreground">No subscriptions. No hidden fees. Lifetime access.</p>

        {/* Price Badge */}
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 0.2, type: 'spring' }}
          className="inline-flex items-baseline gap-1.5 bg-secondary/50 px-6 py-3 rounded-2xl border border-border/50 mt-4"
        >
          <span className="text-5xl font-heading font-bold text-foreground">$7.99</span>
          <div className="text-left ml-1">
            <span className="text-sm text-muted-foreground block">one-time</span>
            <span className="text-xs text-primary font-semibold">lifetime access</span>
          </div>
        </motion.div>
      </motion.div>

      {/* Social Proof Bar */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.1 }}
        className="flex items-center justify-center gap-4 mb-6"
      >
        <div className="flex -space-x-2">
          {['🧑‍💻', '👩‍🎨', '🧑‍🔬', '👩‍💼', '🧑‍🎓'].map((emoji, i) => (
            <div key={i} className="w-8 h-8 rounded-full bg-secondary border-2 border-background flex items-center justify-center text-sm">
              {emoji}
            </div>
          ))}
        </div>
        <div className="text-left">
          <p className="text-sm font-semibold text-foreground">2,847+ upgraded</p>
          <div className="flex items-center gap-0.5">
            {[1,2,3,4,5].map(i => (
              <Star key={i} className="w-3 h-3 fill-accent text-accent" />
            ))}
            <span className="text-xs text-muted-foreground ml-1">4.9/5</span>
          </div>
        </div>
      </motion.div>

      {/* Comparison Toggle */}
      <motion.button
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.15 }}
        onClick={() => setShowComparison(!showComparison)}
        className="w-full text-center text-sm text-primary font-medium mb-4 flex items-center justify-center gap-1"
      >
        {showComparison ? 'Hide' : 'See'} Free vs PRO comparison
        <ChevronLeft className={`w-4 h-4 transition-transform ${showComparison ? 'rotate-90' : '-rotate-90'}`} />
      </motion.button>

      {/* Side-by-side Comparison */}
      <AnimatePresence>
        {showComparison && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden mb-4"
          >
            <div className="glass-card p-4">
              <div className="grid grid-cols-[1fr,60px,60px] gap-2 mb-3">
                <div />
                <p className="text-xs font-semibold text-muted-foreground text-center">Free</p>
                <p className="text-xs font-semibold text-accent text-center">PRO</p>
              </div>
              {COMPARISON_ROWS.map(([feature, free, pro], i) => (
                <div key={i} className="grid grid-cols-[1fr,60px,60px] gap-2 py-1.5 border-t border-border/30">
                  <span className="text-xs text-foreground/80">{feature as string}</span>
                  <div className="flex justify-center">
                    {free === true ? (
                      <Check className="w-4 h-4 text-primary" />
                    ) : free === false ? (
                      <X className="w-4 h-4 text-muted-foreground/30" />
                    ) : (
                      <span className="text-xs text-muted-foreground">{free as string}</span>
                    )}
                  </div>
                  <div className="flex justify-center">
                    {pro === true ? (
                      <Check className="w-4 h-4 text-accent" />
                    ) : (
                      <span className="text-xs text-accent font-semibold">{pro as string}</span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* PRO Features Grid */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="glass-card p-5 mb-4 relative overflow-hidden"
      >
        <div className="absolute inset-0 bg-gradient-to-br from-accent/3 to-primary/3" />
        <div className="relative z-10">
          <p className="text-sm font-heading font-bold text-foreground mb-4 flex items-center gap-2">
            <Zap className="w-4 h-4 text-primary" /> Everything in Free, PLUS:
          </p>
          <div className="space-y-3">
            {visibleFeatures.map((f, i) => (
              <motion.div
                key={f.title}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.25 + i * 0.03 }}
                className="flex items-start gap-3"
              >
                <div className="w-9 h-9 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
                  <f.icon className="w-4.5 h-4.5 text-primary" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-foreground">{f.title}</p>
                  <p className="text-xs text-muted-foreground leading-relaxed">{f.desc}</p>
                </div>
              </motion.div>
            ))}
          </div>
          {PRO_FEATURES.length > 6 && (
            <button
              onClick={() => setShowAllFeatures(!showAllFeatures)}
              className="w-full mt-3 text-sm text-primary font-medium flex items-center justify-center gap-1"
            >
              {showAllFeatures ? 'Show less' : `Show all ${PRO_FEATURES.length} features`}
              {showAllFeatures ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
            </button>
          )}
        </div>
      </motion.div>

      {/* Testimonials */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.25 }}
        className="mb-4"
      >
        <p className="text-xs text-muted-foreground uppercase tracking-wider mb-3 flex items-center gap-1.5">
          <Users className="w-3.5 h-3.5" /> What people are saying
        </p>
        <div className="space-y-2">
          {TESTIMONIALS.map((t, i) => (
            <div key={i} className="glass-card p-4">
              <div className="flex items-center gap-2 mb-2">
                <span className="text-lg">{t.avatar}</span>
                <div className="flex-1">
                  <p className="text-xs font-semibold text-foreground">{t.name} <span className="text-muted-foreground font-normal">• {t.role}</span></p>
                </div>
                <div className="flex items-center gap-0.5">
                  {[1,2,3,4,5].map(s => (
                    <Star key={s} className="w-3 h-3 fill-accent text-accent" />
                  ))}
                </div>
              </div>
              <p className="text-sm text-foreground/80 italic">"{t.text}"</p>
            </div>
          ))}
        </div>
      </motion.div>

      {/* Order Bump 1 — Audio Pack */}
      <motion.button
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        onClick={() => setBump1(!bump1)}
        className={`w-full glass-card p-4 mb-3 text-left transition-all relative overflow-hidden ${
          bump1 ? 'border-accent/50 ring-1 ring-accent/20' : ''
        }`}
      >
        {bump1 && <div className="absolute inset-0 bg-accent/5" />}
        <div className="relative z-10 flex items-start gap-3">
          <div className={`w-6 h-6 rounded-lg border-2 flex items-center justify-center shrink-0 mt-0.5 transition-all ${
            bump1 ? 'border-accent bg-accent' : 'border-muted-foreground/40'
          }`}>
            {bump1 && <Check className="w-3.5 h-3.5 text-accent-foreground" />}
          </div>
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1">
              <div className="w-8 h-8 rounded-lg bg-accent/10 flex items-center justify-center">
                <Headphones className="w-4 h-4 text-accent" />
              </div>
              <div>
                <p className="font-heading font-bold text-foreground text-sm">Growth Accelerator Audio Pack</p>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-accent">+$4.99</span>
                  <span className="text-xs text-muted-foreground line-through">$9.99</span>
                  <span className="text-[10px] font-bold text-primary bg-primary/10 px-1.5 py-0.5 rounded">50% OFF</span>
                </div>
              </div>
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              15 premium guided sessions: focus soundscapes, visualization journeys, power meditations & sleep stories
            </p>
          </div>
        </div>
      </motion.button>

      {/* Order Bump 2 — Blueprint */}
      <motion.button
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.35 }}
        onClick={() => setBump2(!bump2)}
        className={`w-full glass-card p-4 mb-6 text-left transition-all relative overflow-hidden ${
          bump2 ? 'border-accent/50 ring-1 ring-accent/20' : ''
        }`}
      >
        {bump2 && <div className="absolute inset-0 bg-accent/5" />}
        <div className="relative z-10 flex items-start gap-3">
          <div className={`w-6 h-6 rounded-lg border-2 flex items-center justify-center shrink-0 mt-0.5 transition-all ${
            bump2 ? 'border-accent bg-accent' : 'border-muted-foreground/40'
          }`}>
            {bump2 && <Check className="w-3.5 h-3.5 text-accent-foreground" />}
          </div>
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1">
              <div className="w-8 h-8 rounded-lg bg-accent/10 flex items-center justify-center">
                <BookOpen className="w-4 h-4 text-accent" />
              </div>
              <div>
                <p className="font-heading font-bold text-foreground text-sm">90-Day Transformation Blueprint</p>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-accent">+$9.99</span>
                  <span className="text-xs text-muted-foreground line-through">$19.99</span>
                  <span className="text-[10px] font-bold text-primary bg-primary/10 px-1.5 py-0.5 rounded">50% OFF</span>
                </div>
              </div>
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Week-by-week 90-day system + 65-page printable workbook + exclusive advanced protocols
            </p>
          </div>
        </div>
      </motion.button>

      {/* Error Message */}
      {error && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center gap-2 p-3 mb-4 rounded-xl bg-destructive/10 border border-destructive/20"
        >
          <AlertCircle className="w-4 h-4 text-destructive shrink-0" />
          <p className="text-sm text-destructive">{error}</p>
        </motion.div>
      )}

      {/* CTA */}
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }} className="sticky bottom-0 pb-4 pt-2 bg-background/80 backdrop-blur-lg -mx-5 px-5">
        {savings > 0 && (
          <p className="text-center text-xs text-accent font-semibold mb-2">
            🎉 You're saving ${savings.toFixed(2)} with this bundle!
          </p>
        )}
        <button
          onClick={handlePurchase}
          disabled={isLoading}
          className="w-full py-4 rounded-xl gradient-accent text-accent-foreground font-heading font-bold text-lg flex items-center justify-center gap-2 glow-accent hover:opacity-90 transition-all active:scale-[0.98] disabled:opacity-50"
        >
          {isLoading ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin" />
              Opening Checkout...
            </>
          ) : (
            <>
              <Sparkles className="w-5 h-5" />
              Get GrowOS PRO — ${total.toFixed(2)}
              <ArrowRight className="w-5 h-5" />
            </>
          )}
        </button>
        <div className="flex items-center justify-center gap-4 mt-3">
          <div className="flex items-center gap-1 text-muted-foreground">
            <Shield className="w-3.5 h-3.5" />
            <span className="text-[10px]">Secure checkout</span>
          </div>
          <div className="flex items-center gap-1 text-muted-foreground">
            <Lock className="w-3.5 h-3.5" />
            <span className="text-[10px]">SSL encrypted</span>
          </div>
          <div className="flex items-center gap-1 text-muted-foreground">
            <Zap className="w-3.5 h-3.5" />
            <span className="text-[10px]">Instant access</span>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
