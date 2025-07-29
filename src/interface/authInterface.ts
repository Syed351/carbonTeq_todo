import { IUserWithRoleDTO } from "../dtos/userDTO";
import { Result } from "@carbonteq/fp"
export interface IAuthService {
  validateToken(token: string): Promise<Result<IUserWithRoleDTO, string>>
}