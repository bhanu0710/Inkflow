/**
 * API Response contract definitions.
 *
 * Responsibilities:
 * - Define standard JSON response envelope interfaces.
 * - Define pagination metadata interfaces.
 *
 * Non-responsibilities:
 * - Direct HTTP transport handling.
 * - HTTP status code mappings.
 */

export interface ApiResponse<T = unknown, M = unknown> {
  success: boolean;
  data: T;
  meta?: M;
}

export interface PaginationMeta {
  nextCursor: string | null;
  previousCursor: string | null;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
  totalCount?: number;
}
