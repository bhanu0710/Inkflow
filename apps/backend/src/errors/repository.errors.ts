import { Prisma } from "@prisma/client";

export class RepositoryError extends Error {
  constructor(message: string, cause?: unknown) {
    super(message, { cause });
    this.name = this.constructor.name;
    Error.captureStackTrace(this, this.constructor);
  }
}

export class UniqueConstraintViolationError extends RepositoryError {
  constructor(
    public readonly entityName: string,
    public readonly target: string[],
    message: string = `${entityName} with duplicate fields: [${target.join(", ")}] already exists.`,
    cause?: unknown
  ) {
    super(message, cause);
  }
}

export class EntityNotFoundError extends RepositoryError {
  constructor(
    public readonly entityName: string,
    public readonly criteria: Record<string, unknown> | string,
    message: string = typeof criteria === "string"
      ? `${entityName} with identifier ${criteria} not found.`
      : `${entityName} not found matching criteria: ${JSON.stringify(criteria)}.`,
    cause?: unknown
  ) {
    super(message, cause);
  }
}

export class RelationshipConstraintViolationError extends RepositoryError {
  constructor(
    public readonly relation: string,
    message: string = `Relationship constraint violation on relation: ${relation}.`,
    cause?: unknown
  ) {
    super(message, cause);
  }
}

export const mapPrismaError = (error: unknown, entityName: string): Error => {
  if (error instanceof Prisma.PrismaClientKnownRequestError) {
    switch (error.code) {
      case "P2002": {
        const target = (error.meta?.target as string[]) || [];
        return new UniqueConstraintViolationError(entityName, target, undefined, error);
      }
      case "P2025": {
        return new EntityNotFoundError(entityName, "specified identifier", undefined, error);
      }
      case "P2003": {
        const fieldName = (error.meta?.field_name as string) || "unknown_field";
        return new RelationshipConstraintViolationError(fieldName, undefined, error);
      }
      default:
        return new RepositoryError(`Prisma error code ${error.code} on entity ${entityName}`, error);
    }
  }

  if (error instanceof Error) {
    return new RepositoryError(error.message, error);
  }

  return new RepositoryError(`Unknown database error on entity ${entityName}`, error);
};
