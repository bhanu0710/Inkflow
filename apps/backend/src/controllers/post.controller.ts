import type { Request, Response, NextFunction } from "express";
import type { PostService } from "../services/post.service.js";
import { created, ok, paginated, noContent } from "../lib/response/index.js";
import { AuthenticationError } from "../errors/app.errors.js";


/**
 * Controller mapping HTTP request contexts for the Post domain.
 *
 * Responsibilities:
 * - Map HTTP body inputs to the service parameters.
 * - Call service logic.
 * - Delegate formatted payload generation and HTTP responses.
 *
 * Non-responsibilities:
 * - Direct database queries, authorization checks, or business logic.
 */
export class PostController {
  constructor(private readonly postService: PostService) {}

  create = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const authorId = req.user?.id;
      if (!authorId) {
        throw new AuthenticationError("Authentication required");
      }

      const { title, markdownContent } = req.body as {
        title: string;
        markdownContent: string;
      };

      const createdPost = await this.postService.create({
        authorId,
        title,
        markdownContent,
      });

      const responsePayload = created(createdPost);
      res.status(201).json(responsePayload);
    } catch (error) {
      next(error);
    }
  };

  getById = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const currentUserId = req.user?.id;
      if (!currentUserId) {
        throw new AuthenticationError("Authentication required");
      }

      const { postId } = req.params as { postId: string };

      const post = await this.postService.getById(postId, currentUserId);

      const responsePayload = ok(post);
      res.status(200).json(responsePayload);
    } catch (error) {
      next(error);
    }
  };

  update = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const currentUserId = req.user?.id;
      if (!currentUserId) {
        throw new AuthenticationError("Authentication required");
      }

      const { postId } = req.params as { postId: string };
      const { title, markdownContent } = req.body as {
        title?: string;
        markdownContent?: string;
      };

      const updatedPost = await this.postService.update(postId, currentUserId, {
        title,
        markdownContent,
      });

      const responsePayload = ok(updatedPost);
      res.status(200).json(responsePayload);
    } catch (error) {
      next(error);
    }
  };

  publish = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const currentUserId = req.user?.id;
      if (!currentUserId) {
        throw new AuthenticationError("Authentication required");
      }

      const { postId } = req.params as { postId: string };

      const publishedPost = await this.postService.publish(postId, currentUserId);

      const responsePayload = ok(publishedPost);
      res.status(200).json(responsePayload);
    } catch (error) {
      next(error);
    }
  };

  list = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const currentUserId = req.user?.id;
      if (!currentUserId) {
        throw new AuthenticationError("Authentication required");
      }

      const { page, limit } = req.query as { page?: number; limit?: number };

      const parsedPage = Number(page) || 1;
      const parsedLimit = Number(limit) || 20;

      const result = await this.postService.listByAuthor(currentUserId, {
        page: parsedPage,
        limit: parsedLimit,
      });

      const responsePayload = paginated(
        result.items,
        {
          nextCursor: null,
          previousCursor: null,
          hasNextPage: parsedPage < result.totalPages,
          hasPreviousPage: parsedPage > 1,
          totalCount: result.total,
        },
        {
          page: result.page,
          limit: result.limit,
          totalPages: result.totalPages,
        }
      );

      res.status(200).json(responsePayload);
    } catch (error) {
      next(error);
    }
  };

  delete = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const currentUserId = req.user?.id;
      if (!currentUserId) {
        throw new AuthenticationError("Authentication required");
      }

      const { postId } = req.params as { postId: string };

      await this.postService.delete(postId, currentUserId);

      noContent();
      res.status(204).end();
    } catch (error) {
      next(error);
    }
  };

  getPublic = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { slug } = req.params as { slug: string };

      const post = await this.postService.getPublishedBySlug(slug);

      const responsePayload = ok(post);
      res.status(200).json(responsePayload);
    } catch (error) {
      next(error);
    }
  };
}





