import { z } from "zod";
import type { ValidationSchema } from "../../types/index.js";

/**
 * User login request schema definition.
 *
 * Responsibilities:
 * - Define payload verification schemas for login endpoint.
 *
 * Non-responsibilities:
 * - Request routing, controller logic, or database checks.
 */
export const loginSchema: ValidationSchema = {
  body: z.object({
    email: z
      .string({ required_error: "Email is required" })
      .email("Invalid email format")
      .max(320, "Email must not exceed 320 characters"),
    password: z
      .string({ required_error: "Password is required" })
      .min(8, "Password must be at least 8 characters")
      .max(100, "Password must not exceed 100 characters"),
  }),
};
