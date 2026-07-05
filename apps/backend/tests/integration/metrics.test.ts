import request from "supertest";
import { describe, it, expect, vi } from "vitest";
import { createApp } from "../../src/app.js";
import { registry } from "../../src/lib/metrics/index.js";

// Mock the database queries for GET /api/v1/posts/public to succeed with 200
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

describe("Production Prometheus Metrics Integration Tests", () => {
  const app = createApp();

  // Helper to extract request count for a given route/method/status
  const getRequestCount = (
    text: string,
    route: string,
    method: string = "GET",
    statusCode: string = "200"
  ): number => {
    const escapedRoute = route.replace(/[-/\\^$*+?.()|[\]{}]/g, "\\$&");
    const regex = new RegExp(
      `http_requests_total\\{[^\\}]*method="${method}"[^\\}]*route="${escapedRoute}"[^\\}]*status_code="${statusCode}"\\}\\s+(\\d+)`
    );

    const match = text.match(regex);
    return match ? parseInt(match[1], 10) : 0;
  };

  it("should respond with 200 OK and correct Prometheus text content-type", async () => {
    const response = await request(app).get("/metrics");

    expect(response.status).toBe(200);
    expect(response.header["content-type"]).toBe(registry.contentType);
  });

  it("should contain standard Node.js default process metrics", async () => {
    const response = await request(app).get("/metrics");

    expect(response.text).toContain("process_cpu_seconds_total");
    expect(response.text).toContain("process_resident_memory_bytes");
    expect(response.text).toContain("nodejs_eventloop_lag_seconds");
  });

  it("should increment http_requests_total and include duration histograms on requests", async () => {
    // 1. Get initial metrics
    const initialRes = await request(app).get("/metrics");
    const initialCount = getRequestCount(initialRes.text, "/api/v1/posts/public");

    // 2. Perform Instrumented Request
    const targetRes = await request(app).get("/api/v1/posts/public");
    expect(targetRes.status).toBe(200);

    // 3. Get updated metrics
    const finalRes = await request(app).get("/metrics");
    const finalCount = getRequestCount(finalRes.text, "/api/v1/posts/public");

    // 4. Verify increment
    expect(finalCount).toBe(initialCount + 1);

    // 5. Verify duration histogram bucket is present
    expect(finalRes.text).toContain("http_request_duration_seconds_bucket");
    expect(finalRes.text).toContain("http_request_duration_seconds_count");
    expect(finalRes.text).toContain("http_request_duration_seconds_sum");
  });

  it("should exclude health check and metrics endpoints from instrumenting to avoid noise", async () => {
    // 1. Trigger health check and metrics calls
    await request(app).get("/health/live");
    await request(app).get("/health/ready");
    await request(app).get("/health");
    await request(app).get("/metrics");

    // 2. Fetch metrics
    const res = await request(app).get("/metrics");

    // 3. Verify exclusions
    expect(res.text).not.toContain('route="/health/live"');
    expect(res.text).not.toContain('route="/health/ready"');
    expect(res.text).not.toContain('route="/health"');
    expect(res.text).not.toContain('route="/metrics"');
  });
});
