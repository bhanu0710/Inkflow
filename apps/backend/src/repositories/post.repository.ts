import type { PrismaClient, Post, PostStatus, Prisma, PostTag } from "@prisma/client";
import type { TransactionContext } from "./transaction-context.js";
import { PrismaTransactionContext } from "./transaction-context.js";
import { mapPrismaError } from "../errors/repository.errors.js";

export type PostWithRelations = Post & {
  tags?: { tag: { id: string; name: string } }[];
  author?: { id: string; username: string; displayName: string };
};

export class PostRepository {
  constructor(private readonly prisma: PrismaClient) {}

  private getClient(tx?: TransactionContext) {
    if (tx instanceof PrismaTransactionContext) {
      return tx.txClient;
    }
    return this.prisma;
  }

  async create(
    data: {
      authorId: string;
      title: string;
      slug: string;
      markdownContent: string;
      status?: PostStatus;
      readingTimeMinutes: number;
      publishedAt?: Date | null;
    },
    tx?: TransactionContext
  ): Promise<Post> {
    try {
      return await this.getClient(tx).post.create({
        data,
      });
    } catch (error) {
      throw mapPrismaError(error, "Post");
    }
  }

  async findById(id: string, tx?: TransactionContext): Promise<PostWithRelations | null> {
    try {
      return await this.getClient(tx).post.findUnique({
        where: { id },
        include: {
          tags: {
            select: {
              tag: {
                select: {
                  id: true,
                  name: true,
                },
              },
            },
          },
          author: {
            select: {
              id: true,
              username: true,
              displayName: true,
            },
          },
        },
      });
    } catch (error) {
      throw mapPrismaError(error, "Post");
    }
  }

  async findBySlug(slug: string, tx?: TransactionContext): Promise<PostWithRelations | null> {
    try {
      return await this.getClient(tx).post.findUnique({
        where: { slug },
        include: {
          tags: {
            select: {
              tag: {
                select: {
                  id: true,
                  name: true,
                },
              },
            },
          },
          author: {
            select: {
              id: true,
              username: true,
              displayName: true,
            },
          },
        },
      });
    } catch (error) {
      throw mapPrismaError(error, "Post");
    }
  }

  async update(
    id: string,
    data: {
      title?: string;
      markdownContent?: string;
      status?: PostStatus;
      readingTimeMinutes?: number;
      publishedAt?: Date | null;
    },
    tx?: TransactionContext
  ): Promise<Post> {
    try {
      return await this.getClient(tx).post.update({
        where: { id },
        data,
      });
    } catch (error) {
      throw mapPrismaError(error, "Post");
    }
  }

  async publish(
    id: string,
    data: {
      status: PostStatus;
      publishedAt: Date;
    },
    tx?: TransactionContext
  ): Promise<Post> {
    try {
      return await this.getClient(tx).post.update({
        where: { id },
        data,
      });
    } catch (error) {
      throw mapPrismaError(error, "Post");
    }
  }

  async findByAuthor(
    authorId: string,
    pagination: { limit: number; offset: number },
    tx?: TransactionContext
  ): Promise<{ items: Post[]; total: number }> {
    try {
      const client = this.getClient(tx);
      const [items, total] = await Promise.all([
        client.post.findMany({
          where: { authorId },
          take: pagination.limit,
          skip: pagination.offset,
          orderBy: {
            createdAt: "desc",
          },
        }),
        client.post.count({
          where: { authorId },
        }),
      ]);
      return { items, total };
    } catch (error) {
      throw mapPrismaError(error, "Post");
    }
  }

  async deleteById(id: string, tx?: TransactionContext): Promise<Post> {

    try {
      return await this.getClient(tx).post.delete({ where: { id } });
    } catch (error) {
      throw mapPrismaError(error, "Post");
    }
  }

  async deleteManyByAuthorId(authorId: string, tx?: TransactionContext): Promise<Prisma.BatchPayload> {
    try {
      return await this.getClient(tx).post.deleteMany({
        where: { authorId },
      });
    } catch (error) {
      throw mapPrismaError(error, "Post");
    }
  }

  async findAll(
    options: {
      authorId?: string;
      status?: PostStatus;
      tagId?: string;
      limit?: number;
      offset?: number;
    } = {},
    tx?: TransactionContext
  ): Promise<PostWithRelations[]> {
    try {
      const { authorId, status, tagId, limit, offset } = options;

      const where: Prisma.PostWhereInput = {};
      if (authorId) where.authorId = authorId;
      if (status) where.status = status;
      if (tagId) {
        where.tags = {
          some: {
            tagId,
          },
        };
      }

      return await this.getClient(tx).post.findMany({
        where,
        take: limit,
        skip: offset,
        orderBy: {
          createdAt: "desc",
        },
        include: {
          tags: {
            select: {
              tag: {
                select: {
                  id: true,
                  name: true,
                },
              },
            },
          },
          author: {
            select: {
              id: true,
              username: true,
              displayName: true,
            },
          },
        },
      });
    } catch (error) {
      throw mapPrismaError(error, "Post");
    }
  }

  // Raw persistence adapters for relation entity without orchestration
  async addTag(postId: string, tagId: string, tx?: TransactionContext): Promise<PostTag> {
    try {
      return await this.getClient(tx).postTag.create({
        data: { postId, tagId },
      });
    } catch (error) {
      throw mapPrismaError(error, "PostTag");
    }
  }

  async removeTag(postId: string, tagId: string, tx?: TransactionContext): Promise<PostTag> {
    try {
      return await this.getClient(tx).postTag.delete({
        where: {
          postId_tagId: { postId, tagId },
        },
      });
    } catch (error) {
      throw mapPrismaError(error, "PostTag");
    }
  }

  async deleteTagsByPostId(postId: string, tx?: TransactionContext): Promise<Prisma.BatchPayload> {
    try {
      return await this.getClient(tx).postTag.deleteMany({
        where: { postId },
      });
    } catch (error) {
      throw mapPrismaError(error, "PostTag");
    }
  }

  async deleteTagsByTagId(tagId: string, tx?: TransactionContext): Promise<Prisma.BatchPayload> {
    try {
      return await this.getClient(tx).postTag.deleteMany({
        where: { tagId },
      });
    } catch (error) {
      throw mapPrismaError(error, "PostTag");
    }
  }

  async deleteTagsByAuthorId(authorId: string, tx?: TransactionContext): Promise<Prisma.BatchPayload> {
    try {
      return await this.getClient(tx).postTag.deleteMany({
        where: {
          post: {
            authorId,
          },
        },
      });
    } catch (error) {
      throw mapPrismaError(error, "PostTag");
    }
  }
}
