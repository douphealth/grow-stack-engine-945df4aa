import type { Entitlement } from '../shared/catalog';
import { randomId } from './crypto';
import type { D1Database } from './env';

const SCHEMA = [
  `CREATE TABLE IF NOT EXISTS licenses (
     id TEXT PRIMARY KEY,
     email TEXT NOT NULL UNIQUE,
     entitlements TEXT NOT NULL,
     status TEXT NOT NULL DEFAULT 'active',
     created_at INTEGER NOT NULL,
     updated_at INTEGER NOT NULL)`,
  `CREATE TABLE IF NOT EXISTS purchases (
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
     created_at INTEGER NOT NULL)`,
  `CREATE INDEX IF NOT EXISTS purchases_ref ON purchases(client_reference_id)`,
  `CREATE INDEX IF NOT EXISTS purchases_pi ON purchases(payment_intent)`,
  `CREATE TABLE IF NOT EXISTS restore_requests (email TEXT PRIMARY KEY, last_sent INTEGER NOT NULL)`,
  `CREATE TABLE IF NOT EXISTS event_counts (
     day TEXT NOT NULL, name TEXT NOT NULL, count INTEGER NOT NULL DEFAULT 0,
     PRIMARY KEY (day, name))`,
];

let ready: Promise<void> | null = null;
/** Idempotent schema setup, once per isolate (same SQL is in migrations/0001_licenses.sql). */
export function ensureSchema(db: D1Database): Promise<void> {
  if (!ready) {
    ready = db.batch(SCHEMA.map((s) => db.prepare(s))).then(() => undefined);
    ready.catch(() => { ready = null; });
  }
  return ready;
}
export function _resetSchemaCacheForTests() { ready = null; }

export interface License { id: string; email: string; entitlements: Entitlement[]; status: 'active' | 'revoked' }

type Row = { id: string; email: string; entitlements: string; status: string };
const toLicense = (r: Row | null): License | null =>
  r ? { id: r.id, email: r.email, entitlements: JSON.parse(r.entitlements), status: r.status as License['status'] } : null;

export async function licenseById(db: D1Database, id: string) {
  return toLicense(await db.prepare('SELECT id,email,entitlements,status FROM licenses WHERE id=?').bind(id).first<Row>());
}
export async function licenseByEmail(db: D1Database, email: string) {
  return toLicense(await db.prepare('SELECT id,email,entitlements,status FROM licenses WHERE email=?').bind(email).first<Row>());
}
export async function purchaseByRef(db: D1Database, ref: string) {
  return db.prepare('SELECT session_id, license_id FROM purchases WHERE client_reference_id=? AND refunded=0 ORDER BY created_at DESC LIMIT 1')
    .bind(ref).first<{ session_id: string; license_id: string }>();
}

const union = (a: Entitlement[], b: Entitlement[]) => [...new Set([...a, ...b])].sort() as Entitlement[];

export interface RecordInput {
  sessionId: string; email: string; entitlements: Entitlement[]; ref: string | null;
  paymentIntent: string | null; amountTotal: number | null; currency: string | null; livemode: boolean;
}

/** Store a paid session and grant its entitlements to the license for that e-mail. Idempotent. */
export async function recordPurchase(db: D1Database, p: RecordInput): Promise<{ license: License; isNew: boolean }> {
  const now = Date.now();
  let lic = await licenseByEmail(db, p.email);
  if (!lic) {
    const id = randomId('lic_');
    await db.prepare('INSERT OR IGNORE INTO licenses (id,email,entitlements,status,created_at,updated_at) VALUES (?,?,?,?,?,?)')
      .bind(id, p.email, '[]', 'revoked', now, now).run();
    lic = (await licenseByEmail(db, p.email))!;
  }
  // RETURNING makes "first writer wins" atomic when the webhook and a claim race on one session.
  const inserted = await db.prepare(`INSERT OR IGNORE INTO purchases
      (session_id,license_id,client_reference_id,payment_intent,amount_total,currency,entitlements,livemode,created_at)
      VALUES (?,?,?,?,?,?,?,?,?) RETURNING session_id`)
    .bind(p.sessionId, lic.id, p.ref, p.paymentIntent, p.amountTotal, p.currency, JSON.stringify(p.entitlements), p.livemode ? 1 : 0, now)
    .first<{ session_id: string }>();
  if (!inserted) {
    const owner = await db.prepare('SELECT license_id, refunded FROM purchases WHERE session_id=?').bind(p.sessionId).first<{ license_id: string; refunded: number }>();
    return { license: (owner && (await licenseById(db, owner.license_id))) || lic, isNew: false };
  }
  const ent = union(lic.status === 'active' ? lic.entitlements : [], p.entitlements);
  await db.prepare("UPDATE licenses SET entitlements=?, status='active', updated_at=? WHERE id=?").bind(JSON.stringify(ent), now, lic.id).run();
  return { license: { ...lic, entitlements: ent, status: 'active' }, isNew: true };
}

/** Full refund: drop that purchase and recompute the license from what is left. */
export async function refundPurchase(db: D1Database, paymentIntent: string): Promise<License | null> {
  const row = await db.prepare('SELECT license_id FROM purchases WHERE payment_intent=?').bind(paymentIntent).first<{ license_id: string }>();
  if (!row) return null;
  await db.prepare('UPDATE purchases SET refunded=1 WHERE payment_intent=?').bind(paymentIntent).run();
  const rest = await db.prepare('SELECT entitlements FROM purchases WHERE license_id=? AND refunded=0').bind(row.license_id).all<{ entitlements: string }>();
  const ent = rest.results.reduce<Entitlement[]>((acc, r) => union(acc, JSON.parse(r.entitlements)), []);
  const status = ent.length ? 'active' : 'revoked';
  await db.prepare('UPDATE licenses SET entitlements=?, status=?, updated_at=? WHERE id=?').bind(JSON.stringify(ent), status, Date.now(), row.license_id).run();
  return licenseById(db, row.license_id);
}

export async function markEmailSent(db: D1Database, sessionId: string): Promise<boolean> {
  const row = await db.prepare('UPDATE purchases SET email_sent=1 WHERE session_id=? AND email_sent=0 RETURNING session_id')
    .bind(sessionId).first<{ session_id: string }>();
  return Boolean(row);
}

/** True when a restore e-mail may be sent now (at most one per address every 2 minutes). */
export async function allowRestoreEmail(db: D1Database, email: string): Promise<boolean> {
  const now = Date.now();
  const row = await db.prepare('SELECT last_sent FROM restore_requests WHERE email=?').bind(email).first<{ last_sent: number }>();
  if (row && now - row.last_sent < 120_000) return false;
  await db.prepare('INSERT INTO restore_requests (email,last_sent) VALUES (?,?) ON CONFLICT(email) DO UPDATE SET last_sent=excluded.last_sent').bind(email, now).run();
  return true;
}

export async function countEvent(db: D1Database, name: string): Promise<void> {
  const day = new Date().toISOString().slice(0, 10);
  await db.prepare('INSERT INTO event_counts (day,name,count) VALUES (?,?,1) ON CONFLICT(day,name) DO UPDATE SET count=count+1').bind(day, name).run();
}
