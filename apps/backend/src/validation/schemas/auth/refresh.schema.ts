import { z } from "zod";
import type { ValidationSchema } from "../../types/index.js";

/**
 * User refresh token request schema definition.
 *
 * Responsibilities:
 * - Define payload verification schemas for refresh token endpoint.
 *
 * Non-responsibilities:
 * - Request routing, controller logic, or database checks.
 */
export const refreshSchema: ValidationSchema = {
  body: z.object({
    refreshToken: z
      .string({ required_error: "Refresh token is required" })
      .min(1, "Refresh token cannot be empty"),
  }),
};
