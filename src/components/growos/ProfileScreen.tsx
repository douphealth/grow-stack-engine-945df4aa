import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { useGrowOS } from '@/lib/growos-context';
import { generateShareCard, generateStreakCard, shareToNative } from '@/lib/share-cards';
import { generateGrowthReport } from '@/lib/growos-report';
import { Switch } from '@/components/ui/switch';
import { toast } from 'sonner';
import {
  ChevronLeft, ChevronRight, Crown, Share2, ExternalLink, BarChart3, Sparkles, Bell, FileDown,
  Flame, CheckCircle2, AlertTriangle, XCircle, Info, Send, RefreshCw,
} from 'lucide-react';

type NotifStatus = 'unsupported' | 'granted' | 'denied' | 'default';

function getNotifStatus(): NotifStatus {
  if (typeof Notification === 'undefined') return 'unsupported';
  return Notification.permission as NotifStatus;
}

export default function ProfileScreen() {
  const {
    setScreen, userName, archetype, growthScore, streak, isPro, completedToday,
    notificationsEnabled, notificationTime, setNotificationsEnabled, setNotificationTime,
    dailyLogs, journalEntries,
  } = useGrowOS();
  const [isSharing, setIsSharing] = useState(false);
  const [isSharingStreak, setIsSharingStreak] = useState(false);
  const [notifStatus, setNotifStatus] = useState<NotifStatus>(getNotifStatus());
  const [now, setNow] = useState(() => new Date());

  // Refresh notification permission status when window regains focus
  useEffect(() => {
    const refresh = () => setNotifStatus(getNotifStatus());
    window.addEventListener('focus', refresh);
    return () => window.removeEventListener('focus', refresh);
  }, []);

  useEffect(() => {
    setNotifStatus(getNotifStatus());
  }, [notificationsEnabled]);

  // Tick every 30s so "Next reminder" countdown stays fresh
  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), 30_000);
    return () => clearInterval(id);
  }, []);

  const nextReminderAt = (() => {
    if (!notificationsEnabled || notifStatus !== 'granted') return null;
    const [h, m] = notificationTime.split(':').map(Number);
    const next = new Date(now);
    next.setHours(h, m, 0, 0);
    if (next <= now) next.setDate(next.getDate() + 1);
    return next;
  })();

  const formatRelative = (target: Date): string => {
    const diffMs = target.getTime() - now.getTime();
    const mins = Math.round(diffMs / 60_000);
    if (mins < 1) return 'in less than a minute';
    if (mins < 60) return `in ${mins} min`;
    const hrs = Math.floor(mins / 60);
    const remM = mins % 60;
    if (hrs < 24) return remM ? `in ${hrs}h ${remM}m` : `in ${hrs}h`;
    const days = Math.round(hrs / 24);
    return `in ${days} day${days > 1 ? 's' : ''}`;
  };

  const stats = [
    { label: 'Growth Score', value: growthScore, emoji: '📈' },
    { label: 'Day Streak', value: streak, emoji: '🔥' },
    { label: 'Stacks Done', value: completedToday ? 1 : 0, emoji: '✅' },
    { label: 'Status', value: isPro ? 'PRO' : 'Free', emoji: '💎' },
  ];

  const handleShareDNA = async () => {
    if (!archetype) return;
    setIsSharing(true);
    try {
      const blob = await generateShareCard({ archetype, userName, growthScore, streak });
      await shareToNative(blob, `I'm ${archetype.name}!`, `My Growth DNA: ${archetype.name} — ${archetype.title}`);
    } catch (e) {
      console.error('Share failed:', e);
    } finally {
      setIsSharing(false);
    }
  };

  const handleShareStreak = async () => {
    setIsSharingStreak(true);
    try {
      const blob = await generateStreakCard(userName || 'I', streak, growthScore);
      await shareToNative(
        blob,
        `${streak}-day Growth Streak 🔥`,
        `${streak} days strong on GrowOS — Growth Score ${growthScore}. Build yours at gearuptogrow.com`,
      );
    } catch (e) {
      console.error('Share failed:', e);
    } finally {
      setIsSharingStreak(false);
    }
  };

  // Notification status display logic
  const effectiveStatus: 'enabled' | 'blocked' | 'unsupported' | 'idle' =
    notifStatus === 'unsupported' ? 'unsupported'
    : notifStatus === 'denied' ? 'blocked'
    : notificationsEnabled && notifStatus === 'granted' ? 'enabled'
    : 'idle';

  const statusMeta = {
    enabled:     { icon: CheckCircle2, color: 'text-primary',    bg: 'bg-primary/10',    label: `Reminders ON · daily at ${notificationTime}` },
    idle:        { icon: Info,         color: 'text-muted-foreground', bg: 'bg-secondary', label: 'Reminders not scheduled' },
    blocked:     { icon: XCircle,      color: 'text-destructive', bg: 'bg-destructive/10', label: 'Notifications blocked by browser' },
    unsupported: { icon: AlertTriangle, color: 'text-amber-500',  bg: 'bg-amber-500/10',   label: 'Notifications not supported on this device' },
  }[effectiveStatus];
  const StatusIcon = statusMeta.icon;

  const sendTestReminder = () => {
    if (typeof Notification === 'undefined') {
      toast.error('Notifications not supported in this browser');
      return;
    }
    if (Notification.permission !== 'granted') {
      toast.error('Permission required — enable reminders first');
      return;
    }
    try {
      new Notification('🌱 Test reminder from GrowOS', {
        body: 'If you see this, your daily reminders will work!',
        icon: '/placeholder.svg',
        tag: 'growos-test',
      });
      toast.success('Test reminder sent');
      setNow(new Date());
    } catch (e) {
      console.error(e);
      toast.error('Could not send the test reminder');
    }
  };

  const retryScheduling = async () => {
    try {
      await setNotificationsEnabled(true);
      const next = getNotifStatus();
      setNotifStatus(next);
      if (next === 'granted') {
        toast.success(`Reminders scheduled for ${notificationTime} daily`);
      } else if (next === 'denied') {
        toast.error('Browser is still blocking notifications — see tips below');
      } else {
        toast.message('Permission prompt dismissed — try again when ready');
      }
    } catch (e) {
      console.error(e);
      toast.error('Could not set up reminders');
    }
  };

  return (
    <div className="min-h-screen pb-24 px-5 pt-6 max-w-md mx-auto">
      <div className="flex items-center gap-3 mb-6">
        <button onClick={() => setScreen('home')} className="p-2 rounded-lg bg-secondary text-muted-foreground">
          <ChevronLeft className="w-5 h-5" />
        </button>
        <h1 className="text-xl font-heading font-bold text-foreground">Profile</h1>
      </div>

      {/* Archetype Card */}
      {archetype && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass-card p-6 text-center mb-4 relative overflow-hidden"
        >
          <div className={`absolute inset-0 bg-gradient-to-br ${archetype.color} opacity-10`} />
          <div className="absolute inset-0 opacity-5" style={{
            backgroundImage: 'radial-gradient(circle at 2px 2px, currentColor 1px, transparent 0)',
            backgroundSize: '20px 20px',
          }} />
          <div className="relative z-10">
            <span className="text-5xl block mb-3">{archetype.emoji}</span>
            <h2 className="text-xl font-heading font-bold text-foreground">{userName}</h2>
            <p className={`text-sm font-semibold bg-gradient-to-r ${archetype.color} bg-clip-text text-transparent`}>
              {archetype.name} — {archetype.title}
            </p>
            <button
              onClick={handleShareDNA}
              disabled={isSharing}
              className="mt-4 inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-secondary text-sm text-foreground font-medium hover:bg-secondary/80 transition-all disabled:opacity-50"
            >
              {isSharing ? (
                <motion.div animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}>
                  <Sparkles className="w-3.5 h-3.5" />
                </motion.div>
              ) : (
                <Share2 className="w-3.5 h-3.5" />
              )}
              {isSharing ? 'Generating...' : 'Share DNA Card'}
            </button>
          </div>
        </motion.div>
      )}

      {/* Stats */}
      <div className="grid grid-cols-2 gap-3 mb-4">
        {stats.map((s, i) => (
          <motion.div
            key={s.label}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05 }}
            className="glass-card p-4 text-center"
          >
            <span className="text-2xl">{s.emoji}</span>
            <p className="text-xl font-heading font-bold text-foreground mt-1">{s.value}</p>
            <p className="text-xs text-muted-foreground">{s.label}</p>
          </motion.div>
        ))}
      </div>

      {/* Analytics CTA */}
      <motion.button
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        onClick={() => setScreen('analytics')}
        className="w-full glass-card p-4 flex items-center gap-3 mb-4 hover:bg-secondary/50 transition-all"
      >
        <div className="w-10 h-10 rounded-xl bg-primary/20 flex items-center justify-center">
          <BarChart3 className="w-5 h-5 text-primary" />
        </div>
        <div className="flex-1 text-left">
          <p className="font-semibold text-foreground">Growth Analytics</p>
          <p className="text-sm text-muted-foreground">Track your progress & dimensions</p>
        </div>
      </motion.button>

      {/* Upgrade CTA */}
      {!isPro && (
        <motion.button
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          onClick={() => setScreen('upgrade')}
          className="w-full glass-card p-4 flex items-center gap-3 mb-4 hover:bg-secondary/50 transition-all"
        >
          <div className="w-10 h-10 rounded-xl bg-accent/20 flex items-center justify-center">
            <Crown className="w-5 h-5 text-accent" />
          </div>
          <div className="flex-1 text-left">
            <p className="font-semibold text-foreground">Upgrade to GrowOS PRO</p>
            <p className="text-sm text-muted-foreground">Unlock everything for $7.99</p>
          </div>
        </motion.button>
      )}

      {/* Daily reminder + status */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.35 }}
        className="glass-card p-4 mb-3"
      >
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-primary/20 flex items-center justify-center">
            <Bell className="w-5 h-5 text-primary" />
          </div>
          <div className="flex-1">
            <p className="font-semibold text-foreground">Daily Reminder</p>
            <p className="text-xs text-muted-foreground">Get a nudge to run your stack</p>
          </div>
          <Switch
            checked={notificationsEnabled && notifStatus === 'granted'}
            disabled={notifStatus === 'unsupported' || notifStatus === 'denied'}
            onCheckedChange={async (v) => {
              await setNotificationsEnabled(v);
              setNotifStatus(getNotifStatus());
            }}
          />
        </div>

        {/* Status indicator */}
        <div className={`mt-3 flex items-center gap-2 rounded-lg px-3 py-2 ${statusMeta.bg}`}>
          <StatusIcon className={`w-4 h-4 shrink-0 ${statusMeta.color}`} />
          <p className={`text-xs font-medium ${statusMeta.color}`}>{statusMeta.label}</p>
        </div>

        {/* Next reminder field */}
        {nextReminderAt && (
          <div className="mt-2 flex items-center justify-between rounded-lg px-3 py-2 bg-secondary/50">
            <span className="text-xs text-muted-foreground">Next reminder</span>
            <span className="text-xs font-semibold text-foreground">
              {nextReminderAt.toLocaleString(undefined, { weekday: 'short', hour: '2-digit', minute: '2-digit' })}
              <span className="ml-1.5 text-muted-foreground font-normal">· {formatRelative(nextReminderAt)}</span>
            </span>
          </div>
        )}

        {effectiveStatus === 'enabled' && (
          <div className="mt-3 flex items-center gap-2">
            <label className="text-xs text-muted-foreground">Time</label>
            <input
              type="time"
              value={notificationTime}
              onChange={(e) => setNotificationTime(e.target.value)}
              className="bg-secondary text-foreground text-sm rounded-md px-2 py-1 border border-border"
            />
          </div>
        )}

        {/* Troubleshooting tips */}
        {effectiveStatus === 'blocked' && (
          <div className="mt-3 text-xs text-muted-foreground space-y-1.5 border-t border-border/50 pt-3">
            <p className="font-semibold text-foreground">How to unblock:</p>
            <p>• <span className="font-medium">Desktop:</span> click the lock 🔒 in the address bar → set Notifications to Allow</p>
            <p>• <span className="font-medium">iOS Safari:</span> Settings → Safari → Advanced → Website Data → remove this site, then re-enable here</p>
            <p>• <span className="font-medium">Android Chrome:</span> tap ⋮ → Site settings → Notifications → Allow</p>
          </div>
        )}
        {effectiveStatus === 'unsupported' && (
          <div className="mt-3 text-xs text-muted-foreground border-t border-border/50 pt-3">
            <p>Your current browser doesn't expose the Notification API. Try Chrome, Edge, Firefox, or install GrowOS as an app on iOS 16.4+.</p>
          </div>
        )}
        {effectiveStatus === 'idle' && notifStatus === 'default' && (
          <p className="mt-3 text-xs text-muted-foreground">Toggle on to grant permission and schedule your daily nudge.</p>
        )}
        {/* Action buttons */}
        {notifStatus !== 'unsupported' && (
          <div className="mt-3 flex gap-2">
            {effectiveStatus === 'enabled' && (
              <button
                onClick={sendTestReminder}
                className="flex-1 inline-flex items-center justify-center gap-1.5 py-2 px-3 rounded-lg bg-secondary text-foreground text-xs font-medium hover:bg-secondary/80 transition-all"
              >
                <Send className="w-3.5 h-3.5" />
                Send test reminder
              </button>
            )}
            {(effectiveStatus === 'idle' || effectiveStatus === 'blocked') && (
              <button
                onClick={retryScheduling}
                className="flex-1 inline-flex items-center justify-center gap-1.5 py-2 px-3 rounded-lg bg-primary/10 text-primary text-xs font-semibold hover:bg-primary/20 transition-all"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                Retry scheduling
              </button>
            )}
          </div>
        )}
      </motion.div>

      {/* Share Streak (native share target) */}
      <motion.button
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.38 }}
        onClick={handleShareStreak}
        disabled={isSharingStreak}
        className="w-full glass-card p-4 flex items-center gap-3 mb-3 hover:bg-secondary/50 transition-all disabled:opacity-50"
      >
        <div className="w-10 h-10 rounded-xl bg-orange-500/20 flex items-center justify-center">
          {isSharingStreak ? (
            <motion.div animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}>
              <Sparkles className="w-5 h-5 text-orange-400" />
            </motion.div>
          ) : (
            <Flame className="w-5 h-5 text-orange-400" />
          )}
        </div>
        <div className="flex-1 text-left">
          <p className="font-semibold text-foreground">Share Streak Card</p>
          <p className="text-sm text-muted-foreground">
            {streak > 0 ? `Brag about your ${streak}-day streak` : 'Send your Growth Score to a friend'}
          </p>
        </div>
        <Share2 className="w-4 h-4 text-muted-foreground" />
      </motion.button>

      {/* Growth Academy Hub Link */}
      <motion.button
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.39 }}
        onClick={() => setScreen('email-academy')}
        className="w-full glass-card p-4 flex items-center gap-3 mb-3 hover:bg-secondary/50 transition-all"
      >
        <div className="w-10 h-10 rounded-xl bg-sky-500/20 flex items-center justify-center">
          <Send className="w-5 h-5 text-sky-400" />
        </div>
        <div className="flex-1 text-left">
          <p className="font-semibold text-foreground">7-Day Growth Academy</p>
          <p className="text-sm text-muted-foreground">Personalized daily email lessons</p>
        </div>
        <ChevronRight className="w-4 h-4 text-muted-foreground" />
      </motion.button>

      {/* PDF export */}
      <motion.button
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        onClick={() =>
          generateGrowthReport({
            userName, archetype, growthScore, streak, isPro, dailyLogs, journalEntries,
          })
        }
        className="w-full glass-card p-4 flex items-center gap-3 mb-4 hover:bg-secondary/50 transition-all"
      >
        <div className="w-10 h-10 rounded-xl bg-accent/20 flex items-center justify-center">
          <FileDown className="w-5 h-5 text-accent" />
        </div>
        <div className="flex-1 text-left">
          <p className="font-semibold text-foreground">Download Growth Report</p>
          <p className="text-sm text-muted-foreground">PDF with stacks, streaks & scores</p>
        </div>
      </motion.button>

      {/* Link to website */}
      <a
        href="https://gearuptogrow.com"
        target="_blank"
        rel="noopener noreferrer"
        className="glass-card p-4 flex items-center gap-3 hover:bg-secondary/50 transition-all"
      >
        <span className="text-2xl">🌐</span>
        <div className="flex-1">
          <p className="font-semibold text-foreground">gearuptogrow.com</p>
          <p className="text-sm text-muted-foreground">Articles, guides & more</p>
        </div>
        <ExternalLink className="w-4 h-4 text-muted-foreground" />
      </a>
    </div>
  );
}
