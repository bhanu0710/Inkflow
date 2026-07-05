/* eslint-disable @typescript-eslint/no-unsafe-return */
/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-argument */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
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
      update: vi.fn(),
      findMany: vi.fn(),
      count: vi.fn(),
      delete: vi.fn(),
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

  describe("PATCH /api/v1/posts/:postId", () => {
    const testPostId = "8bc7d100-349f-4318-bf12-58b4279b778f";

    it("should successfully update post title, regenerate slug, and retain unchanged values", async () => {
      const mockPost = {
        id: testPostId,
        authorId: testUserId,
        title: "Old Title",
        slug: "old-title",
        markdownContent: "Unchanged markdown content",
        status: "DRAFT",
        readingTimeMinutes: 1,
        publishedAt: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      const updatedTitle = "New Brand Title";
      const expectedSlug = "new-brand-title";

      vi.mocked(prisma.post.findUnique).mockResolvedValueOnce(mockPost as any);
      vi.mocked(prisma.post.update).mockResolvedValueOnce({
        ...mockPost,
        title: updatedTitle,
        slug: expectedSlug,
      } as any);

      const response = await request(app)
        .patch(`/api/v1/posts/${testPostId}`)
        .set("Authorization", `Bearer ${validToken}`)
        .send({
          title: updatedTitle,
        });

      const body = response.body as TestResponse;
      const data = body.data as unknown as Record<string, unknown>;

      expect(response.status).toBe(200);
      expect(body.success).toBe(true);
      expect(data.title).toBe(updatedTitle);
      expect(data.slug).toBe(expectedSlug);
      expect(data.markdownContent).toBe("Unchanged markdown content");
      expect(prisma.post.update).toHaveBeenCalledWith({
        where: { id: testPostId },
        data: {
          title: updatedTitle,
          slug: expectedSlug,
        },
      });
    });

    it("should successfully update markdown content and recalculate reading time", async () => {
      const mockPost = {
        id: testPostId,
        authorId: testUserId,
        title: "Unchanged Title",
        slug: "unchanged-title",
        markdownContent: "Old content",
        status: "DRAFT",
        readingTimeMinutes: 1,
        publishedAt: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      // 400 words = 2 mins reading time
      const longMarkdownContent = "word ".repeat(400);

      vi.mocked(prisma.post.findUnique).mockResolvedValueOnce(mockPost as any);
      vi.mocked(prisma.post.update).mockResolvedValueOnce({
        ...mockPost,
        markdownContent: longMarkdownContent,
        readingTimeMinutes: 2,
      } as any);

      const response = await request(app)
        .patch(`/api/v1/posts/${testPostId}`)
        .set("Authorization", `Bearer ${validToken}`)
        .send({
          markdownContent: longMarkdownContent,
        });

      const body = response.body as TestResponse;
      const data = body.data as unknown as Record<string, unknown>;

      expect(response.status).toBe(200);
      expect(body.success).toBe(true);
      expect(data.markdownContent).toBe(longMarkdownContent);
      expect(data.readingTimeMinutes).toBe(2);
      expect(prisma.post.update).toHaveBeenCalledWith({
        where: { id: testPostId },
        data: {
          markdownContent: longMarkdownContent,
          readingTimeMinutes: 2,
        },
      });
    });

    it("should successfully update both title and markdown content at once", async () => {
      const mockPost = {
        id: testPostId,
        authorId: testUserId,
        title: "Old Title",
        slug: "old-title",
        markdownContent: "Old content",
        status: "DRAFT",
        readingTimeMinutes: 1,
        publishedAt: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      const updatedTitle = "Double Update Title";
      const updatedMarkdown = "This is some new markdown.";

      vi.mocked(prisma.post.findUnique).mockResolvedValueOnce(mockPost as any);
      vi.mocked(prisma.post.update).mockResolvedValueOnce({
        ...mockPost,
        title: updatedTitle,
        slug: "double-update-title",
        markdownContent: updatedMarkdown,
      } as any);

      const response = await request(app)
        .patch(`/api/v1/posts/${testPostId}`)
        .set("Authorization", `Bearer ${validToken}`)
        .send({
          title: updatedTitle,
          markdownContent: updatedMarkdown,
        });

      expect(response.status).toBe(200);
    });

    it("should fail with 400 validation error if body contains unknown fields", async () => {
      const response = await request(app)
        .patch(`/api/v1/posts/${testPostId}`)
        .set("Authorization", `Bearer ${validToken}`)
        .send({
          title: "New Title",
          unknownProperty: "value",
        });

      const body = response.body as TestResponse;
      const error = body.error as unknown as Record<string, unknown>;

      expect(response.status).toBe(400);
      expect(body.success).toBe(false);
      expect(error.code).toBe("VALIDATION_ERROR");
    });

    it("should fail with 400 validation error if request body is empty", async () => {
      const response = await request(app)
        .patch(`/api/v1/posts/${testPostId}`)
        .set("Authorization", `Bearer ${validToken}`)
        .send({});

      const body = response.body as TestResponse;
      const error = body.error as unknown as Record<string, unknown>;

      expect(response.status).toBe(400);
      expect(body.success).toBe(false);
      expect(error.code).toBe("VALIDATION_ERROR");
    });

    it("should fail with 400 when param postId is an invalid UUID", async () => {
      const response = await request(app)
        .patch("/api/v1/posts/invalid-uuid")
        .set("Authorization", `Bearer ${validToken}`)
        .send({ title: "New Title" });

      const body = response.body as TestResponse;
      const error = body.error as unknown as Record<string, unknown>;

      expect(response.status).toBe(400);
      expect(body.success).toBe(false);
      expect(error.code).toBe("VALIDATION_ERROR");
    });

    it("should fail with 401 when Authorization header is missing", async () => {
      const response = await request(app)
        .patch(`/api/v1/posts/${testPostId}`)
        .send({ title: "New Title" });

      const body = response.body as TestResponse;
      const error = body.error as unknown as Record<string, unknown>;

      expect(response.status).toBe(401);
      expect(body.success).toBe(false);
      expect(error.code).toBe("UNAUTHENTICATED");
    });

    it("should fail with 404 when post does not exist", async () => {
      vi.mocked(prisma.post.findUnique).mockResolvedValueOnce(null);

      const response = await request(app)
        .patch(`/api/v1/posts/${testPostId}`)
        .set("Authorization", `Bearer ${validToken}`)
        .send({ title: "New Title" });

      const body = response.body as TestResponse;
      const error = body.error as unknown as Record<string, unknown>;

      expect(response.status).toBe(404);
      expect(body.success).toBe(false);
      expect(error.code).toBe("RESOURCE_NOT_FOUND");
    });

    it("should fail with 404 when post is owned by another user (no leaks)", async () => {
      const mockPostOfAnotherUser = {
        id: testPostId,
        authorId: "another-user-uuid-12345",
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
        .patch(`/api/v1/posts/${testPostId}`)
        .set("Authorization", `Bearer ${validToken}`)
        .send({ title: "Attacker Update" });

      const body = response.body as TestResponse;
      const error = body.error as unknown as Record<string, unknown>;

      expect(response.status).toBe(404);
      expect(body.success).toBe(false);
      expect(error.code).toBe("RESOURCE_NOT_FOUND");
    });

    it("should fail with 409 Conflict if post is not in DRAFT status", async () => {
      const mockPublishedPost = {
        id: testPostId,
        authorId: testUserId,
        title: "Published Post",
        slug: "published-post",
        markdownContent: "Published content",
        status: "PUBLISHED", // NOT a DRAFT
        readingTimeMinutes: 5,
        publishedAt: new Date(),
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      vi.mocked(prisma.post.findUnique).mockResolvedValueOnce(mockPublishedPost as any);

      const response = await request(app)
        .patch(`/api/v1/posts/${testPostId}`)
        .set("Authorization", `Bearer ${validToken}`)
        .send({ title: "Update Published" });

      const body = response.body as TestResponse;
      const error = body.error as unknown as Record<string, unknown>;

      expect(response.status).toBe(409);
      expect(body.success).toBe(false);
      expect(error.code).toBe("RESOURCE_CONFLICT");
      expect(error.message).toBe("Published posts cannot be modified.");
    });
  });

  describe("POST /api/v1/posts/:postId/publish", () => {
    const testPostId = "8bc7d100-349f-4318-bf12-58b4279b778f";

    it("should successfully publish own draft post and return the published post", async () => {
      const mockPost = {
        id: testPostId,
        authorId: testUserId,
        title: "My Draft Post",
        slug: "my-draft-post",
        markdownContent: "Draft content",
        status: "DRAFT",
        readingTimeMinutes: 2,
        publishedAt: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      vi.mocked(prisma.post.findUnique).mockResolvedValueOnce(mockPost as any);
      
      const publishTime = new Date();
      vi.mocked(prisma.post.update).mockResolvedValueOnce({
        ...mockPost,
        status: "PUBLISHED",
        publishedAt: publishTime,
      } as any);

      const response = await request(app)
        .post(`/api/v1/posts/${testPostId}/publish`)
        .set("Authorization", `Bearer ${validToken}`);

      const body = response.body as TestResponse;
      const data = body.data as unknown as Record<string, unknown>;

      expect(response.status).toBe(200);
      expect(body.success).toBe(true);
      expect(data.status).toBe("PUBLISHED");
      expect(data.publishedAt).toBeDefined();
      expect(data.slug).toBe("my-draft-post"); // slug remains unchanged
      expect(data.readingTimeMinutes).toBe(2); // reading time remains unchanged

      expect(prisma.post.update).toHaveBeenCalledWith({
        where: { id: testPostId },
        data: {
          status: "PUBLISHED",
          publishedAt: expect.any(Date),
        },
      });
    });

    it("should fail with 404 when trying to publish another user's draft post (no leaks)", async () => {
      const mockPostOfAnotherUser = {
        id: testPostId,
        authorId: "another-user-uuid",
        title: "Another Draft Post",
        slug: "another-draft-post",
        markdownContent: "Draft content",
        status: "DRAFT",
        readingTimeMinutes: 2,
        publishedAt: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      vi.mocked(prisma.post.findUnique).mockResolvedValueOnce(mockPostOfAnotherUser as any);

      const response = await request(app)
        .post(`/api/v1/posts/${testPostId}/publish`)
        .set("Authorization", `Bearer ${validToken}`);

      const body = response.body as TestResponse;
      const error = body.error as unknown as Record<string, unknown>;

      expect(response.status).toBe(404);
      expect(body.success).toBe(false);
      expect(error.code).toBe("RESOURCE_NOT_FOUND");
    });

    it("should fail with 400 when param postId is an invalid UUID format", async () => {
      const response = await request(app)
        .post("/api/v1/posts/invalid-uuid-format/publish")
        .set("Authorization", `Bearer ${validToken}`);

      const body = response.body as TestResponse;
      const error = body.error as unknown as Record<string, unknown>;

      expect(response.status).toBe(400);
      expect(body.success).toBe(false);
      expect(error.code).toBe("VALIDATION_ERROR");
    });

    it("should fail with 401 when Authorization header is missing", async () => {
      const response = await request(app)
        .post(`/api/v1/posts/${testPostId}/publish`);

      const body = response.body as TestResponse;
      const error = body.error as unknown as Record<string, unknown>;

      expect(response.status).toBe(401);
      expect(body.success).toBe(false);
      expect(error.code).toBe("UNAUTHENTICATED");
    });

    it("should fail with 404 when post does not exist in database", async () => {
      vi.mocked(prisma.post.findUnique).mockResolvedValueOnce(null);

      const response = await request(app)
        .post(`/api/v1/posts/${testPostId}/publish`)
        .set("Authorization", `Bearer ${validToken}`);

      const body = response.body as TestResponse;
      const error = body.error as unknown as Record<string, unknown>;

      expect(response.status).toBe(404);
      expect(body.success).toBe(false);
      expect(error.code).toBe("RESOURCE_NOT_FOUND");
    });

    it("should fail with 409 Conflict if post is already published", async () => {
      const mockPublishedPost = {
        id: testPostId,
        authorId: testUserId,
        title: "Already Published",
        slug: "already-published",
        markdownContent: "Content",
        status: "PUBLISHED",
        readingTimeMinutes: 2,
        publishedAt: new Date(),
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      vi.mocked(prisma.post.findUnique).mockResolvedValueOnce(mockPublishedPost as any);

      const response = await request(app)
        .post(`/api/v1/posts/${testPostId}/publish`)
        .set("Authorization", `Bearer ${validToken}`);

      const body = response.body as TestResponse;
      const error = body.error as unknown as Record<string, unknown>;

      expect(response.status).toBe(409);
      expect(body.success).toBe(false);
      expect(error.code).toBe("RESOURCE_CONFLICT");
      expect(error.message).toBe("Post is already published.");
    });
  });

  describe("GET /api/v1/posts", () => {
    it("should successfully retrieve only the authenticated user's posts ordered by newest first", async () => {
      const mockPosts = [
        {
          id: "post-uuid-2",
          authorId: testUserId,
          title: "Second Post",
          slug: "second-post",
          markdownContent: "content",
          status: "DRAFT",
          readingTimeMinutes: 1,
          publishedAt: null,
          createdAt: new Date("2026-07-05T12:00:00.000Z"),
          updatedAt: new Date("2026-07-05T12:00:00.000Z"),
        },
        {
          id: "post-uuid-1",
          authorId: testUserId,
          title: "First Post",
          slug: "first-post",
          markdownContent: "content",
          status: "PUBLISHED",
          readingTimeMinutes: 1,
          publishedAt: new Date("2026-07-05T10:00:00.000Z"),
          createdAt: new Date("2026-07-05T10:00:00.000Z"),
          updatedAt: new Date("2026-07-05T10:00:00.000Z"),
        },
      ];

      vi.mocked(prisma.post.findMany).mockResolvedValueOnce(mockPosts as any);
      vi.mocked(prisma.post.count).mockResolvedValueOnce(2);

      const response = await request(app)
        .get("/api/v1/posts")
        .set("Authorization", `Bearer ${validToken}`)
        .query({ page: 1, limit: 10 });

      const body = response.body as TestResponse;
      const data = body.data as unknown as Record<string, unknown>[];
      const meta = body.meta as unknown as Record<string, unknown>;


      expect(response.status).toBe(200);
      expect(body.success).toBe(true);
      expect(data).toHaveLength(2);
      expect(data[0].id).toBe("post-uuid-2"); // newest first
      expect(data[1].id).toBe("post-uuid-1");
      expect(meta.totalCount).toBe(2);
      expect(meta.page).toBe(1);
      expect(meta.limit).toBe(10);
      expect(meta.totalPages).toBe(1);

      expect(prisma.post.findMany).toHaveBeenCalledWith({
        where: { authorId: testUserId },
        take: 10,
        skip: 0,
        orderBy: {
          createdAt: "desc",
        },
      });
    });

    it("should return empty list when user has no posts", async () => {
      vi.mocked(prisma.post.findMany).mockResolvedValueOnce([]);
      vi.mocked(prisma.post.count).mockResolvedValueOnce(0);

      const response = await request(app)
        .get("/api/v1/posts")
        .set("Authorization", `Bearer ${validToken}`);

      const body = response.body as TestResponse;
      const data = body.data as unknown as any[];
      const meta = body.meta as unknown as Record<string, unknown>;

      expect(response.status).toBe(200);
      expect(body.success).toBe(true);
      expect(data).toHaveLength(0);
      expect(meta.totalCount).toBe(0);
      expect(meta.totalPages).toBe(0);
    });

    it("should respect pagination limit and skip values on page 2", async () => {
      vi.mocked(prisma.post.findMany).mockResolvedValueOnce([]);
      vi.mocked(prisma.post.count).mockResolvedValueOnce(25);

      const response = await request(app)
        .get("/api/v1/posts")
        .set("Authorization", `Bearer ${validToken}`)
        .query({ page: 2, limit: 10 });

      const body = response.body as TestResponse;
      const meta = body.meta as unknown as Record<string, unknown>;

      expect(response.status).toBe(200);
      expect(meta.page).toBe(2);
      expect(meta.limit).toBe(10);
      expect(meta.totalPages).toBe(3);

      expect(prisma.post.findMany).toHaveBeenCalledWith({
        where: { authorId: testUserId },
        take: 10,
        skip: 10, // skipping first 10 items for page 2
        orderBy: {
          createdAt: "desc",
        },
      });
    });

    it("should fail with 400 validation error on invalid page query param", async () => {
      const response = await request(app)
        .get("/api/v1/posts")
        .set("Authorization", `Bearer ${validToken}`)
        .query({ page: -1 });

      const body = response.body as TestResponse;
      const error = body.error as unknown as Record<string, unknown>;

      expect(response.status).toBe(400);
      expect(body.success).toBe(false);
      expect(error.code).toBe("VALIDATION_ERROR");
    });

    it("should fail with 400 validation error on invalid limit query param (exceeds max 100)", async () => {
      const response = await request(app)
        .get("/api/v1/posts")
        .set("Authorization", `Bearer ${validToken}`)
        .query({ limit: 101 });

      const body = response.body as TestResponse;
      const error = body.error as unknown as Record<string, unknown>;

      expect(response.status).toBe(400);
      expect(body.success).toBe(false);
      expect(error.code).toBe("VALIDATION_ERROR");
    });

    it("should fail with 401 when Authorization header is missing", async () => {
      const response = await request(app).get("/api/v1/posts");

      const body = response.body as TestResponse;
      const error = body.error as unknown as Record<string, unknown>;

      expect(response.status).toBe(401);
      expect(body.success).toBe(false);
      expect(error.code).toBe("UNAUTHENTICATED");
    });
  });


  describe("DELETE /api/v1/posts/:postId", () => {

    const testPostId = "8bc7d100-349f-4318-bf12-58b4279b778f";

    it("should successfully delete own draft post and return 204 No Content", async () => {
      const mockPost = {
        id: testPostId,
        authorId: testUserId,
        title: "My Draft Post",
        slug: "my-draft-post",
        markdownContent: "Draft content",
        status: "DRAFT",
        readingTimeMinutes: 2,
        publishedAt: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      vi.mocked(prisma.post.findUnique).mockResolvedValueOnce(mockPost as any);
      vi.mocked(prisma.post.delete).mockResolvedValueOnce(mockPost as any);

      const response = await request(app)
        .delete(`/api/v1/posts/${testPostId}`)
        .set("Authorization", `Bearer ${validToken}`);

      expect(response.status).toBe(204);
      expect(response.body).toEqual({}); // no response body
      expect(prisma.post.delete).toHaveBeenCalledTimes(1);
      expect(prisma.post.delete).toHaveBeenCalledWith({
        where: { id: testPostId },
      });
    });

    it("should fail with 404 when trying to delete another user's draft post (no leaks)", async () => {
      const mockPostOfAnotherUser = {
        id: testPostId,
        authorId: "another-user-uuid",
        title: "Another Draft Post",
        slug: "another-draft-post",
        markdownContent: "Draft content",
        status: "DRAFT",
        readingTimeMinutes: 2,
        publishedAt: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      vi.mocked(prisma.post.findUnique).mockResolvedValueOnce(mockPostOfAnotherUser as any);

      const response = await request(app)
        .delete(`/api/v1/posts/${testPostId}`)
        .set("Authorization", `Bearer ${validToken}`);

      const body = response.body as TestResponse;
      const error = body.error as unknown as Record<string, unknown>;

      expect(response.status).toBe(404);
      expect(body.success).toBe(false);
      expect(error.code).toBe("RESOURCE_NOT_FOUND");
      expect(prisma.post.delete).not.toHaveBeenCalled();
    });

    it("should fail with 404 when post does not exist in database", async () => {
      vi.mocked(prisma.post.findUnique).mockResolvedValueOnce(null);

      const response = await request(app)
        .delete(`/api/v1/posts/${testPostId}`)
        .set("Authorization", `Bearer ${validToken}`);

      const body = response.body as TestResponse;
      const error = body.error as unknown as Record<string, unknown>;

      expect(response.status).toBe(404);
      expect(body.success).toBe(false);
      expect(error.code).toBe("RESOURCE_NOT_FOUND");
      expect(prisma.post.delete).not.toHaveBeenCalled();
    });

    it("should fail with 409 Conflict if post is already published", async () => {
      const mockPublishedPost = {
        id: testPostId,
        authorId: testUserId,
        title: "Already Published",
        slug: "already-published",
        markdownContent: "Content",
        status: "PUBLISHED",
        readingTimeMinutes: 2,
        publishedAt: new Date(),
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      vi.mocked(prisma.post.findUnique).mockResolvedValueOnce(mockPublishedPost as any);

      const response = await request(app)
        .delete(`/api/v1/posts/${testPostId}`)
        .set("Authorization", `Bearer ${validToken}`);

      const body = response.body as TestResponse;
      const error = body.error as unknown as Record<string, unknown>;

      expect(response.status).toBe(409);
      expect(body.success).toBe(false);
      expect(error.code).toBe("RESOURCE_CONFLICT");
      expect(error.message).toBe("Published posts cannot be deleted.");
      expect(prisma.post.delete).not.toHaveBeenCalled();
    });

    it("should fail with 400 when param postId is an invalid UUID format", async () => {
      const response = await request(app)
        .delete("/api/v1/posts/invalid-uuid-format")
        .set("Authorization", `Bearer ${validToken}`);

      const body = response.body as TestResponse;
      const error = body.error as unknown as Record<string, unknown>;

      expect(response.status).toBe(400);
      expect(body.success).toBe(false);
      expect(error.code).toBe("VALIDATION_ERROR");
    });

    it("should fail with 401 when Authorization header is missing", async () => {
      const response = await request(app).delete(`/api/v1/posts/${testPostId}`);

      const body = response.body as TestResponse;
      const error = body.error as unknown as Record<string, unknown>;

      expect(response.status).toBe(401);
      expect(body.success).toBe(false);
      expect(error.code).toBe("UNAUTHENTICATED");
    });
  });

  describe("GET /api/v1/posts/public/:slug", () => {

    const testSlug = "hello-world-slug";

    it("should successfully retrieve a published post by its slug (without authentication)", async () => {
      const mockPublishedPost = {
        id: "mock-post-uuid-123",
        authorId: "some-author-uuid",
        title: "Hello World Post",
        slug: testSlug,
        markdownContent: "Welcome to public posts content.",
        status: "PUBLISHED",
        readingTimeMinutes: 3,
        publishedAt: new Date(),
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      vi.mocked(prisma.post.findUnique).mockResolvedValueOnce(mockPublishedPost as any);

      const response = await request(app)
        .get(`/api/v1/posts/public/${testSlug}`);

      const body = response.body as TestResponse;
      const data = body.data as unknown as Record<string, unknown>;

      expect(response.status).toBe(200);
      expect(body.success).toBe(true);
      expect(data.id).toBe(mockPublishedPost.id);
      expect(data.title).toBe(mockPublishedPost.title);
      expect(data.slug).toBe(testSlug);
      expect(data.markdownContent).toBe(mockPublishedPost.markdownContent);
      expect(data.status).toBe("PUBLISHED");
      expect(data.readingTimeMinutes).toBe(3);
      expect(data.publishedAt).toBeDefined();

      expect(prisma.post.findUnique).toHaveBeenCalledWith({
        where: { slug: testSlug },
        include: expect.any(Object),
      });
    });

    it("should fail with 404 when post slug does not exist", async () => {
      vi.mocked(prisma.post.findUnique).mockResolvedValueOnce(null);

      const response = await request(app)
        .get(`/api/v1/posts/public/${testSlug}`);

      const body = response.body as TestResponse;
      const error = body.error as unknown as Record<string, unknown>;

      expect(response.status).toBe(404);
      expect(body.success).toBe(false);
      expect(error.code).toBe("RESOURCE_NOT_FOUND");
    });

    it("should fail with 404 when post exists but is in DRAFT status (no leaks)", async () => {
      const mockDraftPost = {
        id: "mock-post-uuid-123",
        authorId: "some-author-uuid",
        title: "Draft Post Title",
        slug: testSlug,
        markdownContent: "Draft content.",
        status: "DRAFT",
        readingTimeMinutes: 2,
        publishedAt: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      vi.mocked(prisma.post.findUnique).mockResolvedValueOnce(mockDraftPost as any);

      const response = await request(app)
        .get(`/api/v1/posts/public/${testSlug}`);

      const body = response.body as TestResponse;
      const error = body.error as unknown as Record<string, unknown>;

      expect(response.status).toBe(404);
      expect(body.success).toBe(false);
      expect(error.code).toBe("RESOURCE_NOT_FOUND");
    });

    it("should fail with 400 when slug parameter is invalid (empty)", async () => {
      const response = await request(app)
        .get("/api/v1/posts/public/%20");

      const body = response.body as TestResponse;
      const error = body.error as unknown as Record<string, unknown>;

      expect(response.status).toBe(400);
      expect(body.success).toBe(false);
      expect(error.code).toBe("VALIDATION_ERROR");
    });
  });

  describe("GET /api/v1/posts/public", () => {

    it("should successfully retrieve published posts with pagination metadata (authentication not required)", async () => {
      const mockPublishedPosts = [
        {
          id: "post-uuid-2",
          authorId: "author-uuid-1",
          title: "Second Published Post",
          slug: "second-published",
          markdownContent: "content",
          status: "PUBLISHED",
          readingTimeMinutes: 2,
          publishedAt: new Date("2026-07-05T12:00:00.000Z"),
          createdAt: new Date("2026-07-05T11:59:00.000Z"),
          updatedAt: new Date("2026-07-05T12:00:00.000Z"),
        },
        {
          id: "post-uuid-1",
          authorId: "author-uuid-2",
          title: "First Published Post",
          slug: "first-published",
          markdownContent: "content",
          status: "PUBLISHED",
          readingTimeMinutes: 1,
          publishedAt: new Date("2026-07-05T10:00:00.000Z"),
          createdAt: new Date("2026-07-05T09:59:00.000Z"),
          updatedAt: new Date("2026-07-05T10:00:00.000Z"),
        },
      ];

      vi.mocked(prisma.post.findMany).mockResolvedValueOnce(mockPublishedPosts as any);
      vi.mocked(prisma.post.count).mockResolvedValueOnce(2);

      const response = await request(app)
        .get("/api/v1/posts/public")
        .query({ page: 1, limit: 10 });

      const body = response.body as TestResponse;
      const data = body.data as unknown as Record<string, unknown>[];
      const meta = body.meta as unknown as Record<string, unknown>;

      expect(response.status).toBe(200);
      expect(body.success).toBe(true);
      expect(data).toHaveLength(2);
      expect(data[0].id).toBe("post-uuid-2"); // publishedAt DESC
      expect(data[1].id).toBe("post-uuid-1");
      expect(meta.totalCount).toBe(2);
      expect(meta.page).toBe(1);
      expect(meta.limit).toBe(10);
      expect(meta.totalPages).toBe(1);

      expect(prisma.post.findMany).toHaveBeenCalledWith({
        where: { status: "PUBLISHED" },
        take: 10,
        skip: 0,
        orderBy: [
          { publishedAt: "desc" },
          { createdAt: "desc" },
        ],
      });
    });

    it("should return empty list when no published posts exist", async () => {
      vi.mocked(prisma.post.findMany).mockResolvedValueOnce([]);
      vi.mocked(prisma.post.count).mockResolvedValueOnce(0);

      const response = await request(app)
        .get("/api/v1/posts/public");

      const body = response.body as TestResponse;
      const data = body.data as unknown as Record<string, unknown>[];
      const meta = body.meta as unknown as Record<string, unknown>;

      expect(response.status).toBe(200);
      expect(body.success).toBe(true);
      expect(data).toHaveLength(0);
      expect(meta.totalCount).toBe(0);
      expect(meta.totalPages).toBe(0);
    });

    it("should respect pagination limit and skip values on page 2", async () => {
      vi.mocked(prisma.post.findMany).mockResolvedValueOnce([]);
      vi.mocked(prisma.post.count).mockResolvedValueOnce(25);

      const response = await request(app)
        .get("/api/v1/posts/public")
        .query({ page: 2, limit: 10 });

      const body = response.body as TestResponse;
      const meta = body.meta as unknown as Record<string, unknown>;

      expect(response.status).toBe(200);
      expect(meta.page).toBe(2);
      expect(meta.limit).toBe(10);
      expect(meta.totalPages).toBe(3);

      expect(prisma.post.findMany).toHaveBeenCalledWith({
        where: { status: "PUBLISHED" },
        take: 10,
        skip: 10,
        orderBy: [
          { publishedAt: "desc" },
          { createdAt: "desc" },
        ],
      });
    });

    it("should fail with 400 validation error on invalid page query param", async () => {
      const response = await request(app)
        .get("/api/v1/posts/public")
        .query({ page: 0 });

      const body = response.body as TestResponse;
      const error = body.error as unknown as Record<string, unknown>;

      expect(response.status).toBe(400);
      expect(body.success).toBe(false);
      expect(error.code).toBe("VALIDATION_ERROR");
    });

    it("should fail with 400 validation error on invalid limit query param (exceeds max 100)", async () => {
      const response = await request(app)
        .get("/api/v1/posts/public")
        .query({ limit: 105 });

      const body = response.body as TestResponse;
      const error = body.error as unknown as Record<string, unknown>;

      expect(response.status).toBe(400);
      expect(body.success).toBe(false);
      expect(error.code).toBe("VALIDATION_ERROR");
    });
  });
});







