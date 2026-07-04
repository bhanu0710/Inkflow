import { randomUUID } from "node:crypto";

import type { NextFunction, Request, Response } from "express";

const requestIdHeader = "x-request-id";

export const requestContextMiddleware = (
  request: Request,
  response: Response,
  next: NextFunction
) => {
  const incomingRequestId = request.header(requestIdHeader);
  const requestId = incomingRequestId?.trim() || randomUUID();

  request.requestId = requestId;
  response.setHeader(requestIdHeader, requestId);

  next();
};
