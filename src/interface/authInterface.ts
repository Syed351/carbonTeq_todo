import { IUserWithRole } from "./user.interface";
import { Result } from "@carbonteq/fp"
export interface IAuthService {
  validateToken(token: string): Promise<Result<IUserWithRole, string>>
}