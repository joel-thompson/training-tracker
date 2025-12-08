export function getEnv(key: string): string | undefined {
  return import.meta.env[key] as string | undefined;
}

export function getEnvRequired(key: string): string {
  const value = getEnv(key);
  if (!value) {
    throw new Error(`Missing required environment variable: ${key}`);
  }
  return value;
}
