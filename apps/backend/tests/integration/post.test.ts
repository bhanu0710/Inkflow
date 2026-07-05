/* eslint-disable @typescript-eslint/no-unsafe-return */
/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-argument */
/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/unbound-method */

import request from "supertest";
import { describe, it, expect, vi, beforeEach } from "vitest";
import jwt from "jsonwebtoken";
import { env } from "../../src/config/env.js";
import { createApp } from "../../src/app.js";
import { prisma } from "../../src/repositories/prisma.repository.js";

// Mock the prisma instance exported from prisma.repository
vi.mock("../../src/repositories/prisma.repository.js", () => {
  const mockPrisma = {
    user: {
      findUnique: vi.fn(),
      create: vi.fn(),
    },
    post: {
      create: vi.fn(),
      findUnique: vi.fn(),
    },
    refreshToken: {
      create: vi.fn(),
      findUnique: vi.fn(),
      update: vi.fn(),
    },
    $transaction: vi.fn((cb: any) => cb(mockPrisma)),
  };
  return {
    prisma: mockPrisma,
    disconnectPrisma: vi.fn(),
  };
});

interface TestResponse {
  success: boolean;
  data: any;
  error?: any;
}

const app = createApp();

describe("Post Integration Tests (Mocked DB)", () => {
  const testUserId = "mock-user-uuid";
  const testEmail = "test@example.com";
  let validToken: string;

  beforeEach(() => {
    vi.clearAllMocks();
    validToken = jwt.sign(
      { userId: testUserId, email: testEmail },
      env.JWT_ACCESS_SECRET,
      { algorithm: "HS256", expiresIn: 60 }
    );
  });

  describe("POST /api/v1/posts", () => {
    it("should successfully create a draft post with valid inputs", async () => {
      const postTitle = "My First Post Title";
      const postContent = "This is a simple markdown content for the post. It has some words.";
      const expectedSlug = "my-first-post-title";

      vi.mocked(prisma.post.create).mockResolvedValueOnce({
        id: "mock-post-uuid",
        authorId: testUserId,
        title: postTitle,
        slug: expectedSlug,
        markdownContent: postContent,
        status: "DRAFT",
        readingTimeMinutes: 1,
        publishedAt: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      } as any);

      const response = await request(app)
        .post("/api/v1/posts")
        .set("Authorization", `Bearer ${validToken}`)
        .send({
          title: postTitle,
          markdownContent: postContent,
        });

      const body = response.body as TestResponse;
      const data = body.data as unknown as Record<string, unknown>;

      expect(response.status).toBe(201);
      expect(body.success).toBe(true);
      expect(data.id).toBe("mock-post-uuid");
      expect(data.authorId).toBe(testUserId);
      expect(data.title).toBe(postTitle);
      expect(data.slug).toBe(expectedSlug);
      expect(data.status).toBe("DRAFT");
      expect(data.readingTimeMinutes).toBe(1);

      expect(prisma.post.create).toHaveBeenCalledWith({
        data: {
          authorId: testUserId,
          title: postTitle,
          markdownContent: postContent,
          slug: expectedSlug,
          readingTimeMinutes: 1,
          status: "DRAFT",
        },
      });
    });

    it("should fail with 401 when Authorization header is missing", async () => {
      const response = await request(app)
        .post("/api/v1/posts")
        .send({
          title: "Some Title",
          markdownContent: "Some Content",
        });

      const body = response.body as TestResponse;
      const error = body.error as unknown as Record<string, unknown>;

      expect(response.status).toBe(401);
      expect(body.success).toBe(false);
      expect(error.code).toBe("UNAUTHENTICATED");
    });

    it("should fail with 400 when title or content is invalid/missing", async () => {
      const response = await request(app)
        .post("/api/v1/posts")
        .set("Authorization", `Bearer ${validToken}`)
        .send({
          title: "", // empty title
          markdownContent: "Some content",
        });

      const body = response.body as TestResponse;
      const error = body.error as unknown as Record<string, unknown>;

      expect(response.status).toBe(400);
      expect(body.success).toBe(false);
      expect(error.code).toBe("VALIDATION_ERROR");
    });

    it("should reject and ignore any client-provided authorId or creator attributes", async () => {
      const postTitle = "Secure Post";
      const postContent = "Content that cannot be hijacked.";
      const hackerUserId = "attacker-user-uuid";

      vi.mocked(prisma.post.create).mockResolvedValueOnce({
        id: "mock-post-uuid",
        authorId: testUserId, // must still be testUserId!
        title: postTitle,
        slug: "secure-post",
        markdownContent: postContent,
        status: "DRAFT",
        readingTimeMinutes: 1,
        publishedAt: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      } as any);

      const response = await request(app)
        .post("/api/v1/posts")
        .set("Authorization", `Bearer ${validToken}`)
        .send({
          title: postTitle,
          markdownContent: postContent,
          authorId: hackerUserId, // attacker tries to override
          userId: hackerUserId,
          ownerId: hackerUserId,
        });

      expect(response.status).toBe(201);
      expect(prisma.post.create).toHaveBeenCalledWith({
        data: {
          authorId: testUserId, // verified: uses authentic user id, not attacker's
          title: postTitle,
          markdownContent: postContent,
          slug: "secure-post",
          readingTimeMinutes: 1,
          status: "DRAFT",
        },
      });
    });
  });

  describe("GET /api/v1/posts/:postId", () => {
    const testPostId = "8bc7d100-349f-4318-bf12-58b4279b778f";

    it("should successfully retrieve the post if owned by the authenticated user", async () => {
      const mockPost = {
        id: testPostId,
        authorId: testUserId,
        title: "Test Post Title",
        slug: "test-post-title",
        markdownContent: "Test Content",
        status: "DRAFT",
        readingTimeMinutes: 2,
        publishedAt: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      vi.mocked(prisma.post.findUnique).mockResolvedValueOnce(mockPost as any);

      const response = await request(app)
        .get(`/api/v1/posts/${testPostId}`)
        .set("Authorization", `Bearer ${validToken}`);

      const body = response.body as TestResponse;
      const data = body.data as unknown as Record<string, unknown>;

      expect(response.status).toBe(200);
      expect(body.success).toBe(true);
      expect(data.id).toBe(testPostId);
      expect(data.authorId).toBe(testUserId);
      expect(data.title).toBe("Test Post Title");
      expect(data.slug).toBe("test-post-title");
      expect(data.status).toBe("DRAFT");
      expect(data.readingTimeMinutes).toBe(2);
    });

    it("should fail with 400 when param postId is an invalid UUID", async () => {
      const response = await request(app)
        .get("/api/v1/posts/invalid-uuid-format")
        .set("Authorization", `Bearer ${validToken}`);

      const body = response.body as TestResponse;
      const error = body.error as unknown as Record<string, unknown>;

      expect(response.status).toBe(400);
      expect(body.success).toBe(false);
      expect(error.code).toBe("VALIDATION_ERROR");
    });

    it("should fail with 401 when Authorization header is missing", async () => {
      const response = await request(app)
        .get(`/api/v1/posts/${testPostId}`);

      const body = response.body as TestResponse;
      const error = body.error as unknown as Record<string, unknown>;

      expect(response.status).toBe(401);
      expect(body.success).toBe(false);
      expect(error.code).toBe("UNAUTHENTICATED");
    });

    it("should fail with 404 when post does not exist in database", async () => {
      vi.mocked(prisma.post.findUnique).mockResolvedValueOnce(null);

      const response = await request(app)
        .get(`/api/v1/posts/${testPostId}`)
        .set("Authorization", `Bearer ${validToken}`);

      const body = response.body as TestResponse;
      const error = body.error as unknown as Record<string, unknown>;

      expect(response.status).toBe(404);
      expect(body.success).toBe(false);
      expect(error.code).toBe("RESOURCE_NOT_FOUND");
    });

    it("should fail with 404 when post is owned by another user (no info leakage)", async () => {
      const mockPostOfAnotherUser = {
        id: testPostId,
        authorId: "another-user-uuid-12345", // owned by someone else
        title: "Secret Post",
        slug: "secret-post",
        markdownContent: "Secret content",
        status: "DRAFT",
        readingTimeMinutes: 5,
        publishedAt: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      vi.mocked(prisma.post.findUnique).mockResolvedValueOnce(mockPostOfAnotherUser as any);

      const response = await request(app)
        .get(`/api/v1/posts/${testPostId}`)
        .set("Authorization", `Bearer ${validToken}`);

      const body = response.body as TestResponse;
      const error = body.error as unknown as Record<string, unknown>;

      expect(response.status).toBe(404);
      expect(body.success).toBe(false);
      expect(error.code).toBe("RESOURCE_NOT_FOUND"); // secure 404, not 403 Forbidden!
    });
  });
});

