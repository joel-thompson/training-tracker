import type { Context } from "hono";
import { db } from "../../db";
import { trainingSessions, sessionItems } from "../../db/schema";
import { createSessionSchema } from "shared/validation";
import { requireUserId } from "../../utils/auth";
import {
  successResponse,
  errorResponse,
  ErrorCodes,
} from "../../utils/response";
import type { ItemType } from "shared/types";
import { ITEM_TYPES } from "shared/constants";
import { toSessionResponse } from "../../utils/transforms";

export const createSessionHandler = async (c: Context) => {
  const userId = requireUserId(c);
  const body: unknown = await c.req.json();
  const parsed = createSessionSchema.safeParse(body);

  if (!parsed.success) {
    return c.json(
      errorResponse(ErrorCodes.VALIDATION_ERROR, parsed.error.message),
      400
    );
  }

  const { sessionDate, classType, techniqueCovered, generalNotes, items } =
    parsed.data;

  const result = await db.transaction(async (tx) => {
    const [session] = await tx
      .insert(trainingSessions)
      .values({
        userId,
        sessionDate,
        classType,
        techniqueCovered,
        generalNotes,
      })
      .returning();

    const insertedItems: (typeof sessionItems.$inferSelect)[] = [];

    if (items) {
      const itemsToInsert: {
        sessionId: string;
        type: ItemType;
        content: string;
        order: number;
      }[] = [];

      for (const type of ITEM_TYPES) {
        items[type]?.forEach((content, index) => {
          itemsToInsert.push({ sessionId: session.id, type, content, order: index });
        });
      }

      if (itemsToInsert.length > 0) {
        const inserted = await tx
          .insert(sessionItems)
          .values(itemsToInsert)
          .returning();
        insertedItems.push(...inserted);
      }
    }

    return { session, items: insertedItems };
  });

  const responseData = toSessionResponse(result.session, result.items);

  return c.json(successResponse(responseData), 201);
};
