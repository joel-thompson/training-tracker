import {
  pgTable,
  pgEnum,
  uuid,
  text,
  date,
  timestamp,
  integer,
  boolean,
  type AnyPgColumn,
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

export const goalCategoryEnum = pgEnum("goal_category", [
  "bottom",
  "top",
  "submission",
  "escape",
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

export const trainingGoals = pgTable("training_goals", {
  id: uuid("id").defaultRandom().primaryKey(),
  userId: text("user_id").notNull(),
  goalText: text("goal_text").notNull(),
  category: goalCategoryEnum("category"),
  notes: text("notes"),
  isActive: boolean("is_active").notNull().default(true),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  completedAt: timestamp("completed_at"),
});

export const gameItems = pgTable("game_items", {
  id: uuid("id").defaultRandom().primaryKey(),
  userId: text("user_id").notNull(),
  name: text("name").notNull(),
  notes: text("notes"),
  parentId: uuid("parent_id").references((): AnyPgColumn => gameItems.id, {
    onDelete: "cascade",
  }),
  displayOrder: integer("display_order").notNull().default(0),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const gameTransitions = pgTable("game_transitions", {
  id: uuid("id").defaultRandom().primaryKey(),
  userId: text("user_id").notNull(),
  fromItemId: uuid("from_item_id")
    .notNull()
    .references(() => gameItems.id, { onDelete: "cascade" }),
  toItemId: uuid("to_item_id")
    .notNull()
    .references(() => gameItems.id, { onDelete: "cascade" }),
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});
