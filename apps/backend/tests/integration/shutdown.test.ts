/* eslint-disable @typescript-eslint/no-unsafe-return */
/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";

// Plain object to track call state, immune to module reload proxies
const mockState = {
  closeCalled: 0,
  disconnectPrismaCalled: 0,
  closeImplementation: (cb: any) => cb(),
  disconnectPrismaImplementation: () => Promise.resolve(),
};

const mockServer = {
  close: vi.fn((cb: any) => {
    mockState.closeCalled++;
    return mockState.closeImplementation(cb);
  }),
};

const mockApp = {
  listen: vi.fn((port: number, host: string, cb?: () => void) => {
    if (cb) cb();
    return mockServer;
  }),
};

vi.mock("../../src/app.js", () => ({
  createApp: () => mockApp,
}));

vi.mock("../../src/repositories/prisma.repository.js", () => {
  const mockPrisma = {
    $disconnect: vi.fn().mockResolvedValue(undefined),
  };
  return {
    prisma: mockPrisma,
    disconnectPrisma: vi.fn(() => {
      mockState.disconnectPrismaCalled++;
      return mockState.disconnectPrismaImplementation();
    }),
  };
});

describe("Graceful Shutdown & Signal Handling Integration Tests", () => {
  let signalHandlers: Record<string, any> = {};
  let exitSpy: any;
  let onSpy: any;

  // Helper to create a promise that resolves when process.exit is called
  const waitForExit = (spy: any) => {
    return new Promise<number>((resolve) => {
      spy.mockImplementation((code: number) => {
        resolve(code);
        return undefined as never;
      });
    });
  };

  beforeEach(async () => {
    vi.resetModules();
    signalHandlers = {};

    // Reset stable mock state
    mockState.closeCalled = 0;
    mockState.disconnectPrismaCalled = 0;
    mockState.closeImplementation = (cb: any) => cb();
    mockState.disconnectPrismaImplementation = () => Promise.resolve();

    // Intercept signal registration
    onSpy = vi.spyOn(process, "on").mockImplementation((event: any, handler: any) => {
      signalHandlers[event] = handler;
      return process;
    });

    // Intercept process.exit to prevent test process termination
    exitSpy = vi.spyOn(process, "exit").mockImplementation(() => {
      return undefined as never;
    });

    // Import server dynamically to execute fresh module code
    await import("../../src/server.js");
  });

  afterEach(() => {
    vi.restoreAllMocks();
    vi.useRealTimers();
  });

  it("should register signal handlers for SIGTERM and SIGINT and exit cleanly", async () => {
    expect(onSpy).toHaveBeenCalledWith("SIGTERM", expect.any(Function));
    expect(onSpy).toHaveBeenCalledWith("SIGINT", expect.any(Function));

    const sigtermHandler = signalHandlers["SIGTERM"];
    const sigintHandler = signalHandlers["SIGINT"];

    expect(sigtermHandler).toBeTypeOf("function");
    expect(sigintHandler).toBeTypeOf("function");

    // Setup exit promise tracker
    const exitPromise = waitForExit(exitSpy);

    // Trigger SIGTERM handler
    sigtermHandler();

    // Wait until shutdown finishes and process.exit is called
    const exitCode = await exitPromise;

    // Verify HTTP server is closed
    expect(mockState.closeCalled).toBe(1);

    // Verify Prisma is disconnected
    expect(mockState.disconnectPrismaCalled).toBe(1);

    // Verify process exits with 0
    expect(exitCode).toBe(0);
  });

  it("should continue shutdown and exit cleanly even if Prisma disconnect fails", async () => {
    // Prisma disconnect throws an error
    mockState.disconnectPrismaImplementation = () => Promise.reject(new Error("Prisma connection termination failed"));

    const sigtermHandler = signalHandlers["SIGTERM"];
    const exitPromise = waitForExit(exitSpy);

    sigtermHandler();

    const exitCode = await exitPromise;

    // HTTP server close should still be invoked
    expect(mockState.closeCalled).toBe(1);

    // Prisma disconnect should have been attempted
    expect(mockState.disconnectPrismaCalled).toBe(1);

    // Should still terminate/exit with 0 because we handled database disconnect error gracefully
    expect(exitCode).toBe(0);
  });

  it("should force exit with code 1 if HTTP server close times out", async () => {
    vi.useFakeTimers();

    // Make mockServer.close hang / not call the callback
    mockState.closeImplementation = () => {
      // Don't call the callback to simulate hanging/in-flight requests
      return mockServer;
    };

    const sigtermHandler = signalHandlers["SIGTERM"];
    const exitPromise = waitForExit(exitSpy);

    // Trigger shutdown
    sigtermHandler();

    // Fast-forward timers beyond the graceful shutdown timeout limit
    vi.advanceTimersByTime(11000); // default is 10000ms

    const exitCode = await exitPromise;

    // Verify process forced exit with 1
    expect(exitCode).toBe(1);
  });
});
