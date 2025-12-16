import { Hono } from "hono";
import {
  createGoalHandler,
  listGoalsHandler,
  getActiveGoalsHandler,
  getGoalHandler,
  updateGoalHandler,
  completeGoalHandler,
  reactivateGoalHandler,
  deleteGoalHandler,
} from "../handlers/goals";

const goals = new Hono();

// Goal CRUD
goals.post("/", createGoalHandler);
goals.get("/", listGoalsHandler);
goals.get("/active", getActiveGoalsHandler);
goals.get("/:id", getGoalHandler);
goals.patch("/:id", updateGoalHandler);
goals.delete("/:id", deleteGoalHandler);

// Goal actions
goals.post("/:id/complete", completeGoalHandler);
goals.post("/:id/reactivate", reactivateGoalHandler);

export { goals };
