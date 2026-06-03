import { motion } from 'framer-motion';
import { useGrowOS } from '@/lib/growos-context';
import { PROTOCOLS, getDimensionColor, getDimensionBg } from '@/lib/growos-data';
import { ChevronLeft, Lock, ArrowRight } from 'lucide-react';

export default function ProtocolsScreen() {
  const { setScreen, isPro, activeProtocol, setActiveProtocol } = useGrowOS();

  const handleStart = (p: typeof PROTOCOLS[0]) => {
    if (p.isPremium && !isPro) {
      setScreen('upgrade');
      return;
    }
    setActiveProtocol({ id: p.id, day: 1, totalDays: p.days });
    setScreen('home');
  };

  return (
    <div className="min-h-screen pb-24 px-5 pt-6 max-w-md mx-auto">
      <div className="flex items-center gap-3 mb-6">
        <button onClick={() => setScreen('home')} className="p-2 rounded-lg bg-secondary text-muted-foreground">
          <ChevronLeft className="w-5 h-5" />
        </button>
        <div>
          <h1 className="text-xl font-heading font-bold text-foreground">Growth Protocols</h1>
          <p className="text-sm text-muted-foreground">Structured multi-day challenges</p>
        </div>
      </div>

      <div className="space-y-3">
        {PROTOCOLS.map((p, i) => {
          const isActive = activeProtocol?.id === p.id;
          return (
            <motion.div
              key={p.id}
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
              className={`glass-card p-4 relative overflow-hidden ${isActive ? 'border-primary/50' : ''}`}
            >
              {isActive && <div className="absolute top-0 left-0 right-0 h-0.5 gradient-primary" />}
              <div className="flex items-start gap-3">
                <span className="text-3xl">{p.emoji}</span>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="font-semibold text-foreground">{p.title}</h3>
                    {p.isPremium && !isPro && <Lock className="w-3.5 h-3.5 text-accent" />}
                  </div>
                  <p className="text-sm text-muted-foreground mb-2">{p.description}</p>
                  <div className="flex items-center gap-3">
                    <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${getDimensionBg(p.dimension)} ${getDimensionColor(p.dimension)}`}>
                      {p.dimension}
                    </span>
                    <span className="text-xs text-muted-foreground">{p.duration}</span>
                  </div>
                </div>
                <button
                  onClick={() => handleStart(p)}
                  className={`shrink-0 p-2 rounded-lg transition-all ${
                    isActive ? 'bg-primary/20 text-primary' : 'bg-secondary text-muted-foreground hover:text-foreground'
                  }`}
                >
                  {isActive ? <span className="text-xs font-semibold px-1">Active</span> : <ArrowRight className="w-4 h-4" />}
                </button>
              </div>
              {isActive && activeProtocol && (
                <div className="mt-3 pt-3 border-t border-border/50">
                  <div className="flex justify-between text-xs text-muted-foreground mb-1">
                    <span>Day {activeProtocol.day}</span>
                    <span>{activeProtocol.totalDays} days total</span>
                  </div>
                  <div className="h-1.5 rounded-full bg-secondary overflow-hidden">
                    <div className="h-full gradient-primary rounded-full" style={{ width: `${(activeProtocol.day / activeProtocol.totalDays) * 100}%` }} />
                  </div>
                </div>
              )}
            </motion.div>
          );
        })}
      </div>

      {/* Source link */}
      <div className="mt-6 text-center">
        <p className="text-xs text-muted-foreground">
          Protocols based on research from{' '}
          <a href="https://gearuptogrow.com" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">
            gearuptogrow.com
          </a>
        </p>
      </div>
    </div>
  );
}
