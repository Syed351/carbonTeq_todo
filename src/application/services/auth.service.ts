import { injectable, inject } from "tsyringe";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";
import { generateTokens } from "../../infrastructure/utils/jwt";
import { IUserRepository } from "../../domain/repositories/user.repository";
import { IAuthService } from "../../domain/repositories/auth.repository";
import { UserWithRoleEntity } from "../../domain/entities/userRole.entity";
import { ILogger } from "../logger.interface";
import { safe } from "../../infrastructure/utils/safe.util";
import { IUserLoginDTO, IUserResponseDTO } from "../dtos/user.dto";
import { TOKENS } from "../../infrastructure/config/DI/token";
import { Result } from "@carbonteq/fp";

@injectable()
export class AuthService implements IAuthService {
  constructor(
    @inject(TOKENS.IUserRepository) private userRepo: IUserRepository,
    @inject(TOKENS.ILogger) private logger: ILogger
  ) {}

  async validateToken(token: string): Promise<Result<UserWithRoleEntity, string>> {
    return Result.Ok(token)
      .flatMap((t) =>
        !t?.trim()
          ? Result.Err("Unauthorized access: Token missing")
          : Result.Ok(t)
      )
      .flatMap((t) => {
        try {
          const decoded = jwt.verify(t, process.env.JWT_SECRET!) as {
            id: string;
            name: string;
            email: string;
          };
          return Result.Ok(decoded);
        } catch {
          return Result.Err("Invalid or expired token");
        }
      })
      .flatMap((decoded) => this.userRepo.findByIdWithRole(decoded.id))
      .toPromise();
  }

   async loginUser(data: IUserLoginDTO): Promise<Result<IUserResponseDTO, string>> {
    this.logger.info("User login attempt", { email: data.email });

    return Result.Ok(data)
      .flatMap(async (input) => {
        this.logger.debug("Fetching user by email", { email: input.email });
        const userRes = await this.userRepo.findByEmail(input.email);
        return userRes.map((user) => ({ input, user }));
      })
      .flatMap(async ({ input, user }) => {
        this.logger.debug("Comparing passwords", { email: input.email });
        const isMatch = await bcrypt.compare(input.password, user.password);
        if (!isMatch) {
          this.logger.warn("Invalid password attempt", { email: input.email });
          return Result.Err("Invalid password");
        }
        return Result.Ok(user);
      })
      .map((user) => {
        this.logger.debug("Generating tokens for login", { userId: user.id });
        const { accessToken, refreshToken } = generateTokens(user);
        this.logger.info("User logged in successfully", { userId: user.id, email: user.email });
        
        return {
          user: {
            id: user.id,
            name: user.name,
            email: user.email,
            role: user.roleId,
          },
          accessToken,
          refreshToken,
        };
      })
      .mapErr((err) => {
        this.logger.error("User login failed", { error: err, email: data.email });
        return err;
      })
      .toPromise();
  }

  async refreshAccessToken(token: string): Promise<Result<IUserResponseDTO, string>> {
    this.logger.info("Refreshing access token");

    return Result.Ok(token)
      .flatMap(() => {
        this.logger.debug("Verifying refresh token");
        return safe(() => jwt.verify(token, process.env.REFRESH_TOKEN_SECRET!), "Token verification failed")
          .flatMap((verified) =>
            typeof verified === "object" && "id" in verified
              ? Result.Ok(verified as { id: string })
              : Result.Err("Invalid refresh token")
          );
      })
      .flatMap((verified) => {
        this.logger.debug("Fetching user by ID", { userId: verified.id });
        return this.userRepo.findById(verified.id);
      })
      .flatMap((user) => {
        this.logger.debug("Generating new tokens", { userId: user.id });
        const { accessToken, refreshToken } = generateTokens(user);
        return this.userRepo.updateRefreshToken(user.id, refreshToken).then(() => {
          this.logger.info("Refresh token updated", { userId: user.id });
          return Result.Ok({
            user: {
              id: user.id,
              name: user.name,
              email: user.email,
              role: user.roleId,
            },
            accessToken,
            refreshToken,
          });
        });
      })
      .mapErr((err) => {
        this.logger.error("Token refresh failed", { error: err });
        return err;
      })
      .toPromise();
  }
    async logoutUser(userId: string): Promise<void> {
    this.logger.info("Logging out user", { userId });
    await this.userRepo.updateRefreshToken(userId, "");
    this.logger.info("User logged out successfully", { userId });
  }
}