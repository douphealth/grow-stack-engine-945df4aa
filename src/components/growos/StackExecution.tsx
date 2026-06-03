import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useGrowOS } from '@/lib/growos-context';
import { getDimensionColor, getDimensionBg } from '@/lib/growos-data';
import { X, ChevronRight, Check, Pause, Play, RotateCcw, Share2 } from 'lucide-react';
import confetti from 'canvas-confetti';
import { generateStreakCard, shareToNative } from '@/lib/share-cards';

export default function StackExecution() {
  const {
    currentStack, setScreen, setGrowthScore, growthScore,
    streak, userName, logDailyCompletion, completedToday
  } = useGrowOS();
  const [currentIndex, setCurrentIndex] = useState(0);
  const [timeLeft, setTimeLeft] = useState(currentStack[0]?.durationSeconds || 60);
  const [isRunning, setIsRunning] = useState(false);
  const [isComplete, setIsComplete] = useState(false);
  const [direction, setDirection] = useState(1);

  const action = currentStack[currentIndex];
  const progress = ((currentIndex) / currentStack.length) * 100;
  const scoreToAdd = Math.max(10, currentStack.length * 5);

  useEffect(() => {
    if (!isRunning || timeLeft <= 0) return;
    const timer = setInterval(() => setTimeLeft(t => t - 1), 1000);
    return () => clearInterval(timer);
  }, [isRunning, timeLeft]);

  useEffect(() => {
    if (timeLeft <= 0 && isRunning) {
      handleNext();
    }
  }, [timeLeft, isRunning]);

  const handleNext = useCallback(() => {
    navigator.vibrate?.(100);

    if (currentIndex < currentStack.length - 1) {
      setDirection(1);
      setCurrentIndex(i => i + 1);
      setTimeLeft(currentStack[currentIndex + 1].durationSeconds);
      setIsRunning(true);
    } else {
      setIsComplete(true);
      setIsRunning(false);

      // Use logDailyCompletion for proper date-aware tracking
      if (!completedToday) {
        setGrowthScore(growthScore + scoreToAdd);
        logDailyCompletion(scoreToAdd);
      }

      // Celebration confetti
      navigator.vibrate?.(300);
      const duration = 3000;
      const end = Date.now() + duration;
      const frame = () => {
        confetti({
          particleCount: 3,
          angle: 60,
          spread: 55,
          origin: { x: 0 },
          colors: ['#10b981', '#f59e0b', '#3b82f6'],
        });
        confetti({
          particleCount: 3,
          angle: 120,
          spread: 55,
          origin: { x: 1 },
          colors: ['#10b981', '#f59e0b', '#8b5cf6'],
        });
        if (Date.now() < end) requestAnimationFrame(frame);
      };
      frame();
    }
  }, [currentIndex, currentStack, growthScore, scoreToAdd, completedToday]);

  const formatTime = (s: number) => {
    const m = Math.floor(s / 60);
    const sec = s % 60;
    return `${m}:${sec.toString().padStart(2, '0')}`;
  };

  const timerProgress = action ? ((action.durationSeconds - timeLeft) / action.durationSeconds) * 100 : 0;

  if (isComplete) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center px-6">
        <motion.div
          initial={{ scale: 0.5, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: 'spring', stiffness: 200 }}
          className="text-center"
        >
          <motion.span
            initial={{ scale: 0, rotate: -180 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{ delay: 0.3, type: 'spring' }}
            className="text-8xl block mb-6"
          >
            🎉
          </motion.span>
          <h2 className="text-3xl font-heading font-bold text-foreground mb-2">Stack Complete!</h2>
          <p className="text-muted-foreground mb-1">You crushed {currentStack.length} micro-actions</p>
          {!completedToday ? (
            <>
              <motion.p
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.5, type: 'spring' }}
                className="text-2xl font-heading font-bold text-primary mb-2"
              >
                +{scoreToAdd} Growth Score
              </motion.p>
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.7 }}
                className="text-accent font-semibold mb-8"
              >
                🔥 {streak + 1} day streak!
              </motion.p>
            </>
          ) : (
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5 }}
              className="text-primary font-semibold mb-8"
            >
              ✅ Already logged today — great consistency!
            </motion.p>
          )}

          <div className="space-y-3 w-full max-w-xs">
            <button
              onClick={async () => {
                try {
                  const blob = await generateStreakCard(userName, streak + 1, growthScore + scoreToAdd);
                  await shareToNative(blob, 'Growth Stack Complete! 🎉', `I just completed my GrowOS Growth Stack — ${currentStack.length} micro-actions! 🚀`);
                } catch (e) {
                  if (navigator.share) {
                    navigator.share({
                      title: 'Growth Stack Complete! 🎉',
                      text: `I just completed my GrowOS Growth Stack — ${currentStack.length} micro-actions to level up! 🚀`,
                      url: 'https://gearuptogrow.com',
                    });
                  }
                }
              }}
              className="w-full py-3 rounded-xl bg-secondary text-foreground font-medium flex items-center justify-center gap-2 hover:bg-secondary/80 transition-all"
            >
              <Share2 className="w-4 h-4" />
              Share Achievement ✨
            </button>
            <button
              onClick={() => setScreen('home')}
              className="w-full py-3.5 rounded-xl gradient-primary text-primary-foreground font-heading font-semibold glow-primary"
            >
              Back to Home
            </button>
          </div>
        </motion.div>
      </div>
    );
  }

  if (!action) return null;

  return (
    <div className="min-h-screen flex flex-col relative">
      {/* Header */}
      <div className="flex items-center justify-between p-4">
        <button onClick={() => setScreen('home')} className="p-2 rounded-lg bg-secondary/50 text-muted-foreground">
          <X className="w-5 h-5" />
        </button>
        <div className="flex items-center gap-2">
          <span className="text-sm text-muted-foreground">{currentIndex + 1}/{currentStack.length}</span>
        </div>
        <button
          onClick={handleNext}
          className="text-sm text-primary font-medium flex items-center gap-1"
        >
          Skip <ChevronRight className="w-4 h-4" />
        </button>
      </div>

      {/* Progress bar */}
      <div className="px-4 mb-6">
        <div className="h-1.5 rounded-full bg-secondary overflow-hidden">
          <motion.div
            className="h-full gradient-primary rounded-full"
            animate={{ width: `${progress + (timerProgress / currentStack.length)}%` }}
          />
        </div>
        <div className="flex justify-center gap-1.5 mt-3">
          {currentStack.map((_, i) => (
            <motion.div
              key={i}
              className={`w-2 h-2 rounded-full transition-all ${
                i < currentIndex ? 'bg-primary' : i === currentIndex ? 'bg-primary scale-125' : 'bg-secondary'
              }`}
              animate={i === currentIndex ? { scale: [1, 1.3, 1] } : {}}
              transition={{ duration: 1, repeat: Infinity }}
            />
          ))}
        </div>
      </div>

      {/* Action Card */}
      <div className="flex-1 flex flex-col items-center justify-center px-6">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentIndex}
            initial={{ x: direction * 200, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: -direction * 200, opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="w-full max-w-sm text-center"
          >
            <div className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold mb-6 ${getDimensionBg(action.dimension)} ${getDimensionColor(action.dimension)}`}>
              {action.description}
            </div>

            <motion.span
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: 'spring', stiffness: 300 }}
              className="text-7xl block mb-4"
            >
              {action.emoji}
            </motion.span>
            <h2 className="text-2xl font-heading font-bold text-foreground mb-4">{action.title}</h2>
            <p className="text-foreground/70 leading-relaxed mb-8 text-sm px-2">
              {action.instruction}
            </p>

            {/* Timer Circle */}
            <div className="relative w-44 h-44 mx-auto mb-8">
              <svg className="w-full h-full -rotate-90" viewBox="0 0 100 100">
                <circle cx="50" cy="50" r="45" fill="none" stroke="hsl(var(--secondary))" strokeWidth="3" />
                <motion.circle
                  cx="50" cy="50" r="45" fill="none"
                  stroke="hsl(var(--primary))"
                  strokeWidth="3.5"
                  strokeLinecap="round"
                  strokeDasharray={`${2 * Math.PI * 45}`}
                  strokeDashoffset={`${2 * Math.PI * 45 * (1 - timerProgress / 100)}`}
                  className="transition-all duration-1000"
                />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-4xl font-heading font-bold text-foreground">{formatTime(timeLeft)}</span>
                <span className="text-xs text-muted-foreground mt-1">
                  {isRunning ? 'in progress' : 'tap play'}
                </span>
              </div>
            </div>

            {/* Controls */}
            <div className="flex items-center justify-center gap-5">
              <button
                onClick={() => { setTimeLeft(action.durationSeconds); navigator.vibrate?.(50); }}
                className="p-3 rounded-full bg-secondary text-muted-foreground hover:text-foreground transition-all active:scale-90"
              >
                <RotateCcw className="w-5 h-5" />
              </button>
              <motion.button
                onClick={() => { setIsRunning(!isRunning); navigator.vibrate?.(30); }}
                whileTap={{ scale: 0.9 }}
                className="p-6 rounded-full gradient-primary text-primary-foreground glow-primary hover:opacity-90 transition-all"
              >
                {isRunning ? <Pause className="w-8 h-8" /> : <Play className="w-8 h-8 ml-0.5" />}
              </motion.button>
              <button
                onClick={() => { handleNext(); navigator.vibrate?.(50); }}
                className="p-3 rounded-full bg-secondary text-muted-foreground hover:text-foreground transition-all active:scale-90"
              >
                <Check className="w-5 h-5" />
              </button>
            </div>
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}
