import { checkDatabaseHealth } from "../lib/health/db-check.js";

export interface HealthStatus {
  status: "ok" | "error";
  details?: {
    database: "up" | "down";
  };
}

export class HealthService {
  getLivenessStatus(): HealthStatus {
    return { status: "ok" };
  }

  async getReadinessStatus(): Promise<HealthStatus> {
    try {
      const isDbUp = await checkDatabaseHealth();
      if (isDbUp) {
        return {
          status: "ok",
          details: { database: "up" },
        };
      }
    } catch {
      // db is down
    }

    return {
      status: "error",
      details: { database: "down" },
    };
  }
}
