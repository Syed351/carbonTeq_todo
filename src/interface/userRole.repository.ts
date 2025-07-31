// interfaces/role.repository.ts
import { Result } from "@carbonteq/fp";
import { RoleEntity } from "../entities/role.entity";

export interface IRoleRepository {
  findByName(roleName: string): Promise<Result<RoleEntity, string>>;
}
