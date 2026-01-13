import { Hono } from "hono";
import { chatHandler } from "../handlers/coach";

const coach = new Hono();

coach.post("/chat", chatHandler);

export { coach };
