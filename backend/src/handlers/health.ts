import type { Context } from "hono";

export const healthHandler = (c: Context) => {
  return c.json({
    success: true,
    data: {
      status: "healthy",
      timestamp: new Date().toISOString(),
    },
  });
};
