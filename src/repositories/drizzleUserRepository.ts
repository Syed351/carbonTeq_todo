import { IUserRepository } from "../interface/user.repository";
import { IUser } from "../interface/user.interface";
import { db } from "../db";
import { User } from "../schema/user.schema";
import { Roles } from "../schema/roles.schema";
import { eq } from "drizzle-orm";
import { Result } from "@carbonteq/fp";

export class DrizzleUserRepository implements IUserRepository {
  async findByEmail(email: string): Promise<Result<IUser, string>> {
    const [user] = await db.select().from(User).where(eq(User.email, email));
    return user ? Result.Ok(user) : Result.Err("User not found with given email");
  }

  async insert(user: IUser): Promise<Result<void, string>> {
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

  async findById(id: string): Promise<Result<IUser, string>> {
    const [user] = await db.select().from(User).where(eq(User.id, id)).limit(1);
    return user ? Result.Ok(user) : Result.Err("User not found by ID");
  }

  async findByIdWithRole(id: string): Promise<Result<{ id: string; name: string; email: string; role: string }, string>> {
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
  }
}
