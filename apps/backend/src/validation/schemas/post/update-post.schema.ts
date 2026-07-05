import { z } from "zod";
import type { ValidationSchema } from "../../types/index.js";

/**
 * Validation schema for updating a post.
 *
 * Responsibilities:
 * - Validate postId path parameter format.
 * - Validate optional body fields (title, markdownContent).
 * - Reject empty request bodies.
 * - Reject unknown properties.
 */
export const updatePostSchema: ValidationSchema = {
  params: z.object({
    postId: z
      .string({ required_error: "Post ID is required" })
      .uuid("Invalid post ID format"),
  }),
  body: z
    .object({
      title: z
        .string()
        .trim()
        .min(1, "Title cannot be empty")
        .max(200, "Title must not exceed 200 characters")
        .optional(),
      markdownContent: z
        .string()
        .min(1, "Content cannot be empty")
        .optional(),
    })
    .strict("Unknown properties are not allowed")
    .refine((data) => data.title !== undefined || data.markdownContent !== undefined, {
      message: "At least one field must be supplied",
    }),
};
