import { randomUUID } from "node:crypto";
import type { Request, Response, NextFunction } from "express";
import { logger } from "../lib/logger/index.js";

import { getActiveTraceId } from "../lib/tracing/index.js";

const REQUEST_ID_HEADER = "x-request-id";

/**
 * Middleware for production-grade request logging and correlation tracking.
 *
 * Responsibilities:
 * - Generates or preserves incoming Correlation (Request) IDs.
 * - Attaches the Request ID to Express Request context.
 * - Reflects the Request ID as response header.
 * - Logs request initiation with client agent details.
 * - Monitors response duration and logs request completion.
 */
export const requestLoggingMiddleware = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  const incomingId = req.header(REQUEST_ID_HEADER);
  const requestId = incomingId?.trim() || randomUUID();

  // Attach requestId to request context
  req.requestId = requestId;

  // Expose requestId header on the response
  res.setHeader(REQUEST_ID_HEADER, requestId);

  const { method, path, ip } = req;
  const userAgent = req.header("user-agent") || "";
  const startTime = performance.now();

  const traceId = getActiveTraceId();

  // Log Request Start
  logger.info(
    {
      requestId,
      traceId,
      method,
      path,
      ip,
      userAgent,
    },
    "Request started"
  );

  // Track and log Request Completion
  res.on("finish", () => {
    const endTime = performance.now();
    const durationMs = parseFloat((endTime - startTime).toFixed(2));
    const currentTraceId = getActiveTraceId();

    logger.info(
      {
        requestId,
        traceId: currentTraceId,
        method,
        path,
        statusCode: res.statusCode,
        durationMs,
      },
      "Request completed"
    );
  });

  next();
};

