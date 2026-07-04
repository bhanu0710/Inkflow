import type { PrismaClient, Tag } from "@prisma/client";
import type { TransactionContext } from "./transaction-context.js";
import { PrismaTransactionContext } from "./transaction-context.js";
import { mapPrismaError } from "../errors/repository.errors.js";

export class TagRepository {
  constructor(private readonly prisma: PrismaClient) {}

  private getClient(tx?: TransactionContext) {
    if (tx instanceof PrismaTransactionContext) {
      return tx.txClient;
    }
    return this.prisma;
  }

  async create(
    data: { name: string; createdById?: string | null },
    tx?: TransactionContext
  ): Promise<Tag> {
    try {
      return await this.getClient(tx).tag.create({
        data: {
          name: data.name,
          createdById: data.createdById ?? null,
        },
      });
    } catch (error) {
      throw mapPrismaError(error, "Tag");
    }
  }

  async findById(id: string, tx?: TransactionContext): Promise<Tag | null> {
    try {
      return await this.getClient(tx).tag.findUnique({
        where: { id },
      });
    } catch (error) {
      throw mapPrismaError(error, "Tag");
    }
  }

  async findByName(name: string, tx?: TransactionContext): Promise<Tag | null> {
    try {
      return await this.getClient(tx).tag.findUnique({
        where: { name },
      });
    } catch (error) {
      throw mapPrismaError(error, "Tag");
    }
  }

  async findManyByNames(names: string[], tx?: TransactionContext): Promise<Tag[]> {
    try {
      return await this.getClient(tx).tag.findMany({
        where: {
          name: { in: names },
        },
      });
    } catch (error) {
      throw mapPrismaError(error, "Tag");
    }
  }

  async findAll(tx?: TransactionContext): Promise<Tag[]> {
    try {
      return await this.getClient(tx).tag.findMany({
        orderBy: { name: "asc" },
      });
    } catch (error) {
      throw mapPrismaError(error, "Tag");
    }
  }

  async deleteById(id: string, tx?: TransactionContext): Promise<Tag> {
    try {
      return await this.getClient(tx).tag.delete({
        where: { id },
      });
    } catch (error) {
      throw mapPrismaError(error, "Tag");
    }
  }
}
