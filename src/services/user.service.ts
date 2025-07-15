import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { IUserLogin, IUserRegister, IUserResponse } from "../interface/user.interface";
import { ApiError } from "../utils/ApiErrors";
import { generateTokens, generateAcessToken, generateRefreshToken } from "../utils/jwt";
import { IUserRepository } from "../repositories/user.repository";
import { IRoleRepository } from "../repositories/userRole.repository";

export class UserService {
  constructor(
    private readonly userRepo: IUserRepository,
    private readonly roleRepo: IRoleRepository
  ) {}

  async registerUser(data: IUserRegister): Promise<void> {
    const { name, email, password, role } = data;

    const existingUser = await this.userRepo.findByEmail(email);
    if (existingUser) throw new ApiError(400, "User already exists");

    const roleRecord = await this.roleRepo.findByName(role);
    if (!roleRecord) throw new ApiError(400, `Role "${role}" not found`);

    const hashedPassword = await bcrypt.hash(password, 10);

    await this.userRepo.insert({
      name,
      email,
      password: hashedPassword,
      roleId: roleRecord.id,
      refreshToken: "",
      id: crypto.randomUUID() // or let DB default generate it
    });
  }

  async loginUser(data: IUserLogin): Promise<IUserResponse> {
    const { email, password } = data;

    const user = await this.userRepo.findByEmail(email);
    if (!user) throw new ApiError(400, "User not found");

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) throw new ApiError(400, "Invalid password");

    const { accessToken, refreshToken } = generateTokens({id: user.id, name: user.name, email: user.email });

    await this.userRepo.updateRefreshToken(user.id, refreshToken);

    return {
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role:" ",
      },
      accessToken,
      refreshToken,
    };
  }

  async refreshAccessToken(token: string): Promise<IUserResponse> {
    if (!token) throw new ApiError(401, "Refresh token not found");

    const decoded = jwt.verify(token, process.env.REFRESH_TOKEN_SECRET!) as { id: string };
    const user = await this.userRepo.findById(decoded.id);

    if (!user) throw new ApiError(401, "User not found");
    if (user.refreshToken !== token) throw new ApiError(401, "Invalid refresh token");

    const newAccessToken = generateAcessToken(user.id, user.name, user.email);
    const newRefreshToken = generateRefreshToken(user.id);

    await this.userRepo.updateRefreshToken(user.id, newRefreshToken);

    return {
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: "User",
      },
      accessToken: newAccessToken,
      refreshToken: newRefreshToken,
    };
  }

  async logoutUser(userId: string): Promise<void> {
    await this.userRepo.updateRefreshToken(userId, "");
  }
}
