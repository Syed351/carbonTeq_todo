import { db } from "../db";
import { User } from "../schema/user.schema";
import { eq } from "drizzle-orm";
import { IUser } from "../interface/user.interface";
import  { IUserRepository } from "../repositories/user.repository";

export class DrizzleUserRepository implements IUserRepository {
  async findByEmail(email: string): Promise<IUser | undefined> {
    const [user] = await db.select().from(User).where(eq(User.email, email));
    return user;
  }

  async insert(user: IUser): Promise<void> {
    await db.insert(User).values(user);
  }

  async updateRefreshToken(userId: string, refreshToken: string): Promise<void> {
    await db.update(User).set({ refreshToken }).where(eq(User.id, userId));
  }

  async findById(id: string): Promise<IUser | undefined> {
    const [user] = await db.select().from(User).where(eq(User.id, id)).limit(1);
    return user;
  }
}
