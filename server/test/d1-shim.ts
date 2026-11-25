// In-memory D1 stand-in for tests, backed by Node's built-in SQLite (node:sqlite, Node >= 22.5).
import { DatabaseSync } from 'node:sqlite';
import type { D1Database, D1PreparedStatement } from '../env';

export function createD1(): D1Database & { raw: DatabaseSync } {
  const raw = new DatabaseSync(':memory:');
  const prepare = (sql: string): D1PreparedStatement => {
    let args: unknown[] = [];
    const stmt: D1PreparedStatement = {
      bind: (...v: unknown[]) => { args = v.map((x) => (x === undefined ? null : x)); return stmt; },
      first: async <T,>() => (raw.prepare(sql).get(...(args as never[])) as T) ?? null,
      all: async <T,>() => ({ results: raw.prepare(sql).all(...(args as never[])) as T[] }),
      run: async () => raw.prepare(sql).run(...(args as never[])),
    };
    return stmt;
  };
  return { raw, prepare, batch: async (stmts) => Promise.all(stmts.map((s) => s.run())) };
}
