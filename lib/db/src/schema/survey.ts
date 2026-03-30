import { pgTable, serial, text, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const surveyResponsesTable = pgTable("survey_responses", {
  id: serial("id").primaryKey(),
  favorite_artist: text("favorite_artist").notNull(),
  genre: text("genre").notNull(),
  college_year: text("college_year").notNull(),
  platforms: text("platforms").notNull(),
  other_platform: text("other_platform"),
  created_at: timestamp("created_at").defaultNow().notNull(),
});

export const insertSurveyResponseSchema = createInsertSchema(surveyResponsesTable).omit({ id: true, created_at: true });
export type InsertSurveyResponse = z.infer<typeof insertSurveyResponseSchema>;
export type SurveyResponse = typeof surveyResponsesTable.$inferSelect;
