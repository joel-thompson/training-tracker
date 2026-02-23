import { describe, it, expect } from "vitest";
import { successResponse, errorResponse, ErrorCodes } from "./response";

describe("successResponse", () => {
  it("returns success shape with data", () => {
    const result = successResponse({ id: "123", name: "test" });
    expect(result).toEqual({ success: true, data: { id: "123", name: "test" } });
  });

  it("works with primitive data", () => {
    const result = successResponse(42);
    expect(result).toEqual({ success: true, data: 42 });
  });
});

describe("errorResponse", () => {
  it("returns error shape with code and message", () => {
    const result = errorResponse(ErrorCodes.VALIDATION_ERROR, "Invalid input");
    expect(result).toEqual({
      success: false,
      error: { code: "VALIDATION_ERROR", message: "Invalid input" },
    });
  });

  it("works with all ErrorCodes values", () => {
    const codes = [
      ErrorCodes.VALIDATION_ERROR,
      ErrorCodes.UNAUTHORIZED,
      ErrorCodes.NOT_FOUND,
      ErrorCodes.INTERNAL_ERROR,
    ] as const;
    for (const code of codes) {
      const result = errorResponse(code, "msg");
      expect(result.success).toBe(false);
      expect(result.error.code).toBe(code);
    }
  });
});
