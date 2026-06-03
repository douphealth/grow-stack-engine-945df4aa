import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@18.5.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

// Price IDs from Stripe
const PRICES = {
  pro: "price_1TJZj2GCqwm95OGXeBzIBCXQ",           // $7.99 GrowOS PRO
  audioPack: "price_1TJZmhGCqwm95OGXgZZXD9Ug",      // $4.99 Audio Pack
  blueprint: "price_1TJZnBGCqwm95OGXVY0pSF9P",       // $9.99 Blueprint
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const stripeKey = Deno.env.get("STRIPE_SECRET_KEY");
    if (!stripeKey) throw new Error("STRIPE_SECRET_KEY is not set");

    const { includeBump1, includeBump2, email } = await req.json();

    const stripe = new Stripe(stripeKey, { apiVersion: "2025-08-27.basil" });

    // Build line items
    const lineItems: Stripe.Checkout.SessionCreateParams.LineItem[] = [
      { price: PRICES.pro, quantity: 1 },
    ];

    if (includeBump1) {
      lineItems.push({ price: PRICES.audioPack, quantity: 1 });
    }
    if (includeBump2) {
      lineItems.push({ price: PRICES.blueprint, quantity: 1 });
    }

    // Check for existing customer
    let customerId: string | undefined;
    if (email) {
      const customers = await stripe.customers.list({ email, limit: 1 });
      if (customers.data.length > 0) {
        customerId = customers.data[0].id;
      }
    }

    const origin = req.headers.get("origin") || "https://grow-plan.gearuptogrow.com";

    const session = await stripe.checkout.sessions.create({
      customer: customerId,
      customer_email: customerId ? undefined : email || undefined,
      line_items: lineItems,
      mode: "payment",
      success_url: `${origin}/?payment=success`,
      cancel_url: `${origin}/?payment=cancelled`,
      metadata: {
        source: "growos-app",
        bumps: JSON.stringify({ audioPack: !!includeBump1, blueprint: !!includeBump2 }),
      },
    });

    return new Response(JSON.stringify({ url: session.url }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });
  } catch (error) {
    const msg = error instanceof Error ? error.message : String(error);
    console.error("[CREATE-CHECKOUT] Error:", msg);
    return new Response(JSON.stringify({ error: msg }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});
