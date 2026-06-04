import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useGrowOS } from '@/lib/growos-context';
import { X, Play, Wind, Sparkles, Brain, Trophy } from 'lucide-react';
import { toast } from 'sonner';

interface QuickBreathingResetProps {
  onClose: () => void;
}

type BreathPhase = 'idle' | 'inhale' | 'hold-in' | 'exhale' | 'hold-out' | 'complete';

export default function QuickBreathingReset({ onClose }: QuickBreathingResetProps) {
  const { growthScore, setGrowthScore, logDailyCompletion } = useGrowOS();
  const [phase, setPhase] = useState<BreathPhase>('idle');
  const [round, setRound] = useState(1);
  const [secondsLeft, setSecondsLeft] = useState(4);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const phaseDuration = 4; // 4 seconds per box phase
  const maxRounds = 4;     // 4 rounds total (~64 seconds)

  // Start breathing cycle
  const startSession = () => {
    setPhase('inhale');
    setRound(1);
    setSecondsLeft(phaseDuration);
    navigator.vibrate?.(50);
  };

  // Run the countdown timer and handle phase transition loops
  useEffect(() => {
    if (phase === 'idle' || phase === 'complete') {
      if (timerRef.current) clearInterval(timerRef.current);
      return;
    }

    timerRef.current = setInterval(() => {
      setSecondsLeft((prev) => {
        if (prev <= 1) {
          // Trigger transition vibration
          navigator.vibrate?.([30]);

          // Move to next phase in the Box Breathing cycle
          setPhase((currentPhase) => {
            switch (currentPhase) {
              case 'inhale':
                return 'hold-in';
              case 'hold-in':
                return 'exhale';
              case 'exhale':
                return 'hold-out';
              case 'hold-out':
                // Check if we need to loop to the next round or complete
                if (round < maxRounds) {
                  setRound((r) => r + 1);
                  return 'inhale';
                } else {
                  handleCompletion();
                  return 'complete';
                }
              default:
                return 'idle';
            }
          });
          return phaseDuration;
        }
        return prev - 1;
      });
    }, 1000);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [phase, round]);

  const handleCompletion = () => {
    navigator.vibrate?.([100, 50, 100]);
    // Add 5 points to the growth score
    setGrowthScore(growthScore + 5);
    // Log completion
    try {
      logDailyCompletion(5);
    } catch (e) {
      console.warn('Logging breathing score failed:', e);
    }
    toast.success('Breathing reset complete! Focus restored. 🧘');
  };

  // Get instructional text and circle scaling depending on phase
  const getPhaseConfig = () => {
    switch (phase) {
      case 'inhale':
        return {
          text: 'Inhale Deeply',
          instruction: 'Expand your belly, draw in oxygen',
          emoji: '🌬️',
          scale: 1.5,
          color: 'from-emerald-500/20 to-teal-500/30 border-emerald-500',
        };
      case 'hold-in':
        return {
          text: 'Hold Breath',
          instruction: 'Let oxygen saturate your bloodstream',
          emoji: '🧘',
          scale: 1.5,
          color: 'from-amber-500/20 to-orange-500/30 border-amber-500',
        };
      case 'exhale':
        return {
          text: 'Exhale Slowly',
          instruction: 'Release stress, let go of tension',
          emoji: '💨',
          scale: 0.85,
          color: 'from-sky-500/20 to-blue-500/30 border-sky-500',
        };
      case 'hold-out':
        return {
          text: 'Rest Empty',
          instruction: 'Enjoy the absolute stillness',
          emoji: '✨',
          scale: 0.85,
          color: 'from-indigo-500/20 to-violet-500/30 border-indigo-500',
        };
      default:
        return {
          text: 'Ready to Reset?',
          instruction: '60 seconds to calm your amygdala & boost focus',
          emoji: '🧠',
          scale: 1.0,
          color: 'from-primary/10 to-accent/15 border-primary/40',
        };
    }
  };

  const config = getPhaseConfig();

  return (
    <div className="fixed inset-0 z-50 bg-background/95 backdrop-blur-2xl flex flex-col items-center justify-center p-6 select-none">
      {/* Top closing option */}
      <button 
        onClick={onClose} 
        className="absolute top-6 right-6 p-3 rounded-full bg-secondary/80 text-muted-foreground hover:text-foreground transition-all"
      >
        <X className="w-5 h-5" />
      </button>

      <div className="max-w-xs w-full text-center space-y-8 flex flex-col items-center justify-center">
        
        {/* Header */}
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-primary/15 border border-primary/20 text-xs font-semibold text-primary mb-2">
            <Brain className="w-3.5 h-3.5" />
            Autonomic Reset
          </div>
          <h2 className="text-2xl font-heading font-bold text-foreground">Box Breathing Reset</h2>
          <p className="text-xs text-muted-foreground mt-1">4-4-4-4 Resynchronization Protocol</p>
        </div>

        {phase !== 'idle' && phase !== 'complete' && (
          <div className="text-xs font-bold text-muted-foreground uppercase tracking-widest bg-secondary/40 px-3 py-1 rounded-md">
            Round {round} of {maxRounds}
          </div>
        )}

        {/* Animation Circle Area */}
        <div className="relative w-72 h-72 flex items-center justify-center">
          
          {/* Pulsing outer aura (Framer Motion driven) */}
          <AnimatePresence>
            {phase !== 'idle' && phase !== 'complete' && (
              <motion.div
                key={phase}
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ 
                  scale: config.scale, 
                  opacity: 0.6,
                }}
                exit={{ opacity: 0 }}
                transition={{ 
                  duration: phase === 'hold-in' || phase === 'hold-out' ? 0.3 : phaseDuration, 
                  ease: 'easeInOut' 
                }}
                className={`absolute w-44 h-44 rounded-full bg-gradient-to-tr ${config.color} blur-2xl pointer-events-none`}
              />
            )}
          </AnimatePresence>

          {/* Core interactive circle */}
          <motion.div
            animate={{ 
              scale: config.scale,
              borderWidth: phase !== 'idle' ? '3px' : '1px'
            }}
            transition={{ 
              duration: phase === 'hold-in' || phase === 'hold-out' ? 0.3 : phaseDuration,
              ease: 'easeInOut' 
            }}
            className={`w-44 h-44 rounded-full flex flex-col items-center justify-center bg-card border-2 shadow-2xl relative z-10 transition-colors duration-500 ${config.color.split(' ').pop()}`}
          >
            <span className="text-5xl mb-2">{config.emoji}</span>
            {phase !== 'idle' && phase !== 'complete' && (
              <motion.span 
                key={secondsLeft}
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className="text-4xl font-heading font-black text-foreground"
              >
                {secondsLeft}s
              </motion.span>
            )}
          </motion.div>

        </div>

        {/* Instructional guides */}
        <div className="h-16 flex flex-col justify-center">
          <AnimatePresence mode="wait">
            <motion.div
              key={phase + config.text}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="space-y-1"
            >
              <h3 className="text-xl font-heading font-bold text-foreground">{config.text}</h3>
              <p className="text-xs text-muted-foreground px-4 leading-relaxed">{config.instruction}</p>
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Buttons / Controls */}
        <div className="w-full pt-4">
          {phase === 'idle' && (
            <button
              onClick={startSession}
              className="w-full py-4 rounded-xl gradient-primary text-primary-foreground font-heading font-bold text-base flex items-center justify-center gap-2 glow-primary hover:opacity-90 active:scale-[0.98] transition-all"
            >
              <Play className="w-5 h-5" />
              Begin 60s Reset
            </button>
          )}

          {phase === 'complete' && (
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="space-y-4"
            >
              <div className="bg-primary/10 border border-primary/20 rounded-xl p-4.5 text-center flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-primary/20 flex items-center justify-center shrink-0">
                  <Trophy className="w-5 h-5 text-primary" />
                </div>
                <div className="text-left">
                  <h4 className="font-heading font-bold text-foreground text-sm">Resynchronized!</h4>
                  <p className="text-xs text-primary font-semibold">+5 Growth Score Logged</p>
                </div>
              </div>
              
              <button
                onClick={onClose}
                className="w-full py-4 rounded-xl bg-secondary text-foreground font-heading font-bold hover:bg-secondary/80 transition-all"
              >
                Close & Return
              </button>
            </motion.div>
          )}

          {phase !== 'idle' && phase !== 'complete' && (
            <button
              onClick={() => {
                if (timerRef.current) clearInterval(timerRef.current);
                setPhase('idle');
              }}
              className="w-full py-3 rounded-xl bg-secondary/50 text-muted-foreground font-semibold hover:text-foreground text-xs transition-all"
            >
              Cancel Session
            </button>
          )}
        </div>

      </div>
    </div>
  );
}
