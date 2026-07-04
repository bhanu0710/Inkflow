import { Router } from "express";

import {
  healthController,
  livenessController,
  readinessController
} from "./health.controller.js";

export const healthRouter = Router();

healthRouter.get("/health", healthController);
healthRouter.get("/ready", readinessController);
healthRouter.get("/live", livenessController);
