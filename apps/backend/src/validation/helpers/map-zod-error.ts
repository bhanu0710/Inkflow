import type { z } from "zod";
import type { ValidationErrorItem } from "../../errors/app.errors.js";

/**
 * Helper to map ZodErrors into structured Validation Error details.
 *
 * Responsibilities:
 * - Parse ZodError details into transport-agnostic schema violations.
 *
 * Non-responsibilities:
 * - Throwing errors or generating HTTP responses.
 */
export const mapZodError = (error: z.ZodError): ValidationErrorItem[] => {
  return error.errors.map((err) => ({
    field: err.path.join("."),
    message: err.message,
  }));
};
