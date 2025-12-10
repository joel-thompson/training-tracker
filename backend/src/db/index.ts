import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import * as schema from "./schema";
import { getEnvRequired } from "../utils/env";

const client = postgres(getEnvRequired("DATABASE_URL"));

export const db = drizzle(client, { schema });
