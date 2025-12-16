import { Hono } from "hono";
import {
  createSessionHandler,
  listSessionsHandler,
  getSessionDatesHandler,
  getSessionHandler,
  updateSessionHandler,
  deleteSessionHandler,
  restoreSessionHandler,
  addSessionItemHandler,
  updateSessionItemHandler,
  deleteSessionItemHandler,
} from "../handlers/sessions";

const sessions = new Hono();

// Session CRUD
sessions.post("/", createSessionHandler);
sessions.get("/", listSessionsHandler);
sessions.get("/dates", getSessionDatesHandler);
sessions.get("/:id", getSessionHandler);
sessions.patch("/:id", updateSessionHandler);
sessions.delete("/:id", deleteSessionHandler);
sessions.post("/:id/restore", restoreSessionHandler);

// Session items
sessions.post("/:id/items", addSessionItemHandler);
sessions.patch("/:id/items/:itemId", updateSessionItemHandler);
sessions.delete("/:id/items/:itemId", deleteSessionItemHandler);

export { sessions };

