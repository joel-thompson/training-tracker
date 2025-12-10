import type { Context } from "hono";
import { getAuth } from "@hono/clerk-auth";
import { db } from "../db";
import { testTable } from "../db/schema";

export const dbTestHandler = async (c: Context) => {
  const auth = getAuth(c);
  if (!auth?.userId) {
    return c.json({ error: "Unauthorized" }, 401);
  }
  const testData = await db.select().from(testTable);
  return c.json(testData);
};
