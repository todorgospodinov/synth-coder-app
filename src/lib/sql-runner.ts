/**
 * Browser-side SQL engine (SQLite compiled to WebAssembly via sql.js), CDN-loaded lazily.
 * Each run uses a fresh in-memory database; results of every statement are printed as tables.
 */
import type { RunResult } from "./python-runner";

const SQLJS = "https://cdn.jsdelivr.net/npm/sql.js@1.10.3/dist/";

type QueryExec = { columns: string[]; values: unknown[][] };
type SqlDb = { exec: (sql: string) => QueryExec[]; getRowsModified: () => number; close: () => void };
type SqlJs = { Database: new () => SqlDb };

declare global {
  interface Window {
    initSqlJs?: (o: { locateFile: (f: string) => string }) => Promise<SqlJs>;
  }
}

let sqlPromise: Promise<SqlJs> | null = null;

function load(): Promise<SqlJs> {
  sqlPromise ??= new Promise<void>((resolve, reject) => {
    if (window.initSqlJs) return resolve();
    const s = document.createElement("script");
    s.src = SQLJS + "sql-wasm.js";
    s.onload = () => resolve();
    s.onerror = () => reject(new Error("Could not load the SQL engine."));
    document.head.appendChild(s);
  }).then(() => window.initSqlJs!({ locateFile: (f) => SQLJS + f }));
  sqlPromise.catch(() => (sqlPromise = null));
  return sqlPromise;
}

function table({ columns, values }: QueryExec): string {
  const rows = values.map((r) => r.map((v) => (v === null ? "NULL" : String(v))));
  const w = columns.map((c, i) => Math.max(c.length, ...rows.map((r) => r[i]!.length)));
  const line = (cells: string[]) => "| " + cells.map((c, i) => c.padEnd(w[i]!)).join(" | ") + " |";
  const sep = "+-" + w.map((n) => "-".repeat(n)).join("-+-") + "-+";
  return [sep, line(columns), sep, ...rows.map(line), sep, `(${rows.length} row${rows.length === 1 ? "" : "s"})`].join("\n");
}

export async function runSql(code: string): Promise<RunResult> {
  const t0 = performance.now();
  const SQL = await load();
  const db = new SQL.Database();
  try {
    const results = db.exec(code);
    const stdout = results.length ? results.map(table).join("\n\n") + "\n" : `OK (${db.getRowsModified()} row(s) affected by last statement)\n`;
    return { stdout, stderr: "", ok: true, ms: Math.round(performance.now() - t0) };
  } catch (e) {
    return { stdout: "", stderr: e instanceof Error ? e.message : String(e), ok: false, ms: Math.round(performance.now() - t0) };
  } finally {
    db.close();
  }
}
