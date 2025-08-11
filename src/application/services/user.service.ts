// services/user.service.ts
import { inject, injectable } from "tsyringe";
import { Result } from "@carbonteq/fp";
import bcrypt from "bcrypt";
import { v4 as uuidv4 } from "uuid";
import { IUserRepository } from "../../domain/repositories/user.repository";
import { IRoleRepository } from "../../domain/repositories/userRole.repository";
import { ILogger } from "../logger.interface";
import { IUserRegisterDTO, IUserLoginDTO, IUserResponseDTO } from "../dtos/user.dto";
import { generateTokens } from "../../infrastructure/utils/jwt";
import { TOKENS } from "../../infrastructure/config/DI/token";
import { UserEntity } from "../../domain/entities/user.entity"; 
import jwt from "jsonwebtoken";
import { toDTO } from "../../infrastructure/mapper/user.mapper";

@injectable()
export class UserService {
  constructor(
    @inject(TOKENS.IUserRepository) private userRepo: IUserRepository,
    @inject(TOKENS.IRoleRepository) private roleRepo: IRoleRepository,
    @inject(TOKENS.ILogger) private logger: ILogger
  ) {}

  async registerUser(payload: IUserRegisterDTO): Promise<Result<IUserResponseDTO, string>> {
    const { name, email, password, role } = payload;
    this.logger.info("Registering user", { email });

    return await Result.Ok(email)
      .flatMap(async (email) => {
        this.logger.debug("Checking for existing user", { email });
       const emailCheck = await this.userRepo.findByEmail(email)
       return emailCheck.isOk() 
        ? Result.Err("User already exists")
        : Result.Ok(role);
      })

      .flatMap(() => {
        this.logger.debug("Fetching role", { role });
        return this.roleRepo.findByName(role)
      })
      .flatMap(async (roleData) => {
  this.logger.debug("Hashing password", { email });
  const hashedPassword = await bcrypt.hash(password, 10);

  const userEntity = UserEntity.create({
    id: uuidv4(),
    name,
    email,
    password: hashedPassword,
    roleId: roleData.id,
    refreshToken: "",
  });

  this.logger.debug("Inserting user", { userId: userEntity.id, email });

  return this.userRepo.insert(userEntity).then(() => Result.Ok(userEntity));
})
      .flatMap(async (user) => {
        this.logger.debug("Generating tokens", { userId: user.id });
        const tokens = generateTokens({ id: user.id, name: user.name, email: user.email });
        await this.userRepo.updateRefreshToken(user.id, tokens.refreshToken);
        this.logger.info("Refresh token updated", { userId: user.id });
        return Result.Ok({ user, tokens });
      })
      .map(({ user, tokens }) => {
        this.logger.info("User registered successfully", { userId: user.id, email });
        return {
          user: toDTO(user , role),
          accessToken: tokens.accessToken,
          refreshToken: tokens.refreshToken,
        };
      })
      .mapErr((err) => {
        this.logger.error("User registration failed", { error: err, email });
        return err;
      })
      .toPromise();
  }

}