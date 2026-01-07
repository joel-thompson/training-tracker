import { Hono } from "hono";
import { clerkMiddleware } from "@hono/clerk-auth";
import { cors } from "hono/cors";
import { logger } from "hono/logger";
import { secureHeaders } from "hono/secure-headers";
import { healthHandler } from "./handlers/health";
import { dbTestHandler } from "./handlers/dbTest";
import { apiTestHandler } from "./handlers/apiTest";
import { sessions } from "./routes/sessions";
import { goals } from "./routes/goals";
import { game } from "./routes/game";
import { stats } from "./routes/stats";
import { getEnvRequired } from "./utils/env";

const app = new Hono();

// Health check (no auth required, before other middleware)
app.get("/health", healthHandler);

// Middleware
app.use("*", logger());
app.use("*", secureHeaders());

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

// API v1 routes
app.route("/api/v1/sessions", sessions);
app.route("/api/v1/goals", goals);
app.route("/api/v1/game", game);
app.route("/api/v1/stats", stats);

export default app;
