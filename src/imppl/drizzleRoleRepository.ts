import { db } from "../db";
import { Roles } from "../schema/roles.schema";
import { eq } from "drizzle-orm";
import { IRoleRepository } from "../repositories/userRole.repository";

export class DrizzleRoleRepository implements IRoleRepository {
  async findByName(roleName: string) {
    const [role] = await db.select().from(Roles).where(eq(Roles.name, roleName));
    return role;
  }
}
