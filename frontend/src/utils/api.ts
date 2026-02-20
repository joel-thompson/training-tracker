import { getEnvWithDefault } from "@/utils/env";

type FetchOptions = RequestInit & {
  token?: string | null;
};

export async function api(path: string, options: FetchOptions = {}) {
  const { token, headers, ...rest } = options;

  const baseURL = getEnvWithDefault("VITE_API_URL", "http://localhost:3000");

  return fetch(`${baseURL}${path}`, {
    ...rest,
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...headers,
    },
  });
}
