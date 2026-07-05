/* eslint-disable @typescript-eslint/no-unsafe-member-access */

import request from "supertest";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { createApp } from "../../src/app.js";
import { checkDatabaseHealth } from "../../src/lib/health/db-check.js";
import { checkRedisHealth } from "../../src/lib/health/redis-check.js";

// Mock the dependency health check helpers
vi.mock("../../src/lib/health/db-check.js", () => ({
  checkDatabaseHealth: vi.fn(),
}));

vi.mock("../../src/lib/health/redis-check.js", () => ({
  checkRedisHealth: vi.fn(),
}));

describe("Production Health Endpoints Integration Tests", () => {
  let app: ReturnType<typeof createApp>;

  beforeEach(() => {
    app = createApp();
    vi.clearAllMocks();
  });

  describe("GET /health/live", () => {
    it("should always return 200 UP indicating the process is alive (without authentication)", async () => {
      const response = await request(app).get("/health/live");

      expect(response.status).toBe(200);
      expect(response.body).toEqual({ status: "UP" });
    });
  });

  describe("GET /health/ready", () => {
    it("should return 200 UP when database and redis are both healthy", async () => {
      vi.mocked(checkDatabaseHealth).mockResolvedValueOnce(true);
      vi.mocked(checkRedisHealth).mockResolvedValueOnce(true);

      const response = await request(app).get("/health/ready");

      expect(response.status).toBe(200);
      expect(response.body).toEqual({
        status: "UP",
        checks: {
          database: "UP",
          redis: "UP",
        },
      });
    });

    it("should return 503 DOWN when database is unavailable", async () => {
      vi.mocked(checkDatabaseHealth).mockResolvedValueOnce(false);
      vi.mocked(checkRedisHealth).mockResolvedValueOnce(true);

      const response = await request(app).get("/health/ready");

      expect(response.status).toBe(503);
      expect(response.body).toEqual({
        status: "DOWN",
        checks: {
          database: "DOWN",
          redis: "UP",
        },
      });
    });

    it("should return 503 DOWN when redis is unavailable", async () => {
      vi.mocked(checkDatabaseHealth).mockResolvedValueOnce(true);
      vi.mocked(checkRedisHealth).mockResolvedValueOnce(false);

      const response = await request(app).get("/health/ready");

      expect(response.status).toBe(503);
      expect(response.body).toEqual({
        status: "DOWN",
        checks: {
          database: "UP",
          redis: "DOWN",
        },
      });
    });

    it("should return 503 DOWN when both database and redis are unavailable", async () => {
      vi.mocked(checkDatabaseHealth).mockResolvedValueOnce(false);
      vi.mocked(checkRedisHealth).mockResolvedValueOnce(false);

      const response = await request(app).get("/health/ready");

      expect(response.status).toBe(503);
      expect(response.body).toEqual({
        status: "DOWN",
        checks: {
          database: "DOWN",
          redis: "DOWN",
        },
      });
    });
  });

  describe("GET /health", () => {
    it("should return 200 status with service metadata, uptime and timestamp when healthy", async () => {
      vi.mocked(checkDatabaseHealth).mockResolvedValueOnce(true);
      vi.mocked(checkRedisHealth).mockResolvedValueOnce(true);

      const response = await request(app).get("/health");

      expect(response.status).toBe(200);
      expect(response.body.status).toBe("UP");
      expect(response.body.service).toBe("inkflow-backend");
      expect(response.body.environment).toBeDefined();
      expect(response.body.uptime).toBeTypeOf("number");
      expect(response.body.timestamp).toBeDefined();
      expect(response.body.checks).toEqual({
        database: "UP",
        redis: "UP",
      });
    });

    it("should return 503 status when one of the dependencies fails", async () => {
      vi.mocked(checkDatabaseHealth).mockResolvedValueOnce(false);
      vi.mocked(checkRedisHealth).mockResolvedValueOnce(true);

      const response = await request(app).get("/health");

      expect(response.status).toBe(503);
      expect(response.body.status).toBe("DOWN");
      expect(response.body.service).toBe("inkflow-backend");
      expect(response.body.environment).toBeDefined();
      expect(response.body.uptime).toBeTypeOf("number");
      expect(response.body.timestamp).toBeDefined();
      expect(response.body.checks).toEqual({
        database: "DOWN",
        redis: "UP",
      });
    });
  });
});
