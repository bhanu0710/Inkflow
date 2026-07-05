import { Router } from "express";
import { HealthService } from "./health.service.js";
import { HealthController } from "./health.controller.js";

const healthService = new HealthService();
const healthController = new HealthController(healthService);

export const healthRouter = Router();

healthRouter.get("/health/live", healthController.getLiveness);

healthRouter.get("/health/ready", (req, res, next) => {
  healthController.getReadiness(req, res, next).catch(next);
});

healthRouter.get("/health", (req, res, next) => {
  healthController.getCombined(req, res, next).catch(next);
});
