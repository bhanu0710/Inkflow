import type { PrismaClient, Bookmark, Prisma, Post } from "@prisma/client";
import type { TransactionContext } from "./transaction-context.js";
import { PrismaTransactionContext } from "./transaction-context.js";
import { mapPrismaError } from "../errors/repository.errors.js";

export class BookmarkRepository {
  constructor(private readonly prisma: PrismaClient) {}

  private getClient(tx?: TransactionContext) {
    if (tx instanceof PrismaTransactionContext) {
      return tx.txClient;
    }
    return this.prisma;
  }

  async create(userId: string, postId: string, tx?: TransactionContext): Promise<Bookmark> {
    try {
      return await this.getClient(tx).bookmark.create({
        data: {
          userId,
          postId,
        },
      });
    } catch (error) {
      throw mapPrismaError(error, "Bookmark");
    }
  }

  async delete(userId: string, postId: string, tx?: TransactionContext): Promise<Bookmark> {
    try {
      return await this.getClient(tx).bookmark.delete({
        where: {
          userId_postId: {
            userId,
            postId,
          },
        },
      });
    } catch (error) {
      throw mapPrismaError(error, "Bookmark");
    }
  }

  async findById(userId: string, postId: string, tx?: TransactionContext): Promise<Bookmark | null> {
    try {
      return await this.getClient(tx).bookmark.findUnique({
        where: {
          userId_postId: {
            userId,
            postId,
          },
        },
      });
    } catch (error) {
      throw mapPrismaError(error, "Bookmark");
    }
  }

  async findAllByUserId(
    userId: string,
    options: { limit?: number; offset?: number } = {},
    tx?: TransactionContext
  ): Promise<(Bookmark & { post: Post })[]> {
    try {
      const { limit, offset } = options;
      return await this.getClient(tx).bookmark.findMany({
        where: { userId },
        take: limit,
        skip: offset,
        orderBy: { createdAt: "desc" },
        include: { post: true },
      });
    } catch (error) {
      throw mapPrismaError(error, "Bookmark");
    }
  }

  async deleteManyByUserId(userId: string, tx?: TransactionContext): Promise<Prisma.BatchPayload> {
    try {
      return await this.getClient(tx).bookmark.deleteMany({
        where: { userId },
      });
    } catch (error) {
      throw mapPrismaError(error, "Bookmark");
    }
  }

  async deleteManyByPostId(postId: string, tx?: TransactionContext): Promise<Prisma.BatchPayload> {
    try {
      return await this.getClient(tx).bookmark.deleteMany({
        where: { postId },
      });
    } catch (error) {
      throw mapPrismaError(error, "Bookmark");
    }
  }
}
