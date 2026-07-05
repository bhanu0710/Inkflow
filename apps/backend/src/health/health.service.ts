import { env } from "../config/env.js";
import { checkDatabaseHealth } from "../lib/health/db-check.js";
import { checkRedisHealth } from "../lib/health/redis-check.js";

export interface ReadinessDetails {
  database: "UP" | "DOWN";
  redis: "UP" | "DOWN";
}

export interface ReadyStatusResponse {
  status: "UP" | "DOWN";
  checks: ReadinessDetails;
}

export interface CombinedStatusResponse {
  status: "UP" | "DOWN";
  service: string;
  environment: string;
  uptime: number;
  timestamp: string;
  checks: ReadinessDetails;
}

export class HealthService {
  /**
   * Retrieves the current liveness status of the node process.
   */
  getLiveness(): { status: "UP" } {
    return { status: "UP" };
  }

  /**
   * Performs quick TCP/SQL checks on database and Redis dependencies.
   */
  async getReadiness(): Promise<ReadyStatusResponse> {
    const [isDbUp, isRedisUp] = await Promise.all([
      checkDatabaseHealth(),
      checkRedisHealth(env.REDIS_URL),
    ]);

    const database = isDbUp ? "UP" : "DOWN";
    const redis = isRedisUp ? "UP" : "DOWN";
    const status = isDbUp && isRedisUp ? "UP" : "DOWN";

    return {
      status,
      checks: {
        database,
        redis,
      },
    };
  }

  /**
   * Assembles combined health check statistics.
   */
  async getCombined(): Promise<CombinedStatusResponse> {
    const readiness = await this.getReadiness();

    return {
      status: readiness.status,
      service: env.SERVICE_NAME,
      environment: env.NODE_ENV,
      uptime: process.uptime(),
      timestamp: new Date().toISOString(),
      checks: readiness.checks,
    };
  }
}
