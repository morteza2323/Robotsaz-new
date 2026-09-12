import "server-only";
import { neon } from "@neondatabase/serverless";

const connectionString = process.env.DATABASE_URL;
if (!connectionString) throw new Error("DATABASE_URL is not configured.");

const sql = neon(connectionString, { fullResults: true });
let lastSuccessfulConnection = 0;
let unavailableUntil = 0;
let connectionCheck: Promise<void> | null = null;

async function ensureConnection() {
  const now = Date.now();
  if (now < unavailableUntil) throw new Error("Database is temporarily unavailable.");
  if (now - lastSuccessfulConnection < 30_000) return;
  if (!connectionCheck) {
    connectionCheck = sql.query("SELECT 1", [], {
      fetchOptions: { signal: AbortSignal.timeout(5_000) },
    }).then(() => {
      lastSuccessfulConnection = Date.now();
      unavailableUntil = 0;
    }).catch(() => {
      unavailableUntil = Date.now() + 15_000;
      throw new Error("Database is temporarily unavailable.");
    }).finally(() => {
      connectionCheck = null;
    });
  }
  await connectionCheck;
}

export const database = {
  async query<Row>(query: string, parameters: unknown[] = []) {
    await ensureConnection();
    try {
      const result = await sql.query(query, parameters, {
        fetchOptions: { signal: AbortSignal.timeout(10_000) },
      });
      lastSuccessfulConnection = Date.now();
      return result as unknown as { rows: Row[]; rowCount: number };
    } catch (error) {
      unavailableUntil = Date.now() + 15_000;
      throw error;
    }
  },
};
