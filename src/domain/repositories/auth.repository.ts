import { UserWithRoleEntity } from "../entities/userRole.entity";
import { Result } from "@carbonteq/fp"
export interface IAuthService {
  validateToken(token: string): Promise<Result<UserWithRoleEntity, string>>
}