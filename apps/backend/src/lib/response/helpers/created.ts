import type { ApiResponse } from "../types/index.js";

/**
 * Builds a standard created response envelope.
 *
 * Responsibilities:
 * - Construct created success payload object structure.
 *
 * Non-responsibilities:
 * - Managing HTTP transport or setting status codes.
 */
export const created = <T>(data: T, meta?: unknown): ApiResponse<T> => {
  const payload: ApiResponse<T> = {
    success: true,
    data,
  };
  if (meta !== undefined) {
    payload.meta = meta;
  }
  return payload;
};
