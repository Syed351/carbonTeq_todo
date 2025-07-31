// repositories/impl/drizzle-user.repository.ts

import { IUserRepository } from "../interface/user.repository";
import { db } from "../db";
import { User } from "../schema/user.schema";
import { Roles } from "../schema/roles.schema";
import { eq } from "drizzle-orm";
import { Result } from "@carbonteq/fp";
import { UserEntity } from "../entities/user.entity";

export class DrizzleUserRepository implements IUserRepository {
  async findByEmail(email: string): Promise<Result<UserEntity, string>> {
    try {
      const [user] = await db.select().from(User).where(eq(User.email, email)).limit(1);
      if (!user) return Result.Err("User not found with given email");

      const entity = UserEntity.fromObject(user);
      return Result.Ok(entity);
    } catch (error) {
      return Result.Err("Failed to query user by email");
    }
  }

  async insert(user: UserEntity): Promise<Result<void, string>> {
    try {
      await db.insert(User).values(user.toObject());
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

  async findById(id: string): Promise<Result<UserEntity, string>> {
    try {
      const [user] = await db.select().from(User).where(eq(User.id, id)).limit(1);
      if (!user) return Result.Err("User not found by ID");

      const entity = UserEntity.fromObject(user);
      return Result.Ok(entity);
    } catch (error) {
      return Result.Err("Failed to query user by ID");
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
        .where(eq(User.id, id))
        .limit(1);

      if (!result[0]) return Result.Err("User with role not found by ID");

      return Result.Ok(result[0]);
    } catch (error) {
      return Result.Err("Database error while fetching user with role");
    }
  }
}
