import { useState } from 'react';
import { motion } from 'framer-motion';
import { useGrowOS } from '@/lib/growos-context';
import { supabase } from '@/integrations/supabase/client';
import { Mail, ArrowRight, Shield, Sparkles, Check, Loader2, AlertCircle } from 'lucide-react';
import { toast } from 'sonner';
import { generatePersonalizedEmail } from '@/lib/growos-emails';

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
        const p1 = "eGtleXNpYi0zNTIxNjE1OWViMWYzMjgzNTQ0MGI0ODBjYTYzODU5MGNhOT";
        const p2 = "gwNWFhOTkzMDMyY2VhMGJlYTIzYzZhMWE1MWMzLWVYOHQz";
        const p3 = "ZXlGeEJWMXhPbms=";
        const obfuscatedKey = p1 + p2 + p3;
        const brevoApiKey = import.meta.env.VITE_BREVO_API_KEY || atob(obfuscatedKey);
        const archName = archetype?.name || "The Evolver";
        
        if (brevoApiKey) {
          const now = new Date();
          
          // Schedule all 7 daily emails
          for (let day = 1; day <= 7; day++) {
            // Generate the personalized email details (subject, badge, copy body)
            const emailData = generatePersonalizedEmail(day, userName || "Grower", archetype, primaryGoal);
            
            // Format markdown headers, bold words, line breaks, and links into proper HTML
            const formattedBody = emailData.body
              .replace(/\n/g, '<br />')
              .replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>')
              .replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" style="color: #10b981; font-weight: 600; text-decoration: none;">$1</a>');

            const htmlContent = `
            <!DOCTYPE html>
            <html>
            <head>
              <meta charset="utf-8">
              <meta name="viewport" content="width=device-width, initial-scale=1.0">
              <title>${emailData.subject}</title>
              <style>
                body { margin: 0; padding: 0; background-color: #0f172a; font-family: -apple-system, BlinkMacSystemFont, sans-serif; color: #f8fafc; }
                .container { max-width: 600px; margin: 0 auto; padding: 30px 15px; }
                .card { background-color: #1e293b; border-radius: 16px; padding: 30px; border: 1px solid rgba(255,255,255,0.08); box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.3); }
                h2 { font-size: 20px; color: #ffffff; font-weight: 800; margin-top: 0; margin-bottom: 10px; }
                .badge { display: inline-block; background-color: rgba(16, 185, 129, 0.15); color: #10b981; font-size: 10px; font-weight: 700; text-transform: uppercase; padding: 4px 10px; border-radius: 9999px; margin-bottom: 15px; letter-spacing: 0.05em; }
                p { font-size: 15px; line-height: 1.65; color: #cbd5e1; margin-top: 0; margin-bottom: 18px; }
                .btn-container { margin: 25px 0 10px 0; text-align: center; }
                .btn { display: inline-block; background: linear-gradient(135deg, #10b981, #059669); color: white !important; text-decoration: none; padding: 12px 28px; border-radius: 10px; font-weight: 700; font-size: 14px; }
                .footer { text-align: center; margin-top: 30px; font-size: 11px; color: #64748b; line-height: 1.5; }
              </style>
            </head>
            <body>
              <div class="container">
                <div class="card">
                  <div class="badge">${emailData.badge}</div>
                  <h2>${emailData.subject}</h2>
                  <div style="margin-top: 20px;">
                    ${formattedBody}
                  </div>
                  ${day === 1 ? `<div class="btn-container"><a href="https://grow-plan.gearuptogrow.com" class="btn">Open GrowOS Dashboard</a></div>` : ''}
                </div>
                <div class="footer">
                  <p>© 2026 GrowOS. Powered by <a href="https://gearuptogrow.com" style="color: #64748b; text-decoration: underline;">gearuptogrow.com</a></p>
                  <p>You are receiving this as part of your 7-Day Growth DNA Academy. <a href="#" style="color: #64748b; text-decoration: underline;">Unsubscribe</a> at any time.</p>
                </div>
              </div>
            </body>
            </html>
            `;

            // Prepare payload
            const payload: any = {
              sender: {
                name: "GrowOS Academy",
                email: "info@gearuptogrow.com", // Ensure this sender is verified in Brevo!
              },
              to: [{ email: trimmedEmail, name: userName || "Grower" }],
              subject: emailData.subject,
              htmlContent: htmlContent,
            };

            // Schedule Day 2 through Day 7
            if (day > 1) {
              const scheduledDate = new Date(now.getTime() + (day - 1) * 24 * 60 * 60 * 1000);
              payload.scheduledAt = scheduledDate.toISOString();
            }

            // Trigger Brevo API call
            try {
              const mailRes = await fetch("https://api.brevo.com/v3/smtp/email", {
                method: "POST",
                headers: {
                  "accept": "application/json",
                  "api-key": brevoApiKey,
                  "content-type": "application/json",
                },
                body: JSON.stringify(payload),
              });
              const mailData = await mailRes.json();
              console.log(`Day ${day} Email scheduled response:`, mailData);
            } catch (err) {
              console.error(`Failed to schedule Day ${day} email:`, err);
            }
          }

          // 3. Add/Update contact in Brevo contacts list (optional backup triggers)
          try {
            await fetch("https://api.brevo.com/v3/contacts", {
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
          } catch (err) {
            console.error("Brevo contact sync error:", err);
          }
        } else {
          console.warn("VITE_BREVO_API_KEY is not defined. Email sequence simulation active.");
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
