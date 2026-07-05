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
});

