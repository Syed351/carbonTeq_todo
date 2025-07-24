// repositories/impl/drizzlePermissionRepository.ts

import { IPermissionRepository } from "../interface/permission.repository";
import { db } from "../db";
import { Roles } from "../schema/roles.schema";
import { Permissions } from "../schema/permission.schema";
import { eq, and } from "drizzle-orm";


export class DrizzlePermissionRepository implements IPermissionRepository {
  async hasPermission(roleName: string, action: "create" | "read" | "update" | "delete"): Promise<boolean> {
    const [role] = await db.select().from(Roles).where(eq(Roles.name, roleName));
    if (!role) return false;

    const [permission] = await db
      .select()
      .from(Permissions)
      .where(and(eq(Permissions.roleId, role.id), eq(Permissions.action, action)));

    return !!permission?.allowed;
  }
}

