import type { ApiResponse } from "../types/index.js";

/**
 * Builds a standard collection response envelope for resource arrays.
 *
 * Responsibilities:
 * - Construct success array payload object structure.
 *
 * Non-responsibilities:
 * - Managing HTTP transport or pagination.
 */
export const collection = <T>(data: T[], meta?: unknown): ApiResponse<T[]> => {
  const payload: ApiResponse<T[]> = {
    success: true,
    data,
  };
  if (meta !== undefined) {
    payload.meta = meta;
  }
  return payload;
};
