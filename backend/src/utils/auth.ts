import type { Context } from "hono";
import { getAuth } from "@hono/clerk-auth";
import { HTTPException } from "hono/http-exception";
import { createClerkClient } from "@clerk/backend";
import { ErrorCodes, errorResponse } from "./response";
import { getEnvRequired } from "./env";

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

export async function requireAiAccess(userId: string): Promise<void> {
  const clerkClient = createClerkClient({
    secretKey: getEnvRequired("CLERK_SECRET_KEY"),
  });
  const user = await clerkClient.users.getUser(userId);

  if (user.privateMetadata?.ai !== true) {
    const body = errorResponse(
      ErrorCodes.AI_ACCESS_DENIED,
      "AI coaching is not available for your account"
    );
    throw new HTTPException(403, {
      message: "AI access denied",
      res: new Response(JSON.stringify(body), {
        status: 403,
        headers: { "Content-Type": "application/json" },
      }),
    });
  }
}
