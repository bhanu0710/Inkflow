import { randomBytes, createHash } from "node:crypto";
import bcrypt from "bcrypt";
import type { User } from "@prisma/client";
import { env } from "../config/env.js";
import type { UserRepository, RefreshTokenRepository, TransactionManager } from "../repositories/index.js";

/**
 * Authentication service orchestration.
 *
 * Responsibilities:
 * - Hash client passwords safely using configurable BCRYPT_COST.
 * - Coordinate user creation and refresh token creation under a single database transaction.
 *
 * Non-responsibilities:
 * - JWT generation, cookie handling, or writing to HTTP responses.
 * - Uniqueness pre-checks (delegated to PostgreSQL unique constraints and repository unique constraint mapping).
 */
export class AuthService {
  constructor(
    private readonly userRepository: UserRepository,
    private readonly refreshTokenRepository: RefreshTokenRepository,
    private readonly transactionManager: TransactionManager
  ) {}

  async register(data: {
    email: string;
    username: string;
    displayName: string;
    password: string;
  }): Promise<{ user: Omit<User, "passwordHash">; refreshToken: string }> {
    const saltRounds = env.BCRYPT_COST;
    const passwordHash = await bcrypt.hash(data.password, saltRounds);

    /**
     * Plaintext refresh token is returned in the payload JSON response.
     * [ARCHITECTURE NOTE]: This is a temporary implementation. Future Login/Auth stories
     * will implement secure HttpOnly cookie session transport for refresh tokens.
     * The underlying database persistence model should remain unchanged.
     */
    const plaintextToken = randomBytes(40).toString("hex");
    const tokenHash = createHash("sha256").update(plaintextToken).digest("hex");

    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 30);

    const result = await this.transactionManager.run(async (tx) => {
      const createdUser = await this.userRepository.create(
        {
          email: data.email,
          username: data.username,
          displayName: data.displayName,
          passwordHash,
        },
        tx
      );

      await this.refreshTokenRepository.create(
        {
          userId: createdUser.id,
          tokenHash,
          expiresAt,
        },
        tx
      );

      return createdUser;
    });

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { passwordHash: _, ...userWithoutHash } = result;

    return {
      user: userWithoutHash,
      refreshToken: plaintextToken,
    };
  }
}
