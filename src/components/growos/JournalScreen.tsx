import { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { useGrowOS } from '@/lib/growos-context';
import { ChevronLeft, Send, Sparkles, Calendar } from 'lucide-react';

const PROMPTS = [
  "What am I most grateful for today?",
  "What's one thing I learned about myself this week?",
  "What challenge am I currently facing, and how can I grow from it?",
  "What would my ideal day look like 1 year from now?",
  "What's one limiting belief I'm ready to let go of?",
  "What made me proud of myself recently?",
  "If I could give advice to my past self, what would it be?",
  "What's one small step I can take today toward my biggest goal?",
];

export default function JournalScreen() {
  const { setScreen, journalEntries, addJournalEntry, mood } = useGrowOS();
  const [entry, setEntry] = useState('');
  const [prompt] = useState(() => PROMPTS[Math.floor(Math.random() * PROMPTS.length)]);
  const [saved, setSaved] = useState(false);

  const handleSave = () => {
    if (!entry.trim()) return;
    addJournalEntry({
      text: entry,
      prompt,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      mood,
    });
    setEntry('');
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  // Group entries by date
  const groupedEntries = useMemo(() => {
    const groups: Record<string, typeof journalEntries> = {};
    journalEntries.forEach(e => {
      const dateKey = new Date(e.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
      if (!groups[dateKey]) groups[dateKey] = [];
      groups[dateKey].push(e);
    });
    return groups;
  }, [journalEntries]);

  const dateKeys = Object.keys(groupedEntries);

  return (
    <div className="min-h-screen pb-24 px-5 pt-6 max-w-md mx-auto">
      <div className="flex items-center gap-3 mb-6">
        <button onClick={() => setScreen('home')} className="p-2 rounded-lg bg-secondary text-muted-foreground">
          <ChevronLeft className="w-5 h-5" />
        </button>
        <div className="flex-1">
          <h1 className="text-xl font-heading font-bold text-foreground">Growth Journal</h1>
          <p className="text-sm text-muted-foreground">Reflect, learn, evolve</p>
        </div>
        <div className="flex items-center gap-1.5 bg-primary/10 px-3 py-1.5 rounded-lg">
          <Calendar className="w-3.5 h-3.5 text-primary" />
          <span className="text-xs font-semibold text-primary">{journalEntries.length} entries</span>
        </div>
      </div>

      {/* Prompt */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="glass-card p-4 mb-4"
      >
        <div className="flex items-center gap-2 mb-2">
          <Sparkles className="w-4 h-4 text-primary" />
          <span className="text-xs text-primary font-semibold uppercase tracking-wider">Today's Prompt</span>
        </div>
        <p className="text-foreground font-medium italic">"{prompt}"</p>
      </motion.div>

      {/* Entry */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="glass-card p-4 mb-4"
      >
        <textarea
          value={entry}
          onChange={e => setEntry(e.target.value)}
          placeholder="Write your thoughts..."
          rows={6}
          className="w-full bg-transparent text-foreground placeholder:text-muted-foreground resize-none focus:outline-none text-sm leading-relaxed"
        />
        <div className="flex items-center justify-between mt-2 pt-2 border-t border-border/50">
          <span className="text-xs text-muted-foreground">{entry.length} characters</span>
          <button
            onClick={handleSave}
            disabled={!entry.trim()}
            className="flex items-center gap-1.5 px-4 py-2 rounded-lg gradient-primary text-primary-foreground text-sm font-medium disabled:opacity-30 hover:opacity-90 transition-all"
          >
            <Send className="w-3.5 h-3.5" />
            {saved ? 'Saved! ✓' : 'Save'}
          </button>
        </div>
      </motion.div>

      {/* Previous entries grouped by date */}
      {dateKeys.length > 0 && (
        <div className="space-y-4">
          {dateKeys.map(dateKey => (
            <div key={dateKey}>
              <p className="text-xs text-muted-foreground uppercase tracking-wider mb-2">{dateKey}</p>
              <div className="space-y-2">
                {groupedEntries[dateKey].map((e) => (
                  <motion.div
                    key={e.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="glass-card p-4"
                  >
                    <div className="flex items-center justify-between mb-1">
                      <p className="text-xs text-muted-foreground">{e.time} — "{e.prompt}"</p>
                      {e.mood && <span className="text-sm">{e.mood}</span>}
                    </div>
                    <p className="text-sm text-foreground/80">{e.text}</p>
                  </motion.div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      {dateKeys.length === 0 && (
        <div className="text-center py-12">
          <span className="text-4xl mb-3 block">📝</span>
          <p className="text-muted-foreground text-sm">Your journal entries will appear here</p>
          <p className="text-muted-foreground text-xs mt-1">Start writing to build your growth story</p>
        </div>
      )}
    </div>
  );
}
