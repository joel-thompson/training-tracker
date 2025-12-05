import { Hono } from "hono";
import type { TestType } from "shared/types";
import { greet } from "shared/utils";

const app = new Hono();

app.get("/", (c) => {
  // return c.text("Hello Hono!");
  const testData: TestType = {
    message: greet("Backend"),
    timestamp: 1,
  };

  return c.json(testData);
});

export default app;
