import { z } from "zod";
import type { ValidationSchema } from "../../types/index.js";

/**
 * Validation schema for publishing a post.
 *
 * Responsibilities:
 * - Validate postId path parameter format.
 */
export const publishPostSchema: ValidationSchema = {
  params: z.object({
    postId: z
      .string({ required_error: "Post ID is required" })
      .uuid("Invalid post ID format"),
  }),
};
