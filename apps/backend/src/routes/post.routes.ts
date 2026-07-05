import { Router } from "express";
import { PostController } from "../controllers/post.controller.js";
import { validateRequest } from "../validation/index.js";
import { createPostSchema } from "../validation/schemas/post/create-post.schema.js";
import { getPostSchema } from "../validation/schemas/post/get-post.schema.js";
import { updatePostSchema } from "../validation/schemas/post/update-post.schema.js";
import { publishPostSchema } from "../validation/schemas/post/publish-post.schema.js";
import { listPostsSchema } from "../validation/schemas/post/list-posts.schema.js";
import { deletePostSchema } from "../validation/schemas/post/delete-post.schema.js";
import { getPublicPostSchema } from "../validation/schemas/post/get-public-post.schema.js";
import { listPublicPostsSchema } from "../validation/schemas/post/list-public-posts.schema.js";
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

postRouter.get("/public", validateRequest(listPublicPostsSchema), (req, res, next) => {
  postController.listPublic(req, res, next).catch(next);
});

postRouter.get("/public/:slug", validateRequest(getPublicPostSchema), (req, res, next) => {
  postController.getPublic(req, res, next).catch(next);
});

postRouter.get("/", authenticate, validateRequest(listPostsSchema), (req, res, next) => {
  postController.list(req, res, next).catch(next);
});

postRouter.post("/", authenticate, validateRequest(createPostSchema), (req, res, next) => {
  postController.create(req, res, next).catch(next);
});

postRouter.get("/:postId", authenticate, validateRequest(getPostSchema), (req, res, next) => {
  postController.getById(req, res, next).catch(next);
});

postRouter.patch("/:postId", authenticate, validateRequest(updatePostSchema), (req, res, next) => {
  postController.update(req, res, next).catch(next);
});

postRouter.post("/:postId/publish", authenticate, validateRequest(publishPostSchema), (req, res, next) => {
  postController.publish(req, res, next).catch(next);
});

postRouter.delete("/:postId", authenticate, validateRequest(deletePostSchema), (req, res, next) => {
  postController.delete(req, res, next).catch(next);
});
