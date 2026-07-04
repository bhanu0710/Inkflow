import type { z } from "zod";

/**
 * ValidationSchema defines the Zod schemas for request parts.
 *
 * Responsibilities:
 * - Define types for query, params, and body validations.
 *
 * Non-responsibilities:
 * - Domain validation schema definitions.
 */
export interface ValidationSchema {
  body?: z.ZodTypeAny;
  params?: z.ZodTypeAny;
  query?: z.ZodTypeAny;
}
