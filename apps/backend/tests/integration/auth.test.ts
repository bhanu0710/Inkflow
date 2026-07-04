/* eslint-disable @typescript-eslint/no-unsafe-return */
/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-argument */
/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/unbound-method */
/* eslint-disable @typescript-eslint/no-unnecessary-type-assertion */

import request from "supertest";
import { describe, it, expect, vi, beforeEach } from "vitest";
import jwt from "jsonwebtoken";
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
});
