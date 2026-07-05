/* eslint-disable @typescript-eslint/no-unsafe-member-access */
import type { Request, Response, NextFunction } from "express";
import { httpRequestsTotal, httpRequestDurationSeconds } from "../lib/metrics/index.js";

/**
 * Middleware collecting HTTP request throughput and duration metrics.
 *
 * Excludes health and metrics endpoints to avoid self-observation noise.
 * Labels include HTTP method, matched route pattern, and response status code.
 */
export const metricsMiddleware = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  const { method, path } = req;

  // Exclude health check and metrics endpoints
  const excludedPaths = ["/health", "/health/live", "/health/ready", "/metrics"];
  if (excludedPaths.includes(path)) {
    next();
    return;
  }

  const startTime = performance.now();

  res.on("finish", () => {
    const endTime = performance.now();
    const durationSeconds = (endTime - startTime) / 1000;

    // Extract the matched path pattern (e.g. /api/v1/posts/:postId) on completion
    const routePattern = req.route ? `${req.baseUrl}${req.route.path}` : "unknown";
    const statusCodeStr = res.statusCode.toString();

    // Track throughput
    httpRequestsTotal.inc({
      method,
      route: routePattern,
      status_code: statusCodeStr,
    });

    // Track latency
    httpRequestDurationSeconds.observe(
      {
        method,
        route: routePattern,
        status_code: statusCodeStr,
      },
      durationSeconds
    );
  });

  next();
};
