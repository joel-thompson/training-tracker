export function getEnv(key: string) {
  return process.env[key];
}

export function getEnvRequired(key: string) {
  const value = getEnv(key);
  if (!value || value.length === 0 || value === "undefined") {
    throw new Error(`Backend is missing required environment variable: ${key}`);
  }
  return value;
}
