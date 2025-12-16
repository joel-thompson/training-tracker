import {
  pgTable,
  pgEnum,
  uuid,
  text,
  date,
  timestamp,
  integer,
} from "drizzle-orm/pg-core";

export const testTable = pgTable("test_table", {
  id: integer("id").primaryKey().generatedByDefaultAsIdentity(),
  name: text("name").notNull(),
});

export const classTypeEnum = pgEnum("class_type", [
  "gi",
  "nogi",
  "open_mat",
  "private",
  "competition",
  "other",
]);

export const itemTypeEnum = pgEnum("item_type", [
  "success",
  "problem",
  "question",
]);

export const trainingSessions = pgTable("training_sessions", {
  id: uuid("id").defaultRandom().primaryKey(),
  userId: text("user_id").notNull(),
  sessionDate: date("session_date").notNull(),
  classType: classTypeEnum("class_type").notNull(),
  techniqueCovered: text("technique_covered"),
  generalNotes: text("general_notes"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
  deletedAt: timestamp("deleted_at"),
});

export const sessionItems = pgTable("session_items", {
  id: uuid("id").defaultRandom().primaryKey(),
  sessionId: uuid("session_id")
    .notNull()
    .references(() => trainingSessions.id, { onDelete: "cascade" }),
  type: itemTypeEnum("type").notNull(),
  content: text("content").notNull(),
  order: integer("order").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});
