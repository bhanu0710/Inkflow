import { z } from "zod";
import type { ValidationSchema } from "../../types/index.js";

/**
 * Validation schema for deleting a post.
 *
 * Responsibilities:
 * - Validate postId parameter format (must be a valid UUID).
 */
export const deletePostSchema: ValidationSchema = {
  params: z.object({
    postId: z
      .string({ required_error: "Post ID is required" })
      .uuid("Invalid post ID format"),
  }),
};
