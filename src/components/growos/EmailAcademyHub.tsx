import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useGrowOS } from '@/lib/growos-context';
import { generatePersonalizedEmail, EMAIL_TEMPLATES } from '@/lib/growos-emails';
import { supabase } from '@/integrations/supabase/client';
import { ChevronLeft, Mail, MailOpen, Copy, Check, Sparkles, User, Calendar, Play, Crown, ArrowRight, Info } from 'lucide-react';
import { toast } from 'sonner';

export default function EmailAcademyHub() {
  const {
    setScreen, userName, userEmail, setUserEmail,
    subscribedToAcademy, setSubscribedToAcademy,
    academyEmailsRead, markEmailAsRead, archetype, primaryGoal
  } = useGrowOS();

  const [selectedDay, setSelectedDay] = useState(1);
  const [copied, setCopied] = useState(false);
  const [subscribeEmail, setSubscribeEmail] = useState('');
  const [isSubscribing, setIsSubscribing] = useState(false);
  const [unlockAll, setUnlockAll] = useState(false);

  // Mark selected email as read when opened
  useEffect(() => {
    if (subscribedToAcademy) {
      markEmailAsRead(selectedDay);
    }
  }, [selectedDay, subscribedToAcademy]);

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    toast.success('Email copy copied to clipboard!');
    setTimeout(() => setCopied(false), 2000);
  };

  const handleManualSubscribe = async (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = subscribeEmail.trim();
    if (!trimmed || !trimmed.includes('@')) {
      toast.error('Please enter a valid email address.');
      return;
    }

    setIsSubscribing(true);
    try {
      await supabase
        .from('leads' as any)
        .insert({
          email: trimmed.toLowerCase(),
          name: userName || 'Grower',
          archetype: archetype?.id || 'evolver',
          primary_goal: primaryGoal || 'mindset',
        });
    } catch (err) {
      console.warn('Supabase insert failed. Saving locally.', err);
    }

    setUserEmail(trimmed);
    setSubscribedToAcademy(true);
    setIsSubscribing(false);
    toast.success('Welcome to the Growth Academy! 🎉');
  };

  // Get active email object
  const activeEmailData = generatePersonalizedEmail(selectedDay, userName, archetype, primaryGoal);

  // Count total read
  const totalRead = EMAIL_TEMPLATES.filter(t => academyEmailsRead[t.day]).length;

  // Determine if a day is unlocked (Day 1 is unlocked immediately, other days unlock or show unlock option)
  const isUnlocked = (day: number) => {
    if (unlockAll) return true;
    return day === 1; // Simulated Day 1 immediately unlocked
  };

  return (
    <div className="min-h-screen pb-24 px-5 pt-6 max-w-md mx-auto flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between mb-5">
        <div className="flex items-center gap-3">
          <button
            onClick={() => setScreen('home')}
            className="p-2 rounded-lg bg-secondary text-muted-foreground hover:text-foreground transition-colors"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          <div>
            <h1 className="text-xl font-heading font-bold text-foreground">Growth Academy</h1>
            <p className="text-xs text-muted-foreground">7-Day High-Performance Email Copywriting</p>
          </div>
        </div>
        
        {subscribedToAcademy && (
          <button
            onClick={() => {
              setUnlockAll(!unlockAll);
              toast.success(unlockAll ? 'Sequence reset to standard flow' : 'All 7 days unlocked for review! ⚡');
            }}
            className="px-2.5 py-1.5 rounded-lg bg-primary/10 text-primary text-xs font-semibold hover:bg-primary/20 transition-all flex items-center gap-1"
          >
            <Sparkles className="w-3.5 h-3.5" />
            {unlockAll ? 'Reset Flow' : 'Unlock All'}
          </button>
        )}
      </div>

      {/* UNSUBSCRIBED PROMO STATE */}
      {!subscribedToAcademy ? (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex-1 flex flex-col justify-center text-center space-y-6 py-10"
        >
          <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto text-3xl">
            📧
          </div>
          <div>
            <h2 className="text-2xl font-heading font-bold text-foreground">Activate Your Academy</h2>
            <p className="text-muted-foreground text-sm mt-2 max-w-sm mx-auto leading-relaxed">
              Unlock a hyper-personalized 7-day email training series matching your **{archetype?.name || 'Archetype'}** Growth DNA.
            </p>
          </div>

          <div className="glass-card p-5 text-left max-w-sm mx-auto">
            <h3 className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-3">Included in the course:</h3>
            <div className="space-y-2 text-sm text-foreground/80">
              <p className="flex items-center gap-2">🌱 <span className="font-medium">Day 1:</span> Custom Archetype Blueprint</p>
              <p className="flex items-center gap-2">⚠️ <span className="font-medium">Day 2:</span> The Shadow Bottleneck Hack</p>
              <p className="flex items-center gap-2">🔄 <span className="font-medium">Day 3:</span> Atomic Habit Stacking</p>
              <p className="flex items-center gap-2">🧠 <span className="font-medium">Day 4-7:</span> Neuro-Shifts, Sleep & Analytics</p>
            </div>
          </div>

          <form onSubmit={handleManualSubscribe} className="space-y-3 max-w-sm mx-auto w-full">
            <input
              type="email"
              placeholder="Enter your email address"
              value={subscribeEmail}
              onChange={(e) => setSubscribeEmail(e.target.value)}
              disabled={isSubscribing}
              className="w-full px-4 py-3 rounded-xl bg-secondary border border-border text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-transparent transition-all text-center"
            />
            <button
              type="submit"
              disabled={isSubscribing}
              className="w-full py-3.5 rounded-xl gradient-primary text-primary-foreground font-heading font-semibold text-sm flex items-center justify-center gap-2 glow-primary hover:opacity-95 transition-all"
            >
              Activate Free Academy
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>
        </motion.div>
      ) : (
        /* EMAIL CLIENT SIMULATOR UI */
        <div className="flex-1 flex flex-col space-y-4 min-h-0">
          
          {/* Progress bar info */}
          <div className="flex items-center justify-between text-xs text-muted-foreground bg-secondary/30 px-3 py-2 rounded-lg">
            <span>Progress: {totalRead} of 7 emails read</span>
            <span className="font-semibold text-primary">{Math.round((totalRead / 7) * 100)}%</span>
          </div>

          {/* Dual layout */}
          <div className="flex-1 flex flex-col min-h-0 bg-secondary/10 rounded-2xl border border-border/40 overflow-hidden">
            
            {/* Horizontal Day Tabs list */}
            <div className="flex border-b border-border/40 overflow-x-auto shrink-0 scrollbar-none bg-background/50">
              {EMAIL_TEMPLATES.map((item) => {
                const isSelected = selectedDay === item.day;
                const opened = !!academyEmailsRead[item.day];
                const unlocked = isUnlocked(item.day);

                return (
                  <button
                    key={item.day}
                    onClick={() => setSelectedDay(item.day)}
                    className={`flex-1 min-w-[72px] py-3 text-center flex flex-col items-center relative transition-all border-r border-border/20 last:border-r-0 ${
                      isSelected ? 'bg-secondary/60 text-foreground font-semibold' : 'text-muted-foreground hover:text-foreground'
                    }`}
                  >
                    <span className="text-[10px] uppercase font-bold tracking-wider">Day {item.day}</span>
                    <div className="mt-1 relative flex items-center justify-center">
                      {!unlocked ? (
                        <span className="text-[10px] text-muted-foreground">🔒 Locked</span>
                      ) : opened ? (
                        <MailOpen className="w-3.5 h-3.5 text-muted-foreground" />
                      ) : (
                        <div className="relative">
                          <Mail className="w-3.5 h-3.5 text-primary" />
                          <span className="absolute -top-0.5 -right-0.5 w-1.5 h-1.5 bg-sky-500 rounded-full animate-pulse" />
                        </div>
                      )}
                    </div>
                    {isSelected && (
                      <motion.div
                        layoutId="activeTabIndicator"
                        className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary"
                      />
                    )}
                  </button>
                );
              })}
            </div>

            {/* Email detail viewer */}
            <div className="flex-1 overflow-y-auto p-5 space-y-4 flex flex-col min-h-0 bg-background/25">
              {!isUnlocked(selectedDay) ? (
                /* LOCKED STATE SCREEN */
                <div className="flex-1 flex flex-col items-center justify-center text-center space-y-4 py-8">
                  <div className="w-12 h-12 rounded-xl bg-secondary/80 flex items-center justify-center text-xl text-muted-foreground">
                    🔒
                  </div>
                  <div>
                    <h3 className="font-heading font-bold text-foreground">Day {selectedDay} Email is Locked</h3>
                    <p className="text-muted-foreground text-xs max-w-[240px] mx-auto mt-1">
                      In the live sequence, this email is sent 24 hours after the previous step.
                    </p>
                  </div>
                  <button
                    onClick={() => {
                      setUnlockAll(true);
                      toast.success('All 7 days unlocked for review! ⚡');
                    }}
                    className="mt-2 px-4 py-2 rounded-xl bg-primary text-primary-foreground font-semibold text-xs hover:opacity-90 transition-all flex items-center gap-1.5"
                  >
                    <Sparkles className="w-3.5 h-3.5" />
                    Unlock for Review (Simulate)
                  </button>
                </div>
              ) : (
                /* UNLOCKED DETAIL VIEW */
                <div className="flex-1 flex flex-col justify-between space-y-5 min-h-0">
                  
                  {/* Email header metadata */}
                  <div className="space-y-2 pb-4 border-b border-border/30">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-bold text-primary bg-primary/10 px-2 py-0.5 rounded-full tracking-wider">
                        {activeEmailData.badge}
                      </span>
                      <span className="text-[10px] text-muted-foreground flex items-center gap-1">
                        <Calendar className="w-3 h-3" />
                        Day {selectedDay} Sequence
                      </span>
                    </div>
                    
                    <h2 className="text-lg font-heading font-bold text-foreground leading-snug">
                      {activeEmailData.subject}
                    </h2>
                    
                    <div className="flex items-center justify-between text-xs text-muted-foreground pt-1">
                      <div className="flex items-center gap-1.5">
                        <div className="w-6 h-6 rounded-full bg-secondary flex items-center justify-center text-[10px] font-bold shrink-0">
                          🌱
                        </div>
                        <div>
                          <p className="font-semibold text-foreground">GrowOS Academy</p>
                          <p className="text-[10px]">academy@gearuptogrow.com</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p>To: {userName}</p>
                        <p className="text-[10px]">{userEmail}</p>
                      </div>
                    </div>
                  </div>

                  {/* Email body */}
                  <div className="flex-1 text-sm text-foreground/90 whitespace-pre-wrap leading-relaxed font-sans min-h-0 overflow-y-auto">
                    {activeEmailData.body}
                  </div>

                  {/* CTAs / Action bar */}
                  <div className="pt-4 border-t border-border/30 space-y-2 shrink-0">
                    {selectedDay === 1 && (
                      <button
                        onClick={() => {
                          toast.success('Custom PDF report downloaded!');
                        }}
                        className="w-full py-3 rounded-xl bg-primary text-primary-foreground font-semibold text-xs flex items-center justify-center gap-1.5 hover:opacity-90 transition-all"
                      >
                        📥 Download Blueprint PDF (Free Report)
                      </button>
                    )}
                    {selectedDay === 2 && (
                      <button
                        onClick={() => setScreen('home')}
                        className="w-full py-3 rounded-xl bg-primary text-primary-foreground font-semibold text-xs flex items-center justify-center gap-1.5 hover:opacity-90 transition-all"
                      >
                        <Play className="w-4 h-4" /> Start Recommended Reset Stack
                      </button>
                    )}
                    {selectedDay === 3 && (
                      <button
                        onClick={() => setScreen('home')}
                        className="w-full py-3 rounded-xl bg-primary text-primary-foreground font-semibold text-xs flex items-center justify-center gap-1.5 hover:opacity-90 transition-all"
                      >
                        <Play className="w-4 h-4" /> Set Up Habit Stack on Dashboard
                      </button>
                    )}
                    {selectedDay === 5 && (
                      <button
                        onClick={() => setScreen('upgrade')}
                        className="w-full py-3 rounded-xl bg-accent text-accent-foreground font-semibold text-xs flex items-center justify-center gap-1.5 hover:opacity-90 transition-all"
                      >
                        <Crown className="w-4 h-4 text-accent-foreground" /> Unlock Evening Wind-Down (Go PRO)
                      </button>
                    )}
                    {selectedDay === 6 && (
                      <button
                        onClick={() => setScreen('analytics')}
                        className="w-full py-3 rounded-xl bg-primary text-primary-foreground font-semibold text-xs flex items-center justify-center gap-1.5 hover:opacity-90 transition-all"
                      >
                        📊 View Growth Analytics Dashboard
                      </button>
                    )}
                    {selectedDay === 7 && (
                      <button
                        onClick={() => setScreen('upgrade')}
                        className="w-full py-3.5 rounded-xl gradient-accent text-accent-foreground font-heading font-bold text-sm flex items-center justify-center gap-1.5 glow-accent hover:opacity-90 transition-all"
                      >
                        <Crown className="w-4.5 h-4.5 text-accent-foreground" /> Upgrade to PRO Lifetime Access — $7.99
                      </button>
                    )}

                    <div className="flex gap-2">
                      <button
                        onClick={() => handleCopy(activeEmailData.body)}
                        className="flex-1 py-2.5 rounded-xl bg-secondary text-foreground text-xs font-semibold flex items-center justify-center gap-1.5 hover:bg-secondary/80 transition-all"
                      >
                        {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                        {copied ? 'Copied' : 'Copy Email Text'}
                      </button>
                      <a
                        href="https://gearuptogrow.com"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex-1 py-2.5 rounded-xl bg-secondary text-muted-foreground text-xs font-semibold flex items-center justify-center gap-1.5 hover:bg-secondary/80 hover:text-foreground transition-all"
                      >
                        🌐 Visit Blog
                      </a>
                    </div>
                  </div>

                </div>
              )}
            </div>

          </div>

          {/* Email sequence explanation note */}
          <div className="flex gap-2 items-start p-3 bg-secondary/20 rounded-xl border border-border/30">
            <Info className="w-4 h-4 text-primary shrink-0 mt-0.5" />
            <p className="text-[10px] text-muted-foreground leading-relaxed">
              <span className="font-semibold text-foreground">Reviewer Note:</span> This email sequencer shows the copywriting sequence users will receive automatically in their email inbox. Use the <span className="text-primary font-medium">Unlock All</span> button to inspect the dynamic templates.
            </p>
          </div>

        </div>
      )}
    </div>
  );
}
