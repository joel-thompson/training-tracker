import { getEnvRequired } from "@/utils/env";

type FetchOptions = RequestInit & {
  token?: string | null;
};

export async function api(path: string, options: FetchOptions = {}) {
  const { token, headers, ...rest } = options;

  const baseURL = getEnvRequired("VITE_API_URL");

  return fetch(`${baseURL}${path}`, {
    ...rest,
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...headers,
    },
  });
}
