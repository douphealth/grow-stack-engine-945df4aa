import { motion } from 'framer-motion';
import { useGrowOS } from '@/lib/growos-context';
import { PROTOCOLS } from '@/lib/growos-data';
import { ArrowRight } from 'lucide-react';
import { useState } from 'react';

const GOALS = [
  { id: 'focus', emoji: '🎯', label: 'Sharpen My Focus', desc: 'Deep work & concentration', protocolId: 'focus-forge' },
  { id: 'stress', emoji: '🧘', label: 'Reduce Stress', desc: 'Calm mind & inner peace', protocolId: 'stress-detox' },
  { id: 'productivity', emoji: '⚡', label: 'Boost Productivity', desc: 'Get more done, better', protocolId: 'anti-procrastination' },
  { id: 'confidence', emoji: '💪', label: 'Build Confidence', desc: 'Self-belief & courage', protocolId: 'confidence-catalyst' },
  { id: 'habits', emoji: '🏗️', label: 'Build Better Habits', desc: 'Consistency & discipline', protocolId: 'morning-ritual' },
  { id: 'mindset', emoji: '🧠', label: 'Growth Mindset', desc: 'Rewire my thinking', protocolId: 'growth-mindset' },
];

export default function GoalSelect() {
  const { setPrimaryGoal, setScreen, setActiveProtocol, setGrowthScore, setStreak, isPro } = useGrowOS();
  const [selected, setSelected] = useState('');

  const handleContinue = () => {
    const goal = GOALS.find(g => g.id === selected);
    if (!goal) return;

    setPrimaryGoal(selected);
    setGrowthScore(100);
    setStreak(1);

    // Match protocol to goal — fall back to free protocol if premium and not Pro
    const protocol = PROTOCOLS.find(p => p.id === goal.protocolId);
    if (protocol) {
      if (protocol.isPremium && !isPro) {
        // Fall back to first free protocol
        const freeProtocol = PROTOCOLS.find(p => !p.isPremium);
        if (freeProtocol) {
          setActiveProtocol({ id: freeProtocol.id, day: 1, totalDays: freeProtocol.days });
        }
      } else {
        setActiveProtocol({ id: protocol.id, day: 1, totalDays: protocol.days });
      }
    }

    setScreen('home');
  };

  return (
    <div className="min-h-screen flex flex-col px-6 py-10 max-w-md mx-auto">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <h2 className="text-2xl font-heading font-bold text-foreground mb-2">
          What's your #1 growth goal?
        </h2>
        <p className="text-muted-foreground mb-8">
          We'll personalize your Growth Stacks around this.
        </p>
      </motion.div>

      <div className="space-y-3 flex-1">
        {GOALS.map((goal, i) => {
          const protocol = PROTOCOLS.find(p => p.id === goal.protocolId);
          const isLocked = protocol?.isPremium && !isPro;
          return (
            <motion.button
              key={goal.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.08 }}
              onClick={() => setSelected(goal.id)}
              className={`w-full p-4 rounded-xl text-left flex items-center gap-4 transition-all active:scale-[0.98] ${
                selected === goal.id
                  ? 'bg-primary/15 border-2 border-primary glow-primary'
                  : 'glass-card hover:bg-secondary/80'
              }`}
            >
              <span className="text-3xl">{goal.emoji}</span>
              <div className="flex-1">
                <p className="font-semibold text-foreground">{goal.label}</p>
                <p className="text-sm text-muted-foreground">{goal.desc}</p>
              </div>
              {isLocked && (
                <span className="text-[10px] font-bold text-accent bg-accent/10 px-2 py-0.5 rounded">PRO</span>
              )}
            </motion.button>
          );
        })}
      </div>

      <motion.button
        initial={{ opacity: 0 }}
        animate={{ opacity: selected ? 1 : 0.5 }}
        disabled={!selected}
        onClick={handleContinue}
        className="w-full py-4 rounded-xl gradient-primary text-primary-foreground font-heading font-semibold text-lg flex items-center justify-center gap-2 glow-primary hover:opacity-90 transition-all active:scale-[0.98] mt-6 disabled:opacity-30 disabled:cursor-not-allowed"
      >
        Let's Go
        <ArrowRight className="w-5 h-5" />
      </motion.button>
    </div>
  );
}
