import { pgTable, integer, text } from "drizzle-orm/pg-core";

export const testTable = pgTable("test_table", {
  id: integer("id").primaryKey().generatedByDefaultAsIdentity(),
  name: text("name").notNull(),
});
