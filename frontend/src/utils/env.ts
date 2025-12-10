import { envIsUndefined } from "shared/utils";

type FrontendEnvKey =
  | "VITE_API_URL" // API URL (default: http://localhost:3000)
  | "VITE_CLERK_PUBLISHABLE_KEY"; // Clerk publishable key for authentication

export function getEnv(key: FrontendEnvKey) {
  const value = import.meta.env[key] as string | undefined;
  if (envIsUndefined(value)) {
    return undefined;
  }
  return value;
}

export function getEnvRequired(key: FrontendEnvKey) {
  const value = getEnv(key);
  if (value === undefined) {
    console.error(`Frontend is missing required environment variable: ${key}`);
    throw new Error(
      `Frontend is missing required environment variable: ${key}`
    );
  }
  return value;
}
