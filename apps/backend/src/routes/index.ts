import { Router } from "express";
import { authRouter } from "./auth.routes.js";
import { postRouter } from "./post.routes.js";

/**
 * Main API V1 router.
 *
 * Responsibilities:
 * - Version and route API resources.
 */
export const apiRouter = Router();

apiRouter.use("/auth", authRouter);
apiRouter.use("/posts", postRouter);
