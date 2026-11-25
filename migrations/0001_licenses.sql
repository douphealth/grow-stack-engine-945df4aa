-- GrowOS licensing schema (D1). The Functions also create these tables on first use
-- (server/db.ts ensureSchema), so applying this file is optional but recommended:
--   npx wrangler d1 execute growos-licenses --remote --file=migrations/0001_licenses.sql
CREATE TABLE IF NOT EXISTS licenses (
  id TEXT PRIMARY KEY,
  email TEXT NOT NULL UNIQUE,
  entitlements TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'active',
  created_at INTEGER NOT NULL,
  updated_at INTEGER NOT NULL
);
CREATE TABLE IF NOT EXISTS purchases (
  session_id TEXT PRIMARY KEY,
  license_id TEXT NOT NULL,
  client_reference_id TEXT,
  payment_intent TEXT,
  amount_total INTEGER,
  currency TEXT,
  entitlements TEXT NOT NULL,
  livemode INTEGER NOT NULL,
  refunded INTEGER NOT NULL DEFAULT 0,
  email_sent INTEGER NOT NULL DEFAULT 0,
  created_at INTEGER NOT NULL
);
CREATE INDEX IF NOT EXISTS purchases_ref ON purchases(client_reference_id);
CREATE INDEX IF NOT EXISTS purchases_pi ON purchases(payment_intent);
CREATE TABLE IF NOT EXISTS restore_requests (email TEXT PRIMARY KEY, last_sent INTEGER NOT NULL);
CREATE TABLE IF NOT EXISTS event_counts (
  day TEXT NOT NULL, name TEXT NOT NULL, count INTEGER NOT NULL DEFAULT 0,
  PRIMARY KEY (day, name)
);
-- Funnel report:
--   SELECT day, name, count FROM event_counts ORDER BY day DESC, name;
