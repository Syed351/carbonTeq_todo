import { IUser } from "../../application/dtos/user.dto";
import { UserEntity } from "../../domain/entities/user.entity";

export function toDTO(user: UserEntity,role:string): IUser {
  return {
    id: user.id,
    name: user.name,
    email: user.email,
    role,
  };
}