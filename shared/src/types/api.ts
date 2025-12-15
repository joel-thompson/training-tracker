// API response wrapper types used by all endpoints

export interface ApiSuccessResponse<T> {
  success: true;
  data: T;
}

export interface ApiErrorResponse {
  success: false;
  error: {
    code: string;
    message: string;
  };
}

export type ApiResponse<T> = ApiSuccessResponse<T> | ApiErrorResponse;

export interface PaginationInfo {
  nextCursor: string | null;
  hasMore: boolean;
  total: number;
}
