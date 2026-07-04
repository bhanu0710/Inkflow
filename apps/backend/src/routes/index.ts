import { Router } from "express";
import { authRouter } from "./auth.routes.js";

/**
 * Main API V1 versioned router.
 *
 * Responsibilities:
 * - Version APIs under the /api/v1 namespace.
 *
 * Non-responsibilities:
 * - Direct business logic or controller definitions.
 */

export const apiRouter = Router();

apiRouter.use("/auth", authRouter);
