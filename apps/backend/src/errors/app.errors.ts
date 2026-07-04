export class AppError extends Error {
  constructor(
    public readonly statusCode: number,
    message: string,
    public readonly errorCode: string,
    cause?: unknown
  ) {
    super(message, { cause });
    this.name = this.constructor.name;
    Error.captureStackTrace(this, this.constructor);
  }
}

export interface ValidationErrorItem {
  field: string;
  message: string;
}

export class ValidationError extends AppError {
  constructor(
    message: string = "Validation failed",
    public readonly details: ValidationErrorItem[] = [],
    cause?: unknown
  ) {
    super(400, message, "VALIDATION_ERROR", cause);
  }
}

export class AuthenticationError extends AppError {
  constructor(message: string = "Authentication failed", cause?: unknown) {
    super(401, message, "UNAUTHENTICATED", cause);
  }
}

export class AuthorizationError extends AppError {
  constructor(message: string = "Forbidden", cause?: unknown) {
    super(403, message, "FORBIDDEN", cause);
  }
}

export class NotFoundError extends AppError {
  constructor(message: string = "Resource not found", cause?: unknown) {
    super(404, message, "RESOURCE_NOT_FOUND", cause);
  }
}

export class ConflictError extends AppError {
  constructor(message: string = "Resource conflict", cause?: unknown) {
    super(409, message, "RESOURCE_CONFLICT", cause);
  }
}

export class InternalServerError extends AppError {
  constructor(message: string = "An unexpected error occurred", cause?: unknown) {
    super(500, message, "INTERNAL_SERVER_ERROR", cause);
  }
}
