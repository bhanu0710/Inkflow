import type { PrismaClient } from "@prisma/client";
import type { TransactionContext} from "./transaction-context.js";
import { PrismaTransactionContext } from "./transaction-context.js";

export interface TransactionManager {
  run<T>(callback: (tx: TransactionContext) => Promise<T>): Promise<T>;
}

export class PrismaTransactionManager implements TransactionManager {
  constructor(private readonly prisma: PrismaClient) {}

  async run<T>(callback: (tx: TransactionContext) => Promise<T>): Promise<T> {
    return this.prisma.$transaction(async (txClient) => {
      const context = new PrismaTransactionContext(txClient);
      return callback(context);
    });
  }
}
