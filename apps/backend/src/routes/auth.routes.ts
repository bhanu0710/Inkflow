import { Router } from "express";
import { AuthController } from "../controllers/auth.controller.js";
import { validateRequest } from "../validation/index.js";
import { registerSchema } from "../validation/schemas/auth/register.schema.js";
import { loginSchema } from "../validation/schemas/auth/login.schema.js";
import { UserRepository, RefreshTokenRepository, PrismaTransactionManager } from "../repositories/index.js";
import { AuthService } from "../services/auth.service.js";
import { TokenService } from "../services/token.service.js";
import { prisma } from "../repositories/prisma.repository.js";

const userRepository = new UserRepository(prisma);
const refreshTokenRepository = new RefreshTokenRepository(prisma);
const transactionManager = new PrismaTransactionManager(prisma);
const tokenService = new TokenService(refreshTokenRepository);
const authService = new AuthService(userRepository, tokenService, transactionManager);
const authController = new AuthController(authService);

export const authRouter = Router();

authRouter.post("/register", validateRequest(registerSchema), (req, res, next) => {
  authController.register(req, res, next).catch(next);
});

authRouter.post("/login", validateRequest(loginSchema), (req, res, next) => {
  authController.login(req, res, next).catch(next);
});
