import type { PrismaClient, User } from "@prisma/client";
import type { TransactionContext } from "./transaction-context.js";
import { PrismaTransactionContext } from "./transaction-context.js";
import { mapPrismaError } from "../errors/repository.errors.js";

export class UserRepository {
  constructor(private readonly prisma: PrismaClient) {}

  private getClient(tx?: TransactionContext) {
    if (tx instanceof PrismaTransactionContext) {
      return tx.txClient;
    }
    return this.prisma;
  }

  async create(
    data: { email: string; username: string; displayName: string; passwordHash: string },
    tx?: TransactionContext
  ): Promise<User> {
    try {
      return await this.getClient(tx).user.create({ data });
    } catch (error) {
      throw mapPrismaError(error, "User");
    }
  }

  async findById(id: string, tx?: TransactionContext): Promise<User | null> {
    try {
      return await this.getClient(tx).user.findUnique({ where: { id } });
    } catch (error) {
      throw mapPrismaError(error, "User");
    }
  }

  async findByEmail(email: string, tx?: TransactionContext): Promise<User | null> {
    try {
      return await this.getClient(tx).user.findUnique({ where: { email } });
    } catch (error) {
      throw mapPrismaError(error, "User");
    }
  }

  async findByUsername(username: string, tx?: TransactionContext): Promise<User | null> {
    try {
      return await this.getClient(tx).user.findUnique({ where: { username } });
    } catch (error) {
      throw mapPrismaError(error, "User");
    }
  }

  async update(
    id: string,
    data: { displayName?: string; passwordHash?: string },
    tx?: TransactionContext
  ): Promise<User> {
    try {
      return await this.getClient(tx).user.update({
        where: { id },
        data,
      });
    } catch (error) {
      throw mapPrismaError(error, "User");
    }
  }

  async deleteById(id: string, tx?: TransactionContext): Promise<User> {
    try {
      return await this.getClient(tx).user.delete({ where: { id } });
    } catch (error) {
      throw mapPrismaError(error, "User");
    }
  }
}
