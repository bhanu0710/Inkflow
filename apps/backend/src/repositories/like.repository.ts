import type { PrismaClient, Like, Prisma } from "@prisma/client";
import type { TransactionContext } from "./transaction-context.js";
import { PrismaTransactionContext } from "./transaction-context.js";
import { mapPrismaError } from "../errors/repository.errors.js";

export class LikeRepository {
  constructor(private readonly prisma: PrismaClient) {}

  private getClient(tx?: TransactionContext) {
    if (tx instanceof PrismaTransactionContext) {
      return tx.txClient;
    }
    return this.prisma;
  }

  async create(userId: string, postId: string, tx?: TransactionContext): Promise<Like> {
    try {
      return await this.getClient(tx).like.create({
        data: {
          userId,
          postId,
        },
      });
    } catch (error) {
      throw mapPrismaError(error, "Like");
    }
  }

  async delete(userId: string, postId: string, tx?: TransactionContext): Promise<Like> {
    try {
      return await this.getClient(tx).like.delete({
        where: {
          userId_postId: {
            userId,
            postId,
          },
        },
      });
    } catch (error) {
      throw mapPrismaError(error, "Like");
    }
  }

  async findById(userId: string, postId: string, tx?: TransactionContext): Promise<Like | null> {
    try {
      return await this.getClient(tx).like.findUnique({
        where: {
          userId_postId: {
            userId,
            postId,
          },
        },
      });
    } catch (error) {
      throw mapPrismaError(error, "Like");
    }
  }

  async countByPostId(postId: string, tx?: TransactionContext): Promise<number> {
    try {
      return await this.getClient(tx).like.count({
        where: { postId },
      });
    } catch (error) {
      throw mapPrismaError(error, "Like");
    }
  }

  async deleteManyByUserId(userId: string, tx?: TransactionContext): Promise<Prisma.BatchPayload> {
    try {
      return await this.getClient(tx).like.deleteMany({
        where: { userId },
      });
    } catch (error) {
      throw mapPrismaError(error, "Like");
    }
  }

  async deleteManyByPostId(postId: string, tx?: TransactionContext): Promise<Prisma.BatchPayload> {
    try {
      return await this.getClient(tx).like.deleteMany({
        where: { postId },
      });
    } catch (error) {
      throw mapPrismaError(error, "Like");
    }
  }
}
