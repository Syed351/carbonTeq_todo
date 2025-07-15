import { IUser,IUserWithRole } from "../interface/user.interface";

export interface IUserRepository {
  findByEmail(email: string): Promise<IUser | undefined>;
  insert(user: IUser): Promise<void>;
  updateRefreshToken(userId: string, refreshToken: string): Promise<void>;
  findById(id: string): Promise<IUser | undefined>;
}
