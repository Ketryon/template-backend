import { pgTable, uuid, varchar, timestamp, text } from "drizzle-orm/pg-core";

// =============================================================================
// EXAMPLE SCHEMA — Replace with your own tables
// =============================================================================

/**
 * Users table
 * Stores user profiles synced from Clerk
 */
export const users = pgTable("users", {
  id: uuid("id").defaultRandom().primaryKey(),
  clerkUserId: varchar("clerk_user_id", { length: 255 }).unique().notNull(),
  email: varchar("email", { length: 255 }),
  name: varchar("name", { length: 255 }),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

/**
 * Example items table
 * Replace or extend this with your own domain models
 */
export const items = pgTable("items", {
  id: uuid("id").defaultRandom().primaryKey(),
  userId: uuid("user_id")
    .references(() => users.id, { onDelete: "cascade" })
    .notNull(),
  name: varchar("name", { length: 255 }).notNull(),
  description: text("description"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});
