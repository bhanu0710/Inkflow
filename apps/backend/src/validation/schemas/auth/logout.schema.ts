import { z } from "zod";
import type { ValidationSchema } from "../../types/index.js";

/**
 * User logout request schema definition.
 *
 * Responsibilities:
 * - Define payload verification schemas for logout endpoint.
 *
 * Non-responsibilities:
 * - Request routing, controller logic, or database checks.
 */
export const logoutSchema: ValidationSchema = {
  body: z.object({
    refreshToken: z
      .string({ required_error: "Refresh token is required" })
      .min(1, "Refresh token cannot be empty"),
  }),
};
