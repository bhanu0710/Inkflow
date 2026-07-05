import { z } from "zod";
import type { ValidationSchema } from "../../types/index.js";

/**
 * Validation schema for retrieving a single post by ID.
 *
 * Responsibilities:
 * - Validate postId path parameter format using UUID constraints.
 */
export const getPostSchema: ValidationSchema = {
  params: z.object({
    postId: z
      .string({ required_error: "Post ID is required" })
      .uuid("Invalid post ID format"),
  }),
};
