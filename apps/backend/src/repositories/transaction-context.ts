import type { Prisma } from "@prisma/client";

export interface TransactionContext {
  readonly id: string;
}

export class PrismaTransactionContext implements TransactionContext {
  readonly id: string;

  constructor(public readonly txClient: Prisma.TransactionClient) {
    this.id = Math.random().toString(36).substring(2, 15);
  }
}
