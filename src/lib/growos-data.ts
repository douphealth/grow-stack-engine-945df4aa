export type GrowthArchetype = {
  id: string;
  name: string;
  emoji: string;
  title: string;
  description: string;
  strengths: string[];
  growthAreas: string[];
  color: string;
};

// Alias for backward compatibility
export type Archetype = GrowthArchetype;

export type QuizQuestion = {
  id: number;
  question: string;
  options: { label: string; emoji: string; archetype: string }[];
};

export type GrowthDimension = 'mindset' | 'productivity' | 'wellness' | 'confidence' | 'focus' | 'habits';

export type MicroAction = {
  id: string;
  title: string;
  emoji: string;
  dimension: GrowthDimension;
  durationSeconds: number;
  description: string;
  instruction: string;
  isPremium?: boolean;
};

export type GrowthProtocol = {
  id: string;
  title: string;
  emoji: string;
  duration: string;
  days: number;
  dimension: GrowthDimension;
  description: string;
  source: string;
  isPremium: boolean;
};

// Alias
export type Protocol = GrowthProtocol;

export const ARCHETYPES: GrowthArchetype[] = [
  { id: 'driver', name: 'The Driver', emoji: '🦁', title: 'Relentless Achiever', description: 'You\'re fueled by ambition and productivity. You push hard — but sometimes forget to recharge.', strengths: ['Goal execution', 'Time management', 'Discipline'], growthAreas: ['Work-life balance', 'Self-compassion', 'Rest'], color: 'from-amber-500 to-orange-600' },
  { id: 'thinker', name: 'The Thinker', emoji: '🦉', title: 'Deep Analyzer', description: 'You think deeply and see patterns others miss. Your challenge is turning insight into action.', strengths: ['Critical thinking', 'Strategy', 'Learning'], growthAreas: ['Taking action', 'Overthinking', 'Decisiveness'], color: 'from-blue-500 to-indigo-600' },
  { id: 'flow-seeker', name: 'The Flow Seeker', emoji: '🌊', title: 'Harmony Hunter', description: 'You crave flow states and inner peace. Structure is your superpower waiting to be unlocked.', strengths: ['Mindfulness', 'Creativity', 'Presence'], growthAreas: ['Structure', 'Consistency', 'Planning'], color: 'from-cyan-400 to-teal-600' },
  { id: 'phoenix', name: 'The Phoenix', emoji: '🔥', title: 'Resilient Riser', description: 'You\'ve been through the fire and you\'re rebuilding. Every setback fuels your comeback.', strengths: ['Resilience', 'Adaptability', 'Empathy'], growthAreas: ['Self-doubt', 'Patience', 'Trust'], color: 'from-red-500 to-orange-500' },
  { id: 'explorer', name: 'The Explorer', emoji: '🧭', title: 'Purpose Seeker', description: 'You\'re on a quest for meaning. You try everything — now it\'s time to go deep.', strengths: ['Curiosity', 'Open-mindedness', 'Versatility'], growthAreas: ['Focus', 'Commitment', 'Depth'], color: 'from-violet-500 to-purple-600' },
  { id: 'builder', name: 'The Builder', emoji: '🏗️', title: 'System Architect', description: 'You build systems that last. Habits are your bricks, and consistency is your mortar.', strengths: ['Habit formation', 'Systems thinking', 'Patience'], growthAreas: ['Flexibility', 'Spontaneity', 'Fun'], color: 'from-emerald-500 to-green-600' },
  { id: 'spark', name: 'The Spark', emoji: '⚡', title: 'Energy Dynamo', description: 'You have incredible energy — the key is learning to channel it without burning out.', strengths: ['Enthusiasm', 'Initiative', 'Energy'], growthAreas: ['Focus', 'Follow-through', 'Rest'], color: 'from-yellow-400 to-amber-500' },
  { id: 'seedling', name: 'The Seedling', emoji: '🌱', title: 'Fresh Starter', description: 'You\'re at the beginning of your growth journey — and that\'s the most powerful place to be.', strengths: ['Beginner\'s mindset', 'Eagerness', 'Potential'], growthAreas: ['Consistency', 'Patience', 'Self-belief'], color: 'from-green-400 to-emerald-500' },
  { id: 'sniper', name: 'The Sniper', emoji: '🎯', title: 'Laser Focused', description: 'When you lock on a target, nothing stops you. The challenge is choosing the right target.', strengths: ['Intense focus', 'Goal clarity', 'Determination'], growthAreas: ['Balance', 'Big picture', 'Letting go'], color: 'from-rose-500 to-red-600' },
  { id: 'evolver', name: 'The Evolver', emoji: '🧬', title: 'Growth Maximalist', description: 'You live for self-improvement. You read, practice, and iterate relentlessly.', strengths: ['Growth mindset', 'Self-awareness', 'Discipline'], growthAreas: ['Perfectionism', 'Present moment', 'Self-acceptance'], color: 'from-teal-400 to-cyan-600' },
  { id: 'guardian', name: 'The Guardian', emoji: '🛡️', title: 'Wellness Protector', description: 'You prioritize mental health and self-care. Now it\'s time to expand your comfort zone.', strengths: ['Self-care', 'Boundaries', 'Emotional intelligence'], growthAreas: ['Risk-taking', 'Ambition', 'Discomfort'], color: 'from-sky-400 to-blue-600' },
  { id: 'alchemist', name: 'The Alchemist', emoji: '🌟', title: 'Chaos Transformer', description: 'You turn challenges into gold. You thrive in uncertainty and find growth everywhere.', strengths: ['Adaptability', 'Creativity', 'Vision'], growthAreas: ['Stability', 'Routine', 'Grounding'], color: 'from-amber-400 to-yellow-500' },
];

export const QUIZ_QUESTIONS: QuizQuestion[] = [
  { id: 1, question: 'When you wake up, your first instinct is to...', options: [
    { label: 'Check my goals and plan the day', emoji: '📋', archetype: 'driver' },
    { label: 'Take a moment to breathe and be present', emoji: '🧘', archetype: 'flow-seeker' },
    { label: 'Think about what I want to learn today', emoji: '📚', archetype: 'thinker' },
    { label: 'Jump into action — energy is high!', emoji: '⚡', archetype: 'spark' },
  ]},
  { id: 2, question: 'Your biggest growth challenge right now is...', options: [
    { label: 'Staying consistent with good habits', emoji: '🔄', archetype: 'seedling' },
    { label: 'Not burning out from going too hard', emoji: '🔥', archetype: 'driver' },
    { label: 'Finding my purpose and direction', emoji: '🧭', archetype: 'explorer' },
    { label: 'Bouncing back from a tough period', emoji: '💪', archetype: 'phoenix' },
  ]},
  { id: 3, question: 'When facing a setback, you typically...', options: [
    { label: 'Analyze what went wrong systematically', emoji: '🔍', archetype: 'thinker' },
    { label: 'Use it as fuel to come back stronger', emoji: '🔥', archetype: 'phoenix' },
    { label: 'Build a new system to prevent it', emoji: '🏗️', archetype: 'builder' },
    { label: 'Transform the challenge into an opportunity', emoji: '🌟', archetype: 'alchemist' },
  ]},
  { id: 4, question: 'Your ideal productivity style is...', options: [
    { label: 'Deep work sessions with total focus', emoji: '🎯', archetype: 'sniper' },
    { label: 'Structured routines and habit stacking', emoji: '🏗️', archetype: 'builder' },
    { label: 'Flexible flow with creative bursts', emoji: '🌊', archetype: 'flow-seeker' },
    { label: 'Constant optimization and iteration', emoji: '🧬', archetype: 'evolver' },
  ]},
  { id: 5, question: 'Self-care for you means...', options: [
    { label: 'Protecting my boundaries and energy', emoji: '🛡️', archetype: 'guardian' },
    { label: 'Physical activity and healthy habits', emoji: '💪', archetype: 'driver' },
    { label: 'Meditation and mindfulness', emoji: '🧘', archetype: 'flow-seeker' },
    { label: 'Learning something new that excites me', emoji: '🚀', archetype: 'explorer' },
  ]},
  { id: 6, question: 'What excites you most about personal growth?', options: [
    { label: 'Becoming the best version of myself', emoji: '🧬', archetype: 'evolver' },
    { label: 'Achieving big, ambitious goals', emoji: '🎯', archetype: 'sniper' },
    { label: 'Finding inner peace and balance', emoji: '☮️', archetype: 'guardian' },
    { label: 'Unlocking hidden potential I didn\'t know I had', emoji: '🌟', archetype: 'alchemist' },
  ]},
  { id: 7, question: 'When you have free time, you\'re drawn to...', options: [
    { label: 'Reading books or watching educational content', emoji: '📖', archetype: 'thinker' },
    { label: 'Starting a new project or challenge', emoji: '⚡', archetype: 'spark' },
    { label: 'Journaling and self-reflection', emoji: '📝', archetype: 'guardian' },
    { label: 'Exploring new ideas and possibilities', emoji: '🧭', archetype: 'explorer' },
  ]},
  { id: 8, question: 'Your growth superpower is...', options: [
    { label: 'Relentless determination', emoji: '🦁', archetype: 'driver' },
    { label: 'Starting from scratch with fresh eyes', emoji: '🌱', archetype: 'seedling' },
    { label: 'Building unbreakable systems', emoji: '🏗️', archetype: 'builder' },
    { label: 'Turning chaos into clarity', emoji: '🌟', archetype: 'alchemist' },
  ]},
];

export const MORNING_STACK: MicroAction[] = [
  { id: 'gratitude', title: 'Gratitude Pulse', emoji: '🧠', dimension: 'mindset', durationSeconds: 90, description: 'Mental Wellness', instruction: 'Close your eyes. Think of 3 things you\'re genuinely grateful for right now. Feel the warmth of each one. Let gratitude fill your chest.' },
  { id: 'visualize', title: 'Visualization Flash', emoji: '🎯', dimension: 'mindset', durationSeconds: 120, description: 'Personal Development', instruction: 'Picture your ideal day unfolding perfectly. See yourself focused, confident, and achieving your goals. Make the image vivid — colors, sounds, feelings.' },
  { id: 'meditate', title: 'Micro-Meditation', emoji: '🧘', dimension: 'wellness', durationSeconds: 180, description: 'Mental Clarity', instruction: 'Focus on your breath. Inhale for 4 counts, hold for 4, exhale for 6. When thoughts arise, acknowledge them gently and return to your breath.' },
  { id: 'timeblock', title: 'Time-Block Builder', emoji: '📋', dimension: 'productivity', durationSeconds: 180, description: 'Productivity', instruction: 'Identify your top 3 priorities for today. Assign each a specific time block. Commit to protecting your most important block.' },
  { id: 'affirm', title: 'Affirmation Lock-In', emoji: '💪', dimension: 'confidence', durationSeconds: 90, description: 'Confidence', instruction: 'Repeat with conviction: "I am capable of extraordinary things. Today, I choose growth over comfort. I trust my ability to handle whatever comes."' },
  { id: 'priority', title: '#1 Priority Commit', emoji: '🔥', dimension: 'focus', durationSeconds: 60, description: 'Deep Work Prep', instruction: 'What is the ONE thing that, if completed today, would make everything else easier or unnecessary? Commit to starting it within the first 2 hours.' },
];

export const EVENING_STACK: MicroAction[] = [
  { id: 'reflect', title: 'Day Reflection', emoji: '🌅', dimension: 'mindset', durationSeconds: 120, description: 'Self-Awareness', instruction: 'What went well today? What\'s one thing you learned? Acknowledge your progress, no matter how small.', isPremium: true },
  { id: 'release', title: 'Stress Release', emoji: '🫧', dimension: 'wellness', durationSeconds: 150, description: 'Mental Wellness', instruction: 'Take 5 deep breaths. With each exhale, release one worry or tension you\'re holding. Let your shoulders drop. Unclench your jaw.', isPremium: true },
  { id: 'gratitude-pm', title: 'Evening Gratitude', emoji: '✨', dimension: 'mindset', durationSeconds: 90, description: 'Gratitude', instruction: 'Name 3 good things that happened today. They don\'t have to be big — even small moments of joy count.', isPremium: true },
  { id: 'tomorrow', title: 'Tomorrow Prep', emoji: '📝', dimension: 'productivity', durationSeconds: 120, description: 'Planning', instruction: 'Write down your top 3 priorities for tomorrow. Knowing what comes next lets your mind rest tonight.', isPremium: true },
];

export const PROTOCOLS: GrowthProtocol[] = [
  { id: 'focus-forge', title: 'Focus Forge', emoji: '🎯', duration: '7 days', days: 7, dimension: 'focus', description: 'Sharpen your focus to a razor\'s edge with progressive deep work training.', source: 'gearuptogrow.com/productivity/improve-focus-7-day-protocol/', isPremium: false },
  { id: 'stress-detox', title: 'Stress Detox', emoji: '🧘', duration: '14 days', days: 14, dimension: 'wellness', description: 'A systematic approach to identifying, managing, and eliminating chronic stress.', source: 'gearuptogrow.com/stress-relief/', isPremium: false },
  { id: 'anti-procrastination', title: 'Anti-Procrastination Sprint', emoji: '🔥', duration: '7 days', days: 7, dimension: 'productivity', description: 'Break the procrastination cycle with proven behavioral techniques.', source: 'gearuptogrow.com/end-procrastination/', isPremium: false },
  { id: 'confidence-catalyst', title: 'Confidence Catalyst', emoji: '💪', duration: '21 days', days: 21, dimension: 'confidence', description: 'Build unshakeable self-confidence through progressive challenges.', source: 'gearuptogrow.com/build-confidence/', isPremium: true },
  { id: 'deep-work', title: 'Deep Work Mastery', emoji: '🧠', duration: '14 days', days: 14, dimension: 'focus', description: 'Master the art of deep, focused work for extraordinary output.', source: 'gearuptogrow.com/deep-work/', isPremium: true },
  { id: 'morning-ritual', title: 'Morning Ritual Builder', emoji: '🌅', duration: '21 days', days: 21, dimension: 'habits', description: 'Design and lock in a morning routine that transforms your entire day.', source: 'gearuptogrow.com/morning-routine/', isPremium: true },
  { id: 'growth-mindset', title: 'Growth Mindset Rewire', emoji: '🌱', duration: '30 days', days: 30, dimension: 'mindset', description: 'Rewire your brain for a growth mindset through daily neuroplastic exercises.', source: 'gearuptogrow.com/growth-mindset/', isPremium: true },
  { id: 'sleep-optimization', title: 'Sleep Optimization', emoji: '😴', duration: '14 days', days: 14, dimension: 'wellness', description: 'Optimize your sleep for peak cognitive performance and recovery.', source: 'gearuptogrow.com/sleep-productivity/', isPremium: true },
  { id: 'journaling-journey', title: 'Journaling Journey', emoji: '📝', duration: '21 days', days: 21, dimension: 'mindset', description: 'Unlock the power of structured journaling for self-discovery and clarity.', source: 'gearuptogrow.com/journaling-benefits/', isPremium: true },
  { id: 'mental-clarity', title: 'Mental Clarity Reset', emoji: '🧠', duration: '7 days', days: 7, dimension: 'wellness', description: 'Clear mental fog and restore sharp, clear thinking in just one week.', source: 'gearuptogrow.com/mental-clarity/', isPremium: true },
];

export const AFFIRMATIONS = [
  "I am capable of achieving extraordinary things.",
  "Every challenge I face is an opportunity to grow stronger.",
  "I trust the process of my personal evolution.",
  "My potential is limitless, and I'm just getting started.",
  "I choose progress over perfection, every single day.",
  "I am worthy of the success I'm building.",
  "My mind is sharp, my heart is strong, my spirit is unbreakable.",
  "I release what I can't control and focus on what I can.",
  "Today, I become 1% better than yesterday.",
  "I am the architect of my own growth.",
];

export function calculateArchetype(answers: Record<number, string>): GrowthArchetype {
  const counts: Record<string, number> = {};
  Object.values(answers).forEach(a => { counts[a] = (counts[a] || 0) + 1; });
  const topId = Object.entries(counts).sort((a, b) => b[1] - a[1])[0]?.[0] || 'evolver';
  return ARCHETYPES.find(a => a.id === topId) || ARCHETYPES[0];
}

export function getDimensionColor(dim: GrowthDimension): string {
  const map: Record<GrowthDimension, string> = {
    mindset: 'text-emerald-400',
    productivity: 'text-blue-400',
    wellness: 'text-cyan-400',
    confidence: 'text-amber-400',
    focus: 'text-rose-400',
    habits: 'text-violet-400',
  };
  return map[dim];
}

export function getDimensionBg(dim: GrowthDimension): string {
  const map: Record<GrowthDimension, string> = {
    mindset: 'bg-emerald-400/10',
    productivity: 'bg-blue-400/10',
    wellness: 'bg-cyan-400/10',
    confidence: 'bg-amber-400/10',
    focus: 'bg-rose-400/10',
    habits: 'bg-violet-400/10',
  };
  return map[dim];
}
