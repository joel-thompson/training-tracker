import { Hono } from "hono";
import type { TestType } from "shared/types";
import { greet } from "shared/utils";
import { clerkMiddleware, getAuth } from "@hono/clerk-auth";
import { cors } from "hono/cors";

const app = new Hono();

app.use(
  "*",
  cors({
    origin: "http://localhost:5173", // Your React dev server URL
    credentials: true,
  })
);

app.use("*", clerkMiddleware());

app.get("/", (c) => {
  // return c.text("Hello Hono!");
  const auth = getAuth(c);
  if (!auth?.userId) {
    return c.json({ error: "Unauthorized" }, 401);
  }

  const testData: TestType = {
    message: greet("Backend"),
    timestamp: 1,
  };

  return c.json(testData);
});

export default app;
