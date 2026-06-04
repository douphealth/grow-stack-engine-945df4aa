import { useState } from 'react';
import { motion } from 'framer-motion';
import { useGrowOS } from '@/lib/growos-context';
import { supabase } from '@/integrations/supabase/client';
import { Mail, ArrowRight, Shield, Sparkles, Check, Loader2, AlertCircle } from 'lucide-react';
import { toast } from 'sonner';

export default function LeadCapture() {
  const { userName, archetype, primaryGoal, setScreen, setUserEmail, setSubscribedToAcademy } = useGrowOS();
  const [email, setEmail] = useState('');
  const [optIn, setOptIn] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Email regex helper
  const isValidEmail = (val: string) => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const trimmedEmail = email.trim();
    if (!trimmedEmail) {
      setError('Email address is required.');
      return;
    }
    if (!isValidEmail(trimmedEmail)) {
      setError('Please enter a valid email address.');
      return;
    }

    setIsLoading(true);

    try {
      // 1. Sync with Supabase database (fails gracefully if schema isn't created yet)
      const { error: dbError } = await supabase
        .from('leads' as any)
        .insert({
          email: trimmedEmail.toLowerCase(),
          name: userName || 'Grower',
          archetype: archetype?.id || 'evolver',
          primary_goal: primaryGoal || 'mindset',
        });

      if (dbError) {
        console.warn('GrowOS Lead Capture: Supabase database sync failed.', dbError);
      }

      // 2. Direct client-side Brevo API calls (if optIn is checked)
      if (optIn) {
        const brevoApiKey = import.meta.env.VITE_BREVO_API_KEY;
        const archName = archetype?.name || "The Evolver";
        const archTitle = archetype?.title || "Growth Maximalist";
        
        const archetypeTraits: Record<string, { title: string; strengths: string; growth: string; emoji: string }> = {
          driver: { title: "Relentless Achiever", strengths: "Goal execution, Time management, Discipline", growth: "Work-life balance, Rest, Self-compassion", emoji: "🦁" },
          thinker: { title: "Deep Analyzer", strengths: "Critical thinking, Strategy, Learning", growth: "Taking action, Overthinking, Decisiveness", emoji: "🦉" },
          'flow-seeker': { title: "Harmony Hunter", strengths: "Mindfulness, Creativity, Presence", growth: "Structure, Consistency, Planning", emoji: "🌊" },
          phoenix: { title: "Resilient Riser", strengths: "Resilience, Adaptability, Empathy", growth: "Self-doubt, Patience, Trust", emoji: "🔥" },
          explorer: { title: "Purpose Seeker", strengths: "Curiosity, Open-mindedness, Versatility", growth: "Focus, Commitment, Depth", emoji: "🧭" },
          builder: { title: "System Architect", strengths: "Habit formation, Systems thinking, Patience", growth: "Flexibility, Spontaneity, Fun", emoji: "🏗️" },
          spark: { title: "Energy Dynamo", strengths: "Enthusiasm, Initiative, Energy", growth: "Focus, Follow-through, Rest", emoji: "⚡" },
          seedling: { title: "Fresh Starter", strengths: "Beginner's mindset, Eagerness, Potential", growth: "Consistency, Patience, Self-belief", emoji: "🌱" },
          sniper: { title: "Laser Focused", strengths: "Intense focus, Goal clarity, Determination", growth: "Balance, Big picture, Letting go", emoji: "🎯" },
          evolver: { title: "Growth Maximalist", strengths: "Growth mindset, Self-awareness, Discipline", growth: "Perfectionism, Present moment, Self-acceptance", emoji: "🧬" },
          guardian: { title: "Wellness Protector", strengths: "Self-care, Boundaries, Emotional intelligence", growth: "Risk-taking, Ambition, Discomfort", emoji: "🛡️" },
          alchemist: { title: "Chaos Transformer", strengths: "Adaptability, Creativity, Vision", growth: "Stability, Routine, Grounding", emoji: "🌟" },
        };

        const traits = archetypeTraits[archetype?.id || 'evolver'] || archetypeTraits.evolver;

        const htmlContent = `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Your Growth DNA Results</title>
          <style>
            body { margin: 0; padding: 0; background-color: #0f172a; font-family: sans-serif; color: #f8fafc; }
            .container { max-width: 600px; margin: 0 auto; padding: 40px 20px; }
            .card { background-color: #1e293b; border-radius: 16px; padding: 30px; text-align: center; border: 1px solid rgba(255,255,255,0.08); }
            .archetype-emoji { font-size: 64px; display: block; margin-bottom: 10px; }
            h1 { font-size: 26px; margin: 0 0 5px 0; color: #ffffff; }
            .subtitle { color: #10b981; font-size: 14px; font-weight: 700; text-transform: uppercase; letter-spacing: 2px; margin-bottom: 20px; }
            p { font-size: 15px; line-height: 1.6; color: #cbd5e1; }
            .meta-grid { text-align: left; background-color: rgba(15, 23, 42, 0.4); border-radius: 12px; padding: 20px; margin-bottom: 25px; }
            .meta-label { font-size: 11px; font-weight: 700; color: #94a3b8; text-transform: uppercase; display: block; }
            .meta-value { font-size: 14px; color: #f1f5f9; }
            .btn { display: inline-block; background: linear-gradient(135deg, #10b981, #059669); color: white !important; text-decoration: none; padding: 14px 30px; border-radius: 12px; font-weight: 700; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="card">
              <span class="archetype-emoji">${traits.emoji}</span>
              <h1>${traits.emoji} ${archName}</h1>
              <div class="subtitle">${traits.title}</div>
              <p>Hey ${userName || 'Grower'},</p>
              <p>Here are your Growth DNA archetype results! You have been subscribed to our 7-Day Growth Academy sequence based on your goal: <strong>${primaryGoal || 'Mindset'}</strong>.</p>
              <div class="meta-grid">
                <div style="margin-bottom: 12px;">
                  <span class="meta-label">Superpowers</span>
                  <span class="meta-value">${traits.strengths}</span>
                </div>
                <div>
                  <span class="meta-label">Growth Focus Areas</span>
                  <span class="meta-value">${traits.growth}</span>
                </div>
              </div>
              <a href="https://grow-plan.gearuptogrow.com" class="btn">Open GrowOS Dashboard</a>
            </div>
          </div>
        </body>
        </html>
        `;

        if (brevoApiKey) {
          // A. Send Day 1 welcome email via SMTP API
          const mailRes = await fetch("https://api.brevo.com/v3/smtp/email", {
            method: "POST",
            headers: {
              "accept": "application/json",
              "api-key": brevoApiKey,
              "content-type": "application/json",
            },
            body: JSON.stringify({
              sender: {
                name: "GrowOS Academy",
                email: "info@gearuptogrow.com", // Ensure this sender or domain is verified in Brevo!
              },
              to: [{ email: trimmedEmail, name: userName || "Grower" }],
              subject: `🧬 Your ${archName} Growth Blueprint is ready inside...`,
              htmlContent: htmlContent,
            }),
          });
          
          const mailData = await mailRes.json();
          console.log("Brevo SMTP Direct Response:", mailData);

          // B. Add contact to Brevo list (triggers automation sequence workflows)
          const contactRes = await fetch("https://api.brevo.com/v3/contacts", {
            method: "POST",
            headers: {
              "accept": "application/json",
              "api-key": brevoApiKey,
              "content-type": "application/json",
            },
            body: JSON.stringify({
              email: trimmedEmail,
              attributes: {
                FIRSTNAME: userName || "Grower",
                ARCHETYPE: archName,
                GOAL: primaryGoal || "Mindset",
              },
              updateEnabled: true,
            }),
          });
          
          const contactData = await contactRes.json();
          console.log("Brevo Contact Add Response:", contactData);
        } else {
          console.warn("VITE_BREVO_API_KEY is not defined in environment variables. Email simulation active.");
        }
      }
    } catch (err) {
      console.error('GrowOS Lead Capture direct Brevo call failed:', err);
    }

    // Save states locally
    setUserEmail(trimmedEmail);
    setSubscribedToAcademy(optIn);
    
    // Simulate slight delay for professional loading feel
    setTimeout(() => {
      setIsLoading(false);
      toast.success('Blueprint generated & sequence active! 🧬');
      setScreen('archetype-reveal');
    }, 1000);
  };

  const handleSkip = () => {
    // Graceful skip option for high-trust user experience
    setSubscribedToAcademy(false);
    setScreen('archetype-reveal');
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-6 relative overflow-hidden">
      {/* Background glow effects */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[500px] h-[500px] rounded-full bg-primary/10 blur-[100px]" />
        <div className="absolute bottom-1/4 right-1/4 w-72 h-72 rounded-full bg-accent/5 blur-3xl" />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="relative z-10 max-w-md w-full"
      >
        {/* DNA completed header */}
        <div className="text-center mb-8">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: 'spring', delay: 0.1 }}
            className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full bg-primary/10 border border-primary/20 text-xs font-semibold text-primary mb-3"
          >
            <Sparkles className="w-3.5 h-3.5" />
            Growth DNA Analysis Complete
          </motion.div>
          <h1 className="text-3xl font-heading font-bold text-foreground">Your Blueprint is Ready!</h1>
          <p className="text-muted-foreground text-sm mt-2 leading-relaxed">
            Hey <span className="text-foreground font-semibold">{userName || 'Grower'}</span>, we've analyzed your responses. Before we reveal your archetype, lock in your resources below:
          </p>
        </div>

        {/* Lead Capture Form Card */}
        <div className="glass-card p-6.5 relative overflow-hidden border-border/80">
          <div className="absolute inset-0 bg-gradient-to-br from-primary/3 to-accent/3 pointer-events-none" />
          
          <div className="relative z-10 space-y-5">
            {/* Offer Stack Checklist */}
            <div className="space-y-3">
              <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider">What you're getting:</p>
              {[
                { title: 'Personalized Growth Archetype Card', desc: 'Identify your ultimate superpowers & shadows' },
                { title: '10-Page Custom Blueprint PDF', desc: 'Step-by-step action guide based on your profile' },
                { title: '7-Day High-Performance Email Academy', desc: 'Daily science-backed protocols & micro-actions' }
              ].map((item, idx) => (
                <div key={idx} className="flex gap-2.5 items-start">
                  <div className="w-5 h-5 rounded-full bg-emerald-500/10 flex items-center justify-center shrink-0 mt-0.5">
                    <Check className="w-3 h-3 text-emerald-400" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-foreground leading-tight">{item.title}</p>
                    <p className="text-xs text-muted-foreground mt-0.5 leading-relaxed">{item.desc}</p>
                  </div>
                </div>
              ))}
            </div>

            <hr className="border-border/40" />

            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Input wrapper */}
              <div className="space-y-1">
                <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider block">
                  Email Address
                </label>
                <div className="relative">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground/60" />
                  <input
                    type="email"
                    placeholder="name@company.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    disabled={isLoading}
                    className="w-full pl-11 pr-5 py-3.5 rounded-xl bg-secondary border border-border text-foreground text-sm placeholder:text-muted-foreground/60 focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-transparent transition-all"
                  />
                </div>
              </div>

              {/* Opt-in check */}
              <label className="flex items-start gap-3 cursor-pointer select-none group">
                <input
                  type="checkbox"
                  checked={optIn}
                  onChange={(e) => setOptIn(e.target.checked)}
                  disabled={isLoading}
                  className="sr-only"
                />
                <div className={`w-5 h-5 rounded-md border flex items-center justify-center shrink-0 mt-0.5 transition-all ${
                  optIn ? 'border-primary bg-primary text-primary-foreground' : 'border-muted-foreground/40 hover:border-muted-foreground/60'
                }`}>
                  {optIn && <Check className="w-3.5 h-3.5" />}
                </div>
                <div className="flex-1">
                  <p className="text-xs font-semibold text-foreground group-hover:text-primary transition-colors">
                    Join the 7-Day High-Performance Email Academy
                  </p>
                  <p className="text-[10px] text-muted-foreground mt-0.5 leading-relaxed">
                    Get daily science-backed lessons tailored to your archetype. Free forever. Unsubscribe anytime.
                  </p>
                </div>
              </label>

              {/* Form level error */}
              {error && (
                <div className="flex items-center gap-2 p-3 rounded-lg bg-destructive/10 border border-destructive/20 text-destructive text-xs">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{error}</span>
                </div>
              )}

              {/* Submit CTA */}
              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-4 rounded-xl gradient-primary text-primary-foreground font-heading font-semibold text-base flex items-center justify-center gap-2 glow-primary hover:opacity-95 transition-all active:scale-[0.99] disabled:opacity-50"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    Generating Blueprint...
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4.5 h-4.5" />
                    Reveal My Archetype & Get Blueprint
                    <ArrowRight className="w-4.5 h-4.5" />
                  </>
                )}
              </button>
            </form>
          </div>
        </div>

        {/* Skip button & privacy section */}
        <div className="text-center mt-5 space-y-4">
          <button
            onClick={handleSkip}
            disabled={isLoading}
            className="text-xs text-muted-foreground hover:text-foreground font-medium underline transition-colors"
          >
            Skip bonuses and just show my results
          </button>
          
          <div className="flex items-center justify-center gap-4 text-[10px] text-muted-foreground">
            <div className="flex items-center gap-1">
              <Shield className="w-3 h-3 text-emerald-400" />
              <span>We value your privacy</span>
            </div>
            <span>•</span>
            <span>No spam, unsubscribe with one click</span>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
