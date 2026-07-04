import type { Request, Response, NextFunction, RequestHandler } from "express";
import type { ParsedQs } from "qs";
import { z } from "zod";
import { ValidationError } from "../../errors/app.errors.js";
import type { ValidationSchema } from "../types/index.js";
import { mapZodError } from "../helpers/map-zod-error.js";

/**
 * Express middleware to validate incoming requests.
 *
 * Responsibilities:
 * - Intercept incoming HTTP requests.
 * - Parse and validate body, params, and query schemas.
 * - Replace raw values with parsed/sanitized Zod output.
 * - Pass mapped ValidationError to Express next() on failure.
 *
 * Non-responsibilities:
 * - Directly sending HTTP responses.
 * - Domain-specific validation logic.
 * - Direct logging or auditing of sensitive request payloads.
 */
export const validateRequest = (schemas: ValidationSchema): RequestHandler => {
  return (req: Request, _res: Response, next: NextFunction): void => {
    Promise.resolve()
      .then(async () => {
        if (schemas.params) {
          req.params = (await schemas.params.parseAsync(req.params)) as Record<string, string>;
        }
        if (schemas.query) {
          req.query = (await schemas.query.parseAsync(req.query)) as ParsedQs;
        }
        if (schemas.body) {
          req.body = (await schemas.body.parseAsync(req.body)) as unknown;
        }
        next();
      })
      .catch((error: unknown) => {
        if (error instanceof z.ZodError) {
          const details = mapZodError(error);
          next(new ValidationError("Validation failed", details, error));
        } else {
          next(error);
        }
      });
  };
};
