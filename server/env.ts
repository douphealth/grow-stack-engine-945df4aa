/** Minimal binding types so the Functions compile without @cloudflare/workers-types. */

export interface D1Result<T = Record<string, unknown>> { results: T[] }
export interface D1PreparedStatement {
  bind(...values: unknown[]): D1PreparedStatement;
  first<T = Record<string, unknown>>(): Promise<T | null>;
  all<T = Record<string, unknown>>(): Promise<D1Result<T>>;
  run(): Promise<unknown>;
}
export interface D1Database {
  prepare(sql: string): D1PreparedStatement;
  batch(statements: D1PreparedStatement[]): Promise<unknown[]>;
}
export interface R2ObjectBody { body: ReadableStream; httpMetadata?: { contentType?: string }; size: number }
export interface R2Bucket {
  head(key: string): Promise<{ size: number } | null>;
  get(key: string): Promise<R2ObjectBody | null>;
}

export interface Env {
  /** D1 database holding licenses, purchases and daily event counts. */
  DB?: D1Database;
  /** Optional R2 bucket with the add-on files. An add-on is only sold when its file exists. */
  ADDON_FILES?: R2Bucket;
  /** HMAC secret for license tokens and restore links (32+ random bytes). */
  LICENSE_SECRET?: string;
  /** Restricted Stripe key: Checkout Sessions read (and Charges read for refunds). */
  STRIPE_SECRET_KEY?: string;
  /** Signing secret of the Stripe webhook endpoint (whsec_…). */
  STRIPE_WEBHOOK_SECRET?: string;
  /** Override for tests (stripe-mock or a local fake). */
  STRIPE_API_BASE?: string;
  /** Optional comma list of plink_… ids; enables the amount-only fallback for these links. */
  GROWOS_PAYMENT_LINK_IDS?: string;
  /** Brevo transactional key; enables restore-by-email and the purchase confirmation email. */
  BREVO_API_KEY?: string;
  MAIL_FROM?: string;
  /** Public origin behind the Worker proxy, e.g. https://grow-plan.gearuptogrow.com (production only). */
  APP_ORIGIN?: string;
  MAIL_API_BASE?: string;
  ADDON_AUDIO_KEY?: string;
  ADDON_BLUEPRINT_KEY?: string;
}

export interface Ctx {
  request: Request;
  env: Env;
  params: Record<string, string | string[]>;
  waitUntil(p: Promise<unknown>): void;
}
