import { randomBytes, createHash } from "node:crypto";
import jwt from "jsonwebtoken";
import type { RefreshTokenRepository } from "../repositories/index.js";
import type { TransactionContext } from "../repositories/transaction-context.js";
import { env } from "../config/env.js";
import { InternalServerError } from "../errors/app.errors.js";

export interface AccessTokenPayload {
  userId: string;
  email: string;
}

/**
 * Reusable token generation and storage service.
 *
 * Responsibilities:
 * - Generate cryptographically secure refresh tokens.
 * - Hash refresh tokens before database persistence.
 * - Compute token expiration from REFRESH_TOKEN_TTL_DAYS configuration.
 * - Persist hashed tokens inside optional transaction contexts.
 * - Generate signed JWT access tokens with minimal payloads.
 *
 * Non-responsibilities:
 * - Direct HTTP transport handling or cookie injections.
 * - Checking domain user existence constraints.
 */
export class TokenService {
  constructor(private readonly refreshTokenRepository: RefreshTokenRepository) {}

  hashToken(token: string): string {
    return createHash("sha256").update(token).digest("hex");
  }

  async createRefreshToken(userId: string, tx?: TransactionContext): Promise<string> {
    const plaintextToken = randomBytes(40).toString("hex");
    const tokenHash = this.hashToken(plaintextToken);

    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + env.REFRESH_TOKEN_TTL_DAYS);

    await this.refreshTokenRepository.create(
      {
        userId,
        tokenHash,
        expiresAt,
      },
      tx
    );

    return plaintextToken;
  }


  generateAccessToken(user: { id: string; email: string }): string {
    try {
      const payload: AccessTokenPayload = {
        userId: user.id,
        email: user.email,
      };

      const options: jwt.SignOptions = {
        algorithm: "HS256",
        expiresIn: env.JWT_ACCESS_TOKEN_TTL_MINUTES * 60,
      };

      /**
       * TODO: Future stories should add standard claims (issuer and audience)
       * to options/payload during signing and verification steps.
       */

      return jwt.sign(payload, env.JWT_ACCESS_SECRET, options);
    } catch (error) {
      throw new InternalServerError("Failed to sign access token", error);
    }
  }
}
