import type { Request, Response, NextFunction } from "express";
import type { AuthService } from "../services/auth.service.js";
import { created, ok, noContent } from "../lib/response/index.js";
import { AuthenticationError } from "../errors/app.errors.js";



/**
 * Authentication controller handling HTTP registrations, logins, and token refreshes.
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

  refresh = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { refreshToken } = req.body as {
        refreshToken: string;
      };

      const refreshResult = await this.authService.refresh(refreshToken);

      const responsePayload = ok(refreshResult);
      res.status(200).json(responsePayload);
    } catch (error) {
      next(error);
    }
  };

  logout = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { refreshToken } = req.body as {
        refreshToken: string;
      };

      await this.authService.logout(refreshToken);

      noContent();
      res.status(204).send();
    } catch (error) {
      next(error);
    }
  };

  me = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const userId = req.user?.id;
      if (!userId) {
        throw new AuthenticationError("Authentication required");
      }

      const userProfile = await this.authService.me(userId);

      const responsePayload = ok(userProfile);
      res.status(200).json(responsePayload);
    } catch (error) {
      next(error);
    }
  };

  updateProfile = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const userId = req.user?.id;
      if (!userId) {
        throw new AuthenticationError("Authentication required");
      }

      const { displayName, username } = req.body as {
        displayName?: string;
        username?: string;
      };

      const updatedProfile = await this.authService.updateProfile(userId, {
        displayName,
        username,
      });

      const responsePayload = ok(updatedProfile);
      res.status(200).json(responsePayload);
    } catch (error) {
      next(error);
    }
  };
}



