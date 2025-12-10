import type { Context } from "hono";
import { getAuth } from "@hono/clerk-auth";
import type { TestType } from "shared/types";
import { greet } from "shared/utils";

export const apiTestHandler = (c: Context) => {
  const auth = getAuth(c);
  if (!auth?.userId) {
    return c.json({ error: "Unauthorized" }, 401);
  }

  const testData: TestType = {
    message: greet("Backend"),
    timestamp: 1 + Math.random(),
  };

  return c.json(testData);
};
