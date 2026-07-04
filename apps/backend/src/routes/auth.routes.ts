import { Router } from "express";
import { AuthController } from "../controllers/auth.controller.js";
import { validateRequest } from "../validation/index.js";
import { registerSchema } from "../validation/schemas/auth/register.schema.js";
import { UserRepository, RefreshTokenRepository, PrismaTransactionManager } from "../repositories/index.js";

import { AuthService } from "../services/auth.service.js";
import { prisma } from "../repositories/prisma.repository.js";

const userRepository = new UserRepository(prisma);
const refreshTokenRepository = new RefreshTokenRepository(prisma);
const transactionManager = new PrismaTransactionManager(prisma);
const authService = new AuthService(userRepository, refreshTokenRepository, transactionManager);
const authController = new AuthController(authService);

export const authRouter = Router();

authRouter.post("/register", validateRequest(registerSchema), (req, res, next) => {
  authController.register(req, res, next).catch(next);
});
