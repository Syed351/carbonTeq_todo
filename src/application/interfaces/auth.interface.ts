import { UserWithRoleEntity } from "../../domain/entities/userRole.entity";
import { IUserRegisterDTO, IUserLoginDTO , IUserResponseDTO } from "../dtos/user.dto";
import { Result } from "@carbonteq/fp"
export interface IAuthService {
  registerUser(payload: IUserRegisterDTO): Promise<Result<IUserResponseDTO, string>>
  validateToken(token: string): Promise<Result<UserWithRoleEntity, string>>;
  loginUser(data: IUserLoginDTO): Promise<Result<IUserResponseDTO, string>>;
  refreshAccessToken(token: string): Promise<Result<IUserResponseDTO, string>>;
  logoutUser(userId: string): Promise<void>;
}