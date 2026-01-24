import { pgTable, text, serial, integer, boolean, timestamp, jsonb } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";
import { users } from "./models/auth";
import { relations } from "drizzle-orm";

export * from "./models/auth";

// Core tables for the application

// Track the global state of the artwork
export const globalState = pgTable("global_state", {
  id: serial("id").primaryKey(),
  totalUsers: integer("total_users").default(0).notNull(),
  lastRenderedAt: timestamp("last_rendered_at").defaultNow(),
  currentDigitIndex: integer("current_digit_index").default(0).notNull(), // How many digits unlocked
});

// Link users to their specific digit
export const userPiStates = pgTable("user_pi_states", {
  id: serial("id").primaryKey(),
  userId: text("user_id").notNull().unique(), // Foreign key to auth users
  digitIndex: integer("digit_index").notNull().unique(), // Which position in Pi (0, 1, 2...)
  digitValue: integer("digit_value").notNull(), // The actual digit (3, 1, 4...)
  assignedAt: timestamp("assigned_at").defaultNow(),
});

// Although we store digits in a file, we might want a cache or lookup table if needed
// But for now, we'll rely on the file and user_pi_states.

export const userPiStatesRelations = relations(userPiStates, ({ one }) => ({
  user: one(users, {
    fields: [userPiStates.userId],
    references: [users.id],
  }),
}));

export const usersRelations = relations(users, ({ one }) => ({
  piState: one(userPiStates, {
    fields: [users.id],
    references: [userPiStates.userId],
  }),
}));

// Schemas
export const insertUserPiStateSchema = createInsertSchema(userPiStates);
export const insertGlobalStateSchema = createInsertSchema(globalState);

// Types
export type UserPiState = typeof userPiStates.$inferSelect;
export type GlobalState = typeof globalState.$inferSelect;

// API Contract Types

export interface PiStateResponse {
  totalUsers: number;
  lastRenderedAt: string | null;
  currentDigitIndex: number;
}

export interface UserDigitResponse {
  digitIndex: number;
  digitValue: number;
  assignedAt: string;
}

export interface WallpaperUrls {
  latest: string; // URL to the latest generated wallpaper
  resolutions: {
    "1170x2532": string;
    "1290x2796": string;
    "1125x2436": string;
    "750x1334": string;
  };
}
