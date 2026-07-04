import type { Request, Response } from "express";
import type { HealthService } from "./health.service.js";

export class HealthController {
  constructor(private readonly healthService: HealthService) {}

  getLiveness = (_request: Request, response: Response): void => {
    const status = this.healthService.getLivenessStatus();
    response.status(200).json(status);
  };

  getReadiness = async (_request: Request, response: Response): Promise<void> => {
    const status = await this.healthService.getReadinessStatus();
    const statusCode = status.status === "ok" ? 200 : 503;
    response.status(statusCode).json(status);
  };
}
