import type { Post } from "@prisma/client";
import type { PostRepository } from "../repositories/post.repository.js";
import { NotFoundError } from "../errors/app.errors.js";


/**
 * Post service orchestration.
 *
 * Responsibilities:
 * - Handle business rules for post creation.
 * - Compute slug automatically from the post title.
 * - Calculate reading time from the markdown content.
 * - Delegate database persistence to PostRepository.
 *
 * Non-responsibilities:
 * - Direct HTTP transport handling or request validation.
 */
export class PostService {
  constructor(private readonly postRepository: PostRepository) {}

  async create(data: {
    authorId: string;
    title: string;
    markdownContent: string;
  }): Promise<Post> {
    /**
     * TODO: Deterministic unique slug generation to handle potential collisions
     * will be implemented in the publishing workflow.
     */
    const slug = this.slugify(data.title);
    const readingTimeMinutes = this.calculateReadingTime(data.markdownContent);

    return await this.postRepository.create({
      authorId: data.authorId,
      title: data.title,
      markdownContent: data.markdownContent,
      slug,
      readingTimeMinutes,
      status: "DRAFT",
    });
  }

  private slugify(text: string): string {
    return text
      .toString()
      .toLowerCase()
      .trim()
      .replace(/\s+/g, "-")
      .replace(/[^\w-]+/g, "")
      .replace(/--+/g, "-")
      .replace(/^-+/, "")
      .replace(/-+$/, "");
  }


  private calculateReadingTime(content: string): number {
    /**
     * TODO: Future stories may improve this calculation by parsing/excluding
     * markdown syntax, links, and code blocks from the raw word count.
     */
    const words = content.trim().split(/\s+/).filter(Boolean).length;
    return Math.max(1, Math.ceil(words / 200));
  }

  async getById(postId: string, currentUserId: string): Promise<Post> {
    const post = await this.postRepository.findById(postId);
    if (!post) {
      throw new NotFoundError("Post not found");
    }

    if (post.authorId !== currentUserId) {
      throw new NotFoundError("Post not found");
    }

    return post;
  }
}

