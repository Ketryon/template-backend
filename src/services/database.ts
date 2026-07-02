import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import * as schema from "./schema";

// =============================================================================
// DATABASE CONNECTION
// =============================================================================

const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  console.warn(
    "DATABASE_URL not set. Database queries will fail until configured."
  );
}

const client = postgres(connectionString || "");
export const db = drizzle(client, { schema });

// =============================================================================
// QUERY HELPERS
// =============================================================================

/**
 * Get a record by ID with optional ownership check
 */
export async function getById<T>(
  table: Parameters<typeof db.select>[0] extends undefined ? never : unknown,
  id: string,
  _userId?: string
): Promise<T | null> {
  // Implement per-table queries in your routes/services
  // This is a pattern reference — customize for your schema
  void table;
  void id;
  void _userId;
  return null;
}

/**
 * Format bytes to human-readable string
 */
export function formatBytes(bytes: number): string {
  if (bytes === 0) return "0 B";
  const k = 1024;
  const sizes = ["B", "KB", "MB", "GB", "TB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
}
