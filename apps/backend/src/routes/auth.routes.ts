import { Router } from "express";
import { AuthController } from "../controllers/auth.controller.js";
import { validateRequest } from "../validation/index.js";
import { registerSchema } from "../validation/schemas/auth/register.schema.js";
import { loginSchema } from "../validation/schemas/auth/login.schema.js";
import { refreshSchema } from "../validation/schemas/auth/refresh.schema.js";
import { logoutSchema } from "../validation/schemas/auth/logout.schema.js";
import { createAuthMiddleware } from "../middlewares/auth.middleware.js";
import { UserRepository, RefreshTokenRepository, PrismaTransactionManager } from "../repositories/index.js";
import { AuthService } from "../services/auth.service.js";
import { TokenService } from "../services/token.service.js";
import { prisma } from "../repositories/prisma.repository.js";
import { ok } from "../lib/response/index.js";

const userRepository = new UserRepository(prisma);
const refreshTokenRepository = new RefreshTokenRepository(prisma);
const transactionManager = new PrismaTransactionManager(prisma);
const tokenService = new TokenService(refreshTokenRepository);
const authService = new AuthService(userRepository, tokenService, refreshTokenRepository, transactionManager);
const authController = new AuthController(authService);
const authenticate = createAuthMiddleware(tokenService);

export const authRouter = Router();

authRouter.post("/register", validateRequest(registerSchema), (req, res, next) => {
  authController.register(req, res, next).catch(next);
});

authRouter.post("/login", validateRequest(loginSchema), (req, res, next) => {
  authController.login(req, res, next).catch(next);
});

authRouter.post("/refresh", validateRequest(refreshSchema), (req, res, next) => {
  authController.refresh(req, res, next).catch(next);
});

authRouter.post("/logout", validateRequest(logoutSchema), (req, res, next) => {
  authController.logout(req, res, next).catch(next);
});

authRouter.get("/protected", authenticate, (req, res) => {
  res.status(200).json(ok({ message: "Authenticated" }));
});

authRouter.get("/me", authenticate, (req, res, next) => {
  authController.me(req, res, next).catch(next);
});

