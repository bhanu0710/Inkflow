import type { PrismaClient, RefreshToken, Prisma } from "@prisma/client";
import type { TransactionContext } from "./transaction-context.js";
import { PrismaTransactionContext } from "./transaction-context.js";
import { mapPrismaError } from "../errors/repository.errors.js";

export class RefreshTokenRepository {
  constructor(private readonly prisma: PrismaClient) {}

  private getClient(tx?: TransactionContext) {
    if (tx instanceof PrismaTransactionContext) {
      return tx.txClient;
    }
    return this.prisma;
  }

  async create(
    data: { userId: string; tokenHash: string; expiresAt: Date },
    tx?: TransactionContext
  ): Promise<RefreshToken> {
    try {
      return await this.getClient(tx).refreshToken.create({
        data: {
          userId: data.userId,
          tokenHash: data.tokenHash,
          expiresAt: data.expiresAt,
        },
      });
    } catch (error) {
      throw mapPrismaError(error, "RefreshToken");
    }
  }

  async findByTokenHash(tokenHash: string, tx?: TransactionContext): Promise<RefreshToken | null> {
    try {
      return await this.getClient(tx).refreshToken.findUnique({
        where: { tokenHash },
      });
    } catch (error) {
      throw mapPrismaError(error, "RefreshToken");
    }
  }

  async revokeById(id: string, tx?: TransactionContext): Promise<RefreshToken> {
    try {
      return await this.getClient(tx).refreshToken.update({
        where: { id },
        data: { revokedAt: new Date() },
      });
    } catch (error) {
      throw mapPrismaError(error, "RefreshToken");
    }
  }


  async revokeAllByUserId(userId: string, tx?: TransactionContext): Promise<Prisma.BatchPayload> {
    try {
      return await this.getClient(tx).refreshToken.updateMany({
        where: {
          userId,
          revokedAt: null,
        },
        data: { revokedAt: new Date() },
      });
    } catch (error) {
      throw mapPrismaError(error, "RefreshToken");
    }
  }

  async deleteManyByUserId(userId: string, tx?: TransactionContext): Promise<Prisma.BatchPayload> {
    try {
      return await this.getClient(tx).refreshToken.deleteMany({
        where: { userId },
      });
    } catch (error) {
      throw mapPrismaError(error, "RefreshToken");
    }
  }

  async deleteExpired(tx?: TransactionContext): Promise<Prisma.BatchPayload> {
    try {
      return await this.getClient(tx).refreshToken.deleteMany({
        where: {
          expiresAt: { lt: new Date() },
        },
      });
    } catch (error) {
      throw mapPrismaError(error, "RefreshToken");
    }
  }
}
