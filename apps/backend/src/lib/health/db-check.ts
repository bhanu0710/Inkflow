import { prisma } from "../../repositories/prisma.repository.js";

/**
 * Checks the database connectivity by executing a lightweight query.
 * Designed to support future timeout options.
 *
 * @param timeoutMs Optional parameter reserved for future timeout implementation.
 */
export const checkDatabaseHealth = async (timeoutMs?: number): Promise<boolean> => {
  if (timeoutMs !== undefined) {
    // Placeholder to satisfy typescript unused variables compiler checks.
    // Future timeout logic using Promise.race goes here.
  }

  try {
    await prisma.$queryRaw`SELECT 1`;
    return true;
  } catch {
    return false;
  }
};
