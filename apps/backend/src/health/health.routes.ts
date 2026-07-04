import { Router } from "express";
import { HealthService } from "./health.service.js";
import { HealthController } from "./health.controller.js";

const healthService = new HealthService();
const healthController = new HealthController(healthService);

export const healthRouter = Router();

healthRouter.get("/health", healthController.getLiveness);
healthRouter.get("/live", healthController.getLiveness);
healthRouter.get("/ready", (req, res, next) => {
  healthController.getReadiness(req, res).catch(next);
});
