import request from "supertest";

import { describe, it, expect, vi, beforeEach } from "vitest";
import { createApp } from "../../src/app.js";
import { logger } from "../../src/lib/logger/index.js";

describe("Request Logging & Correlation ID Middleware Integration Tests", () => {
  let app: ReturnType<typeof createApp>;

  beforeEach(() => {
    app = createApp();
    vi.restoreAllMocks();
  });

  it("should generate a unique request ID automatically and return it in X-Request-ID response header", async () => {
    const infoSpy = vi.spyOn(logger, "info");

    const response = await request(app).get("/health/live");

    expect(response.status).toBe(200);
    const requestId = response.header["x-request-id"];
    expect(requestId).toBeDefined();
    // UUID v4 format verification
    expect(requestId).toMatch(/^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i);

    // Verify logger was called
    expect(infoSpy).toHaveBeenCalled();
    const calls = infoSpy.mock.calls;

    // Verify start log payload
    const startPayload = calls[0][0] as Record<string, unknown>;
    expect(startPayload.requestId).toBe(requestId);
    expect(startPayload.method).toBe("GET");
    expect(startPayload.path).toBe("/health/live");
    expect(startPayload.ip).toBeDefined();
    expect(startPayload.userAgent).toBeDefined();

    // Verify completion log payload
    const completePayload = calls[1][0] as Record<string, unknown>;
    expect(completePayload.requestId).toBe(requestId);
    expect(completePayload.method).toBe("GET");
    expect(completePayload.path).toBe("/health/live");
    expect(completePayload.statusCode).toBe(200);
    expect(completePayload.durationMs).toBeTypeOf("number");
  });

  it("should preserve the incoming X-Request-ID request header", async () => {
    const infoSpy = vi.spyOn(logger, "info");
    const testRequestId = "custom-correlation-id-12345";

    const response = await request(app)
      .get("/health/live")
      .set("X-Request-ID", testRequestId);

    expect(response.status).toBe(200);
    expect(response.header["x-request-id"]).toBe(testRequestId);

    expect(infoSpy).toHaveBeenCalled();
    const calls = infoSpy.mock.calls;
    const startPayload = calls[0][0] as Record<string, unknown>;
    expect(startPayload.requestId).toBe(testRequestId);
  });

  it("should generate different request IDs for different requests", async () => {
    const response1 = await request(app).get("/health/live");
    const response2 = await request(app).get("/health/live");

    const id1 = response1.header["x-request-id"];
    const id2 = response2.header["x-request-id"];

    expect(id1).toBeDefined();
    expect(id2).toBeDefined();
    expect(id1).not.toBe(id2);
  });
});
