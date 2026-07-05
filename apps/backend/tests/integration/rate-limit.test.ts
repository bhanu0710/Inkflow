/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-argument */
/* eslint-disable @typescript-eslint/no-explicit-any */
import request from "supertest";
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";

// Mock the prisma repository so we can query public posts endpoint successfully
vi.mock("../../src/repositories/prisma.repository.js", () => {
  const mockPrisma = {
    post: {
      findMany: vi.fn().mockResolvedValue([]),
      count: vi.fn().mockResolvedValue(0),
    },
  };
  return {
    prisma: mockPrisma,
    disconnectPrisma: vi.fn(),
  };
});

describe("Production API Rate Limiting Integration Tests", () => {
  let app: any;

  beforeEach(async () => {
    // Configure low rate limit via environment variables
    process.env.RATE_LIMIT_WINDOW_MS = "5000"; // 5 seconds window
    process.env.RATE_LIMIT_MAX_REQUESTS = "3"; // only 3 requests allowed

    vi.resetModules();
    vi.restoreAllMocks();

    const { createApp } = await import("../../src/app.js");
    app = createApp();
  });

  afterEach(() => {
    // Clean up environment variables
    delete process.env.RATE_LIMIT_WINDOW_MS;
    delete process.env.RATE_LIMIT_MAX_REQUESTS;
  });

  it("should allow requests below the limit and return the standard headers", async () => {
    const res1 = await request(app).get("/api/v1/posts/public");
    expect(res1.status).toBe(200);
    expect(res1.header["ratelimit-limit"]).toBe("3");
    expect(res1.header["ratelimit-remaining"]).toBe("2");
    expect(res1.header["ratelimit-reset"]).toBeDefined();
  });

  it("should reject requests above the limit with 429, log warning, and return error envelope", async () => {
    // Dynamically import logger to obtain the same instance used inside express app after resetModules
    const { logger } = await import("../../src/lib/logger/index.js");
    const warnSpy = vi.spyOn(logger, "warn");

    // Make 3 successful requests
    for (let i = 0; i < 3; i++) {
      const res = await request(app).get("/api/v1/posts/public");
      expect(res.status).toBe(200);
    }

    // 4th request should exceed the limit and return 429
    const res4 = await request(app).get("/api/v1/posts/public");
    expect(res4.status).toBe(429);
    expect(res4.header["ratelimit-remaining"]).toBe("0");

    // Verify response body matches standard error envelope
    expect(res4.body).toEqual({
      success: false,
      error: {
        code: "TOO_MANY_REQUESTS",
        message: "Too many requests, please try again later.",
        requestId: expect.any(String),
      },
    });

    // Verify logger.warn was called
    expect(warnSpy).toHaveBeenCalled();
    const calls = warnSpy.mock.calls;
    const warningPayload = calls.find((call: any) => call[1] === "Rate limit exceeded")?.[0];
    expect(warningPayload).toBeDefined();
    expect(warningPayload.ip).toBeDefined();
    expect(warningPayload.method).toBe("GET");
    expect(warningPayload.path).toBe("/api/v1/posts/public");
    expect(warningPayload.requestId).toBe(res4.header["x-request-id"]);
  });

  it("should never rate limit health endpoints", async () => {
    // Make 10 requests to health endpoints
    for (let i = 0; i < 10; i++) {
      const res = await request(app).get("/health/live");
      expect(res.status).toBe(200);
      // Health endpoints should not contain rate limit headers because they are skipped
      expect(res.header["ratelimit-limit"]).toBeUndefined();
    }
  });
});
