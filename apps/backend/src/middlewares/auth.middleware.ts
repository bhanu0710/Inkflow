import type { Request, Response, NextFunction } from "express";
import type { TokenService } from "../services/token.service.js";
import { AuthenticationError } from "../errors/app.errors.js";

/**
 * JWT Authentication Middleware Factory.
 *
 * Responsibilities:
 * - Validate the presence and schema of Authorization Bearer header.
 * - Call TokenService.verifyAccessToken to check JWT validity.
 * - Inject verified user payload { id, email } into request.user.
 *
 * Non-responsibilities:
 * - Domain user existence checks or database lookups.
 * - Role-based authorization.
 */
export const createAuthMiddleware = (tokenService: TokenService) => {
  return (req: Request, _res: Response, next: NextFunction): void => {
    const authHeader = req.headers.authorization;
    if (!authHeader) {
      throw new AuthenticationError("Authentication required");
    }

    const parts = authHeader.split(" ");
    if (parts.length !== 2 || parts[0] !== "Bearer") {
      throw new AuthenticationError("Authentication required");
    }

    const token = parts[1];
    if (!token || token.trim() === "") {
      throw new AuthenticationError("Authentication required");
    }

    try {
      const decoded = tokenService.verifyAccessToken(token);
      req.user = {
        id: decoded.userId,
        email: decoded.email,
      };
      next();
    } catch (error) {
      // Re-throw as standard AuthenticationError with generic message, hiding inner error stack from response
      throw new AuthenticationError("Authentication required", error);
    }
  };
};
