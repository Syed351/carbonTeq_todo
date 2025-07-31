// repositories/impl/drizzle-role.repository.ts
import { db } from "../db";
import { Roles } from "../schema/roles.schema";
import { eq } from "drizzle-orm";
import { Result } from "@carbonteq/fp";
import { IRoleRepository } from "../interface/userRole.repository";
import { RoleEntity } from "../entities/role.entity";

export class DrizzleRoleRepository implements IRoleRepository {
  async findByName(roleName: string): Promise<Result<RoleEntity, string>> {
    try {
      const [role] = await db.select().from(Roles).where(eq(Roles.name, roleName));
      if (!role) return Result.Err("Role not found");

      return Result.Ok(RoleEntity.create(role.id, role.name));
    } catch {
      return Result.Err("Error finding role by name");
    }
  }

}
