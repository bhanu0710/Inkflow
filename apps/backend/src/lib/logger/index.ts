import type { Request, Response } from "express";
import pino from "pino";
import { pinoHttp } from "pino-http";

import { env } from "../../config/env.js";

export const logger = pino({
  level: env.LOG_LEVEL,
  base: {
    service: env.SERVICE_NAME,
    environment: env.NODE_ENV
  }
});

export const httpLogger = pinoHttp<Request, Response>({
  logger,
  genReqId: (request) => request.requestId,
  customProps: (request) => ({
    requestId: request.requestId
  })
});
