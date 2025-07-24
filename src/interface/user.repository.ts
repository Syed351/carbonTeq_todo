import { Result } from "@carbonteq/fp";
import { IUser } from "./user.interface";

export interface IUserRepository {
  findByEmail(email: string): Promise<Result<IUser, string>>;
  insert(user: IUser): Promise<Result<void, string>>;
  updateRefreshToken(userId: string, refreshToken: string): Promise<Result<void, string>>;
  findById(id: string): Promise<Result<IUser, string>>;
  findByIdWithRole(id: string): Promise<Result<{
    id: string;
    name: string;
    email: string;
    role: string;
  }, string>>;
}
