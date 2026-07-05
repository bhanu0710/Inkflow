/* eslint-disable @typescript-eslint/no-unsafe-return */
/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-argument */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/unbound-method */
/* eslint-disable @typescript-eslint/no-unnecessary-type-assertion */


import request from "supertest";
import { describe, it, expect, vi, beforeEach } from "vitest";
import jwt from "jsonwebtoken";
import { createHash } from "node:crypto";
import { env } from "../../src/config/env.js";
import type { AccessTokenPayload } from "../../src/services/token.service.js";
import { createApp } from "../../src/app.js";
import { prisma } from "../../src/repositories/prisma.repository.js";
import bcrypt from "bcrypt";


// Mock the prisma instance exported from prisma.repository
vi.mock("../../src/repositories/prisma.repository.js", () => {
  const mockPrisma = {
    user: {
      findUnique: vi.fn(),
      create: vi.fn(),
    },
    refreshToken: {
      create: vi.fn(),
      findUnique: vi.fn(),
      update: vi.fn(),
    },
    // Mock transaction to immediately execute the callback with the mock client itself
    $transaction: vi.fn((cb: any) => cb(mockPrisma)),
  };
  return {
    prisma: mockPrisma,
    disconnectPrisma: vi.fn(),
  };
});


interface TestResponse {
  success: boolean;
  data: {
    user: {
      id: string;
      email: string;
      username: string;
      displayName: string;
      passwordHash?: string;
    };
    refreshToken: string;
    accessToken: string;

  };
  error: {
    code: string;
    message: string;
    requestId: string;
  };
}

describe("Authentication Integration Tests (Mocked DB)", () => {
  const app = createApp();
  const testEmail = "test-login-integration@example.com";
  const testUsername = "testloginintegration";
  const testPassword = "securePassword123";
  const testDisplayName = "Test User Integration";
  const testPasswordHash = bcrypt.hashSync(testPassword, 10);

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("POST /api/v1/auth/login", () => {
    it("should login successfully with valid credentials", async () => {
      // Mock findUnique to return the valid user record
      vi.mocked(prisma.user.findUnique).mockResolvedValue({
        id: "mock-user-uuid",
        email: testEmail,
        username: testUsername,
        displayName: testDisplayName,
        passwordHash: testPasswordHash,
        createdAt: new Date(),
        updatedAt: new Date(),
      } as any);

      // Mock token persistence
      vi.mocked(prisma.refreshToken.create).mockResolvedValue({
        id: "mock-token-uuid",
        userId: "mock-user-uuid",
      } as any);

      const response = await request(app)
        .post("/api/v1/auth/login")
        .send({
          email: testEmail,
          password: testPassword,
        });

      const body = response.body as TestResponse;

      expect(response.status).toBe(200);
      expect(body.success).toBe(true);
      expect(body.data.user.email).toBe(testEmail);
      expect(body.data.user.username).toBe(testUsername);
      expect(body.data.user.passwordHash).toBeUndefined();
      expect(body.data.refreshToken).toBeDefined();
      expect(body.data.accessToken).toBeDefined();

      const decoded = jwt.verify(body.data.accessToken, env.JWT_ACCESS_SECRET) as AccessTokenPayload;
      expect(decoded.userId).toBe("mock-user-uuid");
      expect(decoded.email).toBe(testEmail);


      expect(prisma.user.findUnique).toHaveBeenCalledWith({ where: { email: testEmail } });
      expect(prisma.refreshToken.create).toHaveBeenCalled();
    });

    it("should fail to login with an invalid password", async () => {
      // Mock findUnique to return the user
      vi.mocked(prisma.user.findUnique).mockResolvedValue({
        id: "mock-user-uuid",
        email: testEmail,
        username: testUsername,
        displayName: testDisplayName,
        passwordHash: testPasswordHash,
        createdAt: new Date(),
        updatedAt: new Date(),
      } as any);

      const response = await request(app)
        .post("/api/v1/auth/login")
        .send({
          email: testEmail,
          password: "wrongPassword",
        });

      const body = response.body as TestResponse;

      expect(response.status).toBe(401);
      expect(body.success).toBe(false);
      expect(body.error.code).toBe("UNAUTHENTICATED");
      expect(body.error.message).toBe("Invalid email or password");
    });

    it("should fail to login with an unknown email", async () => {
      // Mock findUnique to return null (user not found)
      vi.mocked(prisma.user.findUnique).mockResolvedValue(null);

      const response = await request(app)
        .post("/api/v1/auth/login")
        .send({
          email: "unknown-email-address-test@example.com",
          password: testPassword,
        });

      const body = response.body as TestResponse;

      expect(response.status).toBe(401);
      expect(body.success).toBe(false);
      expect(body.error.code).toBe("UNAUTHENTICATED");
      expect(body.error.message).toBe("Invalid email or password");
    });
  });

  describe("POST /api/v1/auth/refresh", () => {
    const validRawToken = "validPlaintextRefreshTokenHereButExtremelyLongForHex";
    const validHashedToken = createHash("sha256").update(validRawToken).digest("hex");
    const testEmail = "test-login-integration@example.com";
    const testUsername = "testloginintegration";
    const testDisplayName = "Test User Integration";

    it("should rotate refresh token successfully when given a valid token", async () => {
      // 1. Mock stored token lookup to return a valid active token
      vi.mocked(prisma.refreshToken.findUnique).mockResolvedValue({
        id: "mock-token-uuid",
        userId: "mock-user-uuid",
        tokenHash: validHashedToken,
        expiresAt: new Date(Date.now() + 1000 * 60 * 60 * 24), // 1 day in future
        revokedAt: null,
        createdAt: new Date(),
      } as any);

      // 2. Mock user lookup
      vi.mocked(prisma.user.findUnique).mockResolvedValue({
        id: "mock-user-uuid",
        email: testEmail,
        username: testUsername,
        displayName: testDisplayName,
        passwordHash: "someHash",
        createdAt: new Date(),
        updatedAt: new Date(),
      } as any);

      // 3. Mock revoke of old token
      vi.mocked(prisma.refreshToken.update).mockResolvedValue({
        id: "mock-token-uuid",
        revokedAt: new Date(),
      } as any);

      // 4. Mock create of new token
      vi.mocked(prisma.refreshToken.create).mockResolvedValue({
        id: "mock-new-token-uuid",
        userId: "mock-user-uuid",
        tokenHash: "newHash",
        expiresAt: new Date(),
        revokedAt: null,
        createdAt: new Date(),
      } as any);

      const response = await request(app)
        .post("/api/v1/auth/refresh")
        .send({
          refreshToken: validRawToken,
        });

      const body = response.body as TestResponse;

      expect(response.status).toBe(200);
      expect(body.success).toBe(true);
      expect(body.data.user.email).toBe(testEmail);
      expect(body.data.user.passwordHash).toBeUndefined();
      expect(body.data.accessToken).toBeDefined();
      expect(body.data.refreshToken).toBeDefined();

      // Assert database calls
      expect(prisma.refreshToken.findUnique).toHaveBeenCalledWith({
        where: { tokenHash: validHashedToken },
      });
      expect(prisma.refreshToken.update).toHaveBeenCalledWith({
        where: { id: "mock-token-uuid" },
        data: { revokedAt: expect.any(Date) },
      });
      expect(prisma.refreshToken.create).toHaveBeenCalled();
    });

    it("should fail when refresh token does not exist in database", async () => {
      vi.mocked(prisma.refreshToken.findUnique).mockResolvedValue(null);

      const response = await request(app)
        .post("/api/v1/auth/refresh")
        .send({
          refreshToken: "non-existent-token",
        });

      const body = response.body as TestResponse;

      expect(response.status).toBe(401);
      expect(body.success).toBe(false);
      expect(body.error.code).toBe("UNAUTHENTICATED");
      expect(body.error.message).toBe("Invalid refresh token");
    });

    it("should fail when refresh token is expired", async () => {
      vi.mocked(prisma.refreshToken.findUnique).mockResolvedValue({
        id: "mock-token-uuid",
        userId: "mock-user-uuid",
        tokenHash: validHashedToken,
        expiresAt: new Date(Date.now() - 1000 * 60), // expired 1 min ago
        revokedAt: null,
        createdAt: new Date(),
      } as any);

      const response = await request(app)
        .post("/api/v1/auth/refresh")
        .send({
          refreshToken: validRawToken,
        });

      const body = response.body as TestResponse;

      expect(response.status).toBe(401);
      expect(body.success).toBe(false);
      expect(body.error.code).toBe("UNAUTHENTICATED");
      expect(body.error.message).toBe("Invalid refresh token");
    });

    it("should fail when refresh token is revoked", async () => {
      vi.mocked(prisma.refreshToken.findUnique).mockResolvedValue({
        id: "mock-token-uuid",
        userId: "mock-user-uuid",
        tokenHash: validHashedToken,
        expiresAt: new Date(Date.now() + 1000 * 60 * 60 * 24),
        revokedAt: new Date(), // revoked
        createdAt: new Date(),
      } as any);

      const response = await request(app)
        .post("/api/v1/auth/refresh")
        .send({
          refreshToken: validRawToken,
        });

      const body = response.body as TestResponse;

      expect(response.status).toBe(401);
      expect(body.success).toBe(false);
      expect(body.error.code).toBe("UNAUTHENTICATED");
      expect(body.error.message).toBe("Invalid refresh token");
    });
  });

  describe("POST /api/v1/auth/logout", () => {
    const validRawToken = "validPlaintextRefreshTokenHereButExtremelyLongForHex";
    const validHashedToken = createHash("sha256").update(validRawToken).digest("hex");

    it("should successfully logout with a valid active refresh token", async () => {
      vi.mocked(prisma.refreshToken.findUnique).mockResolvedValue({
        id: "mock-token-uuid",
        userId: "mock-user-uuid",
        tokenHash: validHashedToken,
        expiresAt: new Date(Date.now() + 1000 * 60 * 60 * 24),
        revokedAt: null,
        createdAt: new Date(),
      } as any);

      vi.mocked(prisma.refreshToken.update).mockResolvedValue({
        id: "mock-token-uuid",
        revokedAt: new Date(),
      } as any);

      const response = await request(app)
        .post("/api/v1/auth/logout")
        .send({
          refreshToken: validRawToken,
        });

      expect(response.status).toBe(204);
      expect(response.body).toEqual({});
      expect(prisma.refreshToken.findUnique).toHaveBeenCalledWith({
        where: { tokenHash: validHashedToken },
      });
      expect(prisma.refreshToken.update).toHaveBeenCalledWith({
        where: { id: "mock-token-uuid" },
        data: { revokedAt: expect.any(Date) },
      });
    });

    it("should return 204 successfully on invalid token (idempotency)", async () => {
      vi.mocked(prisma.refreshToken.findUnique).mockResolvedValue(null);

      const response = await request(app)
        .post("/api/v1/auth/logout")
        .send({
          refreshToken: "invalid-token",
        });

      expect(response.status).toBe(204);
      expect(prisma.refreshToken.update).not.toHaveBeenCalled();
    });

    it("should return 204 successfully on already revoked token (idempotency)", async () => {
      vi.mocked(prisma.refreshToken.findUnique).mockResolvedValue({
        id: "mock-token-uuid",
        userId: "mock-user-uuid",
        tokenHash: validHashedToken,
        expiresAt: new Date(Date.now() + 1000 * 60 * 60 * 24),
        revokedAt: new Date(),
        createdAt: new Date(),
      } as any);

      const response = await request(app)
        .post("/api/v1/auth/logout")
        .send({
          refreshToken: validRawToken,
        });

      expect(response.status).toBe(204);
      expect(prisma.refreshToken.update).not.toHaveBeenCalled();
    });

    it("should return 204 successfully on expired token (idempotency)", async () => {
      vi.mocked(prisma.refreshToken.findUnique).mockResolvedValue({
        id: "mock-token-uuid",
        userId: "mock-user-uuid",
        tokenHash: validHashedToken,
        expiresAt: new Date(Date.now() - 1000 * 60), // expired 1 min ago
        revokedAt: null,
        createdAt: new Date(),
      } as any);

      const response = await request(app)
        .post("/api/v1/auth/logout")
        .send({
          refreshToken: validRawToken,
        });

      expect(response.status).toBe(204);
      expect(prisma.refreshToken.update).not.toHaveBeenCalled();
    });

    it("should succeed twice on consecutive logouts (idempotency)", async () => {
      // First call (valid token)
      vi.mocked(prisma.refreshToken.findUnique).mockResolvedValueOnce({
        id: "mock-token-uuid",
        userId: "mock-user-uuid",
        tokenHash: validHashedToken,
        expiresAt: new Date(Date.now() + 1000 * 60 * 60 * 24),
        revokedAt: null,
        createdAt: new Date(),
      } as any);

      vi.mocked(prisma.refreshToken.update).mockResolvedValue({
        id: "mock-token-uuid",
        revokedAt: new Date(),
      } as any);

      let response = await request(app)
        .post("/api/v1/auth/logout")
        .send({
          refreshToken: validRawToken,
        });

      expect(response.status).toBe(204);

      // Second call (mocked to now return already revoked token)
      vi.mocked(prisma.refreshToken.findUnique).mockResolvedValueOnce({
        id: "mock-token-uuid",
        userId: "mock-user-uuid",
        tokenHash: validHashedToken,
        expiresAt: new Date(Date.now() + 1000 * 60 * 60 * 24),
        revokedAt: new Date(),
        createdAt: new Date(),
      } as any);

      response = await request(app)
        .post("/api/v1/auth/logout")
        .send({
          refreshToken: validRawToken,
        });

      expect(response.status).toBe(204);
    });
  });

  describe("GET /api/v1/auth/protected (JWT Authentication Middleware)", () => {
    const testUserId = "mock-user-uuid";
    const testEmail = "test@example.com";

    it("should successfully authenticate with a valid JWT and reach the route handler", async () => {
      const validToken = jwt.sign(
        { userId: testUserId, email: testEmail },
        env.JWT_ACCESS_SECRET,
        { algorithm: "HS256", expiresIn: 60 }
      );

      const response = await request(app)
        .get("/api/v1/auth/protected")
        .set("Authorization", `Bearer ${validToken}`);

      const body = response.body as TestResponse;

      expect(response.status).toBe(200);
      expect(body.success).toBe(true);
      expect(body.data).toEqual({ message: "Authenticated" });
    });

    it("should fail when Authorization header is missing", async () => {
      const response = await request(app)
        .get("/api/v1/auth/protected");

      const body = response.body as TestResponse;

      expect(response.status).toBe(401);
      expect(body.success).toBe(false);
      expect(body.error.code).toBe("UNAUTHENTICATED");
      expect(body.error.message).toBe("Authentication required");
    });

    it("should fail when Authorization header format is malformed (no Bearer prefix)", async () => {
      const response = await request(app)
        .get("/api/v1/auth/protected")
        .set("Authorization", "Token abc-123-xyz");

      const body = response.body as TestResponse;

      expect(response.status).toBe(401);
      expect(body.success).toBe(false);
      expect(body.error.code).toBe("UNAUTHENTICATED");
      expect(body.error.message).toBe("Authentication required");
    });

    it("should fail when Bearer token is empty", async () => {
      const response = await request(app)
        .get("/api/v1/auth/protected")
        .set("Authorization", "Bearer ");

      const body = response.body as TestResponse;

      expect(response.status).toBe(401);
      expect(body.success).toBe(false);
      expect(body.error.code).toBe("UNAUTHENTICATED");
      expect(body.error.message).toBe("Authentication required");
    });

    it("should fail when JWT has expired", async () => {
      const expiredToken = jwt.sign(
        { userId: testUserId, email: testEmail },
        env.JWT_ACCESS_SECRET,
        { algorithm: "HS256", expiresIn: -60 } // expired 60s ago
      );

      const response = await request(app)
        .get("/api/v1/auth/protected")
        .set("Authorization", `Bearer ${expiredToken}`);

      const body = response.body as TestResponse;

      expect(response.status).toBe(401);
      expect(body.success).toBe(false);
      expect(body.error.code).toBe("UNAUTHENTICATED");
      expect(body.error.message).toBe("Authentication required");
    });

    it("should fail when JWT signature is invalid", async () => {
      const invalidSigToken = jwt.sign(
        { userId: testUserId, email: testEmail },
        "wrong-secret-signature-here-with-sufficient-length-to-pass-standards",
        { algorithm: "HS256", expiresIn: 60 }
      );

      const response = await request(app)
        .get("/api/v1/auth/protected")
        .set("Authorization", `Bearer ${invalidSigToken}`);

      const body = response.body as TestResponse;

      expect(response.status).toBe(401);
      expect(body.success).toBe(false);
      expect(body.error.code).toBe("UNAUTHENTICATED");
      expect(body.error.message).toBe("Authentication required");
    });

    it("should fail when JWT is malformed", async () => {
      const response = await request(app)
        .get("/api/v1/auth/protected")
        .set("Authorization", "Bearer malformed.jwt.token");

      const body = response.body as TestResponse;

      expect(response.status).toBe(401);
      expect(body.success).toBe(false);
      expect(body.error.code).toBe("UNAUTHENTICATED");
      expect(body.error.message).toBe("Authentication required");
    });
  });

  describe("GET /api/v1/auth/me", () => {
    const testUserId = "mock-user-uuid";
    const testEmail = "test-me-integration@example.com";
    const testUsername = "testmeintegration";
    const testDisplayName = "Test User Me Integration";

    it("should successfully return authenticated user profile and omit passwordHash", async () => {
      const validToken = jwt.sign(
        { userId: testUserId, email: testEmail },
        env.JWT_ACCESS_SECRET,
        { algorithm: "HS256", expiresIn: 60 }
      );

      vi.mocked(prisma.user.findUnique).mockResolvedValue({
        id: testUserId,
        email: testEmail,
        username: testUsername,
        displayName: testDisplayName,
        passwordHash: "someHashToExclude",
        createdAt: new Date(),
        updatedAt: new Date(),
      } as any);

      const response = await request(app)
        .get("/api/v1/auth/me")
        .set("Authorization", `Bearer ${validToken}`);

      const body = response.body as TestResponse;
      const data = body.data as unknown as Record<string, unknown>;

      expect(response.status).toBe(200);
      expect(body.success).toBe(true);
      expect(data.id).toBe(testUserId);
      expect(data.email).toBe(testEmail);
      expect(data.username).toBe(testUsername);
      expect(data.displayName).toBe(testDisplayName);
      expect(data.passwordHash).toBeUndefined();
      expect(prisma.user.findUnique).toHaveBeenCalledWith({
        where: { id: testUserId },
      });
    });


    it("should fail when Authorization header is missing", async () => {
      const response = await request(app)
        .get("/api/v1/auth/me");

      const body = response.body as TestResponse;

      expect(response.status).toBe(401);
      expect(body.success).toBe(false);
      expect(body.error.code).toBe("UNAUTHENTICATED");
      expect(body.error.message).toBe("Authentication required");
    });

    it("should fail when Authorization header is malformed", async () => {
      const response = await request(app)
        .get("/api/v1/auth/me")
        .set("Authorization", "Token abc-123");

      const body = response.body as TestResponse;

      expect(response.status).toBe(401);
      expect(body.success).toBe(false);
      expect(body.error.code).toBe("UNAUTHENTICATED");
      expect(body.error.message).toBe("Authentication required");
    });

    it("should fail when JWT signature is invalid", async () => {
      const invalidSigToken = jwt.sign(
        { userId: testUserId, email: testEmail },
        "wrong-secret-to-fail-signature-verification-instantly",
        { algorithm: "HS256", expiresIn: 60 }
      );

      const response = await request(app)
        .get("/api/v1/auth/me")
        .set("Authorization", `Bearer ${invalidSigToken}`);

      const body = response.body as TestResponse;

      expect(response.status).toBe(401);
      expect(body.success).toBe(false);
      expect(body.error.code).toBe("UNAUTHENTICATED");
      expect(body.error.message).toBe("Authentication required");
    });

    it("should fail when user is deleted after token issuance", async () => {
      const validToken = jwt.sign(
        { userId: testUserId, email: testEmail },
        env.JWT_ACCESS_SECRET,
        { algorithm: "HS256", expiresIn: 60 }
      );

      // Mock user lookup to return null (meaning user has been deleted)
      vi.mocked(prisma.user.findUnique).mockResolvedValue(null);

      const response = await request(app)
        .get("/api/v1/auth/me")
        .set("Authorization", `Bearer ${validToken}`);

      const body = response.body as TestResponse;

      expect(response.status).toBe(401);
      expect(body.success).toBe(false);
      expect(body.error.code).toBe("UNAUTHENTICATED");
      expect(body.error.message).toBe("Authentication required");
    });
  });
});

