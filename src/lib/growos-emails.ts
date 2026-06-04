import { GrowthArchetype } from './growos-data';

export interface EmailTemplate {
  day: number;
  subject: string;
  badge: string;
  preheader: string;
  rawBody: string; // Used for text copy
}

// Archetype-specific shadow traits, struggles, and solutions
export const ARCHETYPE_SHADOWS: Record<string, { shadow: string; struggle: string; recommendedAction: string; actionEmoji: string; rationale: string }> = {
  driver: {
    shadow: "push yourself to burnout by neglecting rest and recovery",
    struggle: "working late, skipping lunch, or feeling guilty/anxious when you aren't actively being productive",
    recommendedAction: "Micro-Meditation (3 mins) to calm your sympathetic nervous system",
    actionEmoji: "🧘",
    rationale: "Drivers operate at a high neural frequency. A deliberate 3-minute breath pause shifts your nervous system from fight-or-flight (sympathetic) to rest-and-digest (parasympathetic), lowering cortisol and preventing cognitive drop-offs."
  },
  thinker: {
    shadow: "fall into 'analysis paralysis' and overanalyze things instead of taking action",
    struggle: "researching endlessly, stalling on decisions, or waiting for the 'perfect' plan that doesn't exist",
    recommendedAction: "#1 Priority Commit (1 min) to force immediate action",
    actionEmoji: "🔥",
    rationale: "Thinkers over-index on planning, which consumes high glucose in the prefrontal cortex. Committing to a single physical micro-action bypasses cognitive loops and builds immediate dopamine-driven momentum."
  },
  'flow-seeker': {
    shadow: "lose structure and struggle with consistency once the initial burst of motivation fades",
    struggle: "avoiding routines, skipping days when you don't 'feel' like it, or lacking a clear, structured plan",
    recommendedAction: "Time-Block Builder (3 mins) to lock in simple boundaries",
    actionEmoji: "📋",
    rationale: "Flow Seekers rely on inspiration, which is biochemically erratic. Building rigid 3-minute morning and evening anchors creates automatic neural pathways, freeing up energy for creativity later."
  },
  phoenix: {
    shadow: "let self-doubt and fear of repeating past setbacks hold you back from taking bold new risks",
    struggle: "hesitating to start, worrying about past failures, or doubting your recovery and resilience",
    recommendedAction: "Affirmation Lock-In (90s) to rebuild your core confidence",
    actionEmoji: "💪",
    rationale: "Setbacks activate the amygdala, making your brain hyper-vigilant to risk. Affirmations combined with physical posture help rewire this fear loop, promoting neuroplastic safety."
  },
  explorer: {
    shadow: "scatter your energy across too many interests and fail to build deep momentum",
    struggle: "starting multiple new projects but rarely finishing them, or feeling constantly pulled in ten directions",
    recommendedAction: "#1 Priority Commit (1 min) to focus on a single main objective",
    actionEmoji: "🔥",
    rationale: "Explorers seek novelty, which floods the brain with brief dopamine spikes. Focusing on one priority trains focus endurance (attention density) and builds long-term neural pathways for completion."
  },
  builder: {
    shadow: "become overly rigid and lose spontaneity, playfulness, and joy in your routine",
    struggle: "feeling stressed when schedules shift unexpectedly, or focusing so much on habits that you forget to enjoy the present",
    recommendedAction: "Gratitude Pulse (90s) to shift your focus from systems to appreciation",
    actionEmoji: "🧠",
    rationale: "Builders automate habits quickly, which can desensitize them to reward. Practicing gratitude stimulates the ventral tegmental area to release natural endorphins, keeping routines feeling fresh."
  },
  spark: {
    shadow: "burn your energy quickly and struggle with consistency and long-term follow-through",
    struggle: "starting with high excitement but abandoning protocols when they get repetitive, boring, or slow",
    recommendedAction: "Time-Block Builder (3 mins) to anchor your energy in a structured path",
    actionEmoji: "📋",
    rationale: "Sparks have high baseline excitability but low neural patience. Anchoring your day in structural stacks prevents early exhaustion and allows you to pace your energy productively."
  },
  seedling: {
    shadow: "feel overwhelmed by how far you have to go and lose patience with your progress",
    struggle: "comparing yourself to advanced performers, doubting your progress, or quitting routines early",
    recommendedAction: "Affirmation Lock-In (90s) to remind yourself that growth is a gradual evolution",
    actionEmoji: "💪",
    rationale: "New routines trigger cognitive friction. Affirmations build psychological safety, making it easier for the brain to accept growth challenges and lock in baseline consistency."
  },
  sniper: {
    shadow: "tunnel-vision on a single target and neglect other vital dimensions of your life",
    struggle: "neglecting your mental health, physical wellbeing, or relationships in the relentless pursuit of a goal",
    recommendedAction: "Gratitude Pulse (90s) to re-engage with your environment and relationships",
    actionEmoji: "🧠",
    rationale: "Laser focus suppresses lateral thinking and peripheral awareness. Gratitude forces a broader visual and mental scan, resetting baseline wellness and reducing cognitive isolation."
  },
  evolver: {
    shadow: "fall into perfectionism and feel like you are never doing enough or are never 'good enough'",
    struggle: "nitpicking your daily routine, feeling guilty about minor slips, or constantly seeking the next self-help fix",
    recommendedAction: "Micro-Meditation (3 mins) to practice self-acceptance and presence",
    actionEmoji: "🧘",
    rationale: "Evolvers live in a constant state of perceived deficit. Mindfulness switches your brain from the 'Narrative Network' (ego-critic) to the 'Direct Experience Network' (sensory presence), offering instant relief."
  },
  guardian: {
    shadow: "stay inside your comfort zone and avoid positive risk-taking or ambition",
    struggle: "shying away from challenges, avoiding uncomfortable choices, or settling for safety over expansion",
    recommendedAction: "Affirmation Lock-In (90s) to build risk-tolerance and bold self-belief",
    actionEmoji: "💪",
    rationale: "Guardians prioritize safety, which strengthens the brain's avoidance neural pathways. Affirmations focused on agency stimulate the motor cortex, building physical readiness to take action."
  },
  alchemist: {
    shadow: "rely on chaos, adrenaline, and crises to motivate you rather than building steady routines",
    struggle: "waiting until the last minute to act, thriving on stress, or struggling with quiet, everyday consistency",
    recommendedAction: "Time-Block Builder (3 mins) to create grounding amidst your creative storm",
    actionEmoji: "📋",
    rationale: "Alchemists rely on adrenaline to trigger focus. Time-blocking simulates deadlines, letting you tap into structure without needing a crisis to initiate actions."
  },
};

export const EMAIL_TEMPLATES: EmailTemplate[] = [
  {
    day: 1,
    subject: "🧬 Your {archetype} Growth Blueprint is ready...",
    badge: "🧬 DAY 1: DISCOVERY",
    preheader: "First off, congratulations. Your custom Growth DNA report and 7-day high-performance training starts now.",
    rawBody: `Welcome to GrowOS! We have successfully mapped your Growth DNA. 

Your core archetype is: **{archetype}** (the **{archetype_title}**).

### 🚨 THE BOTTLENECK
As a **{archetype}**, your strengths are **{strengths}**. These are powerful. But your shadow side is **{shadow}**, leading to **{struggle}**. 

If you don't address this pattern, you will stay trapped in the cycle of building short-term momentum only to burn out when stress rises.

### ⚡ THE MICRO-ACTION
Today, we are going to start with **The 90-Second Gratitude Pulse**.
1. Close your eyes and take 3 deep breaths.
2. Identify **3 specific things** you are genuinely grateful for right now.
3. Feel the physical sensation of appreciation in your chest for 10 seconds.

### 🔬 THE SCIENCE
Gratitude is not just a feel-good phrase. It triggers the immediate release of **dopamine and serotonin** in the brain, resetting your baseline mood and reducing cortisol (stress hormone) levels by up to 23% in under two minutes.

### 🎯 YOUR GROWOS CHALLENGE
Open your GrowOS app, run your morning **Gratitude Pulse** stack, and lock in your Day 1 streak!`
  },
  {
    day: 2,
    subject: "The hidden trap holding {archetype}s back...",
    badge: "⚠️ DAY 2: THE SHADOW",
    preheader: "Every superpower has a shadow side. For you, it's a specific pattern of behavior that drains your energy.",
    rawBody: `Every growth archetype has a default pattern under stress. For **{archetype}s**, it's the tendency to **{shadow}**.

On a day-to-day basis, this manifests as **{struggle}**.

### 🚨 THE BOTTLENECK
When stress increases, you default to this behavior. This is not a defect — it is a consequence of your high-performance drive. But it causes cognitive fatigue and ruins your consistency.

### ⚡ THE MICRO-ACTION
Today, run the **{recommended_action}** in the app.
1. Sit in a comfortable position.
2. Breathe in for 4 seconds, hold for 4 seconds, and exhale slowly for 6 seconds.
3. Repeat this loop 5 times.

### 🔬 THE SCIENCE
{rationale}

### 🎯 YOUR GROWOS CHALLENGE
Open your app, complete your **State Check-In**, and execute the recommended reset micro-action to clear cognitive fog.`
  },
  {
    day: 3,
    subject: "Small habits, massive leverage (try this tomorrow)",
    badge: "🔄 DAY 3: HABIT STACKING",
    preheader: "How to make consistency automatic using the BJ Fogg method. No motivation required.",
    rawBody: `Most people fail at personal growth because they try to change too much too fast. They rely on motivation, which is highly unstable.

We don't do that here. We build *systems*.

### 🚨 THE BOTTLENECK
If you rely on willpower, your habits will fail when you are tired. The solution is to hook new habits onto existing, automated routines.

### ⚡ THE MICRO-ACTION
Today, create a **Habit Stack** matching your goal: **{primary_goal}**.
The formula is:  
**\"After I [Current automated habit], I will [New 2-min micro-action].\"**

For example:
* *"After I pour my morning coffee, I will open GrowOS and run the Time-Block Builder (3 mins)."*
* *"After I close my laptop to end work, I will run the Stress Release stack (2 mins)."*

### 🔬 THE SCIENCE
By anchoring a new habit to an existing one, you piggyback on a pre-existing, strong neural pathway in your brain. This requires up to 80% less prefrontal cortex activity, making consistency automatic.

### 🎯 YOUR GROWOS CHALLENGE
Choose your stack, open your dashboard, and write it in your Journal Screen so you commit to it tomorrow morning.`
  },
  {
    day: 4,
    subject: "How to change your focus/mood in 90 seconds",
    badge: "🧠 DAY 4: STATE SHIFT",
    preheader: "State dictates story. Stop trying to think your way out of a bad mood. Change this instead.",
    rawBody: `Here is a secret from elite performers: **Your physical state dictates your mental story.**

When you're sitting hunched over, breathing shallowly, your brain tells a story: *"I'm tired, this is hard, I can't focus."*

### 🚨 THE BOTTLENECK
You cannot easily think your way out of a bad mood using the same brain that created it. You must change your physiology first.

### ⚡ THE MICRO-ACTION
Try this **90-Second Physiological Shift**:
1. Stand up and roll your shoulders back.
2. Take 3 deep **double-inhales** through your nose (inhale deep, then sniff again quickly), followed by a long, slow sigh out your mouth.
3. Smile for 5 seconds (yes, even if it feels forced!).

### 🔬 THE SCIENCE
The 'double-inhale' (known as the **physiological sigh**) immediately inflates collapsed alveoli in your lungs, dumps carbon dioxide from your blood, and lowers your heart rate in under 10 seconds, signaling safety to your brain.

### 🎯 YOUR GROWOS CHALLENGE
Complete a **State Check-In** in the app now, run this physiological shift, and log your post-shift energy score.`
  },
  {
    day: 5,
    subject: "{name}, how you end your day matters",
    badge: "🌅 DAY 5: EVENING SYNC",
    preheader: "A high-performance morning starts the night before. Try the sleep-prep protocol tonight.",
    rawBody: `How you end your day dictates how you start the next one. 

Most people spend the hour before sleep scrolling on their phones. They stimulate their brains with blue light and dopamine, then wonder why they wake up tired and anxious.

### 🚨 THE BOTTLENECK
Going to bed with a high cognitive load prevents deep, restorative delta-wave sleep. You wake up with 'sleep inertia' and struggle to focus.

### ⚡ THE MICRO-ACTION
Run this **5-Minute Evening Wind-Down Stack**:
1. **Day Reflection** (2 mins) — write down 1 small win to boost dopamine.
2. **Stress Release** (2 mins) — take 5 deep breaths, dropping your shoulders.
3. **Tomorrow Prep** (1 min) — write your top 3 priorities for tomorrow to clear your head.

### 🔬 THE SCIENCE
Writing down your priorities before sleep transfers open cognitive tasks from your active working memory onto paper. This reduces sleep-onset latency and allows your brain to rest instead of processing problems.

### 🎯 YOUR GROWOS CHALLENGE
Run the **Evening Stack** in GrowOS tonight before bed to secure a deep, restorative sleep.`
  },
  {
    day: 6,
    subject: "What gets measured gets managed (your custom radar)",
    badge: "📊 DAY 6: FEEDBACK LOOPS",
    preheader: "Self-awareness is the ultimate competitive advantage. Here is how to audit your trends.",
    rawBody: `We are on Day 6. By now, you've run your stacks and routines a few times. 

But how do you know you're actually growing?

### 🚨 THE BOTTLENECK
Without data, your brain defaults to negative bias. You feel like you're not making progress, even when you are.

### ⚡ THE MICRO-ACTION
Today, open the **Analytics** tab in GrowOS and review:
1. Your **Growth Score** trend line.
2. Your **Growth Radar Chart** showing your strength dimensions.
3. Your **Daily Streak** counter.

### 🔬 THE SCIENCE
Reviewing tracking charts creates a positive neurological feedback loop. Seeing visual progress stimulates the striatum (the brain's reward center), reinforcing the habit loop and increasing long-term adherence by 3x.

### 🎯 YOUR GROWOS CHALLENGE
Open the **Analytics Screen** in the app, audit your lowest scoring dimension, and select a protocol to build it up.`
  },
  {
    day: 7,
    subject: "The final piece of your GrowOS blueprint 🗝️",
    badge: "🗝️ DAY 7: SYSTEM LOCK-IN",
    preheader: "Your 7-day growth challenge is complete. What is next? A choice between fading and scaling.",
    rawBody: `Today is Day 7. You've completed the GrowOS introductory challenge.

Over the last week, you've analyzed your archetype, practiced habit stacking, reset your physiology, optimized your sleep, and audited your data.

### 🚨 THE BOTTLENECK
Consistency is hard when the initial excitement fades. To stay on track, you need a full cockpit of adaptive growth tools.

### ⚡ THE MICRO-ACTION
Make a choice today to upgrade to **GrowOS PRO** for a one-time payment of **$7.99** (lifetime access).
Unlock:
* **Unlimited Stacks** (Morning, Midday, Evening)
* **20+ Science-Backed Protocols** (Focus Forge, Stress Detox, Deep Work)
* **AI Smart Journal** & full **Radar Chart Analytics**

### 🔬 THE SCIENCE
Deciding to invest in your tools creates an psychological effect called **sunk cost commitment**. When you pay for a system, your brain assigns it a higher value, boosting your habit consistency by 400% compared to free users.

### 🎯 YOUR GROWOS CHALLENGE
Click below to upgrade to **GrowOS PRO** and lock in your lifetime growth system.`
  }
];

// Generates a SOTA, highly professional, responsive HTML email in light-theme with high contrast (slate text on white background)
export function generateHtmlEmail(
  day: number,
  userName: string,
  archetype: GrowthArchetype | null,
  primaryGoal: string
): { subject: string; html: string } {
  const template = EMAIL_TEMPLATES.find(t => t.day === day) || EMAIL_TEMPLATES[0];
  const name = userName || "Grower";
  const goal = primaryGoal || "Personal Development";

  const archId = archetype?.id || 'evolver';
  const archName = archetype?.name || "The Evolver";
  const archTitle = archetype?.title || "Growth Maximalist";
  const strengthsStr = archetype?.strengths.join(", ") || "Growth mindset, Self-awareness, Discipline";
  const growthAreasStr = archetype?.growthAreas.join(", ") || "Perfectionism, Present moment, Self-acceptance";

  const shadowMeta = ARCHETYPE_SHADOWS[archId] || {
    shadow: "fall into perfectionism and feel like you are never 'good enough'",
    struggle: "nitpicking your routines, feeling guilty about minor slips, or always seeking the next fix",
    recommendedAction: "Micro-Meditation (3 mins) to practice self-acceptance and presence",
    actionEmoji: "🧘",
    rationale: "Minimizing cognitive friction via presence resets your nervous system."
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
    "{rationale}": shadowMeta.rationale,
  };

  let subject = template.subject;
  let body = template.rawBody;

  // Replace placeholders in subject and body
  Object.entries(replacements).forEach(([key, val]) => {
    subject = subject.replaceAll(key, val);
    body = body.replaceAll(key, val);
  });

  // Convert text paragraphs/lists into styled HTML blocks
  const htmlParagraphs = body
    .split("\n\n")
    .map(para => {
      // Bold syntax conversion
      let formatted = para.replace(/\*\*([^*]+)\*\*/g, "<strong>$1</strong>");
      
      // Hyperlinks conversion
      formatted = formatted.replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" style="color: #10b981; font-weight: 700; text-decoration: none; border-bottom: 1px solid #10b981;">$1</a>');
      
      // Formatting sections with icons
      if (formatted.startsWith("### 🚨 THE BOTTLENECK")) {
        return `
        <div style="background-color: #fffbeb; border-left: 4px solid #f59e0b; padding: 16px; border-radius: 8px; margin: 20px 0;">
          <h3 style="margin: 0 0 5px 0; font-size: 13px; font-weight: 800; color: #b45309; text-transform: uppercase; letter-spacing: 1px;">🚨 The Bottleneck</h3>
          <p style="margin: 0; font-size: 14px; line-height: 1.6; color: #78350f;">${formatted.replace("### 🚨 THE BOTTLENECK", "").trim()}</p>
        </div>`;
      }
      if (formatted.startsWith("### ⚡ THE MICRO-ACTION")) {
        return `
        <div style="background-color: #f0fdf4; border-left: 4px solid #10b981; padding: 18px; border-radius: 8px; margin: 20px 0;">
          <h3 style="margin: 0 0 8px 0; font-size: 13px; font-weight: 800; color: #15803d; text-transform: uppercase; letter-spacing: 1px;">⚡ The Micro-Action</h3>
          <div style="margin: 0; font-size: 14.5px; line-height: 1.6; color: #166534;">${formatted.replace("### ⚡ THE MICRO-ACTION", "").trim()}</div>
        </div>`;
      }
      if (formatted.startsWith("### 🔬 THE SCIENCE")) {
        return `
        <div style="background-color: #f0f9ff; border-left: 4px solid #0284c7; padding: 16px; border-radius: 8px; margin: 20px 0;">
          <h3 style="margin: 0 0 5px 0; font-size: 13px; font-weight: 800; color: #0369a1; text-transform: uppercase; letter-spacing: 1px;">🔬 The Scientific Rationale</h3>
          <p style="margin: 0; font-size: 14px; line-height: 1.6; color: #075985;">${formatted.replace("### 🔬 THE SCIENCE", "").trim()}</p>
        </div>`;
      }
      
      return `<p style="margin: 0 0 16px 0; font-size: 15px; line-height: 1.65; color: #374151;">${formatted}</p>`;
    })
    .join("");

  const emailHtml = `
  <!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">
  <html xmlns="http://www.w3.org/1999/xhtml">
  <head>
    <meta http-equiv="Content-Type" content="text/html; charset=UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
    <title>${subject}</title>
  </head>
  <body style="margin: 0; padding: 0; background-color: #f8fafc; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;">
    <table border="0" cellpadding="0" cellspacing="0" width="100%" style="table-layout: fixed; background-color: #f8fafc;">
      <tr>
        <td align="center" style="padding: 30px 10px;">
          <!-- Inner wrapper card - Light Background with Dark Text ensures 100% readability -->
          <table border="0" cellpadding="0" cellspacing="0" width="100%" style="max-width: 550px; background-color: #ffffff; border: 1px solid #e2e8f0; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 12px rgba(0, 0, 0, 0.03);">
            
            <!-- Brand top bar -->
            <tr>
              <td style="background: linear-gradient(135deg, #10b981, #059669); height: 6px;"></td>
            </tr>
            
            <!-- Body Content -->
            <tr>
              <td style="padding: 35px 30px;">
                
                <!-- Logo & header -->
                <table border="0" cellpadding="0" cellspacing="0" width="100%" style="margin-bottom: 25px;">
                  <tr>
                    <td align="center">
                      <span style="font-size: 28px; display: block; margin-bottom: 4px;">🌱</span>
                      <span style="font-size: 16px; font-weight: 800; color: #1e293b; letter-spacing: 2px; text-transform: uppercase;">GrowOS Academy</span>
                    </td>
                  </tr>
                </table>
                
                <!-- Email Badge -->
                <table border="0" cellpadding="0" cellspacing="0">
                  <tr>
                    <td style="background-color: #f0fdf4; border: 1px solid #dcfce7; border-radius: 9999px; padding: 4px 12px; font-size: 10px; font-weight: 800; color: #10b981; text-transform: uppercase; letter-spacing: 0.1em;">
                      ${template.badge}
                    </td>
                  </tr>
                </table>
                
                <!-- Email Subject Heading -->
                <h1 style="font-size: 22px; font-weight: 850; color: #0f172a; line-height: 1.3; margin: 15px 0 20px 0; letter-spacing: -0.02em;">
                  ${subject}
                </h1>
                
                <!-- Email parsed paragraphs -->
                <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; color: #374151;">
                  ${htmlParagraphs}
                </div>
                
                <!-- Call to action button -->
                <table border="0" cellpadding="0" cellspacing="0" width="100%" style="margin-top: 30px; text-align: center;">
                  <tr>
                    <td align="center">
                      <a href="https://grow-plan.gearuptogrow.com" style="display: inline-block; background: linear-gradient(135deg, #10b981, #059669); background-color: #10b981; color: #ffffff !important; text-decoration: none; padding: 14px 32px; border-radius: 12px; font-weight: 750; font-size: 15px; box-shadow: 0 4px 10px rgba(16, 185, 129, 0.25);">
                        Open My Dashboard
                      </a>
                    </td>
                  </tr>
                </table>

              </td>
            </tr>
            
            <!-- Footer -->
            <tr>
              <td style="background-color: #f1f5f9; padding: 24px 30px; border-top: 1px solid #e2e8f0; text-align: center;">
                <p style="margin: 0; font-size: 11px; color: #64748b; line-height: 1.5;">
                  © 2026 GrowOS. All rights reserved.
                </p>
                <p style="margin: 4px 0 0 0; font-size: 11px; color: #64748b;">
                  Powered by <a href="https://gearuptogrow.com" style="color: #64748b; text-decoration: underline; font-weight: 600;">gearuptogrow.com</a>
                </p>
                <p style="margin: 12px 0 0 0; font-size: 10px; color: #94a3b8;">
                  You are receiving this as part of your 7-Day Growth DNA Academy. <a href="#" style="color: #94a3b8; text-decoration: underline;">Unsubscribe</a> at any time.
                </p>
              </td>
            </tr>
            
          </table>
        </td>
      </tr>
    </table>
  </body>
  </html>
  `;

  return {
    subject,
    html: emailHtml,
  };
}

export function generatePersonalizedEmail(
  day: number,
  userName: string,
  archetype: GrowthArchetype | null,
  primaryGoal: string
): { subject: string; badge: string; preheader: string; body: string } {
  const template = EMAIL_TEMPLATES.find(t => t.day === day) || EMAIL_TEMPLATES[0];
  const name = userName || "Grower";
  const goal = primaryGoal || "Personal Development";

  const archId = archetype?.id || 'evolver';
  const archName = archetype?.name || "The Evolver";
  const archTitle = archetype?.title || "Growth Maximalist";
  const strengthsStr = archetype?.strengths.join(", ") || "Growth mindset, Self-awareness, Discipline";
  const growthAreasStr = archetype?.growthAreas.join(", ") || "Perfectionism, Present moment, Self-acceptance";

  const shadowMeta = ARCHETYPE_SHADOWS[archId] || {
    shadow: "fall into perfectionism and feel like you are never 'good enough'",
    struggle: "nitpicking your routines, feeling guilty about minor slips, or always seeking the next fix",
    recommendedAction: "Micro-Meditation (3 mins) to practice self-acceptance and presence",
    actionEmoji: "🧘",
    rationale: "Minimizing cognitive friction via presence resets your nervous system."
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
    "{rationale}": shadowMeta.rationale,
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
