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
import type { Session } from "shared/types";

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
        type: "success" | "problem" | "question";
        content: string;
        order: number;
      }[] = [];

      if (items.success) {
        items.success.forEach((content, index) => {
          itemsToInsert.push({
            sessionId: session.id,
            type: "success",
            content,
            order: index,
          });
        });
      }

      if (items.problem) {
        items.problem.forEach((content, index) => {
          itemsToInsert.push({
            sessionId: session.id,
            type: "problem",
            content,
            order: index,
          });
        });
      }

      if (items.question) {
        items.question.forEach((content, index) => {
          itemsToInsert.push({
            sessionId: session.id,
            type: "question",
            content,
            order: index,
          });
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

  const responseData: Session = {
    id: result.session.id,
    userId: result.session.userId,
    sessionDate: result.session.sessionDate,
    classType: result.session.classType,
    techniqueCovered: result.session.techniqueCovered,
    generalNotes: result.session.generalNotes,
    createdAt: result.session.createdAt.toISOString(),
    updatedAt: result.session.updatedAt.toISOString(),
    items: result.items.map((item) => ({
      id: item.id,
      sessionId: item.sessionId,
      type: item.type,
      content: item.content,
      order: item.order,
      createdAt: item.createdAt.toISOString(),
    })),
  };

  return c.json(successResponse(responseData), 201);
};
