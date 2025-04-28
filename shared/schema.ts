import { pgTable, text, serial, integer, timestamp, doublePrecision } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Users table
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  avatarColor: text("avatar_color").notNull(),
});

// Challenges table
export const challenges = pgTable("challenges", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  targetValue: doublePrecision("target_value").notNull(),
  unit: text("unit").notNull(),
  startDate: timestamp("start_date").notNull(),
  endDate: timestamp("end_date").notNull(),
  isCompleted: integer("is_completed").default(0).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Participants table (users in challenges)
export const participants = pgTable("participants", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id),
  challengeId: integer("challenge_id").notNull().references(() => challenges.id),
  currentValue: doublePrecision("current_value").default(0).notNull(),
  lastUpdated: timestamp("last_updated").defaultNow().notNull(),
});

// Progress entries table
export const progressEntries = pgTable("progress_entries", {
  id: serial("id").primaryKey(),
  participantId: integer("participant_id").notNull().references(() => participants.id),
  value: doublePrecision("value").notNull(),
  date: timestamp("date").notNull(),
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Insert schemas
export const insertUserSchema = createInsertSchema(users).omit({ id: true });
export const insertChallengeSchema = createInsertSchema(challenges).omit({ 
  id: true, 
  isCompleted: true,
  createdAt: true 
});
export const insertParticipantSchema = createInsertSchema(participants).omit({ 
  id: true, 
  currentValue: true,
  lastUpdated: true 
});
export const insertProgressEntrySchema = createInsertSchema(progressEntries).omit({ 
  id: true,
  createdAt: true 
});

// Types
export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;

export type InsertChallenge = z.infer<typeof insertChallengeSchema>;
export type Challenge = typeof challenges.$inferSelect;

export type InsertParticipant = z.infer<typeof insertParticipantSchema>;
export type Participant = typeof participants.$inferSelect;

export type InsertProgressEntry = z.infer<typeof insertProgressEntrySchema>;
export type ProgressEntry = typeof progressEntries.$inferSelect;

// Extended types for API responses
export type ChallengeWithParticipants = Challenge & {
  participants: (Participant & { user: User })[];
};
