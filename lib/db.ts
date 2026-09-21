import "server-only";
import { Pool, type QueryResultRow } from "pg";

const connectionString = process.env.DATABASE_URL;
if (!connectionString) throw new Error("DATABASE_URL is not configured.");

const poolSize = Number.parseInt(process.env.DB_POOL_MAX || "10", 10);
const globalForDatabase = globalThis as typeof globalThis & {
  forgeworksDatabasePool?: Pool;
};

const pool = globalForDatabase.forgeworksDatabasePool ?? new Pool({
  connectionString,
  max: Number.isFinite(poolSize) && poolSize > 0 ? poolSize : 10,
  connectionTimeoutMillis: 10_000,
  idleTimeoutMillis: 30_000,
  allowExitOnIdle: false,
});

// Reuse the pool during Next.js development reloads instead of opening new
// connections for every compiled server module.
globalForDatabase.forgeworksDatabasePool = pool;

export const database = {
  async query<Row extends QueryResultRow = QueryResultRow>(query: string, parameters: unknown[] = []) {
    const result = await pool.query<Row>(query, parameters);
    return { rows: result.rows, rowCount: result.rowCount ?? 0 };
  },
};
