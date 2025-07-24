// services/user.service.ts
import { inject, injectable } from "tsyringe";
import { Result } from "@carbonteq/fp";
import bcrypt from "bcrypt";
import { v4 as uuidv4 } from "uuid";
import { IUserRepository } from "../interface/user.repository";
import { IRoleRepository } from "../interface/userRole.repository";
import { ILogger } from "../interface/logger.interface";
import { IUserRegister, IUserLogin, IUserResponse,IUser } from "../interface/user.interface";
import { generateTokens } from "../utils/jwt";
import { TOKENS } from "../token";
import jwt from 'jsonwebtoken';
import { LoginDTO } from "../dtos/user.dto";

@injectable()
export class UserService {
  constructor(
    @inject(TOKENS.IUserRepository) private userRepo: IUserRepository,
    @inject(TOKENS.IRoleRepository) private roleRepo: IRoleRepository,
    @inject(TOKENS.ILogger) private logger: ILogger
  ) {}

async registerUser(payload: IUserRegister): Promise<Result<IUserResponse, string>> {
  const { name, email, password, role } = payload;
  this.logger.info("Registering user", { email });

  return await Result.Ok(email).flatMap((email) =>
      this.userRepo.findByEmail(email).then((existing) =>
        existing ? Result.Err("User already exists") : Result.Ok(payload)
      )).flatMap(() =>
      this.roleRepo.findByName(role).then((roleData) =>
        roleData ? Result.Ok(roleData) : Result.Err("Invalid role provided")
      )).flatMap(async (roleData) => {
      const hashedPassword = await bcrypt.hash(password, 10);
      const user = {
        id: uuidv4(),
        name,
        email,
        password: hashedPassword,
        roleId: roleData.id,
        refreshToken: "",
      };
      return this.userRepo.insert(user).then(() => Result.Ok(user));
    }).flatMap((user) => {
      const tokens = generateTokens({ id: user.id, name: user.name, email: user.email });
      return this.userRepo
        .updateRefreshToken(user.id, tokens.refreshToken)
        .then(() => Result.Ok({ user, tokens }));
    }).map(({ user, tokens }) => {
      this.logger.info("User registered successfully", { userId: user.id });
      return {
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          role,
        },
        accessToken: tokens.accessToken,
        refreshToken: tokens.refreshToken,
      };
    }).toPromise();
}
 
loginUser = async (data: IUserLogin): Promise<Result<IUserResponse, string>> => {
  return Result.Ok(data).flatMap((payload) => {
      const validated = LoginDTO.safeParse(payload);
      return validated.success
        ? Result.Ok(validated.data)
        : Result.Err("Invalid input");
    }).flatMap((validated) =>
      this.userRepo.findByEmail(validated.email).then((userRes) =>
        userRes.isErr()
          ? Result.Err("User not found")
          : Result.Ok({ validated, user: userRes.unwrap() })
      )
    ).flatMap(({ validated, user }) =>
      bcrypt.compare(validated.password, user.password).then((isMatch) =>
        isMatch
          ? Result.Ok({ validated, user })
          : Result.Err("Invalid password")
      )
    ).map(({ user }) => {
      const { accessToken, refreshToken } = generateTokens(user);
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
    }).toPromise();
};

refreshAccessToken = async (token: string): Promise<Result<IUserResponse, string>> => {
  const result = Result.Ok(token).flatMap((t) => {
      const decoded = jwt.decode(t);
      return (decoded && typeof decoded === "object" && "id" in decoded)
        ? Result.Ok(decoded as { id: string })
        : Result.Err("Invalid refresh token");
    }).flatMap(() => {
      const verified = jwt.verify(token, process.env.REFRESH_TOKEN_SECRET!);
      return (verified && typeof verified === "object" && "id" in verified)
        ? Result.Ok(verified as { id: string })
        : Result.Err("Invalid refresh token");
    });
  if (result.isErr()) return Promise.resolve(Result.Err(result.unwrapErr()));
  const { id } = result.unwrap();
  return this.userRepo.findById(id).then((userRes) =>
    userRes.map((user) => {
      const { accessToken, refreshToken } = generateTokens(user);
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
  );
};


  async logoutUser(userId: string): Promise<void> {
    this.logger.info(`Logging out user with ID: ${userId}`);
    await this.userRepo.updateRefreshToken(userId, "");
    this.logger.info(`User logged out: ${userId}`);
  }
}
