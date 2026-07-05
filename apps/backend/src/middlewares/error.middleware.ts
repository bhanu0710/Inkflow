import type { Request, Response, NextFunction } from "express";
import { logger } from "../lib/logger/index.js";
import { getActiveTraceId } from "../lib/tracing/index.js";
import {
  AppError,
  NotFoundError,
  ConflictError,
  ValidationError,
  InternalServerError,
} from "../errors/app.errors.js";
import {
  EntityNotFoundError,
  UniqueConstraintViolationError,
  RelationshipConstraintViolationError,
} from "../errors/repository.errors.js";

const translateRepositoryError = (error: unknown): unknown => {
  if (error instanceof EntityNotFoundError) {
    return new NotFoundError(error.message, error);
  }
  if (error instanceof UniqueConstraintViolationError) {
    return new ConflictError(error.message, error);
  }
  if (error instanceof RelationshipConstraintViolationError) {
    return new ConflictError(error.message, error);
  }
  return error;
};

export const errorMiddleware = (
  error: unknown,
  request: Request,
  response: Response,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  _next: NextFunction
): void => {
  const translatedError = translateRepositoryError(error);

  let appError: AppError;

  if (translatedError instanceof AppError) {
    appError = translatedError;
  } else {
    const message = translatedError instanceof Error ? translatedError.message : "An unexpected error occurred";
    appError = new InternalServerError(message, translatedError);
  }

  const requestId = request.requestId || "unknown";
  const traceId = getActiveTraceId();
  const isProduction = process.env.NODE_ENV === "production";

  if (appError.statusCode >= 500) {
    logger.error(
      {
        requestId,
        traceId,
        errorCode: appError.errorCode,
        statusCode: appError.statusCode,
        error: {
          message: appError.message,
          stack: appError.stack,
          cause: appError.cause,
        },
      },
      "Internal Server Error occurred"
    );
  } else {
    logger.warn(
      {
        requestId,
        traceId,
        errorCode: appError.errorCode,
        statusCode: appError.statusCode,
        message: appError.message,
      },
      "Client request error occurred"
    );
  }

  const errorResponse: Record<string, unknown> = {
    code: appError.errorCode,
    message: appError.message,
    requestId,
  };

  if (appError instanceof ValidationError && appError.details.length > 0) {
    errorResponse.details = appError.details;
  }

  if (!isProduction) {
    errorResponse.stack = appError.stack;
  }

  response.status(appError.statusCode).json({
    success: false,
    error: errorResponse,
  });
};

export const notFoundMiddleware = (request: Request, response: Response, next: NextFunction): void => {
  next(new NotFoundError(`Route ${request.method} ${request.path} not found`));
};
