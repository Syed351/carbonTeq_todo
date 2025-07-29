import { Result } from "@carbonteq/fp";
import { IUserDTO } from "../dtos/userDTO";

export interface IUserRepository {
  findByEmail(email: string): Promise<Result<IUserDTO, string>>;
  insert(user: IUserDTO): Promise<Result<void, string>>;
  updateRefreshToken(userId: string, refreshToken: string): Promise<Result<void, string>>;
  findById(id: string): Promise<Result<IUserDTO, string>>;
  findByIdWithRole(id: string): Promise<Result<{
    id: string;
    name: string;
    email: string;
    role: string;
  }, string>>;
}
