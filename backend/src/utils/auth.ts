import type { Context } from "hono";
import { getAuth } from "@hono/clerk-auth";
import { HTTPException } from "hono/http-exception";
import { ErrorCodes, errorResponse } from "./response";

export function getUserId(c: Context): string | null {
  const auth = getAuth(c);
  return auth?.userId ?? null;
}

export function requireUserId(c: Context): string {
  const userId = getUserId(c);
  if (!userId) {
    const body = errorResponse(ErrorCodes.UNAUTHORIZED, "Unauthorized");
    throw new HTTPException(401, {
      message: "Unauthorized",
      res: new Response(JSON.stringify(body), {
        status: 401,
        headers: { "Content-Type": "application/json" },
      }),
    });
  }
  return userId;
}
