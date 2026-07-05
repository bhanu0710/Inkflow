import { z } from "zod";
import type { ValidationSchema } from "../../types/index.js";

/**
 * Validation schema for listing user posts with pagination.
 *
 * Query parameters validated:
 * - page: optional integer (coerced, >= 1, defaults to 1).
 * - limit: optional integer (coerced, 1 to 100, defaults to 20).
 */
export const listPostsSchema: ValidationSchema = {
  query: z.object({
    page: z.coerce
      .number()
      .int("Page must be an integer")
      .min(1, "Page must be at least 1")
      .default(1),
    limit: z.coerce
      .number()
      .int("Limit must be an integer")
      .min(1, "Limit must be at least 1")
      .max(100, "Limit must not exceed 100")
      .default(20),
  }),
};
