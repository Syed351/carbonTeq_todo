import { IUserRepository } from "../interface/user.repository";
import { IUserDTO } from "../dtos/userDTO";
import { db } from "../db";
import { User } from "../schema/user.schema";
import { Roles } from "../schema/roles.schema";
import { eq } from "drizzle-orm";
import { Result } from "@carbonteq/fp";

export class DrizzleUserRepository implements IUserRepository {
async findByEmail(email: string): Promise<Result<IUserDTO, string>> {
  try {
    const [user] = await db.select().from(User).where(eq(User.email, email));
    if (!user) return Result.Err("User not found with given email");
    return Result.Ok(user);
  } catch (error) {
    return Result.Err("Failed to query user");
  }
}

  async insert(user: IUserDTO): Promise<Result<void, string>> {
    try {
      await db.insert(User).values(user);
      return Result.Ok(undefined);
    } catch (error) {
      return Result.Err("Failed to insert user");
    }
  }

  async updateRefreshToken(userId: string, refreshToken: string): Promise<Result<void, string>> {
    try {
      await db.update(User).set({ refreshToken }).where(eq(User.id, userId));
      return Result.Ok(undefined);
    } catch (error) {
      return Result.Err("Failed to update refresh token");
    }
  }

  async findById(id: string): Promise<Result<IUserDTO, string>> {
    try{
    const [user] = await db.select().from(User).where(eq(User.id, id)).limit(1);
    return Result.Ok(user)
    }catch(error){
    return Result.Err("User not found by ID");
    }
  }

  async findByIdWithRole(id: string): Promise<Result<{ id: string; name: string; email: string; role: string }, string>> {
  try {
    const result = await db
      .select({
        id: User.id,
        name: User.name,
        email: User.email,
        role: Roles.name,
      })
      .from(User)
      .innerJoin(Roles, eq(User.roleId, Roles.id))
      .where(eq(User.id, id));

    return result[0]
      ? Result.Ok(result[0])
      : Result.Err("User with role not found by ID");

  } catch (error) {
    return Result.Err("Database error while fetching user with role");
  }
}
};
