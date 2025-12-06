import { Hono } from "hono";
import type { TestType } from "shared/types";
import { greet } from "shared/utils";
import { clerkMiddleware, getAuth } from "@hono/clerk-auth";
import { cors } from "hono/cors";

const app = new Hono();

// Health check (no auth required)
app.get("/health", (c) => {
  return c.json({
    success: true,
    data: {
      status: "healthy",
      timestamp: new Date().toISOString(),
    },
  });
});

// CORS
app.use(
  "*",
  cors({
    origin: [process.env.FRONTEND_URL ?? "http://localhost:5173"],
    allowMethods: ["GET", "POST", "PATCH", "DELETE", "OPTIONS"],
    allowHeaders: ["Content-Type", "Authorization"],
    credentials: true,
  })
);

app.use("/api/*", clerkMiddleware());

app.get("/api", (c) => {
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
