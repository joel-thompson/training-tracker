import { envIsUndefined } from "shared/utils";

type BackendEnvKey =
  | "FRONTEND_URL" // Frontend origin for CORS (default: http://localhost:5173)
  | "CLERK_SECRET_KEY" // Clerk secret key for authentication
  | "CLERK_PUBLISHABLE_KEY" // Clerk publishable key for authentication
  | "DATABASE_URL"; // PostgreSQL connection string

export function getEnv(key: BackendEnvKey) {
  const value = process.env[key];
  if (envIsUndefined(value)) {
    return undefined;
  }

  return value;
}

export function getEnvRequired(key: BackendEnvKey) {
  const value = getEnv(key);
  if (value === undefined) {
    console.error(`Backend is missing required environment variable: ${key}`);
    throw new Error(`Backend is missing required environment variable: ${key}`);
  }
  return value;
}
