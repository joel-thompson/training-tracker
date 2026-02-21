import type { ApiSuccessResponse, ApiErrorResponse } from "shared/types";
export { ErrorCodes } from "shared/constants";

export function successResponse<T>(data: T): ApiSuccessResponse<T> {
  return {
    success: true,
    data,
  };
}

export function errorResponse(code: string, message: string): ApiErrorResponse {
  return {
    success: false,
    error: {
      code,
      message,
    },
  };
}

