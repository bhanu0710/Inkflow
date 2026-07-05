import type { Request, Response, NextFunction } from "express";
import type { HealthService } from "./health.service.js";

export class HealthController {
  constructor(private readonly healthService: HealthService) {}

  /**
   * Returns 200 UP indicating that the Node process is running.
   */
  getLiveness = (_request: Request, response: Response): void => {
    const status = this.healthService.getLiveness();
    response.status(200).json(status);
  };

  /**
   * Verifies that database and redis dependencies are both healthy.
   * Returns 200 if UP, otherwise 503 DOWN.
   */
  getReadiness = async (_request: Request, response: Response, next: NextFunction): Promise<void> => {
    try {
      const status = await this.healthService.getReadiness();
      const statusCode = status.status === "UP" ? 200 : 503;
      response.status(statusCode).json(status);
    } catch (error) {
      next(error);
    }
  };

  /**
   * Returns a combined health status including service metadata, uptime, and dependencies.
   * Returns 200 if all UP, otherwise 503 DOWN.
   */
  getCombined = async (_request: Request, response: Response, next: NextFunction): Promise<void> => {
    try {
      const status = await this.healthService.getCombined();
      const statusCode = status.status === "UP" ? 200 : 503;
      response.status(statusCode).json(status);
    } catch (error) {
      next(error);
    }
  };
}
