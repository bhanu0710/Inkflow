import { z } from "zod";
import type { ValidationSchema } from "../../types/index.js";

/**
 * User profile update request schema definition.
 *
 * Responsibilities:
 * - Define types, formats, and lengths for updateable fields.
 * - Require at least one field to be supplied.
 *
 * Non-responsibilities:
 * - Database checks or routing.
 */
export const updateProfileSchema: ValidationSchema = {
  body: z
    .object({
      displayName: z
        .string()
        .trim()
        .min(1, "Display name must be at least 1 character")
        .max(100, "Display name must not exceed 100 characters")
        .optional(),
      username: z
        .string()
        .trim()
        .min(3, "Username must be at least 3 characters")
        .max(50, "Username must not exceed 50 characters")
        .toLowerCase()
        .regex(/^[a-z0-9_-]+$/, "Username can only contain lowercase letters, numbers, underscores, and hyphens")
        .optional(),
    })
    .refine((data) => data.displayName !== undefined || data.username !== undefined, {
      message: "At least one field must be supplied",
      path: [],
    }),
};
