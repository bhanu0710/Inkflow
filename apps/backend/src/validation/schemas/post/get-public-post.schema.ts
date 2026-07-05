import { z } from "zod";
import type { ValidationSchema } from "../../types/index.js";

/**
 * Validation schema for retrieving a public post by slug.
 *
 * Responsibilities:
 * - Validate slug path parameter is a trimmed non-empty string.
 */
export const getPublicPostSchema: ValidationSchema = {
  params: z.object({
    slug: z
      .string({ required_error: "Slug is required" })
      .trim()
      .min(1, "Slug cannot be empty")
      .max(200, "Slug must not exceed 200 characters"),
  }),
};
