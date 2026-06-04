import { motion } from 'framer-motion';
import { useState } from 'react';
import { useGrowOS } from '@/lib/growos-context';
import { Sparkles, ArrowRight } from 'lucide-react';

export default function WelcomeScreen() {
  const { setScreen, setUserName } = useGrowOS();
  const [name, setName] = useState('');

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-6 relative overflow-hidden">
      {/* Background effects */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 rounded-full bg-primary/5 blur-3xl" />
        <div className="absolute bottom-1/4 right-1/4 w-80 h-80 rounded-full bg-accent/5 blur-3xl" />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        className="relative z-10 text-center max-w-md w-full"
      >
        {/* Logo */}
        <motion.div
          initial={{ scale: 0.5, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}
          className="mb-8"
        >
          <img
            src="/logo.png"
            alt="GearUpToGrow logo"
            className="inline-flex items-center justify-center w-20 h-20 rounded-2xl mb-4 object-contain bg-white shadow-lg"
          />
          <h1 className="text-4xl font-heading font-bold gradient-text">GrowOS</h1>
          <p className="text-muted-foreground mt-1 text-sm tracking-wider uppercase">Your Personal Growth Operating System</p>
        </motion.div>

        {/* Tagline */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="text-xl font-heading text-foreground/90 mb-2"
        >
          10 minutes. Every dimension of your life.
        </motion.p>
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
          className="text-lg font-heading text-accent font-semibold mb-10"
        >
          Stacked.
        </motion.p>

        {/* Features */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7 }}
          className="grid grid-cols-3 gap-3 mb-10"
        >
          {[
            { emoji: '🧠', label: 'AI-Adaptive' },
            { emoji: '⚡', label: 'Micro-Actions' },
            { emoji: '📊', label: 'Track Growth' },
          ].map((f) => (
            <div key={f.label} className="glass-card p-3 text-center">
              <span className="text-2xl">{f.emoji}</span>
              <p className="text-xs text-muted-foreground mt-1">{f.label}</p>
            </div>
          ))}
        </motion.div>

        {/* Name Input */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.9 }}
          className="space-y-4"
        >
          <input
            type="text"
            placeholder="What's your name?"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full px-5 py-4 rounded-xl bg-secondary border border-border text-foreground text-center text-lg font-medium placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all"
          />
          <button
            onClick={() => {
              setUserName(name || 'Grower');
              setScreen('quiz');
            }}
            className="w-full py-4 rounded-xl gradient-primary text-primary-foreground font-heading font-semibold text-lg flex items-center justify-center gap-2 glow-primary hover:opacity-90 transition-all active:scale-[0.98]"
          >
            <Sparkles className="w-5 h-5" />
            Discover Your Growth DNA
            <ArrowRight className="w-5 h-5" />
          </button>
          <p className="text-xs text-muted-foreground">
            Powered by <a href="https://gearuptogrow.com" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">gearuptogrow.com</a>
          </p>
        </motion.div>
      </motion.div>
    </div>
  );
}
