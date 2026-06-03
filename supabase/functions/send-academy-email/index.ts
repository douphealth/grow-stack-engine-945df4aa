import { serve } from "https://deno.land/std@0.190.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

interface EmailPayload {
  email: string;
  name: string;
  archetypeId: string;
  archetypeName: string;
  primaryGoal: string;
}

// Inline HTML builder for a SOTA, premium, responsive email template matching the GrowOS brand
function generateHtmlEmail(name: string, archetypeId: string, archetypeName: string, primaryGoal: string) {
  const primaryColor = "#10b981"; // Emerald/Green from GrowOS
  const bgColor = "#0f172a"; // Dark slate
  const cardBg = "#1e293b"; // Slate-800
  
  // Custom archetype title and traits lookup for the welcome email
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

  const traits = archetypeTraits[archetypeId] || archetypeTraits.evolver;

  return `
  <!DOCTYPE html>
  <html>
  <head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Your Growth DNA Results</title>
    <style>
      body {
        margin: 0;
        padding: 0;
        background-color: ${bgColor};
        font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
        color: #f8fafc;
        -webkit-font-smoothing: antialiased;
      }
      .container {
        max-width: 600px;
        margin: 0 auto;
        padding: 40px 20px;
      }
      .logo {
        text-align: center;
        margin-bottom: 30px;
      }
      .logo-icon {
        display: inline-block;
        width: 50px;
        height: 50px;
        line-height: 50px;
        border-radius: 12px;
        background: linear-gradient(135deg, ${primaryColor}, #059669);
        font-size: 24px;
        color: white;
        text-shadow: 0 2px 4px rgba(0,0,0,0.1);
      }
      .logo-text {
        font-size: 22px;
        font-weight: 800;
        margin-top: 10px;
        letter-spacing: 1px;
        background: linear-gradient(to right, ${primaryColor}, #34d399);
        -webkit-background-clip: text;
        -webkit-text-fill-color: transparent;
      }
      .card {
        background-color: ${cardBg};
        border: 1px solid rgba(255,255,255,0.08);
        border-radius: 16px;
        padding: 30px;
        text-align: center;
        box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.3);
      }
      .archetype-emoji {
        font-size: 64px;
        margin-bottom: 10px;
        display: block;
      }
      h1 {
        font-size: 26px;
        margin: 0 0 5px 0;
        font-weight: 800;
      }
      .subtitle {
        color: ${primaryColor};
        font-size: 14px;
        font-weight: 700;
        text-transform: uppercase;
        letter-spacing: 2px;
        margin-bottom: 20px;
      }
      p {
        font-size: 15px;
        line-height: 1.6;
        color: #cbd5e1;
        margin-top: 0;
        margin-bottom: 20px;
      }
      .meta-grid {
        text-align: left;
        background-color: rgba(15, 23, 42, 0.4);
        border-radius: 12px;
        padding: 20px;
        margin-bottom: 25px;
        border: 1px solid rgba(255,255,255,0.04);
      }
      .meta-item {
        margin-bottom: 12px;
      }
      .meta-item:last-child {
        margin-bottom: 0;
      }
      .meta-label {
        font-size: 11px;
        font-weight: 700;
        color: #94a3b8;
        text-transform: uppercase;
        letter-spacing: 1px;
        display: block;
        margin-bottom: 2px;
      }
      .meta-value {
        font-size: 14px;
        color: #f1f5f9;
        font-weight: 500;
      }
      .btn {
        display: inline-block;
        background: linear-gradient(135deg, ${primaryColor}, #059669);
        color: white !important;
        text-decoration: none;
        padding: 14px 30px;
        border-radius: 12px;
        font-weight: 700;
        font-size: 15px;
        box-shadow: 0 4px 14px 0 rgba(16, 185, 129, 0.4);
        margin-bottom: 15px;
      }
      .footer {
        text-align: center;
        margin-top: 30px;
        font-size: 12px;
        color: #64748b;
      }
      .footer a {
        color: ${primaryColor};
        text-decoration: none;
      }
    </style>
  </head>
  <body>
    <div class="container">
      <div class="logo">
        <div class="logo-icon">🌱</div>
        <div class="logo-text">GrowOS</div>
      </div>
      
      <div class="card">
        <span class="archetype-emoji">${traits.emoji}</span>
        <h1>${traits.emoji} ${archetypeName}</h1>
        <div class="subtitle">${traits.title}</div>
        
        <p>Hey ${name},</p>
        <p>Here are your Growth DNA archetype results! Over the next 7 days, we'll send you custom daily micro-actions to optimize your operating system for your primary focus area: <strong>${primaryGoal}</strong>.</p>
        
        <div class="meta-grid">
          <div class="meta-item">
            <span class="meta-label">Your Superpowers</span>
            <span class="meta-value">${traits.strengths}</span>
          </div>
          <div class="meta-item">
            <span class="meta-label">Growth Focus Areas</span>
            <span class="meta-value">${traits.growth}</span>
          </div>
        </div>
        
        <a href="https://grow-plan.gearuptogrow.com" class="btn">Open Your GrowOS Dashboard</a>
        <p style="font-size: 12px; color: #64748b; margin-bottom: 0;">You've been subscribed to the 7-Day Growth Academy sequence. You can unsubscribe anytime by clicking the link in our footer.</p>
      </div>
      
      <div class="footer">
        <p>© 2026 GrowOS. Powered by <a href="https://gearuptogrow.com">gearuptogrow.com</a></p>
        <p>If you wish to opt-out, you can <a href="#">unsubscribe here</a> at any time.</p>
      </div>
    </div>
  </body>
  </html>
  `;
}

serve(async (req) => {
  // Handle CORS options
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const resendApiKey = Deno.env.get("RESEND_API_KEY");
    if (!resendApiKey) {
      console.warn("[SEND-ACADEMY-EMAIL] RESEND_API_KEY is not set. Simulating success in development mode.");
      return new Response(
        JSON.stringify({ success: true, message: "Development simulation: email logged to console.", testMode: true }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 200 }
      );
    }

    const { email, name, archetypeId, archetypeName, primaryGoal }: EmailPayload = await req.json();

    if (!email) {
      return new Response(JSON.stringify({ error: "Email is required" }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 400,
      });
    }

    // Call Resend API to deliver the transactional welcome email
    const response = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${resendApiKey}`,
      },
      body: JSON.stringify({
        from: "GrowOS Academy <academy@gearuptogrow.com>",
        to: [email],
        subject: `🧬 Your ${archetypeName} Growth Blueprint is ready inside...`,
        html: generateHtmlEmail(name, archetypeId, archetypeName, primaryGoal),
      }),
    });

    const resData = await response.json();

    if (!response.ok) {
      console.error("[SEND-ACADEMY-EMAIL] Resend error response:", resData);
      throw new Error(resData.message || "Failed to send email via Resend");
    }

    return new Response(JSON.stringify({ success: true, message: "Email sent successfully", data: resData }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });
  } catch (error) {
    const msg = error instanceof Error ? error.message : String(error);
    console.error("[SEND-ACADEMY-EMAIL] Error sending email:", msg);
    return new Response(JSON.stringify({ error: msg }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});
