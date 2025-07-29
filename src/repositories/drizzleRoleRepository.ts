import { db } from "../db";
import { Roles } from "../schema/roles.schema";
import { eq } from "drizzle-orm";
import { Result } from "@carbonteq/fp"
import { IRoleRepository } from "../interface/userRole.repository";


export class DrizzleRoleRepository implements IRoleRepository {
  async findByName(roleName: string) {
    try{
    const [role] = await db.select().from(Roles).where(eq(Roles.name, roleName));
    return Result.Ok(role)    
  } catch (error){
        return  Result.Err("User with role not found by ID")
    }
  }
}
