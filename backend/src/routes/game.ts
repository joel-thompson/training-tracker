import { Hono } from "hono";
import {
  listGameItemsHandler,
  createGameItemHandler,
  updateGameItemHandler,
  deleteGameItemHandler,
  reorderGameItemHandler,
} from "../handlers/game/items";
import {
  listGameTransitionsHandler,
  createGameTransitionHandler,
  updateGameTransitionHandler,
  deleteGameTransitionHandler,
} from "../handlers/game/transitions";

const game = new Hono();

// Game items CRUD
game.get("/items", listGameItemsHandler);
game.post("/items", createGameItemHandler);
game.patch("/items/:id", updateGameItemHandler);
game.delete("/items/:id", deleteGameItemHandler);
game.post("/items/:id/reorder", reorderGameItemHandler);

// Game transitions CRUD
game.get("/transitions", listGameTransitionsHandler);
game.post("/transitions", createGameTransitionHandler);
game.patch("/transitions/:id", updateGameTransitionHandler);
game.delete("/transitions/:id", deleteGameTransitionHandler);

export { game };
