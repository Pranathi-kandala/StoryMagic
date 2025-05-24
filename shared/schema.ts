import { pgTable, text, serial, integer, boolean, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
});

export const stories = pgTable("stories", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  content: text("content").notNull(),
  character: text("character").notNull(),
  storyType: text("story_type").notNull(),
  userPrompt: text("user_prompt"),
  imageUrl: text("image_url"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  isSaved: boolean("is_saved").default(false),
});

export const parentalSettings = pgTable("parental_settings", {
  id: serial("id").primaryKey(),
  ageGroup: text("age_group").notNull().default("6-8 years"),
  dailyTimeLimit: integer("daily_time_limit").default(60), // minutes
  storiesPerDay: integer("stories_per_day").default(5),
  allowedThemes: text("allowed_themes").array().default(['fairy-tale', 'adventure', 'friendship', 'animals']),
});

export const insertUserSchema = createInsertSchema(users).omit({
  id: true,
});

export const insertStorySchema = createInsertSchema(stories).omit({
  id: true,
  createdAt: true,
});

export const insertParentalSettingsSchema = createInsertSchema(parentalSettings).omit({
  id: true,
});

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;

export type InsertStory = z.infer<typeof insertStorySchema>;
export type Story = typeof stories.$inferSelect;

export type InsertParentalSettings = z.infer<typeof insertParentalSettingsSchema>;
export type ParentalSettings = typeof parentalSettings.$inferSelect;
