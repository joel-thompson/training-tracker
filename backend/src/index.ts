import { Hono } from "hono";
import { clerkMiddleware } from "@hono/clerk-auth";
import { cors } from "hono/cors";
import { healthHandler } from "./handlers/health";
import { dbTestHandler } from "./handlers/dbTest";
import { apiTestHandler } from "./handlers/apiTest";
import { getEnvRequired } from "./utils/env";

const app = new Hono();

// Health check (no auth required)
app.get("/health", healthHandler);

// CORS
app.use(
  "*",
  cors({
    origin: [getEnvRequired("FRONTEND_URL")],
    allowMethods: ["GET", "POST", "PATCH", "DELETE", "OPTIONS"],
    allowHeaders: ["Content-Type", "Authorization"],
    credentials: true,
  })
);

app.use("/api/*", clerkMiddleware());

app.get("/api/test", apiTestHandler);
app.get("/api/db/test", dbTestHandler);

export default app;
