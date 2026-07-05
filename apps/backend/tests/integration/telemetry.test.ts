/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-argument */
/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-return */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { vi, describe, it, expect, beforeEach } from "vitest";

const exportedSpans: any[] = [];

// Mock ConsoleSpanExporter to capture generated spans and suppress standard stdout output
vi.mock("@opentelemetry/sdk-trace-base", async (importOriginal) => {
  const original = await importOriginal<any>();
  class MockConsoleSpanExporter {
    export(spans: any, resultCallback: any) {
      exportedSpans.push(...spans);
      resultCallback({ code: 0 }); // 0 signifies Success
    }
    shutdown() {}
  }
  return {
    ...original,
    ConsoleSpanExporter: MockConsoleSpanExporter,
  };
});

import "./setup-telemetry.js";
import request from "supertest";
import { createApp } from "../../src/app.js";
import { logger } from "../../src/lib/logger/index.js";
import { initTelemetry } from "../../src/lib/tracing/index.js";

// Mock the database queries for public posts to succeed without real DB connectivity
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

describe("OpenTelemetry Tracing Integration Tests", () => {
  const app = createApp();

  beforeEach(() => {
    exportedSpans.length = 0;
    vi.restoreAllMocks();
  });

  it("should initialize OpenTelemetry SDK exactly once and be idempotent", () => {
    expect(() => initTelemetry()).not.toThrow();
  });

  it("should generate traceId, trace spans and correlate with logger metadata", async () => {
    const loggerInfoSpy = vi.spyOn(logger, "info");

    const response = await request(app).get("/api/v1/posts/public");
    expect(response.status).toBe(200);

    // Wait a brief moment for the telemetry exporter to flush spans
    await new Promise((resolve) => setTimeout(resolve, 50));

    // Verify HTTP requests generate spans in exporter
    expect(exportedSpans.length).toBeGreaterThan(0);
    const httpSpan = exportedSpans.find((span) => span.name.includes("GET"));
    expect(httpSpan).toBeDefined();

    const traceId = httpSpan.spanContext().traceId;
    expect(traceId).toBeDefined();
    expect(traceId.length).toBe(32); // W3C traceId is 32 hex chars

    // Check request logs include both requestId and traceId
    const requestStartLog = loggerInfoSpy.mock.calls.find((call) =>
      call[1]?.includes("Request started")
    );
    expect(requestStartLog).toBeDefined();
    expect(requestStartLog![0].requestId).toBeDefined();
    expect(requestStartLog![0].traceId).toBe(traceId);

    const requestCompletedLog = loggerInfoSpy.mock.calls.find((call) =>
      call[1]?.includes("Request completed")
    );
    expect(requestCompletedLog).toBeDefined();
    expect(requestCompletedLog![0].requestId).toBeDefined();
    expect(requestCompletedLog![0].traceId).toBe(traceId);
  });

  it("should support W3C Trace Context and propagate incoming traceparent", async () => {
    const incomingTraceId = "4bf92f3577b34da6a3ce929d0e0e4736";
    const incomingSpanId = "00f067aa0ba902b7";
    const traceparent = `00-${incomingTraceId}-${incomingSpanId}-01`;

    const response = await request(app)
      .get("/api/v1/posts/public")
      .set("traceparent", traceparent);

    expect(response.status).toBe(200);

    await new Promise((resolve) => setTimeout(resolve, 50));

    expect(exportedSpans.length).toBeGreaterThan(0);
    const propagatedSpan = exportedSpans.find(
      (span) => span.parentSpanContext?.spanId === incomingSpanId
    );
    expect(propagatedSpan).toBeDefined();
    expect(propagatedSpan.spanContext().traceId).toBe(incomingTraceId);
  });
});
