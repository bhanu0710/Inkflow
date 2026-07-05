/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import type { Request, Response } from "express";
import rateLimit from "express-rate-limit";
import { env } from "../config/env.js";
import { logger } from "../lib/logger/index.js";

/**
 * Middleware providing production-ready API rate limiting.
 *
 * Configured using:
 * - RATE_LIMIT_WINDOW_MS: Window size in milliseconds
 * - RATE_LIMIT_MAX_REQUESTS: Maximum number of requests allowed in the window
 *
 * Health probes (/health, /health/live, /health/ready) are explicitly excluded to
 * prevent Kubernetes liveness/readiness check rate-limiting.
 */
export const rateLimitMiddleware = rateLimit({
  windowMs: env.RATE_LIMIT_WINDOW_MS,
  max: env.RATE_LIMIT_MAX_REQUESTS,
  standardHeaders: true,
  legacyHeaders: false,
  skip: (req) => {
    const request = req as Request;
    const excludedPaths = ["/health", "/health/live", "/health/ready"];
    return excludedPaths.includes(request.path);
  },
  handler: (req, res) => {
    const request = req as Request;
    const response = res as Response;
    const requestId = request.requestId || "unknown";
    const { method, path } = request;
    const ip = request.ip || "unknown";

    // Log rejected request
    logger.warn(
      {
        requestId,
        ip,
        method,
        path,
      },
      "Rate limit exceeded"
    );

    response.status(429).json({
      success: false,
      error: {
        code: "TOO_MANY_REQUESTS",
        message: "Too many requests, please try again later.",
        requestId,
      },
    });
  },
});
