import type { Request, Response, NextFunction } from "express";
import type { AuthService } from "../services/auth.service.js";
import { created, ok } from "../lib/response/index.js";

/**
 * Authentication controller handling HTTP registrations and logins.
 *
 * Responsibilities:
 * - Map HTTP body inputs to the service parameters.
 * - Call service logic.
 * - Delegate formatted payload generation and HTTP responses.
 *
 * Non-responsibilities:
 * - Validating payloads directly or executing transaction queries.
 */
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  register = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { email, username, displayName, password } = req.body as {
        email: string;
        username: string;
        displayName: string;
        password: string;
      };

      const registrationResult = await this.authService.register({
        email,
        username,
        displayName,
        password,
      });

      const responsePayload = created(registrationResult);
      res.status(201).json(responsePayload);
    } catch (error) {
      next(error);
    }
  };

  login = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { email, password } = req.body as {
        email: string;
        password: string;
      };

      const loginResult = await this.authService.login({
        email,
        password,
      });

      const responsePayload = ok(loginResult);
      res.status(200).json(responsePayload);
    } catch (error) {
      next(error);
    }
  };
}
