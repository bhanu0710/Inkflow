import type { ApiResponse } from "../types/index.js";

/**
 * Builds a standard success response envelope for a single resource.
 *
 * Responsibilities:
 * - Construct success payload object structure.
 *
 * Non-responsibilities:
 * - Managing HTTP transport or writing to HTTP response streams.
 */
export const ok = <T>(data: T, meta?: unknown): ApiResponse<T> => {
  const payload: ApiResponse<T> = {
    success: true,
    data,
  };
  if (meta !== undefined) {
    payload.meta = meta;
  }
  return payload;
};
