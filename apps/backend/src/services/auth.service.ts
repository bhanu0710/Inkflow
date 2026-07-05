import bcrypt from "bcrypt";
import type { User } from "@prisma/client";
import { env } from "../config/env.js";
import type { UserRepository, RefreshTokenRepository, TransactionManager } from "../repositories/index.js";
import type { TokenService } from "./token.service.js";
import { AuthenticationError } from "../errors/app.errors.js";

/**
 * Authentication service orchestration.
 *
 * Responsibilities:
 * - Hash client passwords safely using configurable BCRYPT_COST.
 * - Coordinate user creation and credentials validation.
 * - Coordinate token validation and rotation.
 * - Delegate refresh token generation and storage to the TokenService.
 * - Delegate JWT access token generation to the TokenService.
 *
 * Non-responsibilities:
 * - Direct HTTP transport handling, cookie writing, or cookie session parsing.
 */
export class AuthService {
  constructor(
    private readonly userRepository: UserRepository,
    private readonly tokenService: TokenService,
    private readonly refreshTokenRepository: RefreshTokenRepository,
    private readonly transactionManager: TransactionManager
  ) {}

  async register(data: {
    email: string;
    username: string;
    displayName: string;
    password: string;
  }): Promise<{ user: Omit<User, "passwordHash">; accessToken: string; refreshToken: string }> {
    const saltRounds = env.BCRYPT_COST;
    const passwordHash = await bcrypt.hash(data.password, saltRounds);

    let plaintextToken = "";

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

      plaintextToken = await this.tokenService.createRefreshToken(createdUser.id, tx);

      return createdUser;
    });

    const accessToken = this.tokenService.generateAccessToken({
      id: result.id,
      email: result.email,
    });

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { passwordHash: _, ...userWithoutHash } = result;

    return {
      user: userWithoutHash,
      accessToken,
      refreshToken: plaintextToken,
    };
  }

  async login(data: {
    email: string;
    password: string;
  }): Promise<{ user: Omit<User, "passwordHash">; accessToken: string; refreshToken: string }> {
    const user = await this.userRepository.findByEmail(data.email);
    if (!user) {
      throw new AuthenticationError("Invalid email or password");
    }

    const isPasswordMatch = await bcrypt.compare(data.password, user.passwordHash);
    if (!isPasswordMatch) {
      throw new AuthenticationError("Invalid email or password");
    }

    const plaintextToken = await this.tokenService.createRefreshToken(user.id);
    const accessToken = this.tokenService.generateAccessToken({
      id: user.id,
      email: user.email,
    });

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { passwordHash: _, ...userWithoutHash } = user;

    return {
      user: userWithoutHash,
      accessToken,
      refreshToken: plaintextToken,
    };
  }

  async refresh(refreshToken: string): Promise<{
    user: Omit<User, "passwordHash">;
    accessToken: string;
    refreshToken: string;
  }> {
    const incomingHash = this.tokenService.hashToken(refreshToken);

    const storedToken = await this.refreshTokenRepository.findByTokenHash(incomingHash);
    if (!storedToken) {
      throw new AuthenticationError("Invalid refresh token");
    }

    if (storedToken.revokedAt !== null) {
      throw new AuthenticationError("Invalid refresh token");
    }

    if (storedToken.expiresAt < new Date()) {
      throw new AuthenticationError("Invalid refresh token");
    }

    const user = await this.userRepository.findById(storedToken.userId);
    if (!user) {
      throw new AuthenticationError("Invalid refresh token");
    }

    let newPlaintextToken = "";

    await this.transactionManager.run(async (tx) => {
      await this.refreshTokenRepository.revokeById(storedToken.id, tx);
      newPlaintextToken = await this.tokenService.createRefreshToken(user.id, tx);
    });

    const newAccessToken = this.tokenService.generateAccessToken({
      id: user.id,
      email: user.email,
    });

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { passwordHash: _, ...userWithoutHash } = user;

    return {
      user: userWithoutHash,
      accessToken: newAccessToken,
      refreshToken: newPlaintextToken,
    };

  }
}
