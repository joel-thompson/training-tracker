import { defineConfig } from "drizzle-kit";
import { getEnvRequired } from "./src/utils/env";

export default defineConfig({
  dialect: "postgresql",
  schema: "./src/db/schema.ts",
  out: "./drizzle",
  dbCredentials: {
    url: getEnvRequired("DATABASE_URL"),
  },
});
