import { Hono } from "hono";
import { chatHandler, sampleFeedbackHandler } from "../handlers/coach";

const coach = new Hono();

coach.post("/chat", chatHandler);
coach.post("/sample-feedback", sampleFeedbackHandler);

export { coach };
