import { z } from "zod";
import type { ValidationSchema } from "../../types/index.js";

/**
 * User registration request schema definition.
 *
 * Responsibilities:
 * - Define types, formats, and lengths for registration fields.
 *
 * Non-responsibilities:
 * - Business constraints checking or database interaction.
 */
export const registerSchema: ValidationSchema = {
  body: z.object({
    email: z
      .string({ required_error: "Email is required" })
      .email("Invalid email format")
      .max(320, "Email must not exceed 320 characters"),
    username: z
      .string({ required_error: "Username is required" })
      .min(3, "Username must be at least 3 characters")
      .max(50, "Username must not exceed 50 characters")
      .toLowerCase()
      .regex(/^[a-z0-9_-]+$/, "Username can only contain lowercase letters, numbers, underscores, and hyphens"),
    displayName: z
      .string({ required_error: "Display name is required" })
      .min(1, "Display name is required")
      .max(100, "Display name must not exceed 100 characters"),
    password: z
      .string({ required_error: "Password is required" })
      .min(8, "Password must be at least 8 characters")
      .max(100, "Password must not exceed 100 characters"),
  }),
};
