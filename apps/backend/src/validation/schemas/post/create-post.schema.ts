import { z } from "zod";
import type { ValidationSchema } from "../../types/index.js";

/**
 * Schema definition for creating a new post.
 *
 * Responsibilities:
 * - Validate title format, min/max length constraints.
 * - Validate markdownContent format.
 *
 * Non-responsibilities:
 * - Routing, authorization, or database checking.
 */
export const createPostSchema: ValidationSchema = {
  body: z
    .object({
      title: z
        .string({ required_error: "Title is required" })
        .min(1, "Title cannot be empty")
        .max(200, "Title must not exceed 200 characters"),
      markdownContent: z
        .string({ required_error: "Content is required" })
        .min(1, "Content cannot be empty"),
    }),
};
