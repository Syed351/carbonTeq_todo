import { injectable, inject } from "tsyringe";
import jwt from "jsonwebtoken";
import { IUserRepository } from "../../domain/repositories/user.repository";
import { IAuthService } from "../../domain/repositories/auth.repository";
import { IUserWithRoleDTO } from "../dtos/user.dto";
import { TOKENS } from "../../infrastructure/config/DI/token";
import { Result } from "@carbonteq/fp";

@injectable()
export class AuthService implements IAuthService {
  constructor(
    @inject(TOKENS.IUserRepository) private userRepository: IUserRepository
  ) {}

  async validateToken(token: string): Promise<Result<IUserWithRoleDTO, string>> {
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
      .flatMap((decoded) => this.userRepository.findByIdWithRole(decoded.id))
      .toPromise();
  }
}