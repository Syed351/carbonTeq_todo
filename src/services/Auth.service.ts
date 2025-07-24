// src/services/impl/auth.service.ts

import { injectable, inject } from "tsyringe";
import jwt from "jsonwebtoken";
import { IUserRepository } from "../interface/user.repository";
import { IAuthService } from "../interface/authInterface";
import { IUserWithRole } from "../interface/user.interface";
import { TOKENS } from "../token";
import {Result } from "@carbonteq/fp"

@injectable()
export class AuthService implements IAuthService {
  constructor(
    @inject(TOKENS.IUserRepository) private userRepository: IUserRepository
  ) {}

async validateToken(token: string): Promise<Result<IUserWithRole, string>> {
  const verified = Result.Ok(token).flatMap((t) =>
      !t?.trim()
        ? Result.Err("Unauthorized access: Token missing")
        : Result.Ok(t)
    ).flatMap((t) => {
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
    });
  if (verified.isErr()) return verified;

  const decoded = verified.unwrap();
  const user = await this.userRepository.findByIdWithRole(decoded.id);
  return user; // Already a Result
}

}
