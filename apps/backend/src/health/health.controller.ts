import type { Request, Response } from "express";

import {
  getHealthStatus,
  getLivenessStatus,
  getReadinessStatus
} from "./health.service.js";

export const healthController = (_request: Request, response: Response) => {
  response.status(200).json(getHealthStatus());
};

export const readinessController = (_request: Request, response: Response) => {
  response.status(200).json(getReadinessStatus());
};

export const livenessController = (_request: Request, response: Response) => {
  response.status(200).json(getLivenessStatus());
};
