import { Result } from "@carbonteq/fp";
import { UserEntity } from "../entities/user.entity"

export interface IUserRepository {
  findByEmail(email: string): Promise<Result<UserEntity, string>>;
  insert(user: UserEntity): Promise<Result<void, string>>;
  updateRefreshToken(userId: string, refreshToken: string): Promise<Result<void, string>>;
  findById(id: string): Promise<Result<UserEntity, string>>;
  findByIdWithRole(id: string): Promise<Result<{
    id: string;
    name: string;
    email: string;
    role: string;
  }, string>>;
}

