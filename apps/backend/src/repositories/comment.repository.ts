import type { PrismaClient, Comment, Prisma } from "@prisma/client";
import type { TransactionContext } from "./transaction-context.js";
import { PrismaTransactionContext } from "./transaction-context.js";
import { mapPrismaError } from "../errors/repository.errors.js";

export class CommentRepository {
  constructor(private readonly prisma: PrismaClient) {}

  private getClient(tx?: TransactionContext) {
    if (tx instanceof PrismaTransactionContext) {
      return tx.txClient;
    }
    return this.prisma;
  }

  async create(
    data: {
      postId: string;
      authorId: string;
      parentId?: string | null;
      body: string;
      depth: number;
    },
    tx?: TransactionContext
  ): Promise<Comment> {
    try {
      return await this.getClient(tx).comment.create({
        data: {
          postId: data.postId,
          authorId: data.authorId,
          parentId: data.parentId ?? null,
          body: data.body,
          depth: data.depth,
        },
      });
    } catch (error) {
      throw mapPrismaError(error, "Comment");
    }
  }

  async findById(id: string, tx?: TransactionContext): Promise<Comment | null> {
    try {
      return await this.getClient(tx).comment.findUnique({
        where: { id },
      });
    } catch (error) {
      throw mapPrismaError(error, "Comment");
    }
  }

  async deleteById(id: string, tx?: TransactionContext): Promise<Comment> {
    try {
      return await this.getClient(tx).comment.delete({
        where: { id },
      });
    } catch (error) {
      throw mapPrismaError(error, "Comment");
    }
  }

  async deleteManyByAuthorId(authorId: string, tx?: TransactionContext): Promise<Prisma.BatchPayload> {
    try {
      return await this.getClient(tx).comment.deleteMany({
        where: { authorId },
      });
    } catch (error) {
      throw mapPrismaError(error, "Comment");
    }
  }

  async deleteManyByPostId(postId: string, tx?: TransactionContext): Promise<Prisma.BatchPayload> {
    try {
      return await this.getClient(tx).comment.deleteMany({
        where: { postId },
      });
    } catch (error) {
      throw mapPrismaError(error, "Comment");
    }
  }

  async findAllByPostId(postId: string, tx?: TransactionContext): Promise<Comment[]> {
    try {
      return await this.getClient(tx).comment.findMany({
        where: { postId },
        orderBy: { createdAt: "asc" },
      });
    } catch (error) {
      throw mapPrismaError(error, "Comment");
    }
  }
}
