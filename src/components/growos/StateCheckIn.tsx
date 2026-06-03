import { motion } from 'framer-motion';
import { useGrowOS } from '@/lib/growos-context';
import { MORNING_STACK, EVENING_STACK, MicroAction } from '@/lib/growos-data';
import { Zap } from 'lucide-react';

const MOODS = ['😫', '😔', '😐', '😊', '🔥'];

function buildAdaptiveStack(
  energy: number,
  clarity: number,
  mood: string,
  timeAvailable: number,
  isPro: boolean
): MicroAction[] {
  const hour = new Date().getHours();
  const isEvening = hour >= 18;

  // Base pool: use evening stack if late + pro, else morning
  let pool: MicroAction[] = isEvening && isPro
    ? [...EVENING_STACK]
    : [...MORNING_STACK];

  // Priority scoring based on state
  const scored = pool.map(action => {
    let score = 10; // base score

    // Low energy → prioritize wellness & mindset, deprioritize productivity
    if (energy <= 2) {
      if (action.dimension === 'wellness') score += 5;
      if (action.dimension === 'mindset') score += 3;
      if (action.dimension === 'productivity') score -= 3;
      if (action.dimension === 'focus') score -= 2;
    }

    // High energy → prioritize productivity & focus
    if (energy >= 4) {
      if (action.dimension === 'productivity') score += 4;
      if (action.dimension === 'focus') score += 3;
    }

    // Low clarity → boost mindset & wellness
    if (clarity <= 2) {
      if (action.dimension === 'mindset') score += 4;
      if (action.dimension === 'wellness') score += 3;
      if (action.dimension === 'focus') score -= 2;
    }

    // High clarity → boost focus & productivity
    if (clarity >= 4) {
      if (action.dimension === 'focus') score += 4;
      if (action.dimension === 'productivity') score += 2;
    }

    // Mood-based adjustments
    const moodIndex = MOODS.indexOf(mood);
    if (moodIndex <= 1) {
      // Low mood → more confidence & wellness
      if (action.dimension === 'confidence') score += 5;
      if (action.dimension === 'wellness') score += 3;
    }
    if (moodIndex >= 3) {
      // Good mood → channel into productivity & habits
      if (action.dimension === 'habits') score += 3;
      if (action.dimension === 'productivity') score += 2;
    }

    return { action, score };
  });

  // Sort by score descending
  scored.sort((a, b) => b.score - a.score);

  // Fit within time budget
  let totalTime = 0;
  const adapted: MicroAction[] = [];
  for (const { action } of scored) {
    if (totalTime + action.durationSeconds <= timeAvailable * 60) {
      adapted.push(action);
      totalTime += action.durationSeconds;
    }
  }

  // Always return at least 1 action
  return adapted.length > 0 ? adapted : [pool[0]];
}

export default function StateCheckIn({ onComplete }: { onComplete: () => void }) {
  const { energy, setEnergy, clarity, setClarity, mood, setMood, timeAvailable, setTimeAvailable, setCurrentStack, setHasCheckedIn, isPro } = useGrowOS();

  const handleStart = () => {
    const adapted = buildAdaptiveStack(energy, clarity, mood, timeAvailable, isPro);
    setCurrentStack(adapted);
    setHasCheckedIn(true);
    onComplete();
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -30 }}
      className="glass-card p-6 space-y-6"
    >
      <div className="text-center">
        <h3 className="text-lg font-heading font-bold text-foreground">Quick State Check-In</h3>
        <p className="text-sm text-muted-foreground">30 seconds to personalize your stack</p>
      </div>

      {/* Energy */}
      <div>
        <div className="flex justify-between items-center mb-2">
          <span className="text-sm font-medium text-foreground">⚡ Energy Level</span>
          <span className="text-sm text-primary font-semibold">{energy}/5</span>
        </div>
        <input
          type="range" min={1} max={5} value={energy}
          onChange={e => setEnergy(Number(e.target.value))}
          className="w-full h-2 rounded-full appearance-none bg-secondary cursor-pointer accent-primary [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-5 [&::-webkit-slider-thumb]:h-5 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-primary"
        />
        <div className="flex justify-between text-xs text-muted-foreground mt-1">
          <span>Drained</span><span>Energized</span>
        </div>
      </div>

      {/* Clarity */}
      <div>
        <div className="flex justify-between items-center mb-2">
          <span className="text-sm font-medium text-foreground">🧠 Mental Clarity</span>
          <span className="text-sm text-primary font-semibold">{clarity}/5</span>
        </div>
        <input
          type="range" min={1} max={5} value={clarity}
          onChange={e => setClarity(Number(e.target.value))}
          className="w-full h-2 rounded-full appearance-none bg-secondary cursor-pointer accent-primary [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-5 [&::-webkit-slider-thumb]:h-5 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-primary"
        />
        <div className="flex justify-between text-xs text-muted-foreground mt-1">
          <span>Foggy</span><span>Sharp</span>
        </div>
      </div>

      {/* Mood */}
      <div>
        <span className="text-sm font-medium text-foreground block mb-3">😊 Mood</span>
        <div className="flex justify-between">
          {MOODS.map(m => (
            <button
              key={m}
              onClick={() => setMood(m)}
              className={`text-3xl p-2 rounded-xl transition-all ${mood === m ? 'bg-primary/20 scale-110' : 'hover:bg-secondary'}`}
            >
              {m}
            </button>
          ))}
        </div>
      </div>

      {/* Time */}
      <div>
        <span className="text-sm font-medium text-foreground block mb-3">⏰ Time Available</span>
        <div className="grid grid-cols-4 gap-2">
          {[5, 10, 15, 20].map(t => (
            <button
              key={t}
              onClick={() => setTimeAvailable(t)}
              className={`py-2.5 rounded-lg text-sm font-semibold transition-all ${
                timeAvailable === t ? 'gradient-primary text-primary-foreground' : 'bg-secondary text-muted-foreground hover:text-foreground'
              }`}
            >
              {t} min
            </button>
          ))}
        </div>
      </div>

      {/* AI adaptation preview */}
      <div className="bg-primary/5 rounded-xl p-3 border border-primary/10">
        <p className="text-xs text-primary font-medium mb-1">🤖 AI Adaptation Preview</p>
        <p className="text-xs text-muted-foreground">
          {energy <= 2 ? 'Low energy detected → prioritizing wellness & mindset actions' :
           energy >= 4 ? 'High energy → adding productivity & focus challenges' :
           'Balanced energy → well-rounded stack'}
          {clarity <= 2 ? ' • Foggy mind → extra clarity exercises' : ''}
        </p>
      </div>

      <button
        onClick={handleStart}
        className="w-full py-3.5 rounded-xl gradient-primary text-primary-foreground font-heading font-semibold flex items-center justify-center gap-2 glow-primary hover:opacity-90 transition-all active:scale-[0.98]"
      >
        <Zap className="w-5 h-5" />
        Generate My Growth Stack
      </button>
    </motion.div>
  );
}
