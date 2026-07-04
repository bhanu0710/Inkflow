import type { ApiResponse, PaginationMeta } from "../types/index.js";

/**
 * Builds a standard paginated response envelope.
 *
 * Responsibilities:
 * - Construct paginated array payload object structure incorporating cursor metadata.
 *
 * Non-responsibilities:
 * - Managing database pagination or cursor calculations.
 */
export const paginated = <T>(
  data: T[],
  paginationMeta: PaginationMeta,
  meta?: unknown
): ApiResponse<T[]> => {
  return {
    success: true,
    data,
    meta: meta !== undefined ? { ...paginationMeta, ...(meta as object) } : paginationMeta,
  };
};
