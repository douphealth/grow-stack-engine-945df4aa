import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useGrowOS } from '@/lib/growos-context';
import { PROTOCOLS, getDimensionColor, getDimensionBg, AFFIRMATIONS } from '@/lib/growos-data';
import StateCheckIn from './StateCheckIn';
import QuickBreathingReset from './QuickBreathingReset';
import { Play, Flame, BookOpen, Trophy, TrendingUp, Crown, User, Sparkles, ChevronRight, Star } from 'lucide-react';

export default function HomeScreen() {
  const {
    userName, archetype, growthScore, streak, completedToday,
    currentStack, setScreen, activeProtocol, hasCheckedIn, setHasCheckedIn, isPro,
    subscribedToAcademy,
  } = useGrowOS();

  const [showCheckIn, setShowCheckIn] = useState(false);
  const [showBreathing, setShowBreathing] = useState(false);
  const [affirmation] = useState(() => AFFIRMATIONS[Math.floor(Math.random() * AFFIRMATIONS.length)]);

  const protocol = activeProtocol ? PROTOCOLS.find(p => p.id === activeProtocol.id) : null;
  const totalStackTime = Math.ceil(currentStack.reduce((sum, a) => sum + a.durationSeconds, 0) / 60);
  const hour = new Date().getHours();
  const greeting = hour < 12 ? 'Good Morning' : hour < 17 ? 'Good Afternoon' : 'Good Evening';

  return (
    <div className="min-h-screen pb-24 px-5 pt-6 max-w-md mx-auto">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center justify-between mb-6"
      >
        <div>
          <p className="text-sm text-muted-foreground">{greeting}</p>
          <h1 className="text-2xl font-heading font-bold text-foreground">{userName} {archetype?.emoji}</h1>
        </div>
        <div className="flex items-center gap-2">
          {!isPro && (
            <button
              onClick={() => setScreen('upgrade')}
              className="p-2.5 rounded-xl bg-accent/10 text-accent hover:bg-accent/20 transition-all"
            >
              <Crown className="w-5 h-5" />
            </button>
          )}
          <button
            onClick={() => setScreen('profile')}
            className="p-2.5 rounded-xl bg-secondary text-muted-foreground hover:text-foreground transition-all"
          >
            <User className="w-5 h-5" />
          </button>
        </div>
      </motion.div>

      {/* Growth Score */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="glass-card p-4 mb-4 flex items-center justify-between"
      >
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-xl gradient-primary flex items-center justify-center">
            <TrendingUp className="w-6 h-6 text-primary-foreground" />
          </div>
          <div>
            <p className="text-xs text-muted-foreground uppercase tracking-wider">Growth Score</p>
            <p className="text-2xl font-heading font-bold text-foreground">{growthScore}</p>
          </div>
        </div>
        <div className="flex items-center gap-1.5 bg-accent/10 px-3 py-1.5 rounded-lg">
          <Flame className="w-4 h-4 text-accent" />
          <span className="text-sm font-bold text-accent">{streak} day streak</span>
        </div>
      </motion.div>

      {/* Daily Affirmation */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.15 }}
        className="glass-card p-4 mb-4"
      >
        <div className="flex items-start gap-3">
          <Star className="w-5 h-5 text-accent shrink-0 mt-0.5" />
          <div>
            <p className="text-xs text-muted-foreground uppercase tracking-wider mb-1">Daily Affirmation</p>
            <p className="text-sm text-foreground/90 italic">"{affirmation}"</p>
          </div>
        </div>
      </motion.div>

      {/* Quick Box Breathing Reset */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.18 }}
        onClick={() => setShowBreathing(true)}
        className="glass-card p-4 mb-4 hover:bg-secondary/40 transition-all cursor-pointer relative overflow-hidden group border-emerald-500/25"
      >
        <div className="absolute inset-0 bg-gradient-to-r from-emerald-500/5 to-teal-500/5 group-hover:opacity-80 transition-opacity" />
        <div className="relative z-10 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/10 flex items-center justify-center text-emerald-400 group-hover:scale-110 transition-transform">
              <span className="text-xl">🧘</span>
            </div>
            <div className="text-left">
              <p className="text-[10px] text-emerald-400 font-bold uppercase tracking-wider">Quick state Reset</p>
              <p className="font-semibold text-foreground text-sm flex items-center gap-1.5">
                60s Autonomic Box Breathing
                <span className="text-[9px] font-bold text-emerald-400 bg-emerald-500/10 px-1 py-0.5 rounded leading-none">🧘 RESTORE FOCUS</span>
              </p>
              <p className="text-xs text-muted-foreground mt-0.5">Resynchronize heart rate & reduce cortisol immediately</p>
            </div>
          </div>
          <ChevronRight className="w-5 h-5 text-muted-foreground group-hover:text-foreground group-hover:translate-x-0.5 transition-all" />
        </div>
      </motion.div>

      {/* State Check-In or Stack CTA */}
      <AnimatePresence mode="wait">
        {showCheckIn ? (
          <StateCheckIn key="checkin" onComplete={() => setShowCheckIn(false)} />
        ) : (
          <motion.div
            key="stack-cta"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="glass-card p-5 mb-4 relative overflow-hidden"
          >
            <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-accent/5" />
            <div className="relative z-10">
              <div className="flex items-center gap-2 mb-1">
                <Sparkles className="w-4 h-4 text-primary" />
                <p className="text-xs text-primary font-semibold uppercase tracking-wider">Today's Growth Stack</p>
              </div>
              <p className="text-xl font-heading font-bold text-foreground mb-1">
                {currentStack.length} micro-actions • {totalStackTime} min
              </p>
              <div className="flex gap-1.5 mb-4">
                {currentStack.map(a => (
                  <span key={a.id} className="text-lg">{a.emoji}</span>
                ))}
              </div>

              {completedToday ? (
                <div className="flex items-center gap-2 py-3 px-4 rounded-xl bg-primary/10">
                  <Trophy className="w-5 h-5 text-primary" />
                  <span className="font-semibold text-primary">Stack completed today! 🎉</span>
                </div>
              ) : (
                <div className="flex gap-2">
                  {!hasCheckedIn && (
                    <button
                      onClick={() => setShowCheckIn(true)}
                      className="flex-1 py-3 rounded-xl bg-secondary text-foreground font-medium hover:bg-secondary/80 transition-all text-sm"
                    >
                      Customize
                    </button>
                  )}
                  <button
                    onClick={() => setScreen('stack-execution')}
                    className="flex-1 py-3 rounded-xl gradient-primary text-primary-foreground font-heading font-semibold flex items-center justify-center gap-2 glow-primary hover:opacity-90 transition-all active:scale-[0.98]"
                  >
                    <Play className="w-5 h-5" />
                    Start Stack
                  </button>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Active Protocol */}
      {protocol && activeProtocol && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="glass-card p-4 mb-4"
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <span className="text-2xl">{protocol.emoji}</span>
              <div>
                <p className="text-xs text-muted-foreground uppercase tracking-wider">Active Protocol</p>
                <p className="font-semibold text-foreground">{protocol.title}</p>
              </div>
            </div>
            <span className="text-sm text-muted-foreground">Day {activeProtocol.day}/{activeProtocol.totalDays}</span>
          </div>
          <div className="mt-3 h-2 rounded-full bg-secondary overflow-hidden">
            <div
              className="h-full gradient-primary rounded-full transition-all"
              style={{ width: `${(activeProtocol.day / activeProtocol.totalDays) * 100}%` }}
            />
          </div>
        </motion.div>
      )}

      {/* 7-Day Growth Academy Card */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.32 }}
        onClick={() => setScreen('email-academy')}
        className="glass-card p-4 mb-4 hover:bg-secondary/50 transition-all cursor-pointer relative overflow-hidden"
      >
        <div className="absolute inset-0 bg-gradient-to-r from-primary/5 to-accent/5 pointer-events-none" />
        <div className="relative z-10 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="text-2xl">📧</span>
            <div className="text-left">
              <p className="text-[10px] text-primary font-bold uppercase tracking-wider">7-Day Academy</p>
              <p className="font-semibold text-foreground text-sm">
                {subscribedToAcademy ? 'Growth Academy Active' : 'Unlock Growth Academy'}
              </p>
              <p className="text-xs text-muted-foreground mt-0.5">
                {subscribedToAcademy ? 'Read Day-by-Day Email Training' : 'Unlock custom blueprint & 7-day course'}
              </p>
            </div>
          </div>
          <ChevronRight className="w-5 h-5 text-muted-foreground" />
        </div>
      </motion.div>

      {/* Quick Actions */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.35 }}
        className="grid grid-cols-2 gap-3 mb-4"
      >
        <button
          onClick={() => setScreen('journal')}
          className="glass-card p-4 text-left hover:bg-secondary/50 transition-all active:scale-[0.98]"
        >
          <span className="text-2xl mb-2 block">📝</span>
          <p className="font-semibold text-foreground text-sm">Quick Journal</p>
          <p className="text-xs text-muted-foreground">Reflect & grow</p>
        </button>
        <button
          onClick={() => setScreen('protocols')}
          className="glass-card p-4 text-left hover:bg-secondary/50 transition-all active:scale-[0.98]"
        >
          <span className="text-2xl mb-2 block">📊</span>
          <p className="font-semibold text-foreground text-sm">Protocols</p>
          <p className="text-xs text-muted-foreground">Growth challenges</p>
        </button>
      </motion.div>

      {/* Bottom Nav */}
      <div className="fixed bottom-0 left-0 right-0 bg-card/90 backdrop-blur-xl border-t border-border/50 px-6 py-3">
        <div className="max-w-md mx-auto flex justify-around">
          {[
            { icon: '🏠', label: 'Home', screen: 'home' as const },
            { icon: '📊', label: 'Protocols', screen: 'protocols' as const },
            { icon: '📧', label: 'Academy', screen: 'email-academy' as const },
            { icon: '📝', label: 'Journal', screen: 'journal' as const },
            { icon: '👤', label: 'Profile', screen: 'profile' as const },
          ].map(item => (
            <button
              key={item.label}
              onClick={() => setScreen(item.screen)}
              className="flex flex-col items-center gap-0.5 text-muted-foreground hover:text-foreground transition-colors"
            >
              <span className="text-xl">{item.icon}</span>
              <span className="text-[10px] font-medium">{item.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Autonomic Box Breathing Reset Overlay */}
      <AnimatePresence>
        {showBreathing && (
          <QuickBreathingReset onClose={() => setShowBreathing(false)} />
        )}
      </AnimatePresence>
    </div>
  );
}
