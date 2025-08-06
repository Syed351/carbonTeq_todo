import { IUserWithRoleDTO } from "../../application/dtos/user.dto";
import { Result } from "@carbonteq/fp"
export interface IAuthService {
  validateToken(token: string): Promise<Result<IUserWithRoleDTO, string>>
}