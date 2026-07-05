import { Router } from "express";
import { PostController } from "../controllers/post.controller.js";
import { validateRequest } from "../validation/index.js";
import { createPostSchema } from "../validation/schemas/post/create-post.schema.js";
import { getPostSchema } from "../validation/schemas/post/get-post.schema.js";
import { createAuthMiddleware } from "../middlewares/auth.middleware.js";
import { PostRepository, RefreshTokenRepository } from "../repositories/index.js";
import { PostService } from "../services/post.service.js";
import { TokenService } from "../services/token.service.js";
import { prisma } from "../repositories/prisma.repository.js";

const postRepository = new PostRepository(prisma);
const postService = new PostService(postRepository);
const postController = new PostController(postService);

const refreshTokenRepository = new RefreshTokenRepository(prisma);
const tokenService = new TokenService(refreshTokenRepository);
const authenticate = createAuthMiddleware(tokenService);

export const postRouter = Router();

postRouter.post("/", authenticate, validateRequest(createPostSchema), (req, res, next) => {
  postController.create(req, res, next).catch(next);
});

postRouter.get("/:postId", authenticate, validateRequest(getPostSchema), (req, res, next) => {
  postController.getById(req, res, next).catch(next);
});
