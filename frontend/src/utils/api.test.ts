import { describe, it, expect, vi, beforeEach } from "vitest";
import { api } from "./api";

type FetchCall = [string, RequestInit & { headers: Record<string, string> }];

const mockFetch = vi.fn<() => Promise<Response>>();
vi.stubGlobal("fetch", mockFetch);

describe("api", () => {
  beforeEach(() => {
    mockFetch.mockClear();
    mockFetch.mockResolvedValue(new Response(JSON.stringify({ success: true })));
  });

  it("constructs URL with base URL and path", async () => {
    await api("/api/v1/goals");
    const [url] = mockFetch.mock.calls[0] as unknown as FetchCall;
    expect(url).toBe("http://localhost:3000/api/v1/goals");
  });

  it("sets Content-Type header", async () => {
    await api("/api/v1/goals");
    const [, options] = mockFetch.mock.calls[0] as unknown as FetchCall;
    expect(options.headers["Content-Type"]).toBe("application/json");
  });

  it("injects Authorization header when token is provided", async () => {
    await api("/api/v1/goals", { token: "my-token" });
    const [, options] = mockFetch.mock.calls[0] as unknown as FetchCall;
    expect(options.headers.Authorization).toBe("Bearer my-token");
  });

  it("omits Authorization header when token is null", async () => {
    await api("/api/v1/goals", { token: null });
    const [, options] = mockFetch.mock.calls[0] as unknown as FetchCall;
    expect(options.headers.Authorization).toBeUndefined();
  });

  it("passes method and body through to fetch", async () => {
    await api("/api/v1/goals", {
      method: "POST",
      body: JSON.stringify({ goalText: "test" }),
    });
    const [, options] = mockFetch.mock.calls[0] as unknown as FetchCall;
    expect(options.method).toBe("POST");
    expect(options.body).toBe(JSON.stringify({ goalText: "test" }));
  });
});
