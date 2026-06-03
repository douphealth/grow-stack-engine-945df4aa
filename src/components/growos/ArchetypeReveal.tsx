import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useGrowOS } from '@/lib/growos-context';
import { generateShareCard, shareToNative } from '@/lib/share-cards';
import { Share2, ArrowRight, Sparkles, Download } from 'lucide-react';
import confetti from 'canvas-confetti';

export default function ArchetypeReveal() {
  const { archetype, userName, setScreen, growthScore, streak } = useGrowOS();
  const [revealed, setRevealed] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);

  useEffect(() => {
    // Auto-reveal after a dramatic pause
    const timer = setTimeout(() => {
      setRevealed(true);
      // Fire confetti
      confetti({
        particleCount: 100,
        spread: 80,
        origin: { y: 0.6 },
        colors: ['#10b981', '#f59e0b', '#3b82f6', '#8b5cf6'],
      });
      navigator.vibrate?.(200);
    }, 1500);
    return () => clearTimeout(timer);
  }, []);

  if (!archetype) return null;

  const handleShare = async () => {
    setIsGenerating(true);
    try {
      const blob = await generateShareCard({
        archetype,
        userName,
        growthScore,
        streak,
      });
      await shareToNative(blob, `I'm ${archetype.name}!`, `My Growth DNA archetype is ${archetype.name} — ${archetype.title}. Discover yours!`);
    } catch (e) {
      console.error('Share failed:', e);
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-6 relative overflow-hidden">
      {/* Ambient background */}
      <div className="absolute inset-0 pointer-events-none">
        <motion.div
          animate={{ scale: [1, 1.2, 1], opacity: [0.05, 0.12, 0.05] }}
          transition={{ duration: 4, repeat: Infinity }}
          className="absolute top-1/3 left-1/2 -translate-x-1/2 w-[600px] h-[600px] rounded-full bg-primary blur-[120px]"
        />
        <motion.div
          animate={{ scale: [1, 1.3, 1], opacity: [0.03, 0.08, 0.03] }}
          transition={{ duration: 5, repeat: Infinity, delay: 1 }}
          className="absolute bottom-1/4 left-1/3 w-[400px] h-[400px] rounded-full bg-accent blur-[100px]"
        />
      </div>

      <AnimatePresence mode="wait">
        {!revealed ? (
          /* Loading / DNA analyzing state */
          <motion.div
            key="loading"
            exit={{ opacity: 0, scale: 0.8 }}
            className="relative z-10 text-center"
          >
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 3, repeat: Infinity, ease: 'linear' }}
              className="w-32 h-32 mx-auto mb-8 relative"
            >
              <div className="absolute inset-0 rounded-full border-2 border-primary/20" />
              <div className="absolute inset-0 rounded-full border-2 border-t-primary border-r-transparent border-b-transparent border-l-transparent" />
              <div className="absolute inset-3 rounded-full border-2 border-t-transparent border-r-accent border-b-transparent border-l-transparent" />
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="text-4xl">🧬</span>
              </div>
            </motion.div>
            <motion.p
              animate={{ opacity: [0.5, 1, 0.5] }}
              transition={{ duration: 2, repeat: Infinity }}
              className="text-lg font-heading text-foreground/80"
            >
              Analyzing your Growth DNA...
            </motion.p>
          </motion.div>
        ) : (
          /* Reveal */
          <motion.div
            key="reveal"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="relative z-10 max-w-sm w-full"
          >
            <motion.p
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-center text-muted-foreground mb-4 text-xs uppercase tracking-[0.25em] font-medium"
            >
              Your Growth DNA Revealed
            </motion.p>

            {/* The Card */}
            <motion.div
              initial={{ rotateY: 90, opacity: 0 }}
              animate={{ rotateY: 0, opacity: 1 }}
              transition={{ duration: 0.6, type: 'spring' }}
              className="glass-card p-8 text-center mb-6 relative overflow-hidden"
            >
              <div className={`absolute inset-0 bg-gradient-to-br ${archetype.color} opacity-10`} />

              {/* Subtle pattern overlay */}
              <div className="absolute inset-0 opacity-5" style={{
                backgroundImage: 'radial-gradient(circle at 2px 2px, currentColor 1px, transparent 0)',
                backgroundSize: '24px 24px',
              }} />

              <div className="relative z-10">
                <motion.span
                  initial={{ scale: 0, rotate: -180 }}
                  animate={{ scale: 1, rotate: 0 }}
                  transition={{ delay: 0.3, type: 'spring', stiffness: 200 }}
                  className="text-7xl block mb-4"
                >
                  {archetype.emoji}
                </motion.span>

                <motion.h2
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.5 }}
                  className="text-3xl font-heading font-bold text-foreground mb-1"
                >
                  {archetype.name}
                </motion.h2>

                <motion.p
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.6 }}
                  className={`text-sm font-semibold bg-gradient-to-r ${archetype.color} bg-clip-text text-transparent mb-4`}
                >
                  {archetype.title}
                </motion.p>

                <motion.p
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.7 }}
                  className="text-foreground/70 text-sm leading-relaxed mb-6"
                >
                  {archetype.description}
                </motion.p>

                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.8 }}
                  className="grid grid-cols-2 gap-4 text-left"
                >
                  <div>
                    <p className="text-xs text-primary font-semibold mb-2 uppercase tracking-wider">Strengths</p>
                    {archetype.strengths.map(s => (
                      <p key={s} className="text-sm text-foreground/80 flex items-center gap-1.5 mb-1.5">
                        <span className="w-1.5 h-1.5 rounded-full bg-primary shrink-0" /> {s}
                      </p>
                    ))}
                  </div>
                  <div>
                    <p className="text-xs text-accent font-semibold mb-2 uppercase tracking-wider">Growth Areas</p>
                    {archetype.growthAreas.map(g => (
                      <p key={g} className="text-sm text-foreground/80 flex items-center gap-1.5 mb-1.5">
                        <span className="w-1.5 h-1.5 rounded-full bg-accent shrink-0" /> {g}
                      </p>
                    ))}
                  </div>
                </motion.div>

                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 1 }}
                  className="mt-6 pt-4 border-t border-border/50"
                >
                  <p className="text-xs text-muted-foreground">
                    {userName}'s Growth DNA • gearuptogrow.com
                  </p>
                </motion.div>
              </div>
            </motion.div>

            {/* Actions */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 1.1 }}
              className="space-y-3"
            >
              <button
                onClick={handleShare}
                disabled={isGenerating}
                className="w-full py-3.5 rounded-xl bg-secondary text-foreground font-medium flex items-center justify-center gap-2 hover:bg-secondary/80 transition-all disabled:opacity-50"
              >
                {isGenerating ? (
                  <motion.div animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}>
                    <Sparkles className="w-4 h-4" />
                  </motion.div>
                ) : (
                  <Share2 className="w-4 h-4" />
                )}
                {isGenerating ? 'Generating Card...' : 'Share Your Growth DNA Card'}
              </button>
              <button
                onClick={() => setScreen('goal-select')}
                className="w-full py-4 rounded-xl gradient-primary text-primary-foreground font-heading font-semibold text-lg flex items-center justify-center gap-2 glow-primary hover:opacity-90 transition-all active:scale-[0.98]"
              >
                <Sparkles className="w-5 h-5" />
                Start Growing
                <ArrowRight className="w-5 h-5" />
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
