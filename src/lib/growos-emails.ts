import { GrowthArchetype } from './growos-data';

export interface EmailTemplate {
  day: number;
  subject: string;
  badge: string;
  preheader: string;
  rawBody: string;
}

// Archetype-specific shadow traits and struggles to enable extreme hyper-personalization
export const ARCHETYPE_SHADOWS: Record<string, { shadow: string; struggle: string; recommendedAction: string; actionEmoji: string }> = {
  driver: {
    shadow: "push yourself to burnout by neglecting rest, sleep, and recovery",
    struggle: "working late, skipping breaks, or feeling guilty/anxious when you aren't actively being productive",
    recommendedAction: "Micro-Meditation (3 mins) to calm your sympathetic nervous system",
    actionEmoji: "🧘",
  },
  thinker: {
    shadow: "fall into 'analysis paralysis' and overanalyze things instead of taking action",
    struggle: "researching endlessly, stalling on minor decisions, or waiting for the 'perfect' plan that doesn't exist",
    recommendedAction: "#1 Priority Commit (1 min) to force immediate action",
    actionEmoji: "🔥",
  },
  'flow-seeker': {
    shadow: "lose structure and struggle with consistency once the initial burst of motivation fades",
    struggle: "avoiding routines, skipping days when you don't 'feel' like it, or lacking a clear, step-by-step plan",
    recommendedAction: "Time-Block Builder (3 mins) to lock in simple boundaries",
    actionEmoji: "📋",
  },
  phoenix: {
    shadow: "let self-doubt and fear of repeating past setbacks hold you back from taking bold new risks",
    struggle: "hesitating to start, worrying about past failures, or doubting your recovery and resilience",
    recommendedAction: "Affirmation Lock-In (90s) to rebuild your core confidence",
    actionEmoji: "💪",
  },
  explorer: {
    shadow: "scatter your energy across too many interests and fail to build deep momentum",
    struggle: "starting multiple new projects but rarely finishing them, or feeling constantly pulled in ten directions",
    recommendedAction: "#1 Priority Commit (1 min) to focus on a single main objective",
    actionEmoji: "🔥",
  },
  builder: {
    shadow: "become overly rigid and lose spontaneity, playfulness, and joy in your routine",
    struggle: "feeling stressed when schedules shift unexpectedly, or focusing so much on habits that you forget to enjoy the present",
    recommendedAction: "Gratitude Pulse (90s) to shift your focus from systems to appreciation",
    actionEmoji: "🧠",
  },
  spark: {
    shadow: "burn your energy quickly and struggle with consistency and long-term follow-through",
    struggle: "starting with high excitement but abandoning protocols when they get repetitive, boring, or slow",
    recommendedAction: "Time-Block Builder (3 mins) to anchor your energy in a structured path",
    actionEmoji: "📋",
  },
  seedling: {
    shadow: "feel overwhelmed by how far you have to go and lose patience with your progress",
    struggle: "comparing yourself to advanced performers, doubting your progress, or quitting routines early",
    recommendedAction: "Affirmation Lock-In (90s) to remind yourself that growth is a gradual evolution",
    actionEmoji: "💪",
  },
  sniper: {
    shadow: "tunnel-vision on a single target and neglect other vital dimensions of your life",
    struggle: "neglecting your mental health, physical wellbeing, or relationships in the relentless pursuit of a goal",
    recommendedAction: "Gratitude Pulse (90s) to re-engage with your environment and relationships",
    actionEmoji: "🧠",
  },
  evolver: {
    shadow: "fall into perfectionism and feel like you are never doing enough or are never 'good enough'",
    struggle: "nitpicking your daily routine, feeling guilty about minor slips, or constantly seeking the next self-help fix",
    recommendedAction: "Micro-Meditation (3 mins) to practice self-acceptance and presence",
    actionEmoji: "🧘",
  },
  guardian: {
    shadow: "stay inside your comfort zone and avoid positive risk-taking or ambition",
    struggle: "shying away from challenges, avoiding uncomfortable choices, or settling for safety over expansion",
    recommendedAction: "Affirmation Lock-In (90s) to build risk-tolerance and bold self-belief",
    actionEmoji: "💪",
  },
  alchemist: {
    shadow: "rely on chaos, adrenaline, and crises to motivate you rather than building steady routines",
    struggle: "waiting until the last minute to act, thriving on stress, or struggling with quiet, everyday consistency",
    recommendedAction: "Time-Block Builder (3 mins) to create grounding amidst your creative storm",
    actionEmoji: "📋",
  },
};

export const EMAIL_TEMPLATES: EmailTemplate[] = [
  {
    day: 1,
    subject: "🧬 Your {archetype} Growth Blueprint is ready inside...",
    badge: "🧬 BLUEPRINT DELIVERED",
    preheader: "First off, congratulations. Your custom Growth DNA report and 7-day high-performance training starts now.",
    rawBody: `Hey {name},

First off, congratulations. By taking the Growth DNA Quiz, you've taken a crucial step that 95% of people never do: you've audited your own behavior to build a better system.

Your results are in, and your archetype is: **{archetype}** (the **{archetype_title}**).

As a **{archetype}**, your core strengths are **{strengths}**. These are your superpowers. But your hidden bottleneck is **{growth_areas}**.

If you don't address this bottleneck, you will stay stuck in the same cycle of building momentum, only to watch it fade when life gets chaotic. 

Here is what we are going to do over the next 7 days in the **GrowOS Growth Academy**:
Each day, I will send you a highly specific, science-backed micro-action to optimize your operating system. By Day 7, you will have a rock-solid, automated morning and evening routine.

👉 **[Download your custom 10-page Archetype Blueprint PDF here]** (Included Free)

Let's start right now: Open the app, and run your first **Gratitude Pulse** micro-action. It takes exactly 90 seconds. 

To your growth,  
**The GrowOS Team**`
  },
  {
    day: 2,
    subject: "The hidden bottleneck holding {archetype}s back...",
    badge: "⚠️ TRAP DETECTED",
    preheader: "Every superpower has a shadow side. For you, it's a specific pattern of behavior that drains your energy.",
    rawBody: `Hey {name},

Every growth archetype has a shadow side. For **{archetype}s**, it's the tendency to **{shadow}**.

On a day-to-day basis, this looks like **{struggle}**. 

This isn't a defect; it's a natural consequence of your high-performance drive. But left unchecked, it causes cognitive fatigue and ruins your consistency. 

The solution? **The 2-Minute Reset.**

Neuroscience shows that taking a short, deliberate pause resets your prefrontal cortex and restores willpower. Today, I want you to run the **{recommended_action}** in GrowOS. 

It takes just a few minutes. Focus on your breath: inhale for 4 counts, hold for 4, exhale for 6. 

Try it now. Notice the shift in your focus afterward.

Speak tomorrow,  
**The GrowOS Team**`
  },
  {
    day: 3,
    subject: "Small habits, massive leverage (try this tomorrow)",
    badge: "🔄 HABIT STACKING",
    preheader: "How to make consistency automatic using the BJ Fogg method. No motivation required.",
    rawBody: `Hey {name},

Most people fail at personal growth because they try to change too much too fast. They rely on motivation, which is highly unstable and fades at the first sign of fatigue.

We don't do that here. We build *systems*.

The easiest way to build a habit is **Habit Stacking** (developed by Stanford researcher BJ Fogg and popularized by James Clear).

The formula:  
**After [Current Habit], I will [New Micro-Action].**

For a **{archetype}** like you, your primary goal is **{primary_goal}**. Let's stack a micro-action that helps with this. 

For example, try this tomorrow morning:  
*"After I pour my morning coffee, I will open GrowOS and run the Time-Block Builder (3 minutes)."*

Write down your stack. Commit to it. It takes less than 3 minutes, but the compounding effect over a year is massive.

Talk tomorrow,  
**The GrowOS Team**`
  },
  {
    day: 4,
    subject: "How to change your focus/mood in 90 seconds",
    badge: "🧠 NEURO-SHIFT",
    preheader: "State dictates story. Stop trying to think your way out of a bad mood. Change this instead.",
    rawBody: `Hey {name},

Here's a secret from elite performers: **Your physical state dictates your mental story.**

When you're sitting hunched over at your desk, breathing shallowly, your brain tells a story: *"I'm tired, this work is hard, I can't focus."*

If you try to think your way out of a bad mood, you'll fail. Instead, change your physiology first.

In GrowOS, we use the **State Check-In** to build this bio-feedback loop. By scoring your energy, clarity, and mood, you force your brain to self-reflect and adjust.

Try this 90-second physiological shift right now:
1. Stand up and roll your shoulders back.
2. Take 3 deep "double-inhales" through your nose (inhale deep, then sniff again quickly), followed by a long, slow sigh out your mouth.
3. Smile for 5 seconds (yes, even if it feels forced!).

This simple shift floods your system with oxygen, lowers cortisol, and tells your nervous system it's safe and ready. 

Now, go crush your next task.

Speak tomorrow,  
**The GrowOS Team**`
  },
  {
    day: 5,
    subject: "{name}, how you end your day matters",
    badge: "🌅 EVENING SHIFT",
    preheader: "A high-performance morning starts the night before. Try the sleep-prep protocol tonight.",
    rawBody: `Hey {name},

How did your day go? 

Most people spend the hour before sleep scrolling on their phones. They stimulate their brains with blue light and cortisol, then wonder why they wake up tired, anxious, and unmotivated.

If you want a high-performance morning, you must protect your evening. 

Introducing the **Evening Wind-Down Stack**. 

By spending just 5 minutes reflecting on your day, releasing stress, and planning tomorrow, you clear your cognitive load. Your brain doesn't have to keep processing problems in your sleep.

In GrowOS, we've designed an Evening Stack specifically for this:
1. **Day Reflection** (2 min) — celebrate a small win to boost dopamine.
2. **Stress Release** (2.5 min) — release physical tension with breathing.
3. **Tomorrow Prep** (2 min) — write your top 3 priorities so your brain rest.

Run this tonight before bed. You'll wake up with absolute clarity.

Speak tomorrow,  
**The GrowOS Team**`
  },
  {
    day: 6,
    subject: "What gets measured gets managed (your custom radar)",
    badge: "📊 DATA FEEDBACK",
    preheader: "Self-awareness is the ultimate competitive advantage. Here is how to audit your trends.",
    rawBody: `Hey {name},

We are on Day 6. By now, you've run your morning stacks and routines a few times. 

But how do you know you're actually growing? 

In management, there is a famous rule: **"What gets measured gets managed."** The same applies to your mind. 

When you log your check-ins and stacks, GrowOS compiles your data into a **Growth Radar** and **Daily Trends Chart**. 

This dashboard shows you exactly which dimensions (Mindset, Focus, Wellness, Habits) are thriving and which need attention. 

Open the **Analytics** tab in GrowOS today and look at your charts. Are you tracking upward? Is your streak holding? 

Self-awareness isn't just about feeling good — it is the ultimate competitive advantage.

Talk tomorrow,  
**The GrowOS Team**`
  },
  {
    day: 7,
    subject: "The final piece of your GrowOS blueprint 🗝️",
    badge: "🗝️ UNLOCK SYSTEM",
    preheader: "Your 7-day growth challenge is complete. What is next? A choice between fading and scaling.",
    rawBody: `Hey {name},

Today is Day 7. You've completed the GrowOS introductory challenge. 

Over the last week, you've learned about your archetype, practiced habit stacking, reset your physical state, optimized your evenings, and looked at your data. 

Now, you face a choice:

**Option A:** You let this momentum fade. You go back to your old routines, rely on motivation, and hope for consistency. 

**Option B:** You lock in this system for life.

For the price of a single coffee (**$7.99, one-time**), you can upgrade to **GrowOS PRO** and unlock lifetime access to:
* **Unlimited Adaptive Stacks** (Morning, Midday, and Evening)
- **The Full 20+ Protocol Library** (Stress Detox, Deep Work, Confidence)
- **AI Smart Journaling & Analytics Dashboard**
- **Custom Stack Builder & Focus Timer**

No subscriptions. No recurring charges. Just lifetime access to your personal growth cockpit.

👉 **[Upgrade to GrowOS PRO here]**

Thank you for letting us join your journey this week. Keep stacking.

To your growth,  
**The GrowOS Team**`
  }
];

export function generatePersonalizedEmail(
  day: number,
  userName: string,
  archetype: GrowthArchetype | null,
  primaryGoal: string
): { subject: string; badge: string; preheader: string; body: string } {
  const template = EMAIL_TEMPLATES.find(t => t.day === day) || EMAIL_TEMPLATES[0];
  const name = userName || "Grower";
  const goal = primaryGoal || "Personal Growth";

  const archId = archetype?.id || 'evolver';
  const archName = archetype?.name || "The Evolver";
  const archTitle = archetype?.title || "Growth Maximalist";
  const strengthsStr = archetype?.strengths.join(", ") || "Growth mindset, Self-awareness, Discipline";
  const growthAreasStr = archetype?.growthAreas.join(", ") || "Perfectionism, Present moment, Self-acceptance";

  const shadowMeta = ARCHETYPE_SHADOWS[archId] || {
    shadow: "fall into perfectionism and feel like you are never 'good enough'",
    struggle: "nitpicking your routines, feeling guilty about minor slips, or always seeking the next fix",
    recommendedAction: "Micro-Meditation (3 mins) to practice self-acceptance and presence",
    actionEmoji: "🧘"
  };

  const replacements: Record<string, string> = {
    "{name}": name,
    "{archetype}": archName,
    "{archetype_title}": archTitle,
    "{strengths}": strengthsStr,
    "{growth_areas}": growthAreasStr,
    "{primary_goal}": goal,
    "{shadow}": shadowMeta.shadow,
    "{struggle}": shadowMeta.struggle,
    "{recommended_action}": shadowMeta.recommendedAction,
    "{action_emoji}": shadowMeta.actionEmoji,
  };

  let subject = template.subject;
  let preheader = template.preheader;
  let body = template.rawBody;

  // Replace placeholders
  Object.entries(replacements).forEach(([key, val]) => {
    subject = subject.replaceAll(key, val);
    preheader = preheader.replaceAll(key, val);
    body = body.replaceAll(key, val);
  });

  return {
    subject,
    badge: template.badge,
    preheader,
    body,
  };
}
